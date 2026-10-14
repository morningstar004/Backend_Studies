import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Globe2,
  LockKeyhole,
  Play,
  Shuffle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { playlistService } from "../api/services.ts";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";
import VideoSort, { sortVideos } from "../components/VideoSort.jsx";
import { EmptyState } from "../components/States.jsx";
import formatRelativeTime from "../components/formatRelativeTime.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoSort, setVideoSort] = useState("uploaded-desc");
  const playlistQuery = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => playlistService.byId(playlistId),
    enabled: !!playlistId,
  });
  const playlist = playlistQuery.data?.data;

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

  if (playlistQuery.isError || !playlist) {
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
            <div className="flex flex-wrap gap-3">
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
            </div>
          </div>
        </header>
      ) : (
        <header className="rounded-2xl border border-black/10 bg-linear-to-br from-primary/20 via-primary/5 to-transparent p-6 shadow-sm dark:border-white/10 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/55 dark:text-white/55">
            Playlist
          </p>
          <h1 className="mt-1 text-3xl font-bold">{playlist.name}</h1>
          {playlist.description && (
            <p className="mt-3 text-sm text-black/65 dark:text-white/65">
              {playlist.description}
            </p>
          )}
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
    </section>
  );
}
