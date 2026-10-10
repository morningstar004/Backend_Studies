import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { likeService, playlistService, userService } from "../../api/services.ts";
import VideoCollectionCard from "../../components/VideoCollectionCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const normalizeVideo = (entry) => entry?.video ?? entry;

export function LibraryOverview() {
  const navigate = useNavigate();
  const collectionScrollRefs = useRef(new Map());
  const previewCardClassName =
    "w-[calc((100%_-_1rem)/2)] shrink-0 snap-start sm:w-[calc((100%_-_2rem)/3)] xl:w-[calc((100%_-_3rem)/4)]";
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
              className={`h-100 max-h-80 px-6 overflow-hidden rounded-2xl border border-black/10 bg-linear-to-br ${tone} p-3 shadow-sm`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[15px] font-bold text-black/65 dark:text-white/70">
                    {title}
                  </span>
                  <p className="text-[9px] text-black/60 dark:text-white/60">
                    {description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Scroll ${title} left`}
                    onClick={() =>
                      collectionScrollRefs.current
                        .get(title)
                        ?.scrollBy({ left: -320, behavior: "smooth" })
                    }
                    className="rounded-full border border-white/50 bg-white/35 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.2)] dark:hover:bg-white/15"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Scroll ${title} right`}
                    onClick={() =>
                      collectionScrollRefs.current
                        .get(title)
                        ?.scrollBy({ left: 320, behavior: "smooth" })
                    }
                    className="rounded-full border border-white/50 bg-white/35 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.2)] dark:hover:bg-white/15"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(href)}
                    className="rounded-full border border-white/50 bg-white/35 px-3 py-1.5 text-sm font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.2)] dark:hover:bg-white/15"
                  >
                    View all {count}
                  </button>
                </div>
              </div>

              <div
                ref={(element) => {
                  if (element) collectionScrollRefs.current.set(title, element);
                  else collectionScrollRefs.current.delete(title);
                }}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-t-2xl bg-amber-50/5 p-4 shadow-[inset_0_10px_14px_rgba(0,0,0,0.10),inset_12px_0_14px_rgba(0,0,0,0.08),inset_-12px_0_14px_rgba(0,0,0,0.08)] dark:bg-amber-50/5 dark:shadow-[inset_0_10px_14px_rgba(255,255,255,0.06),inset_12px_0_14px_rgba(255,255,255,0.04),inset_-12px_0_14px_rgba(255,255,255,0.04)]"
              >
                {hasItems
                  ? title === "Playlists"
                    ? preview.map((playlist) => (
                        <div
                          key={playlist._id}
                          className={`${previewCardClassName} overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-2 shadow-sm dark:border-white/10 dark:bg-slate-900/70`}
                        >
                          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
                            {playlist.videos?.[0]?.thumbnail ? (
                              <>
                                {[0, 1, 2].map((layer) => (
                                  <div
                                    key={layer}
                                    aria-hidden="true"
                                    className="absolute bottom-1 rounded-lg bg-slate-500/50"
                                    style={{
                                      left: `${8 - layer * 2}%`,
                                      width: `${86.5 - layer * 0.02}%`,
                                      right: `${layer * 5}px`,
                                      top: `${layer * 5}px`,
                                      bottom: `${7 - layer * 2}%`,
                                      zIndex: layer + 1,
                                    }}
                                  />
                                ))}
                                <img
                                  src={playlist.videos[0].thumbnail}
                                  alt=""
                                  aria-hidden="true"
                                  className="absolute inset-x-1 bottom-0 z-[5] h-[calc(100%-8px)] w-full rounded-xl object-cover"
                                  style={{ clipPath: "inset(0 12% 0 0 round 0.75rem)" }}
                                />
                              </>
                            ) : (
                              <p className="text-[9px] text-black/50 dark:text-white/50">
                                No videos yet
                              </p>
                            )}
                            <span className="absolute bottom-1.5 right-2 z-10 rounded-lg bg-black/75 px-2 py-1 text-[9px] font-medium text-white">
                              {playlist.totalVideos ?? playlist.videos?.length ?? 0}{" "}
                              videos
                            </span>
                          </div>
                          <p className="mt-2 truncate text-xs font-semibold">
                            {playlist.name}
                          </p>
                        </div>
                      ))
                    : preview.map((video) => (
                        <div
                          key={video._id}
                          className={previewCardClassName}
                        >
                          <VideoCollectionCard
                            video={video}
                            isInWatchlist={title === "Watchlist"}
                            compact
                            dominantColorHover
                          />
                        </div>
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
