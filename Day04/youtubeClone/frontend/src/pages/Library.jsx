import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { likeService, playlistService, userService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
import VideoOptionsMenu from "../components/VideoOptionsMenu.jsx";
import formatRelativeTime from "../components/formatRelativeTime.js";
import { useAuth } from "../context/AuthContext.jsx";

const normalizeVideo = (entry) => entry?.video ?? entry;

const formatDuration = (seconds = 0) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

export default function Library({ mode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentMode = mode || "library";
  const [historySearch, setHistorySearch] = useState("");

  const watchlistQuery = useQuery({
    queryKey: ["watchlist"],
    queryFn: userService.watchlist,
    enabled: !!user?._id,
  });

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: userService.history,
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
  const historyVideos = historyQuery.data?.data || [];
  const likedVideos = (likedQuery.data?.data || [])
    .map(normalizeVideo)
    .filter(Boolean);
  const playlists = playlistQuery.data?.data || [];

  const handleClearHistory = async () => {
    if (!historyVideos.length) return;

    if (!window.confirm("Clear your entire watch history?")) return;

    try {
      await userService.clearHistory();
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Watch history cleared.");
    } catch (error) {
      toast.error(error?.message || "Unable to clear watch history.");
    }
  };

  const collectionData = {
    history: historyVideos,
    watchlist: watchlistVideos,
    library: likedVideos,
  };

  const emptyHistorySearch = (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-black/10 bg-gray-500/20 dark:border-white/10 dark:bg-black/20">
      <p className="text-xl font-bold text-black/50 dark:text-white/50">
        No such video exists
      </p>
    </div>
  );

  const visibleVideos = collectionData[currentMode] || [];
  const filteredVideos =
    currentMode === "history"
      ? visibleVideos.filter((video) =>
          String(video.title || "")
            .toLowerCase()
            .includes(historySearch.trim().toLowerCase()),
        )
      : visibleVideos;

  const collections = [
    {
      title: "Watchlist",
      description: "Saved for later",
      count: watchlistVideos.length,
      tone: "from-primary/20 via-primary/5 to-transparent",
      href: "/watchlist",
      preview: watchlistVideos.slice(0, 6),
    },
    {
      title: "Playlists",
      description: "Curated collections",
      count: playlists.length,
      tone: "from-blue-500/20 via-blue-500/5 to-transparent",
      href: "/library",
      preview: playlists.slice(0, 6),
    },
    {
      title: "Liked videos",
      description: "Videos you loved",
      count: likedVideos.length,
      tone: "from-pink-500/20 via-pink-500/5 to-transparent",
      href: "/liked-videos",
      preview: likedVideos.slice(0, 6),
    },
  ];

  const renderVideoCard = (video) => (
    <Link
      key={video._id}
      to={`/video/${video._id}`}
      className="group relative isolate overflow-hidden rounded-2xl transition-colors duration-[400ms] ease-out hover:text-teal-100 text-semibold"
    >
      {/* <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-0 scale-90 rounded-2xl opacity-0 transition-all duration-[400ms] ease-out group-hover:scale-100 group-hover:opacity-60"
      /> */}
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-[95%] w-[97%] rounded-2xl object-cover transition duration-300"
        />
        <div className="absolute bottom-3 right-3 rounded-md bg-black/80 px-1.5 py-0.25 text-[10px] font-medium text-white backdrop-blur-md opacity-80">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="relative z-10 flex-col px-4 pb-2">
        <h2 className="line-clamp-2 font-bold text-white">{video.title}</h2>
        <div className="absolute bottom-2 right-3 z-10 text-black dark:text-white hover:bg-black/40 duration-300 transition-all rounded-full h-10 w-10 flex justify-center items-center">
          <VideoOptionsMenu
            videoId={video._id}
            videoFile={video.videoFile}
            title={video.title}
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          {video.owner?.avatar && (
            <img
              src={video.owner.avatar}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          )}
          <div className="flex-col gap-2 font-mono">
            <Link
              to={
                video.owner?.username ? `/channel/${video.owner.username}` : "#"
              }
              className="transition-colors text-sm hover:text-primary"
              onClick={(event) => {
                if (!video.owner?.username) event.preventDefault();
              }}
            >
              {video.owner?.fullName || "Creator"}
            </Link>
            <div className="flex gap-1">
              <span className="inline-flex items-center gap-1">
                <Eye size={12} />
                {video.views || 0}
              </span>
              <span>•</span>
              <span>{formatRelativeTime(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            {currentMode === "history"
              ? "Watch history"
              : currentMode === "watchlist"
                ? "Watchlist"
                : "Library"}
          </h1>
          {currentMode === "history" && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <label className="relative w-full sm:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                  size={17}
                />
                <input
                  type="search"
                  aria-label="Search watch history"
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  placeholder="Search watch history"
                  className="input w-full rounded-3xl pl-9"
                />
              </label>
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={!historyVideos.length}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                Clear history
              </button>
            </div>
          )}
        </div>
      </div>

      {currentMode !== "library" ? (
        filteredVideos.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => renderVideoCard(video))}
          </div>
        ) : currentMode === "history" && historySearch.trim() ? (
          emptyHistorySearch
        ) : null
      ) : (
        <div className="grid gap-4 md:grid-cols-1">
          {collections.map(
            ({ title, description, count, tone, href, preview }) => {
              const hasItems = (count ?? 0) > 0 && (preview?.length ?? 0) > 0;

              return (
                <div
                  key={title}
                  className={`overflow-hidden rounded-2xl max-h-[400px] h-[500px] border border-black/10 bg-gradient-to-br ${tone} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  {hasItems ? (
                    <Link to={href} className="mb-4 block">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-black/65 dark:text-white/70">
                            {title}
                          </span>
                          <p className="text-xs text-black/60 dark:text-white/60">
                            {description}
                          </p>
                        </div>
                        <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold dark:bg-white/10">
                          {count ?? 0}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="mb-4 block">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-black/65 dark:text-white/70">
                            {title}
                          </span>
                          <p className="text-xs text-black/60 dark:text-white/60">
                            {description}
                          </p>
                        </div>
                        <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold dark:bg-white/10">
                          {count ?? 0}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {hasItems
                      ? title === "Playlists"
                        ? preview.map((playlist) => (
                            <Link
                              key={playlist._id}
                              to={"/library"}
                              className="rounded-2xl border border-black/10 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                            >
                              <p className="font-semibold">{playlist.name}</p>
                              <p className="text-xs text-black/60 dark:text-white/60">
                                {playlist.totalVideos ??
                                  playlist.videos?.length ??
                                  0}{" "}
                                videos
                              </p>
                            </Link>
                          ))
                        : preview.map((video) => renderVideoCard(video))
                      : null}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}
