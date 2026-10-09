import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Download,
  ListPlus,
  MoreVertical,
  Share2,
  History,
  ArrowLeft,
  Globe2,
  LockKeyhole,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { playlistService, userService } from "../api/services.ts";
import { useAuth } from "../context/AuthContext.jsx";

const VideoOptionsMenu = ({
  videoId,
  videoFile,
  title = "video",
  showHistoryRemoval = false,
  isInWatchlist = false,
  compact = false,
  menuPlacement = "above",
  buttonClassName = "text-white",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [playlistDialog, setPlaylistDialog] = useState(null);
  const [playlistForm, setPlaylistForm] = useState({
    name: "",
    description: "",
    isPublished: false,
  });
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const playlistsQuery = useQuery({
    queryKey: ["user-playlists", user?._id],
    queryFn: () => playlistService.list(user._id),
    enabled: !!user?._id && playlistDialog === "select",
  });
  const watchlistQuery = useQuery({
    queryKey: ["watchlist"],
    queryFn: userService.watchlist,
    enabled: !!user?._id,
  });
  const watchlist = watchlistQuery.data?.data;
  const videoIsInWatchlist = watchlist
    ? watchlist.some((video) => String(video._id) === String(videoId))
    : isInWatchlist;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDownload = async () => {
    if (!videoFile) return;

    try {
      const response = await fetch(videoFile, { mode: "cors" });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${(title || "video").replace(/\s+/g, "-").toLowerCase()}.mp4`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.href = videoFile;
      link.download = `${(title || "video").replace(/\s+/g, "-").toLowerCase()}.mp4`;
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handleSaveWatchlist = async () => {
    if (!videoId) {
      toast.error("Video is missing.");
      return;
    }

    try {
      const response = await userService.toggleWatchlist(videoId);
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(response?.data?.message || "Watchlist updated.");
    } catch (error) {
      toast.error(error?.message || "Unable to update watchlist.");
    }
  };

  const handleAddPlaylist = async () => {
    if (!videoId) {
      toast.error("Video is missing.");
      return;
    }

    if (!user?._id) {
      toast.error("Sign in to add videos to a playlist.");
      return;
    }

    setPlaylistDialog("select");
  };

  const handleSelectPlaylist = async (playlistId) => {
    try {
      await playlistService.add(playlistId, videoId);
      await queryClient.invalidateQueries({
        queryKey: ["user-playlists", user?._id],
      });
      toast.success("Video added to playlist.");
      setPlaylistDialog(null);
    } catch (error) {
      toast.error(error?.message || "Unable to add the video to a playlist.");
    }
  };

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();
    if (!videoId) {
      toast.error("Video is missing.");
      return;
    }

    setIsSavingPlaylist(true);
    try {
      const createResponse = await playlistService.create(playlistForm);
      const playlistId = createResponse?.data?._id || createResponse?.data?.id;
      if (!playlistId) {
        throw new Error("Playlist was not created.");
      }

      await playlistService.add(playlistId, videoId);
      await queryClient.invalidateQueries({
        queryKey: ["user-playlists", user?._id],
      });
      toast.success("Playlist created and video added.");
      setPlaylistDialog(null);
      setPlaylistForm({ name: "", description: "", isPublished: false });
    } catch (error) {
      toast.error(error?.message || "Unable to create the playlist.");
    } finally {
      setIsSavingPlaylist(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/video/${videoId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Watch this video",
          text: `Check out this video: ${title || "video"}`,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Video link copied to clipboard.");
        return;
      }

      window.prompt("Copy this video link:", shareUrl);
    } catch {
      toast.error("Unable to share this video.");
    }
  };

  const handleRemoveFromHistory = async () => {
    if (!videoId) {
      toast.error("Video is missing.");
      return;
    }

    try {
      await userService.removeFromHistory(videoId);
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Video removed from history.");
    } catch (error) {
      toast.error(error?.message || "Unable to remove video from history.");
    }
  };

  const menuOptions = [
    {
      label: videoIsInWatchlist ? "Remove from watchlist" : "Save to watchlist",
      icon: Bookmark,
      action: handleSaveWatchlist,
    },
    { label: "Add Playlist", icon: ListPlus, action: handleAddPlaylist },
    { label: "Download", icon: Download, action: handleDownload },
    { label: "Share", icon: Share2, action: handleShare },
    ...(showHistoryRemoval
      ? [
          {
            label: "Remove from History",
            icon: History,
            action: handleRemoveFromHistory,
          },
        ]
      : []),
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open video options"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center justify-center rounded-none border-0 bg-transparent p-0 transition hover:bg-transparent ${
          compact ? "h-6 w-6" : "h-8 w-8"
        } ${buttonClassName}`}
      >
        <MoreVertical className={compact ? "h-4 w-4" : "h-4 w-4"} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-20 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#111111] ${
            menuPlacement === "below" ? "top-full mt-1" : "bottom-10"
          }`}
        >
          {menuOptions.map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                action?.();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {playlistDialog &&
        createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="playlist-dialog-title"
            className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-5 text-black shadow-2xl dark:border-white/10 dark:bg-[#111111] dark:text-white"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {playlistDialog === "select" ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2
                      id="playlist-dialog-title"
                      className="text-lg font-semibold"
                    >
                      Add to playlist
                    </h2>
                    <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                      Choose a playlist or create a new one.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close playlist dialog"
                    onClick={() => setPlaylistDialog(null)}
                    className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {playlistsQuery.isPending ? (
                  <p className="py-5 text-center text-sm text-black/60 dark:text-white/60">
                    Loading your playlists...
                  </p>
                ) : playlistsQuery.isError ? (
                  <div className="py-4">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {playlistsQuery.error?.message ||
                        "Unable to load your playlists."}
                    </p>
                    <button
                      type="button"
                      onClick={() => playlistsQuery.refetch()}
                      className="mt-3 text-sm font-medium text-primary"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {(playlistsQuery.data?.data || []).map((playlist) => (
                      <button
                        key={playlist._id}
                        type="button"
                        onClick={() => handleSelectPlaylist(playlist._id)}
                        className="flex w-full items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-left transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {playlist.name}
                          </span>
                          <span className="text-xs text-black/55 dark:text-white/55">
                            {playlist.totalVideos ?? playlist.videos?.length ?? 0}{" "}
                            videos
                          </span>
                        </span>
                        {playlist.isPublished ? (
                          <Globe2
                            className="ml-3 h-4 w-4 shrink-0"
                            aria-label="Public"
                          />
                        ) : (
                          <LockKeyhole
                            className="ml-3 h-4 w-4 shrink-0"
                            aria-label="Private"
                          />
                        )}
                      </button>
                    ))}
                    {!playlistsQuery.data?.data?.length && (
                      <p className="py-4 text-center text-sm text-black/60 dark:text-white/60">
                        You don&apos;t have any playlists yet.
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPlaylistDialog("create")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Create new playlist
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Back to playlists"
                      onClick={() => setPlaylistDialog("select")}
                      className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h2
                      id="playlist-dialog-title"
                      className="text-lg font-semibold"
                    >
                      Create playlist
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Close playlist dialog"
                    onClick={() => setPlaylistDialog(null)}
                    disabled={isSavingPlaylist}
                    className="rounded-full p-2 hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleCreatePlaylist} className="space-y-4">
                  <label className="block space-y-1.5 text-sm font-medium">
                    Playlist name
                    <input
                      autoFocus
                      required
                      minLength={3}
                      maxLength={50}
                      value={playlistForm.name}
                      onChange={(event) =>
                        setPlaylistForm((form) => ({
                          ...form,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Name your playlist"
                      className="w-full rounded-xl border border-black/15 bg-transparent px-3 py-2.5 font-normal outline-none focus:border-primary dark:border-white/15"
                    />
                  </label>

                  <label className="block space-y-1.5 text-sm font-medium">
                    Description
                    <textarea
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={3}
                      value={playlistForm.description}
                      onChange={(event) =>
                        setPlaylistForm((form) => ({
                          ...form,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Describe what this playlist is about"
                      className="w-full resize-y rounded-xl border border-black/15 bg-transparent px-3 py-2.5 font-normal outline-none focus:border-primary dark:border-white/15"
                    />
                  </label>

                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">
                      Visibility
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          published: false,
                          label: "Private",
                          Icon: LockKeyhole,
                        },
                        {
                          published: true,
                          label: "Public",
                          Icon: Globe2,
                        },
                      ].map(({ published, label, Icon }) => (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={playlistForm.isPublished === published}
                          onClick={() =>
                            setPlaylistForm((form) => ({
                              ...form,
                              isPublished: published,
                            }))
                          }
                          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                            playlistForm.isPublished === published
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-black/15 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <p className="text-xs text-black/55 dark:text-white/55">
                    This playlist will be saved to your account.
                  </p>
                  <button
                    type="submit"
                    disabled={isSavingPlaylist}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingPlaylist
                      ? "Creating playlist..."
                      : "Create playlist and add video"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>,
          document.body,
        )}
    </div>
  );
};

export default VideoOptionsMenu;
