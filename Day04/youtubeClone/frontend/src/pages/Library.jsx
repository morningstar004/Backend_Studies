import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { likeService, playlistService, userService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const normalizeVideo = (entry) => entry?.video ?? entry;

export default function Library({ mode }) {
  const { user } = useAuth();
  const currentMode = mode || "library";

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
  const likedVideos = (likedQuery.data?.data || []).map(normalizeVideo).filter(Boolean);
  const playlists = playlistQuery.data?.data || [];

  const collectionData = {
    history: historyVideos,
    watchlist: watchlistVideos,
    library: likedVideos,
  };

  const visibleVideos = collectionData[currentMode] || [];

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
    <Link key={video._id} to={`/video/${video._id}`} className="block">
      <img
        className="aspect-video w-full rounded-xl object-cover"
        src={video.thumbnail}
        alt={video.title}
      />
      <p className="mt-2 font-semibold">{video.title}</p>
      <p className="text-xs text-black/55 dark:text-white/55">
        {video.owner?.fullName || "Unknown creator"}
      </p>
    </Link>
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold">
          {currentMode === "history"
            ? "Watch history"
            : currentMode === "watchlist"
              ? "Watchlist"
              : "Library"}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {collections.map(({ title, description, count, tone, href, preview }) => (
          <div
            key={title}
            className={`overflow-hidden rounded-2xl max-h-[380px] h-[500px] border border-black/10 bg-gradient-to-br ${tone} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
          >
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

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {title === "Playlists"
                ? preview.map((playlist) => (
                    <Link
                      key={playlist._id}
                      to={"/library"}
                      className="rounded-2xl border border-black/10 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                    >
                      <p className="font-semibold">{playlist.name}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">
                        {playlist.totalVideos ?? playlist.videos?.length ?? 0} videos
                      </p>
                    </Link>
                  ))
                : preview.map((video) => renderVideoCard(video))}
            </div>
          </div>
        ))}
      </div>

      <div>
        {currentMode !== "history" &&
          currentMode !== "watchlist" &&
          playlists.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-bold">Your playlists</h2>
              <div className="flex flex-wrap gap-3">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
                  >
                    <p className="font-semibold">{playlist.name}</p>
                    <p className="text-xs text-black/60 dark:text-white/60">
                      {playlist.totalVideos ?? playlist.videos?.length ?? 0}{" "}
                      videos
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        <h2 className="mb-3 text-xl font-bold">
          {currentMode === "history"
            ? "Watch history"
            : currentMode === "watchlist"
              ? "Watchlist videos"
              : "Liked videos"}
        </h2>

        {watchlistQuery.isLoading || historyQuery.isLoading || likedQuery.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((x) => (
              <SkeletonCard key={x} />
            ))}
          </div>
        ) : visibleVideos.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleVideos.map((video) => renderVideoCard(normalizeVideo(video)))}
          </div>
        ) : (
          <EmptyState
            title="Your library is empty"
            detail="Videos you like or watch will appear here."
          />
        )}
      </div>
    </section>
  );
}
