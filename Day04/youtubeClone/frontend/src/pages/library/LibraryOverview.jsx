import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { likeService, playlistService, userService } from "../../api/services.ts";
import VideoCollectionCard from "../../components/VideoCollectionCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const normalizeVideo = (entry) => entry?.video ?? entry;

export function LibraryOverview() {
  const { user } = useAuth();
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
    queryFn: () => playlistService.list(user._id),
    enabled: !!user?._id,
  });

  const watchlistVideos = watchlistQuery.data?.data || [];
  const likedVideos = (likedQuery.data?.data || [])
    .map(normalizeVideo)
    .filter(Boolean);
  const playlists = playlistQuery.data?.data || [];
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
      <h1 className="text-2xl font-bold">Library</h1>
      <div className="grid gap-4 md:grid-cols-1">
        {collections.map(({ title, description, count, tone, href, preview }) => {
          const hasItems = count > 0 && preview.length > 0;

          return (
            <div
              key={title}
              className={`h-[375px] max-h-[300px] overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br ${tone} p-3 shadow-sm`}
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
                    {count}
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
                            {playlist.totalVideos ?? playlist.videos?.length ?? 0}{" "}
                            videos
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
        })}
      </div>
    </section>
  );
}
