import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { likeService, userService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
export default function Library({ mode }) {
  const query = useQuery({
    queryKey: [mode || "library"],
    queryFn: mode === "history" ? userService.history : likeService.videos,
  });
  const entries = query.data?.data || [];
  const videos =
    mode === "history" ? entries : entries.map((item) => item.video);
  return (
    <section>
      <h1 className="text-2xl font-bold">
        {mode === "history" ? "Watch history" : "Liked videos"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-black/55 dark:text-white/55">
        {mode === "history"
          ? "Recently watched from your account."
          : "Videos you have saved with a like."}
      </p>
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
    </section>
  );
}
