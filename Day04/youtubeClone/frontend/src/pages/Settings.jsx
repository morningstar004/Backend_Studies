import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Check,
  KeyRound,
  LogOut,
  MessageSquare,
  Moon,
  Palette,
  Sun,
  UserRound,
  UserRoundCog,
} from "lucide-react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { commentService, userService } from "../api/services.ts";
import { EmptyState } from "../components/States.jsx";
import History from "./History.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const sections = [
  { id: "profile", label: "Edit profile", icon: UserRound },
  { id: "password", label: "Change password", icon: KeyRound },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "activities", label: "Activities", icon: Activity },
  { id: "account", label: "Switch account", icon: UserRoundCog },
];

const getDateLabel = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Date unavailable";

export default function Settings() {
  const { section = "profile" } = useParams();

  const activeSection = sections.some((item) => item.id === section)
    ? section
    : "profile";

  const { user, refreshUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    username: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const actionInProgress = useRef(false);
  const [editingComment, setEditingComment] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentsPage, setCommentsPage] = useState(1);

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      username: user?.username || "",
    });
  }, [user]);

  const commentsQuery = useQuery({
    queryKey: ["my-comments", user?._id, commentsPage],
    queryFn: () => commentService.mine(commentsPage),
    enabled: Boolean(user?._id) && activeSection === "comments",
  });

  const commentsData = commentsQuery.data?.data;

  const comments = commentsData?.docs || [];

  const saveProfile = async (event) => {
    event.preventDefault();
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setSaving(true);
    try {
      await userService.update(profileForm);
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["channel-profile"] });
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error?.message || "Unable to update your profile.");
    } finally {
      actionInProgress.current = false;
      setSaving(false);
    }
  };

  const uploadProfileImage = async (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (actionInProgress.current) {
      event.target.value = "";
      return;
    }
    actionInProgress.current = true;
    const body = new FormData();
    body.append(kind === "avatar" ? "avatar" : "coverImage", file);
    setSaving(true);
    try {
      if (kind === "avatar") {
        await userService.avatar(body);
      } else {
        await userService.cover(body);
      }
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["channel-profile"] });
      toast.success(`${kind === "avatar" ? "Avatar" : "Cover image"} updated.`);
    } catch (error) {
      toast.error(error?.message || "Unable to upload the image.");
    } finally {
      actionInProgress.current = false;
      setSaving(false);
      event.target.value = "";
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setSaving(true);
    try {
      await userService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        ConformPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed.");
    } catch (error) {
      toast.error(error?.message || "Unable to change your password.");
    } finally {
      actionInProgress.current = false;
      setSaving(false);
    }
  };

  const saveComment = async (commentId) => {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setSaving(true);
    try {
      await commentService.update(commentId, commentDraft);
      await queryClient.invalidateQueries({ queryKey: ["my-comments"] });
      setEditingComment(null);
      toast.success("Comment updated.");
    } catch (error) {
      toast.error(error?.message || "Unable to update your comment.");
    } finally {
      actionInProgress.current = false;
      setSaving(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (actionInProgress.current) return;
    if (!window.confirm("Delete this comment?")) return;
    actionInProgress.current = true;
    setSaving(true);
    try {
      await commentService.delete(commentId);
      await queryClient.invalidateQueries({ queryKey: ["my-comments"] });
      if (comments.length === 1 && commentsPage > 1) {
        setCommentsPage((page) => page - 1);
      }
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error(error?.message || "Unable to delete your comment.");
    } finally {
      actionInProgress.current = false;
      setSaving(false);
    }
  };

  const switchAccount = async () => {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setSaving(true);
    try {
      await logout();
    } catch (error) {
      toast.error(error?.message || "Unable to contact the sign-out service.");
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-8">
      <form className="space-y-5" onSubmit={saveProfile}>
        <div>
          <h2 className="text-lg font-semibold">Profile information</h2>
          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            Update the details shown on your account and channel.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["fullName", "Full name", "text"],
            ["username", "Username", "text"],
            ["email", "Email address", "email"],
          ].map(([name, label, type]) => (
            <label key={name} className="block text-sm font-medium">
              {label}
              <input
                required
                type={type}
                autoComplete={name === "email" ? "email" : "name"}
                className="input mt-1.5"
                value={profileForm[name]}
                onChange={(event) =>
                  setProfileForm((form) => ({
                    ...form,
                    [name]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>
        <button
          disabled={saving}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="grid gap-5 border-t border-black/10 pt-6 dark:border-white/10 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Change avatar
          <input
            type="file"
            accept="image/*"
            disabled={saving}
            onChange={(event) => uploadProfileImage(event, "avatar")}
            className="input mt-1.5 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5"
          />
        </label>
        <label className="block text-sm font-medium">
          Change cover image
          <input
            type="file"
            accept="image/*"
            disabled={saving}
            onChange={(event) => uploadProfileImage(event, "cover")}
            className="input mt-1.5 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5"
          />
        </label>
      </div>
    </div>
  );

  const renderPasswordSettings = () => (
    <form className="max-w-xl space-y-5" onSubmit={changePassword}>
      <div>
        <h2 className="text-lg font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Confirm your current password before choosing a new one.
        </p>
      </div>
      {[
        ["oldPassword", "Current password", "current-password"],
        ["newPassword", "New password", "new-password"],
        ["confirmPassword", "Confirm new password", "new-password"],
      ].map(([name, label, autoComplete]) => (
        <label key={name} className="block text-sm font-medium">
          {label}
          <input
            required
            minLength={6}
            type="password"
            autoComplete={autoComplete}
            className="input mt-1.5"
            value={passwordForm[name]}
            onChange={(event) =>
              setPasswordForm((form) => ({
                ...form,
                [name]: event.target.value,
              }))
            }
          />
        </label>
      ))}
      <button
        disabled={saving}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Updating..." : "Update password"}
      </button>
    </form>
  );

  const renderComments = () => {
    if (commentsQuery.isLoading) {
      return (
        <div className="surface p-6 text-sm">Loading your comments...</div>
      );
    }
    if (commentsQuery.isError) {
      return (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          {commentsQuery.error?.message || "Unable to load your comments."}
        </div>
      );
    }
    if (!comments.length) {
      return (
        <EmptyState
          title="No comments yet"
          detail="Comments you add to videos and posts will appear here."
        />
      );
    }

    return (
      <div className="space-y-3">
        {comments.map((comment) => {
          const target = comment.video || comment.tweet;
          const targetLabel = comment.video
            ? comment.video.title
            : comment.tweet?.caption;
          const targetLink = comment.video
            ? `/video/${comment.video._id}`
            : comment.tweet
              ? `/tweets#tweet-${comment.tweet._id}`
              : null;

          return (
            <article key={comment._id} className="surface p-4 sm:p-5">
              {editingComment === comment._id ? (
                <div className="space-y-3">
                  <textarea
                    aria-label="Edit comment"
                    maxLength={1000}
                    rows={3}
                    className="input"
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveComment(comment._id)}
                      disabled={saving}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingComment(null)}
                      disabled={saving}
                      className="rounded-lg px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm">
                    {comment.content}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-black/55 dark:text-white/55">
                      <span>{getDateLabel(comment.createdAt)}</span>
                      {target && targetLink && (
                        <>
                          <span className="mx-2">·</span>
                          <Link
                            className="inline-flex max-w-64 items-center gap-1 truncate text-primary hover:underline"
                            to={targetLink}
                            title={targetLabel}
                          >
                            {comment.video ? "Video" : "Post"}: {targetLabel}
                            <ArrowRight size={12} />
                          </Link>
                        </>
                      )}
                      {!target && (
                        <span className="ml-2">
                          · Original post unavailable
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setEditingComment(comment._id);
                          setCommentDraft(comment.content);
                        }}
                        className="font-medium text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteComment(comment._id)}
                        disabled={saving}
                        className="font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </article>
          );
        })}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={!commentsData?.hasPrevPage}
            onClick={() => setCommentsPage((page) => Math.max(1, page - 1))}
            className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
          >
            Previous
          </button>
          <span className="text-sm text-black/55 dark:text-white/55">
            Page {commentsData?.page || commentsPage} of{" "}
            {commentsData?.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={!commentsData?.hasNextPage}
            onClick={() => setCommentsPage((page) => page + 1)}
            className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slateDark dark:text-white">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-slateDark/60 dark:text-white/60">
          Choose your interface theme. Your preference is saved locally and applies instantly across the entire application.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        {/* Light Theme Card */}
        <button
          type="button"
          onClick={() => {
            if (theme !== "light") toggleTheme();
          }}
          className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
            theme === "light"
              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
              : "border-black/10 bg-black/5 hover:border-black/25 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-700">
                <Sun size={18} />
              </span>
              <span className="font-semibold text-slateDark dark:text-white">
                Light mode
              </span>
            </div>
            {theme === "light" && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-white">
                <Check size={14} />
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-slateDark/70 dark:text-white/70">
            Clean mint background (#EFF3F1) with earthy teal accents and dark slate typography.
          </p>
          <div className="mt-4 flex w-full items-center gap-2 rounded-xl border border-black/10 bg-[#EFF3F1] p-2.5">
            <div className="h-3 w-3 rounded-full bg-[#5E887E]" />
            <div className="h-3 w-8 rounded-full bg-[#22333B]" />
            <div className="h-3 w-12 rounded-full bg-[#C7A17A]" />
          </div>
        </button>

        {/* Dark Theme Card */}
        <button
          type="button"
          onClick={() => {
            if (theme !== "dark") toggleTheme();
          }}
          className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
            theme === "dark"
              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
              : "border-black/10 bg-black/5 hover:border-black/25 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-800 text-slate-200">
                <Moon size={18} />
              </span>
              <span className="font-semibold text-slateDark dark:text-white">
                Dark mode
              </span>
            </div>
            {theme === "dark" && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-white">
                <Check size={14} />
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-slateDark/70 dark:text-white/70">
            Deep slate starry sky canvas with glassy elevated cards and subtle light text.
          </p>
          <div className="mt-4 flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[#0F1416] p-2.5">
            <div className="h-3 w-3 rounded-full bg-[#5E887E]" />
            <div className="h-3 w-8 rounded-full bg-white/70" />
            <div className="h-3 w-12 rounded-full bg-[#C7A17A]" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderSection = () => {
    if (activeSection === "profile") return renderProfileSettings();
    if (activeSection === "password") return renderPasswordSettings();
    if (activeSection === "appearance") return renderAppearanceSettings();
    if (activeSection === "comments") return renderComments();
    if (activeSection === "activities") return <History />;

    return (
      <div className="max-w-xl space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Switch account</h2>
          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            Sign out of @{user?.username || "your account"} to sign in with a
            different account.
          </p>
        </div>
        <button
          type="button"
          onClick={switchAccount}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
        >
          <LogOut size={16} />
          Sign out and switch
        </button>
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-6xl space-y-5 py-4">
      <header>
        <h1 className="text-2xl font-bold text-slateDark dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slateDark/60 dark:text-white/60">
          Manage your account, comments, and activity.
        </p>
      </header>
      <div className="grid gap-5 md:grid-cols-[15rem_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="surface flex gap-2 overflow-x-auto p-2 md:flex-col md:gap-1 md:p-3"
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <NavLink
              key={id}
              to={`/settings/${id}`}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "text-slateDark/75 hover:bg-black/5 hover:text-slateDark dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <section className="surface min-w-0 p-5 sm:p-7 shadow-sm">
          {renderSection()}
        </section>
      </div>
    </main>
  );
}
