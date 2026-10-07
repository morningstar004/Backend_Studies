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
  isInWatchlist = false,
  compact = false,
  horizontal = false,
  dominantColorHover = false,
}) => {
  const [dominantColor, setDominantColor] = useState("hsl(210 80% 60%)");

  useEffect(() => {
    if (!dominantColorHover) return undefined;

    let isCancelled = false;
    getDominantColor(video.thumbnail).then((color) => {
      if (!isCancelled) setDominantColor(color);
    });

    return () => {
      isCancelled = true;
    };
  }, [dominantColorHover, video.thumbnail]);

  if (horizontal) {
    return (
      <article
        className={`group relative isolate overflow-visible rounded-xl border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-slate-900/60 ${
          dominantColorHover ? "transition-colors duration-[400ms]" : ""
        }`}
      >
        {dominantColorHover && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 rounded-xl opacity-0 transition-opacity duration-[400ms] group-hover:opacity-60"
            style={{
              backgroundColor: `color-mix(in srgb, ${dominantColor} 65%, black)`,
            }}
          />
        )}
        <Link
          to={`/video/${video._id}`}
          className="relative z-10 flex gap-4 pr-8"
        >
          <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg sm:w-48">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
            </span>
          </div>
          <div className="min-w-0 flex-1 py-1">
            <h2 className="line-clamp-2 font-semibold">{video.title}</h2>
            <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-black/60 dark:text-white/60">
              {video.owner?.avatar && (
                <img
                  src={video.owner.avatar}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-full object-cover"
                />
              )}
              <span className="truncate">
                {video.owner?.fullName || "Creator"}
              </span>
              <span>•</span>
              <span className="shrink-0">{video.views || 0} views</span>
            </div>
            <p className="mt-2 text-xs text-black/55 dark:text-white/55">
              {timestamp
                ? `Added ${formatRelativeTime(timestamp)}`
                : "Saved date unavailable"}
            </p>
          </div>
        </Link>
        <div className="absolute right-2 top-2 z-30">
          <VideoOptionsMenu
            videoId={video._id}
            videoFile={video.videoFile}
            title={video.title}
            isInWatchlist={isInWatchlist}
            menuPlacement="below"
            buttonClassName="text-black dark:text-white"
          />
        </div>
      </article>
    );
  }

  return (
    <Link
      to={`/video/${video._id}`}
      className={`group relative isolate overflow-hidden rounded-2xl transition-colors duration-[400ms] ease-out hover:text-teal-100 text-semibold`}
    >
      {dominantColorHover && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px z-0 scale-90 rounded-2xl opacity-0 transition-all duration-[400ms] ease-out group-hover:scale-100 group-hover:opacity-60"
          style={{
            backgroundColor: `color-mix(in srgb, ${dominantColor} 65%, black)`,
          }}
        />
      )}
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
          className={`absolute right-2 z-10 flex items-center justify-center rounded-full text-black transition-all duration-300 hover:bg-black/40 dark:text-white ${
            compact ? "bottom-1.5 h-7 w-7" : "bottom-2 h-10 w-10"
          }`}
        >
          <VideoOptionsMenu
            videoId={video._id}
            videoFile={video.videoFile}
            title={video.title}
            showHistoryRemoval={showHistoryRemoval}
            isInWatchlist={isInWatchlist}
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