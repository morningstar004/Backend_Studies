import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Play, Shuffle } from "lucide-react";
import { likeService, playlistService, userService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";
import VideoSort, { sortVideos } from "../components/VideoSort.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import formatRelativeTime from "../components/formatRelativeTime.js";

const normalizeVideo = (entry) => entry?.video ?? entry;

export default function Library({ mode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentMode = mode || "overview";
  const [watchlistSort, setWatchlistSort] = useState("uploaded-desc");

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
    enabled: !!user?._id,
    queryFn: () => playlistService.list(user._id),
  });

  const watchlistVideos = watchlistQuery.data?.data || [];
  const likedVideos = (likedQuery.data?.data || [])
    .map(normalizeVideo)
    .filter(Boolean);
  const playlists = playlistQuery.data?.data || [];
  const sortedWatchlistVideos = [...watchlistVideos].sort((left, right) => {
    const leftDate = left.watchlistAddedAt
      ? new Date(left.watchlistAddedAt).getTime()
      : Number.NEGATIVE_INFINITY;
    const rightDate = right.watchlistAddedAt
      ? new Date(right.watchlistAddedAt).getTime()
      : Number.NEGATIVE_INFINITY;
    return rightDate - leftDate;
  });
  const watchlistVideosBySort = sortVideos(sortedWatchlistVideos, watchlistSort);

  const collectionData = {
    watchlist: sortedWatchlistVideos,
    "liked-videos": likedVideos,
  };
  const visibleVideos = collectionData[currentMode] || [];
  const firstWatchlistVideo = sortedWatchlistVideos[0];
  const watchlistVideoIds = watchlistVideosBySort
    .map((video) => video._id)
    .filter(Boolean);
  const startWatchlistPlayback = (videoIds) => {
    const [firstVideoId, ...remainingVideoIds] = videoIds;
    if (!firstVideoId) return;

    const queue = [firstVideoId, ...remainingVideoIds].join(",");
    navigate(
      `/video/${encodeURIComponent(firstVideoId)}?queue=${encodeURIComponent(queue)}`,
    );
  };
  const shuffleWatchlist = () => {
    const shuffledVideoIds = [...watchlistVideoIds];
    for (let index = shuffledVideoIds.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledVideoIds[index], shuffledVideoIds[swapIndex]] = [
        shuffledVideoIds[swapIndex],
        shuffledVideoIds[index],
      ];
    }
    startWatchlistPlayback(shuffledVideoIds);
  };
  const titles = {
    overview: "Library",
    watchlist: "Watchlist",
    playlists: "Playlists",
    "liked-videos": "Liked videos",
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
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{titles[currentMode]}</h1>
        </div>
      </div>

      {currentMode === "overview" ? (
        <div className="grid gap-4 md:grid-cols-1">
          {collections.map(
            ({ title, description, count, tone, href, preview }) => {
              const hasItems = (count ?? 0) > 0 && (preview?.length ?? 0) > 0;

              return (
                <div
                  key={title}
                  className={`overflow-hidden rounded-2xl max-h-[300px] h-[375px] border border-black/10 bg-gradient-to-br ${tone} p-3 shadow-sm`}
                >
                  <Link to={href} className="mb-4 block">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[15px] font-bold text-black/65 dark:text-white/70">
                          {title}
                        </span>
                        <p className="text-[9px] text-black/60 dark:text-white/60">
                          {description}
                        </p>
                      </div>
                      <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[9px] font-semibold dark:bg-white/10">
                        {count ?? 0}
                      </span>
                    </div>
                  </Link>

                  <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {hasItems
                      ? title === "Playlists"
                        ? preview.map((playlist) => (
                            <div
                              key={playlist._id}
                              className="rounded-2xl border border-black/10 bg-white/70 p-2 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                            >
                              <p className="text-xs font-semibold">{playlist.name}</p>
                              <p className="text-[9px] text-black/60 dark:text-white/60">
                                {playlist.totalVideos ??
                                  playlist.videos?.length ??
                                  0} videos
                              </p>
                            </div>
                          ))
                        : preview.map((video) => (
                            <VideoCollectionCard
                              key={video._id}
                              video={video}
                              isInWatchlist={title === "Watchlist"}
                              compact
                              dominantColorHover
                            />
                          ))
                      : null}
                  </div>
                </div>
              );
            },
          )}
        </div>
      ) : currentMode === "playlists" ? (
        playlists.length ? (
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {playlists.map((playlist) => (
              <article
                key={playlist._id}
                className="space-y-3 rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-semibold">{playlist.name}</h2>
                    {playlist.description && (
                      <p className="mt-1 line-clamp-2 text-[10.5px] text-black/60 dark:text-white/60">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[9px] text-black/55 dark:text-white/55">
                    {playlist.totalVideos ?? playlist.videos?.length ?? 0} videos
                  </span>
                </div>
                {playlist.videos?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {playlist.videos.slice(0, 3).map((video) => (
                      <Link
                        key={video._id}
                        to={`/video/${video._id}`}
                        title={video.title}
                        className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black/10 dark:bg-white/10"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full scale-75 object-cover"
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No playlists yet" detail="Create a playlist to collect videos here." />
        )
      ) : visibleVideos.length > 0 ? (
        currentMode === "watchlist" ? (
          <div className="space-y-5">
            <header className="grid overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent shadow-sm dark:border-white/10 sm:grid-cols-[minmax(12rem,0.8fr)_1.2fr]">
              <div className="relative min-h-48 bg-black/10 sm:min-h-56">
                <img
                  src={firstWatchlistVideo.thumbnail}
                  alt={firstWatchlistVideo.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent sm:bg-gradient-to-r" />
              </div>
              <div className="flex flex-col justify-center gap-4 p-5 sm:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/55 dark:text-white/55">
                    Your collection
                  </p>
                  <h2 className="mt-1 text-3xl font-bold">Watchlist</h2>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-black/65 dark:text-white/65">
                  <span>
                    {sortedWatchlistVideos.length}{" "}
                    {sortedWatchlistVideos.length === 1 ? "video" : "videos"} saved
                  </span>
                  <span>
                    Last updated{" "}
                    {formatRelativeTime(firstWatchlistVideo.watchlistAddedAt)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startWatchlistPlayback(watchlistVideoIds)}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <Play size={16} fill="currentColor" />
                    Play all
                  </button>
                  <button
                    type="button"
                    onClick={shuffleWatchlist}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-black/15 bg-white/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/15 dark:bg-black/30 dark:hover:bg-black/50"
                  >
                    <Shuffle size={16} />
                    Shuffle
                  </button>
                </div>
              </div>
            </header>
            <VideoSort value={watchlistSort} onChange={setWatchlistSort} />
            <div className="space-y-3">
              {watchlistVideosBySort.map((video) => (
                <VideoCollectionCard
                  key={video._id}
                  video={video}
                  timestamp={video.watchlistAddedAt}
                  isInWatchlist
                  horizontal
                  dominantColorHover
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {visibleVideos.map((video) => (
              <VideoCollectionCard key={video._id} video={video} compact />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title={currentMode === "watchlist" ? "Watchlist is empty" : "No liked videos yet"}
        />
      )}
    </section>
  );
}
