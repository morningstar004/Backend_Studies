import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { likeService, playlistService, userService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const normalizeVideo = (entry) => entry?.video ?? entry;

export default function Library({ mode }) {
  const { user } = useAuth();
  const currentMode = mode || "overview";

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
    "liked-videos": likedVideos,
  };
  const visibleVideos = collectionData[currentMode] || [];
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
                  className={`overflow-hidden rounded-2xl max-h-[300px] h-[375px] border border-black/10 bg-gradient-to-br ${tone} p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
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

                  <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {hasItems
                      ? title === "Playlists"
                        ? preview.map((playlist) => (
                            <div
                              key={playlist._id}
                              className="rounded-2xl border border-black/10 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                            >
                              <p className="font-semibold">{playlist.name}</p>
                              <p className="text-xs text-black/60 dark:text-white/60">
                                {playlist.totalVideos ??
                                  playlist.videos?.length ??
                                  0} videos
                              </p>
                            </div>
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
                    <h2 className="font-semibold">{playlist.name}</h2>
                    {playlist.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-black/60 dark:text-white/60">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-black/55 dark:text-white/55">
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
                        className="aspect-video overflow-hidden rounded-lg bg-black/10 dark:bg-white/10"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover"
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
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {visibleVideos.map((video) => (
            <VideoCollectionCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={currentMode === "watchlist" ? "Watchlist is empty" : "No liked videos yet"}
        />
      )}
    </section>
  );
}
