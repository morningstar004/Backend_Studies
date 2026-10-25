import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Globe2,
  LockKeyhole,
  MoreVertical,
  Pencil,
  Play,
  Shuffle,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { playlistService } from "../api/services.ts";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";
import VideoSort, { sortVideos } from "../components/VideoSort.jsx";
import { EmptyState } from "../components/States.jsx";
import formatRelativeTime from "../components/formatRelativeTime.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "sonner";

function PlaylistOptionsMenu({ onEdit, onDelete, align = "left" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuWidth = 192;
  const menuHeight = 96;

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setPosition({
      left: Math.max(
        8,
        Math.min(
          align === "right" ? rect.right - menuWidth : rect.left,
          window.innerWidth - menuWidth - 8,
        ),
      ),
      top: Math.min(
        rect.bottom + 8,
        window.innerHeight - menuHeight - 8,
      ),
    });
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsidePointer = (event) => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    updatePosition();
    document.addEventListener("mousedown", handleOutsidePointer);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsidePointer);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, align]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Playlist options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          if (!isOpen) requestAnimationFrame(updatePosition);
          setIsOpen((open) => !open);
        }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/60 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/15 dark:bg-black/30 dark:hover:bg-black/50"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Playlist options"
            style={{
              position: "fixed",
              left: position.left,
              top: position.top,
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className="z-100 w-48 overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#111111]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
              Edit playlist
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Delete playlist
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [videoSort, setVideoSort] = useState("uploaded-desc");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const actionLockRef = useRef(false);
  const playlistQuery = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => playlistService.byId(playlistId),
    enabled: !!playlistId,
  });
  const playlist = playlistQuery.data?.data;

  useEffect(() => {
    if (!isEditing) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsEditing(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing]);

  const handleUpdatePlaylist = async (event) => {
    event.preventDefault();
    if (!playlist || actionLockRef.current) return;

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

    actionLockRef.current = true;
    setIsSaving(true);
    try {
      await playlistService.update(playlist._id, updates);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["user-playlists", user?._id],
        }),
        queryClient.invalidateQueries({ queryKey: ["playlist", playlist._id] }),
      ]);
      toast.success("Playlist updated.");
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.message || "Unable to update the playlist.");
    } finally {
      actionLockRef.current = false;
      setIsSaving(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist || actionLockRef.current) return;

    if (!window.confirm(`Delete "${playlist.name}"? This cannot be undone.`)) {
      return;
    }

    actionLockRef.current = true;
    setIsSaving(true);
    try {
      await playlistService.delete(playlist._id);
      await queryClient.invalidateQueries({
        queryKey: ["user-playlists", user?._id],
      });
      toast.success("Playlist deleted.");
      navigate("/library/playlists", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Unable to delete the playlist.");
    } finally {
      actionLockRef.current = false;
      setIsSaving(false);
    }
  };

  const startPlayback = (videoIds) => {
    const [firstVideoId, ...remainingVideoIds] = videoIds;
    if (!firstVideoId) return;

    const queue = [firstVideoId, ...remainingVideoIds].join(",");
    navigate(
      `/video/${encodeURIComponent(firstVideoId)}?queue=${encodeURIComponent(queue)}`,
    );
  };

  if (playlistQuery.isPending) {
    return (
      <section className="surface grid min-h-64 place-items-center p-8">
        <p className="text-sm text-black/60 dark:text-white/60">
          Loading playlist...
        </p>
      </section>
    );
  }

  if (!playlist) {
    return (
      <section className="surface grid min-h-64 place-items-center p-8 text-center">
        <div>
          <h1 className="font-semibold">Unable to open playlist</h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            {playlistQuery.error?.message || "Playlist not found."}
          </p>
          <button
            type="button"
            onClick={() => playlistQuery.refetch()}
            className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const videos = playlist.videos || [];
  const isPlaylistOwner =
    Boolean(playlist.owner?._id) &&
    String(playlist.owner._id) === String(user?._id);
  const sortedVideos = sortVideos(videos, videoSort);
  const videoIds = sortedVideos.map((video) => video._id).filter(Boolean);
  const featuredVideo = videos[0];
  const shuffleVideos = () => {
    const shuffledVideoIds = [...videoIds];
    for (let index = shuffledVideoIds.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledVideoIds[index], shuffledVideoIds[swapIndex]] = [
        shuffledVideoIds[swapIndex],
        shuffledVideoIds[index],
      ];
    }
    startPlayback(shuffledVideoIds);
  };

  return (
    <section className="space-y-6">
      <Link
        to="/library/playlists"
        className="inline-flex items-center gap-2 text-sm font-medium text-black/65 transition hover:text-primary dark:text-white/65"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to playlists
      </Link>

      {featuredVideo ? (
        <header className="grid overflow-hidden rounded-2xl border border-black/10 bg-linear-to-br from-primary/20 via-primary/5 to-transparent shadow-sm dark:border-white/10 sm:grid-cols-[minmax(12rem,0.8fr)_1.2fr]">
          <div className="relative min-h-48 bg-black/10 sm:min-h-56">
            <img
              src={featuredVideo.thumbnail}
              alt={featuredVideo.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/65 to-transparent sm:bg-linear-to-r" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-5 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/55 dark:text-white/55">
                Playlist
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{playlist.name}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium dark:border-white/10 dark:bg-black/20">
                  {playlist.isPublished ? (
                    <Globe2 className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <LockKeyhole className="h-3.5 w-3.5" />
                  )}
                  {playlist.isPublished ? "Public" : "Private"}
                </span>
              </div>
              {playlist.description && (
                <p className="mt-2 max-w-2xl text-sm text-black/65 dark:text-white/65">
                  {playlist.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-black/65 dark:text-white/65">
              <span>
                {videos.length} {videos.length === 1 ? "video" : "videos"}
              </span>
              {playlist.owner?.fullName && <span>{playlist.owner.fullName}</span>}
              <span>
                Updated{" "}
                {formatRelativeTime(playlist.updatedAt || playlist.createdAt)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => startPlayback(videoIds)}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Play size={16} fill="currentColor" />
                Play all
              </button>
              <button
                type="button"
                onClick={shuffleVideos}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-black/15 bg-white/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/15 dark:bg-black/30 dark:hover:bg-black/50"
              >
                <Shuffle size={16} />
                Shuffle
              </button>
              {isPlaylistOwner && (
                <PlaylistOptionsMenu
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDeletePlaylist}
                />
              )}
            </div>
          </div>
        </header>
      ) : (
        <header className="rounded-2xl border border-black/10 bg-linear-to-br from-primary/20 via-primary/5 to-transparent p-6 shadow-sm dark:border-white/10 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/55 dark:text-white/55">
                Playlist
              </p>
              <h1 className="mt-1 text-3xl font-bold">{playlist.name}</h1>
              {playlist.description && (
                <p className="mt-3 text-sm text-black/65 dark:text-white/65">
                  {playlist.description}
                </p>
              )}
            </div>
            {isPlaylistOwner && (
              <PlaylistOptionsMenu
                align="right"
                onEdit={() => setIsEditing(true)}
                onDelete={handleDeletePlaylist}
              />
            )}
          </div>
        </header>
      )}

      {videos.length ? (
        <>
          <VideoSort
            value={videoSort}
            onChange={setVideoSort}
            ariaLabel="Sort playlist videos"
          />
          <div className="space-y-3">
            {sortedVideos.map((video) => (
              <VideoCollectionCard
                key={video._id}
                video={video}
                playlistId={isPlaylistOwner ? playlist._id : undefined}
                horizontal
                dominantColorHover
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="This playlist is empty"
          detail="Add videos to this playlist and they will appear here."
        />
      )}

      {isEditing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              setIsEditing(false);
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
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="rounded-full p-2 transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
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
                  defaultValue={playlist.name}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black outline-none placeholder:text-black/40 focus:border-primary dark:border-white/15 dark:bg-black dark:text-white/60 dark:placeholder:text-white/40"
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                Description
                <textarea
                  name="description"
                  minLength={10}
                  maxLength={1000}
                  defaultValue={playlist.description || ""}
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
                  defaultValue={playlist.isPublished ? "public" : "private"}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black outline-none focus:border-primary dark:border-white/15 dark:bg-black dark:text-white dark:scheme-dark"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
