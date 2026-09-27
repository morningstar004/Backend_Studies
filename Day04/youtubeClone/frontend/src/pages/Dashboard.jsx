// Import useQuery hook for managing asynchronous data fetching and caching
import { useQuery } from "@tanstack/react-query";
import { Eye, Heart, Users, Video } from "lucide-react";
import { dashboardService } from "../api/services.ts";
import { SkeletonCard, EmptyState } from "../components/States.jsx";
const stat = [
  { key: "totalVideo", label: "Videos", icon: Video },
  { key: "totalViewCount", label: "Views", icon: Eye },
  { key: "subscribers", label: "Subscribers", icon: Users },
  { key: "totalLikes", label: "Likes", icon: Heart },
];
export default function Dashboard() {
  const stats = useQuery({
    queryKey: ["dashboard", "stats"],
    // Fetch dashboard statistics using the dashboardService (dashboardController is has responsible for this)
    queryFn: dashboardService.stats,
  });
  const videos = useQuery({
    queryKey: ["dashboard", "videos"],
    queryFn: dashboardService.videos,
  });
  // Extract the data from the stats query result that is returned from the backend API as an response object.
  const data = stats.data?.data;
  return (
    <section className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold">Creator studio</h1>
        <p className="text-sm text-black/55 dark:text-white/55">
          A state view of your channel.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stat.map(({ key, label, icon: Icon }) => (
          <div className="surface p-4" key={key}>
            <Icon className="mb-5 text-primary" size={19} />
            <p className="text-2xl font-bold">{data?.[key] ?? "—"}</p>
            <p className="text-sm text-black/55 dark:text-white/55">{label}</p>
          </div>
        ))}
      </div>
      <div>
        <h2 className="mb-4 text-lg font-bold">Your videos</h2>
        {/* Displaying a skeleton of the video cards, while the videos complete loading from the DB. */}
        {videos.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((x) => (
              <SkeletonCard key={x} />
            ))}
          </div>
        ) : // Displaying the videos if they are available, otherwise showing an empty state message.
        videos.data?.data?.length ? (
          <div className="space-y-2">
            {videos.data.data.map((v) => (
              <div key={v._id} className="surface flex items-center gap-3 p-3">
                <img
                  className="h-14 w-24 rounded-lg object-cover"
                  src={v.thumbnail}
                  alt=""
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{v.title}</p>
                  <p className="text-xs text-black/55 dark:text-white/55">
                    {v.views} views · {v.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Displaying an empty state message if there are no videos available.
          <EmptyState
            title="No uploads yet"
            detail="Use Create to publish your first video."
          />
        )}
      </div>
    </section>
  );
}
