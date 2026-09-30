import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { likeService, playlistService, userService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";
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

  const collectionData = {
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

  return (
    <section className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            {currentMode === "watchlist" ? "Watchlist" : "Library"}
          </h1>
        </div>
      </div>

      {currentMode !== "library" ? (
        visibleVideos.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleVideos.map((video) => (
              <VideoCollectionCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={currentMode === "watchlist" ? "Watchlist is empty" : "No videos yet"}
          />
        )
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
                        : preview.map((video) => (
                            <VideoCollectionCard key={video._id} video={video} />
                          ))
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
