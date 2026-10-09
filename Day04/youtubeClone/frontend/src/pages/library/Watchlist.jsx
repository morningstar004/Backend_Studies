import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Play, Shuffle } from "lucide-react";
import { userService } from "../../api/services.ts";
import VideoCollectionCard from "../../components/VideoCollectionCard.jsx";
import VideoSort, { sortVideos } from "../../components/VideoSort.jsx";
import { EmptyState } from "../../components/States.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import formatRelativeTime from "../../components/formatRelativeTime.js";

export function Watchlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchlistSort, setWatchlistSort] = useState("uploaded-desc");
  const watchlistQuery = useQuery({
    queryKey: ["watchlist"],
    queryFn: userService.watchlist,
    enabled: !!user?._id,
  });
  const watchlistVideos = watchlistQuery.data?.data || [];
  const sortedWatchlistVideos = [...watchlistVideos].sort((left, right) => {
    const leftDate = left.watchlistAddedAt
      ? new Date(left.watchlistAddedAt).getTime()
      : Number.NEGATIVE_INFINITY;
    const rightDate = right.watchlistAddedAt
      ? new Date(right.watchlistAddedAt).getTime()
      : Number.NEGATIVE_INFINITY;
    return rightDate - leftDate;
  });
  const watchlistVideosBySort = sortVideos(
    sortedWatchlistVideos,
    watchlistSort,
  );
  const watchlistVideoIds = watchlistVideosBySort
    .map((video) => video._id)
    .filter(Boolean);
  const firstWatchlistVideo = sortedWatchlistVideos[0];
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

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Watchlist</h1>
      {firstWatchlistVideo ? (
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
                  {sortedWatchlistVideos.length === 1 ? "video" : "videos"}{" "}
                  saved
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
        <EmptyState title="Watchlist is empty" />
      )}
    </section>
  );
}
