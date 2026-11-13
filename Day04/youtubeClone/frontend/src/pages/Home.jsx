import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { videoService } from "../api/services.ts";
import { SkeletonCard, EmptyState } from "../components/States.jsx";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";

const Home = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.trim() || "";

  // Fetching the list of videos from the backend API using videoService and react-query.
  const { data, isLoading, error } = useQuery({
    queryKey: ["videos", search],
    queryFn: () => videoService.list({ query: search, limit: 24 }),
  });

  const videos = data?.data?.videos || [];

  return (
    <section className="space-y-6">
      {search && (
        <div className="flex items-center justify-between border-b border-[#22333B]/10 pb-3 dark:border-white/10">
          <h1 className="text-lg font-semibold text-slateDark dark:text-white">
            Search results for <span className="text-primary">"{search}"</span>
          </h1>
          <span className="text-xs text-slateDark/50 dark:text-white/50">
            {videos.length} {videos.length === 1 ? "video" : "videos"} found
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error && videos.length === 0 ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-600 dark:text-red-400">
          Failed to load videos: {error?.message || "Please check your connection and try again."}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          title={search ? "No videos found" : "No videos available yet"}
          detail={search ? "Try searching with different keywords." : "Check back soon or upload your own video."}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCollectionCard key={video._id} video={video} dominantColorHover />
          ))}
        </div>
      )}
    </section>
  );
};

export default Home;
