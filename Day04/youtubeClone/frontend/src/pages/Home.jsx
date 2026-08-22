import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye } from "lucide-react";
import { videoService } from "../api/services.ts";
import { SkeletonCard, EmptyState } from "../components/States.jsx";
import { Link } from "react-router-dom";

const Home = () => {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  // Fetching the list of videos from the backend API using the videoService and react-query.
  const { data, isLoading, error } = useQuery({
    queryKey: ["videos", search],
    queryFn: () => videoService.list({ query: search, limit: 18 }),
  });
  // Extracting the list of videos from the data returned by the query. If no videos are found, an empty array is used as a fallback.
  const videos = data?.data?.videos || [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Discover videos
          </h1>
          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            Fresh ideas from the community.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(query);
          }}
          className="relative max-w-sm flex-1 right-96"
        >
          <Search
            className="absolute left-3 top-3 text-black/40 dark:text-white/40"
            size={17}
          />
          <input
            className="input pl-9 rounded-3xl w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos"
          />
        </form>
      </div>
          {/* // Displaying the videos if they are available, otherwise showing a skeleton or an empty state message. */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        // Displaying an error message if there is an error while fetching the videos.
      ) : error ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          {error.message}
        </div>
        // Displaying an empty state message if there are no videos available.
      ) : videos.length === 0 ? (
        <EmptyState
          title="No videos found"
          detail="Try a different search phrase."
        />
        // Displaying the list of videos if they are available.
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/video/${video._id}`}
              className="group overflow-hidden rounded-2xl transition"
            >
              <div className="aspect-video overflow-hidden rounded-xl bg-black/10 dark:bg-white/10">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                <h2 className="line-clamp-2 font-semibold">{video.title}</h2>
                <div className="mt-2 flex items-center gap-2 text-xs text-black/55 dark:text-white/55">
                  {video.owner?.avatar && (
                    <img
                      src={video.owner.avatar}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  )}
                  <span>{video.owner?.fullName || "Creator"}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={12} />
                    {video.views || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Home;
