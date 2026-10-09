import { useQuery } from "@tanstack/react-query";
import { Clock3, Globe2, ListVideo, LockKeyhole } from "lucide-react";
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <article
              key={playlist._id}
              className="relative flex h-85 flex-col overflow-hidden rounded-2xl bg-white/70 shadow-sm transitionhover:shadow-md dark:bg-white/3"
            >
              <div className="relative h-65 shrink-0 flex justify-center items-center overflow-hidden">
                {playlist.videos?.[0]?.thumbnail ? (
                  <img
                    src={playlist.videos[0].thumbnail}
                    alt={`${playlist.videos[0].title || playlist.name} thumbnail`}
                    className="h-[95%] w-[97%] rounded-2xl object-cover transition duration-300"
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
              <div className="flex min-h-0 flex-1 flex-col p-4 pb-14">
                <h2 className=" *:line-clamp-2 font-semibold dark:text-white text-black">
                  {playlist.name}
                </h2>
                <div className="mt-1 flex min-w-0 items-center gap-2 whitespace-nowrap text-sm">
                  <div className="flex shrink-0 items-center gap-2 text-black/60 dark:text-white/60">
                    {playlist.isPublished ? (
                      <Globe2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <LockKeyhole className="h-4 w-4 shrink-0" />
                    )}
                    <span>{playlist.isPublished ? "Public" : "Private"}</span>
                  </div>
                  <span className="shrink-0 text-black/60 dark:text-white/60">
                    •
                  </span>
                  <div className="flex min-w-0 items-center gap-2 text-black/55 dark:text-white/55">
                    <Clock3 className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      Updated{" "}
                      {formatRelativeTime(playlist.updatedAt || playlist.createdAt)}
                    </span>
                  </div>
                <Link
                  to={`/playlist/${playlist._id}`}
                  aria-label={`Open playlist ${playlist.name}`}
                  title="Open playlist"
                  className="absolute right-3 bottom-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-white shadow transition hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ListVideo className="h-4 w-4" />
                </Link>
                </div>
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
