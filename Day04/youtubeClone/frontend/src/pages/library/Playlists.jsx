import { useQuery } from "@tanstack/react-query";
import { Clock3, Globe2, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { playlistService } from "../../api/services.ts";
import { EmptyState } from "../../components/States.jsx";
import formatRelativeTime from "../../components/formatRelativeTime.js";
import { useAuth } from "../../context/AuthContext.jsx";

export function Playlists() {
  const { user } = useAuth();
  const playlistQuery = useQuery({
    queryKey: ["user-playlists", user?._id],
    enabled: !!user?._id,
    queryFn: () => playlistService.list(user._id),
  });
  const playlists = playlistQuery.data?.data || [];

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Playlists</h1>
      {playlists.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
          {playlists.map((playlist) => (
            <article
              key={playlist._id}
              className="flex h-80 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm transition hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="relative h-36 shrink-0 overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-black/10 dark:to-white/10">
                {playlist.videos?.[0]?.thumbnail ? (
                  <img
                    src={playlist.videos[0].thumbnail}
                    alt={`${playlist.videos[0].title || playlist.name} thumbnail`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-black/50 dark:text-white/50">
                    No videos yet
                  </div>
                )}
                <span className="absolute bottom-3 right-3 shrink-0 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white">
                  {playlist.totalVideos ?? playlist.videos?.length ?? 0}{" "}
                  {(playlist.totalVideos ?? playlist.videos?.length ?? 0) === 1
                    ? "video"
                    : "videos"}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <h2 className="line-clamp-2 text-lg font-semibold leading-snug">
                  {playlist.name}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                  {playlist.isPublished ? (
                    <Globe2 className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <LockKeyhole className="h-4 w-4 shrink-0" />
                  )}
                  <span>{playlist.isPublished ? "Public" : "Private"}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-black/55 dark:text-white/55">
                  <Clock3 className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Updated{" "}
                    {formatRelativeTime(playlist.updatedAt || playlist.createdAt)}
                  </span>
                </div>
                <Link
                  to={`/playlist/${playlist._id}`}
                  className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Open playlist
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No playlists yet"
          detail="Create a playlist to collect videos here."
        />
      )}
    </section>
  );
}
