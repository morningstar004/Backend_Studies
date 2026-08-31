import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { likeService, playlistService, userService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Library({ mode }) {
  const { user } = useAuth();
  const currentMode = mode || "library";

  const query = useQuery({
    queryKey: [currentMode],
    queryFn:
      currentMode === "history"
        ? userService.history
        : currentMode === "watchlist"
          ? userService.watchlist
          : likeService.videos,
  });

  const playlistQuery = useQuery({
    queryKey: ["user-playlists", user?._id],
    enabled: !!user?._id,
    queryFn: () => playlistService.list(user._id),
  });

  const entries = query.data?.data || [];
  const videos =
    currentMode === "history" || currentMode === "watchlist"
      ? entries
      : entries.map((item) => item.video);
  const playlists = playlistQuery.data?.data || [];

  const collections = [
    {
      title: "Watchlist",
      description: "Saved for later",
      count: currentMode === "watchlist" ? videos.length : 0,
      tone: "from-primary/20 via-primary/5 to-transparent",
      href: "/watchlist",
    },
    {
      title: "Playlists",
      description: "Curated collections",
      count: playlists.length,
      tone: "from-blue-500/20 via-blue-500/5 to-transparent",
      href: "/library",
    },
    {
      title: "Liked videos",
      description: "Videos you loved",
      count: currentMode === "library" ? videos.length : 0,
      tone: "from-pink-500/20 via-pink-500/5 to-transparent",
      href: "/library",
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold">
          {currentMode === "history"
            ? "Watch history"
            : currentMode === "watchlist"
              ? "Watchlist"
              : "Your library"}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {collections.map(({ title, description, count, tone, href }) => (
          <Link
            key={title}
            to={href}
            className={`overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br ${tone} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10`}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-sm font-medium text-black/65 dark:text-white/70">
                {title}
              </span>
              <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold dark:bg-white/10">
                {count ?? 0}
              </span>
            </div>
            <p className="text-xl font-bold">{title}</p>
            <p className="mt-1 text-xs text-black/60 dark:text-white/60">
              {description}
            </p>
          </Link>
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

        {query.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((x) => (
              <SkeletonCard key={x} />
            ))}
          </div>
        ) : videos.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((v) => (
              <Link key={v._id} to={`/video/${v._id}`}>
                <img
                  className="aspect-video w-full rounded-xl object-cover"
                  src={v.thumbnail}
                  alt=""
                />
                <p className="mt-2 font-semibold">{v.title}</p>
                <p className="text-xs text-black/55 dark:text-white/55">
                  {v.owner?.fullName}
                </p>
              </Link>
            ))}
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
