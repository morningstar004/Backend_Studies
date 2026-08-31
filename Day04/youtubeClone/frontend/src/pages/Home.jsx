import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { videoService } from "../api/services.ts";
import { SkeletonCard, EmptyState } from "../components/States.jsx";
import VideoOptionsMenu from "../components/VideoOptionsMenu.jsx";
import { Link, useSearchParams } from "react-router-dom";

const getDominantColor = (src) => {
  if (!src) return Promise.resolve("hsl(210 80% 60%)");

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 36;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);

        const { data } = ctx.getImageData(0, 0, size, size);
        const colorBuckets = new Map();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const saturation = max === 0 ? 0 : delta / max;
          const brightness = max / 255;

          // Ignore near-black, near-white, and grey pixels so an actual scene colour
          // (sky blue, fire orange, grass green, etc.) is selected instead.
          if (saturation < 0.12 || brightness < 0.12 || brightness > 0.96)
            continue;

          // Group similar RGB pixels, while retaining their real RGB values rather
          // than converting every thumbnail to one fixed saturation/lightness.
          const bucket = `${Math.round(r / 32) * 32}-${Math.round(g / 32) * 32}-${Math.round(b / 32) * 32}`;
          const weight = 0.5 + saturation;
          const existing = colorBuckets.get(bucket) || {
            weight: 0,
            r: 0,
            g: 0,
            b: 0,
          };

          existing.weight += weight;
          existing.r += r * weight;
          existing.g += g * weight;
          existing.b += b * weight;
          colorBuckets.set(bucket, existing);
        }

        let dominantColor;

        colorBuckets.forEach((color) => {
          if (!dominantColor || color.weight > dominantColor.weight) {
            dominantColor = color;
          }
        });

        if (!dominantColor) {
          resolve("hsl(32 85% 60%)");
          return;
        }

        const { weight, r, g, b } = dominantColor;
        resolve(
          `rgb(${Math.round(r / weight)} ${Math.round(g / weight)} ${Math.round(b / weight)})`,
        );
      } catch {
        resolve("hsl(210 80% 60%)");
      }
    };

    img.onerror = () => resolve("hsl(210 80% 60%)");
    img.src = src;
  });
};

const formatDuration = (seconds = 0) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "recently";

  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? "1 min ago" : `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
};

const Home = () => {
  const [searchParams] = useSearchParams();
  const [dominantColors, setDominantColors] = useState({});
  const search = searchParams.get("search")?.trim() || "";
  // Fetching the list of videos from the backend API using the videoService and react-query.
  const { data, isLoading, error } = useQuery({
    queryKey: ["videos", search],
    queryFn: () => videoService.list({ query: search, limit: 18 }),
  });
  // Extracting the list of videos from the data returned by the query. If no videos are found, an empty array is used as a fallback.
  const videos = data?.data?.videos || [];

  useEffect(() => {
    if (!videos.length) return;

    let isCancelled = false;

    const loadColors = async () => {
      const nextColors = {};

      for (const video of videos) {
        if (!video?._id) continue;
        nextColors[video._id] = await getDominantColor(video.thumbnail);
      }

      if (!isCancelled) {
        setDominantColors(nextColors);
      }
    };

    loadColors();

    return () => {
      isCancelled = true;
    };
  }, [videos]);

  return (
    <section className="space-y-6">
      {/* // Displaying the videos if they are available, otherwise showing a skeleton or an empty state message. */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : // Displaying an error message if there is an error while fetching the videos.
      error ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          <div className="font-semibold">Failed to load videos</div>
          <div className="mt-1">
            {error.message ||
              "An unexpected error occurred. Please try again later."}
          </div>
        </div>
      ) : // Displaying an empty state message if there are no videos available.
      videos.length === 0 ? (
        <EmptyState
          title="No videos found"
          detail="Try a different search phrase."
        />
      ) : (
        // Displaying the list of videos if they are available.
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/video/${video._id}`}
              className="group relative isolate overflow-hidden rounded-2xl transition-colors duration-[400ms] ease-out hover:text-teal-100 text-semibold"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px z-0 scale-90 rounded-2xl opacity-0 transition-all duration-[400ms] ease-out group-hover:scale-100 group-hover:opacity-60"
                style={{
                  backgroundColor: `color-mix(in srgb, ${dominantColors[video._id] || "hsl(210 80% 60%)"} 65%, black)`,
                }}
              />
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-[95%] w-[97%] rounded-2xl object-cover transition duration-300"
                />
                <div className="absolute bottom-3 right-3 rounded-md bg-black/80 px-1.5 py-0.25 text-[10px] font-medium text-white backdrop-blur-md opacity-80">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="relative z-10 flex-col px-4 pb-2">
                <h2 className="line-clamp-2 font-bold text-white">
                  {video.title}
                </h2>
                <div className="absolute bottom-2 right-3 z-10 text-black dark:text-white hover:bg-black/40 duration-300 transition-all rounded-full h-10 w-10 flex justify-center items-center">
                  <VideoOptionsMenu
                    videoId={video._id}
                    videoFile={video.videoFile}
                    title={video.title}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {video.owner?.avatar && (
                    <img
                      src={video.owner.avatar}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-col gap-2 font-mono">
                    <Link
                      to={
                        video.owner?.username
                          ? `/channel/${video.owner.username}`
                          : "#"
                      }
                      className="transition-colors text-sm hover:text-primary"
                      onClick={(event) => {
                        if (!video.owner?.username) event.preventDefault();
                      }}
                    >
                      {video.owner?.fullName || "Creator"}
                    </Link>
                    <div className="flex gap-1">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={12} />
                        {video.views || 0}
                      </span>
                      <span>•</span>
                      <span>{formatRelativeTime(video.createdAt)}</span>
                    </div>
                  </div>
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
