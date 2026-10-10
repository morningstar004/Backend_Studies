import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  LockKeyhole,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  likeService,
  playlistService,
  userService,
} from "../../api/services.ts";
import VideoCollectionCard from "../../components/VideoCollectionCard.jsx";
import formatRelativeTime from "../../components/formatRelativeTime.js";
import { useAuth } from "../../context/AuthContext.jsx";

const normalizeVideo = (entry) => entry?.video ?? entry;

export function LibraryOverview() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const collectionScrollRefs = useRef(new Map());
  const [openPlaylistMenuId, setOpenPlaylistMenuId] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);
  const previewCardClassName =
    "w-[calc((100%_-_1rem)/2)] shrink-0 snap-start sm:w-[calc((100%_-_2rem)/3)] xl:w-[calc((100%_-_3rem)/4)]";
  const { user } = useAuth();
  const watchlistQuery = useQuery({
    queryKey: ["watchlist"],
    queryFn: userService.watchlist,
    enabled: !!user?._id,
  });
  const likedQuery = useQuery({
    queryKey: ["liked-videos"],
    queryFn: likeService.videos,
    enabled: !!user?._id,
  });
  const playlistQuery = useQuery({
    queryKey: ["user-playlists", user?._id],
    queryFn: () => playlistService.list(user._id),
    enabled: !!user?._id,
  });

  const watchlistVideos = watchlistQuery.data?.data || [];
  const likedVideos = (likedQuery.data?.data || [])
    .map(normalizeVideo)
    .filter(Boolean);
  const playlists = playlistQuery.data?.data || [];

  useEffect(() => {
    if (!editingPlaylist) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setEditingPlaylist(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editingPlaylist]);

  const handleUpdatePlaylist = async (event) => {
    event.preventDefault();
    if (!editingPlaylist) return;

    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description") || "").trim();
    if (description && description.length < 10) {
      toast.error("Description must be at least 10 characters, or left empty.");
      return;
    }

    const updates = {
      name: String(formData.get("name") || "").trim(),
      description,
      isPublished: formData.get("isPublished") === "public",
    };

    setIsSavingPlaylist(true);
    try {
      await playlistService.update(editingPlaylist._id, updates);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["user-playlists", user?._id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["playlist", editingPlaylist._id],
        }),
      ]);
      toast.success("Playlist updated.");
      setEditingPlaylist(null);
    } catch (error) {
      toast.error(error?.message || "Unable to update the playlist.");
    } finally {
      setIsSavingPlaylist(false);
    }
  };

  const handleDeletePlaylist = async (playlist) => {
    setOpenPlaylistMenuId(null);
    if (!window.confirm(`Delete "${playlist.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await playlistService.delete(playlist._id);
      await queryClient.invalidateQueries({
        queryKey: ["user-playlists", user?._id],
      });
      toast.success("Playlist deleted.");
    } catch (error) {
      toast.error(error?.message || "Unable to delete the playlist.");
    }
  };
  const collections = [
    {
      title: "Watchlist",
      description: "Saved for later",
      count: watchlistVideos.length,
      tone: "from-primary/20 via-primary/5 to-transparent",
      href: "/library/watchlist",
      preview: watchlistVideos.slice(0, 6),
    },
    {
      title: "Playlists",
      description: "Curated collections",
      count: playlists.length,
      tone: "from-blue-500/20 via-blue-500/5 to-transparent",
      href: "/library/playlists",
      preview: playlists.slice(0, 6),
    },
    {
      title: "Liked videos",
      description: "Videos you loved",
      count: likedVideos.length,
      tone: "from-pink-500/20 via-pink-500/5 to-transparent",
      href: "/library/liked-videos",
      preview: likedVideos.slice(0, 6),
    },
  ];

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Library</h1>
      <div className="grid gap-4 md:grid-cols-1">
        {collections.map(
          ({ title, description, count, tone, href, preview }) => {
            const hasItems = count > 0 && preview.length > 0;

            return (
              <div
                key={title}
                className={`h-100 max-h-85 px-6 overflow-hidden rounded-2xl border border-black/10 bg-linear-to-br ${tone} p-3 shadow-sm`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[15px] font-bold text-black/65 dark:text-white/70">
                      {title}
                    </span>
                    <p className="text-[9px] text-black/60 dark:text-white/60">
                      {description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Scroll ${title} left`}
                      onClick={() =>
                        collectionScrollRefs.current
                          .get(title)
                          ?.scrollBy({ left: -320, behavior: "smooth" })
                      }
                      className="rounded-full border border-white/50 bg-white/35 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.2)] dark:hover:bg-white/15"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Scroll ${title} right`}
                      onClick={() =>
                        collectionScrollRefs.current
                          .get(title)
                          ?.scrollBy({ left: 320, behavior: "smooth" })
                      }
                      className="rounded-full border border-white/50 bg-white/35 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.2)] dark:hover:bg-white/15"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(href)}
                      className="rounded-full border border-white/50 bg-white/35 px-3 py-1.5 text-sm font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.2)] dark:hover:bg-white/15"
                    >
                      View all {count}
                    </button>
                  </div>
                </div>

                <div
                  ref={(element) => {
                    if (element)
                      collectionScrollRefs.current.set(title, element);
                    else collectionScrollRefs.current.delete(title);
                  }}
                  className="flex pt-6 snap-x snap-mandatory gap-3.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden rounded-t-2xl bg-amber-50/5 p-4 shadow-[inset_0_10px_14px_rgba(0,0,0,0.10),inset_12px_0_14px_rgba(0,0,0,0.08),inset_-12px_0_14px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_10px_14px_rgba(255,255,255,0.06),inset_12px_0_14px_rgba(255,255,255,0.04),inset_-12px_0_14px_rgba(255,255,255,0.04)]"
                >
                  {hasItems
                    ? title === "Playlists"
                      ? preview.map((playlist) => (
                          <div
                            key={playlist._id}
                            className={`${previewCardClassName} relative rounded-2xl p-2 shadow-sm`}
                          >
                            <Link
                              to={`/playlist/${playlist._id}`}
                              aria-label={`Open playlist ${playlist.name}`}
                              className="block"
                            >
                              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl">
                                {playlist.videos?.[0]?.thumbnail ? (
                                  <>
                                    {[0, 1, 2].map((layer) => (
                                      <div
                                        key={layer}
                                        aria-hidden="true"
                                        className="absolute bottom-1 rounded-lg bg-slate-500/50"
                                        style={{
                                          left: `${8 - layer * 2}%`,
                                          width: `${86.5 - layer * 0.02}%`,
                                          right: `${layer * 4}px`,
                                          top: `${layer * 3}px`,
                                          bottom: `${7 - layer * 2}%`,
                                          zIndex: layer + 1,
                                        }}
                                      />
                                    ))}
                                    <img
                                      src={playlist.videos[0].thumbnail}
                                      alt=""
                                      aria-hidden="true"
                                      className="absolute inset-x-1 bottom-0 z-[5] h-[calc(100%-8px)] w-full rounded-xl object-cover"
                                      style={{
                                        clipPath:
                                          "inset(0 12% 0 0 round 0.75rem)",
                                      }}
                                    />
                                  </>
                                ) : (
                                  <p className="text-[9px] text-black/50 dark:text-white/50">
                                    No videos yet
                                  </p>
                                )}
                                <span className="absolute bottom-1.5 right-10 z-10 rounded-lg bg-black/75 px-2 py-1 text-[9px] font-medium text-white">
                                  {playlist.totalVideos ??
                                    playlist.videos?.length ??
                                    0}{" "}
                                  videos
                                </span>
                              </div>
                              <p className="mt-2 px-2 truncate text-xs font-semibold">
                                {playlist.name}
                              </p>
                              <div className="mt-1 flex min-w-0 items-center gap-2 px-2 text-[10px] text-black/55 dark:text-white/55">
                                <span className="inline-flex shrink-0 items-center gap-1">
                                  {playlist.isPublished ? (
                                    <Globe2 className="h-3 w-3 text-primary" />
                                  ) : (
                                    <LockKeyhole className="h-3 w-3" />
                                  )}
                                  {playlist.isPublished ? "Public" : "Private"}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex min-w-0 items-center gap-1">
                                  <Clock3 className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    Updated{" "}
                                    {formatRelativeTime(
                                      playlist.updatedAt || playlist.createdAt,
                                    )}
                                  </span>
                                </span>
                              </div>
                            </Link>
                            <div className="absolute right-11 bottom-2 z-20">
                              <button
                                type="button"
                                aria-label={`Options for ${playlist.name}`}
                                aria-haspopup="menu"
                                aria-expanded={
                                  openPlaylistMenuId === playlist._id
                                }
                                onClick={() =>
                                  setOpenPlaylistMenuId((currentId) =>
                                    currentId === playlist._id
                                      ? null
                                      : playlist._id,
                                  )
                                }
                                className="rounded-full bg-black/70 p-1.5 text-white shadow backdrop-blur transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openPlaylistMenuId === playlist._id && (
                                <div
                                  role="menu"
                                  aria-label={`${playlist.name} options`}
                                  className="absolute right-0 bottom-[110%] mt-1 w-36 overflow-hidden rounded-xl border border-black/10 bg-white py-1 text-sm shadow-lg dark:border-white/10 dark:bg-black/90"
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setOpenPlaylistMenuId(null);
                                      setEditingPlaylist(playlist);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() =>
                                      handleDeletePlaylist(playlist)
                                    }
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete playlist
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      : preview.map((video) => (
                          <div key={video._id} className={previewCardClassName}>
                            <VideoCollectionCard
                              video={video}
                              isInWatchlist={title === "Watchlist"}
                              compact
                              dominantColorHover
                            />
                          </div>
                        ))
                    : null}
                </div>
              </div>
            );
          },
        )}
      </div>
      {editingPlaylist && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditingPlaylist(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-playlist-title"
            className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 text-black shadow-2xl dark:border-white/10 dark:bg-black/80 dark:text-white"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-playlist-title" className="text-lg font-bold">
                  Edit playlist
                </h2>
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                  Update its name, description, and visibility.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close edit playlist dialog"
                onClick={() => setEditingPlaylist(null)}
                className="rounded-full p-2 transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdatePlaylist} className="space-y-4">
              <label className="block space-y-1.5 text-sm font-medium">
                Playlist name
                <input
                  name="name"
                  required
                  minLength={3}
                  maxLength={50}
                  defaultValue={editingPlaylist.name}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black outline-none placeholder:text-black/40 focus:border-primary dark:border-white/15 dark:bg-black dark:text-white dark:placeholder:text-white/40"
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                Description
                <textarea
                  name="description"
                  minLength={10}
                  maxLength={1000}
                  defaultValue={editingPlaylist.description || ""}
                  aria-describedby="playlist-description-hint"
                  className="min-h-24 w-full resize-y rounded-xl border border-black/15 bg-white px-3 py-2 text-black outline-none placeholder:text-black/40 focus:border-primary dark:border-white/15 dark:bg-black dark:text-white/60 dark:placeholder:text-white/40"
                />
                <span
                  id="playlist-description-hint"
                  className="block text-xs font-normal text-black/55 dark:text-white/55"
                >
                  Leave blank to remove the description, or enter at least 10
                  characters.
                </span>
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                Privacy
                <select
                  name="isPublished"
                  defaultValue={
                    editingPlaylist.isPublished ? "public" : "private"
                  }
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black outline-none focus:border-primary dark:border-white/15 dark:bg-black dark:text-white dark:scheme-dark"
                >
                  <option
                    className="bg-white text-black dark:bg-black dark:text-white"
                    value="private"
                  >
                    Private
                  </option>
                  <option
                    className="bg-white text-black dark:bg-black dark:text-white"
                    value="public"
                  >
                    Public
                  </option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  disabled={isSavingPlaylist}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlaylist}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSavingPlaylist ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
