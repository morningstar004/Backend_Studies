import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3, Globe2, ListVideo, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { playlistService } from "../../api/services.ts";
import { EmptyState } from "../../components/States.jsx";
import formatRelativeTime from "../../components/formatRelativeTime.js";
import { useAuth } from "../../context/AuthContext.jsx";
import getDominantColor from "../../context/dominantColor.js";

function PlaylistCard({ playlist }) {
  const thumbnail = playlist.videos?.[0]?.thumbnail;
  const [dominantColor, setDominantColor] = useState("hsl(210 80% 60%)");

  useEffect(() => {
    if (!thumbnail) return undefined;

    let isCancelled = false;
    getDominantColor(thumbnail).then((color) => {
      if (!isCancelled) setDominantColor(color);
    });

    return () => {
      isCancelled = true;
    };
  }, [thumbnail]);

  return (
    <Link
      to={`/playlist/${playlist._id}`}
      aria-label={`Open playlist ${playlist.name}`}
      className="relative flex h-64 min-w-0 flex-col overflow-hidden rounded-2xl bg-white/70 shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out hover:shadow-md active:scale-[0.98] active:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-white/[0.03] sm:h-72 xl:h-75"
    >
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
        {thumbnail ? (
          <>
            {[0, 1, 2].map((layer) => (
              <div
                key={layer}
                aria-hidden="true"
                className="absolute bottom-0 rounded-xl transition"
                style={{
                  left: `${8-layer * 2}%`,
                  width: `${86.5 - layer * 0.02}%`,
                  right: `${layer * 5}px`,
                  top: `${(layer) * 5}px`,
                  bottom: `${7 - layer * 2}%`,
                  zIndex: layer + 1,
                  backgroundColor: `color-mix(in srgb, ${dominantColor} ${35 + layer * 20}%, black)`,
                }}
              />
            ))}
            <img
              src={thumbnail}
              alt={`${playlist.videos[0].title || playlist.name} thumbnail`}
              className="absolute inset-x-1 bottom-0 z-[5] h-[calc(100%-14px)] w-full rounded-xl object-cover transition duration-300"
              style={{ clipPath: "inset(0 12% 0 0 round 0.75rem)" }}
            />
          </>
        ) : (
          <div className="grid h-full place-items-center text-sm text-black/50 dark:text-white/50">
            No videos yet
          </div>
        )}
        <span className="absolute bottom-3 right-14 z-10 inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-black/75 px-2.5 py-1 pb-1.5 text-xs font-medium text-white">
          <ListVideo className="h-3.5 w-3.5 shrink-0" />
          {playlist.totalVideos ?? playlist.videos?.length ?? 0}{" "}
          {(playlist.totalVideos ?? playlist.videos?.length ?? 0) === 1
            ? "video"
            : "videos"}
        </span>
      </div>
      <div className="flex min-w-0 shrink-0 flex-col p-4 sm:p-4 sm:pb-2.5">
        <h2 className="line-clamp-2 wrap-break-words text-base font-semibold text-black dark:text-white sm:text-lg">
          {playlist.name}
        </h2>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:mt-0.5 sm:flex-nowrap sm:text-sm">
          <div className="flex shrink-0 items-center gap-1.5 text-black/60 dark:text-white/60">
            {playlist.isPublished ? (
              <Globe2 className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
            ) : (
              <LockKeyhole className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            )}
            <span>{playlist.isPublished ? "Public" : "Private"}</span>
          </div>
          <span className="hidden shrink-0 text-black/60 dark:text-white/60 sm:inline">
            •
          </span>
          <div className="flex min-w-0 items-center gap-1.5 text-black/55 dark:text-white/55">
            <Clock3 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="min-w-0 truncate">
              Updated{" "}
              {formatRelativeTime(playlist.updatedAt || playlist.createdAt)}
            </span>
          </div>
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-14 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-white shadow"
          >
            <ListVideo className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function Playlists() {
  const { user } = useAuth();
  const playlistQuery = useQuery({
    queryKey: ["user-playlists", user?._id],
    enabled: !!user?._id,
    queryFn: () => playlistService.list(user._id),
  });
  const playlists = playlistQuery.data?.data || [];

  return (
    <section className="min-w-0 space-y-5 sm:space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Playlists</h1>
      {playlists.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
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
