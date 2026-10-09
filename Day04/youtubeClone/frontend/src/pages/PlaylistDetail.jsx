import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Globe2, LockKeyhole } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { playlistService } from "../api/services.ts";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";
import { EmptyState } from "../components/States.jsx";
import formatRelativeTime from "../components/formatRelativeTime.js";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const playlistQuery = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => playlistService.byId(playlistId),
    enabled: !!playlistId,
  });
  const playlist = playlistQuery.data?.data;

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

  return (
    <section className="space-y-6">
      <Link
        to="/library/playlists"
        className="inline-flex items-center gap-2 text-sm font-medium text-black/65 transition hover:text-primary dark:text-white/65"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to playlists
      </Link>

      <header className="rounded-2xl border border-black/10 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 dark:border-white/10 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{playlist.name}</h1>
            {playlist.description && (
              <p className="mt-3 max-w-2xl text-sm text-black/65 dark:text-white/65">
                {playlist.description}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-black/20">
            {playlist.isPublished ? (
              <Globe2 className="h-4 w-4 text-primary" />
            ) : (
              <LockKeyhole className="h-4 w-4" />
            )}
            {playlist.isPublished ? "Public" : "Private"}
          </span>
        </div>
        <p className="mt-5 text-sm text-black/55 dark:text-white/55">
          {videos.length} {videos.length === 1 ? "video" : "videos"} · Updated{" "}
          {formatRelativeTime(playlist.updatedAt || playlist.createdAt)}
        </p>
      </header>

      {videos.length ? (
        <div className="space-y-3">
          {videos.map((video) => (
            <VideoCollectionCard key={video._id} video={video} horizontal />
          ))}
        </div>
      ) : (
        <EmptyState
          title="This playlist is empty"
          detail="Add videos to this playlist and they will appear here."
        />
      )}
    </section>
  );
}
