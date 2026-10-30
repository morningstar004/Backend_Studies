// Import query hooks for managing asynchronous data fetching and caching.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Heart, Pencil, Trash2, Users, Video } from "lucide-react";
import { dashboardService, videoService } from "../api/services.ts";
import { SkeletonCard, EmptyState } from "../components/States.jsx";
import { toast } from "sonner";
const stat = [
  { key: "totalVideo", label: "Videos", icon: Video },
  { key: "totalViewCount", label: "Views", icon: Eye },
  { key: "subscribers", label: "Subscribers", icon: Users },
  { key: "totalLikes", label: "Likes", icon: Heart },
];
export default function Dashboard() {
  const queryClient = useQueryClient();
  const deletingVideoRef = useRef(false);
  const [engagementRange, setEngagementRange] = useState("month");
  const stats = useQuery({
    queryKey: ["dashboard", "stats"],
    // Fetch dashboard statistics using the dashboardService (dashboardController is has responsible for this)
    queryFn: dashboardService.stats,
  });
  const videos = useQuery({
    queryKey: ["dashboard", "videos"],
    queryFn: dashboardService.videos,
  });
  const engagement = useQuery({
    queryKey: ["dashboard", "engagement", engagementRange],
    queryFn: () => dashboardService.engagement(engagementRange),
  });
  const deleteMutation = useMutation({
    mutationFn: (videoId) => videoService.delete(videoId),
    onSuccess: async (_, videoId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "videos"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }),
        queryClient.invalidateQueries({ queryKey: ["videos"] }),
        queryClient.invalidateQueries({ queryKey: ["profile-videos"] }),
        queryClient.invalidateQueries({ queryKey: ["video", videoId] }),
        queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
        queryClient.invalidateQueries({ queryKey: ["liked-videos"] }),
        queryClient.invalidateQueries({ queryKey: ["history"] }),
        queryClient.invalidateQueries({ queryKey: ["subscription-videos"] }),
      ]);
      toast.success("Video deleted");
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => {
      deletingVideoRef.current = false;
    },
  });
  // Extract the data from the stats query result that is returned from the backend API as an response object.
  const data = stats.data?.data;
  const viewDays = engagement.data?.data ?? [];
  const maxViews = Math.max(...viewDays.map((day) => day.views), 0);
  const chartMax = Math.max(maxViews, 1);
  const chartPoints = viewDays.map((day, index) => ({
    ...day,
    x: 48 + (index * 652) / Math.max(viewDays.length - 1, 1),
    y: 198 - (day.views / chartMax) * 160,
  }));
  const linePath = chartPoints
    .map(({ x, y }, index) => `${index ? "L" : "M"} ${x} ${y}`)
    .join(" ");
  const areaPath = chartPoints.length
    ? `${linePath} L ${chartPoints.at(-1).x} 198 L ${chartPoints[0].x} 198 Z`
    : "";
  const dateLabels = [0, 0.25, 0.5, 0.75, 1]
    .map(
      (fraction) =>
        viewDays[Math.round(fraction * (viewDays.length - 1))]?.date,
    )
    .filter((date, index, dates) => date && dates.indexOf(date) === index);
  const formatDateLabel = (value) => {
    const date = new Date(value);
    if (engagementRange === "6hour" || engagementRange === "day") {
      return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        timeZone: "UTC",
      });
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      ...(engagementRange === "year" || engagementRange === "all"
        ? { year: "numeric" }
        : { day: "numeric" }),
      timeZone: "UTC",
    });
  };

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
      <section
        className="surface p-4 sm:p-5"
        aria-labelledby="view-engagement-title"
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <h2 id="view-engagement-title" className="text-lg font-bold">
            View engagement
            <span className="mt-1 block text-sm font-normal text-black/55 dark:text-white/55">
              Views over time. Tracking starts with new views.
            </span>
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-black/55 dark:text-white/55">Duration</span>
            <select
              value={engagementRange}
              onChange={(event) => setEngagementRange(event.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black"
              aria-label="View engagement duration"
            >
              <option value="6hour">6 hours</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="3month">3 months</option>
              <option value="year">Year</option>
              <option value="all">All time</option>
            </select>
          </label>
        </div>
        {engagement.isLoading ? (
          <p className="text-sm text-black/55 dark:text-white/55">
            Loading view data...
          </p>
        ) : engagement.isError ? (
          <p role="alert" className="text-sm text-red-500">
            View data could not be loaded. Please try again.
          </p>
        ) : viewDays.length ? (
          <div className="min-w-0">
            <svg
              className="w-full overflow-visible"
              viewBox="0 0 720 250"
              role="img"
              aria-label={`Channel view activity for the selected duration. Peak: ${maxViews.toLocaleString()} views in one period.`}
            >
              {[0, 0.5, 1].map((fraction) => {
                const y = 198 - fraction * 160;
                const value = Math.round(chartMax * fraction);
                return (
                  <g key={fraction}>
                    <line
                      x1="48"
                      x2="700"
                      y1={y}
                      y2={y}
                      className="stroke-black/10 dark:stroke-white/10"
                    />
                    <text
                      x="40"
                      y={y + 4}
                      textAnchor="end"
                      className="fill-black/50 text-[11px] dark:fill-white/50"
                    >
                      {value.toLocaleString()}
                    </text>
                  </g>
                );
              })}
              <path d={areaPath} className="fill-primary/10" />
              <path
                d={linePath}
                fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {chartPoints.map(({ date, views, x, y }) => (
                <circle
                  key={date}
                  cx={x}
                  cy={y}
                  r="3"
                  className="fill-primary"
                >
                  <title>
                    {formatDateLabel(date)}: {views.toLocaleString()} views
                  </title>
                </circle>
              ))}
              {dateLabels.map((date) => {
                const index = viewDays.findIndex((day) => day.date === date);
                const x = chartPoints[index]?.x;
                return (
                  <text
                    key={date}
                    x={x}
                    y="228"
                    textAnchor="middle"
                    className="fill-black/50 text-[11px] dark:fill-white/50"
                  >
                    {formatDateLabel(date)}
                  </text>
                );
              })}
            </svg>
          </div>
        ) : (
          <p className="text-sm text-black/55 dark:text-white/55">
            No view data available for this period yet.
          </p>
        )}
      </section>
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
                <Link
                  to={`/video/${v._id}/edit`}
                  aria-label={`Edit ${v.title}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  <Pencil size={15} />
                  Edit
                </Link>
                <button
                  type="button"
                  aria-label={`Delete ${v.title}`}
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (
                      !deletingVideoRef.current &&
                      window.confirm(
                        `Delete "${v.title}"? This cannot be undone.`,
                      )
                    ) {
                      deletingVideoRef.current = true;
                      deleteMutation.mutate(v._id);
                    }
                  }}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  {deleteMutation.isPending &&
                  deleteMutation.variables === v._id
                    ? "Deleting..."
                    : "Delete"}
                </button>
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
