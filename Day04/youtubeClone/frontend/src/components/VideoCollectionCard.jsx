import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import VideoOptionsMenu from "./VideoOptionsMenu.jsx";
import formatRelativeTime from "./formatRelativeTime.js";
import getDominantColor from "../context/dominantColor.js";

const formatDuration = (seconds = 0) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const VideoCollectionCard = ({
  video,
  timestamp = video.createdAt,
  showHistoryRemoval = false,
  compact = false,
}) => {
  const [dominantColor, setDominantColor] = useState("hsl(210 80% 60%)");

  useEffect(() => {
    let isCancelled = false;

    getDominantColor(video.thumbnail).then((color) => {
      if (!isCancelled) setDominantColor(color);
    });

    return () => {
      isCancelled = true;
    };
  }, [video.thumbnail]);

  return (
    <Link
      to={`/video/${video._id}`}
      className="group relative isolate overflow-hidden rounded-2xl transition-colors duration-[400ms] ease-out hover:text-teal-100 text-semibold"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-0 scale-90 rounded-2xl opacity-0 transition-all duration-[400ms] ease-out group-hover:scale-100 group-hover:opacity-60"
        style={{
          backgroundColor: `color-mix(in srgb, ${dominantColor} 65%, black)`,
        }}
      />
      <div className="relative z-10 flex aspect-video items-center justify-center overflow-hidden rounded-2xl">
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`h-[95%] w-[97%] rounded-2xl object-cover transition duration-300`}
        />
        <div
          className={`absolute right-3 rounded-md bg-black/80 px-1.5 font-medium text-white backdrop-blur-md opacity-80 ${
            compact ? "bottom-2 text-[10px]" : "bottom-3 py-0.25 text-[10px]"
          }`}
        >
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className={`relative z-10 flex-col pb-2 ${compact ? "px-3" : "px-4"}`}>
        <h2 className="line-clamp-2 font-bold text-white">
          {video.title}
        </h2>
        <div
          className={`absolute right-3 z-10 flex items-center justify-center rounded-full text-black transition-all duration-300 hover:bg-black/40 dark:text-white ${
            compact ? "bottom-1.5 h-7 w-7" : "bottom-2 h-10 w-10"
          }`}
        >
          <VideoOptionsMenu
            videoId={video._id}
            videoFile={video.videoFile}
            title={video.title}
            showHistoryRemoval={showHistoryRemoval}
            compact={compact}
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          {video.owner?.avatar && (
            <img
              src={video.owner.avatar}
              alt=""
              className={`h-7 w-7 rounded-full object-cover ${compact ? "hidden" : ""}`}
            />
          )}
          <div
            className={`min-w-0 font-mono ${
              compact
                ? "flex flex-1 items-center gap-2 whitespace-nowrap"
                : "flex-col gap-2"
            }`}
          >
            <Link
              to={video.owner?.username ? `/channel/${video.owner.username}` : "#"}
              className={`transition-colors hover:text-primary ${
                compact ? "text-[13px]" : "text-sm"
              }`}
              onClick={(event) => {
                if (!video.owner?.username) event.preventDefault();
              }}
            >
              {video.owner?.fullName || "Creator"}
            </Link>
            {compact ? <span>•</span> : null}
            <div className={`flex gap-1 ${compact ? "shrink-0 items-center" : ""}`}>
              <span className="inline-flex items-center gap-1">
                <Eye size={12} />
                {video.views || 0}
              </span>
              <span>•</span>
              <span>{formatRelativeTime(timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCollectionCard;