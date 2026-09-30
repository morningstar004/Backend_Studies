import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import VideoOptionsMenu from "./VideoOptionsMenu.jsx";
import formatRelativeTime from "./formatRelativeTime.js";

const formatDuration = (seconds = 0) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const VideoCollectionCard = ({ video, timestamp = video.createdAt }) => (
  <Link
    to={`/video/${video._id}`}
    className="group relative isolate overflow-hidden rounded-2xl transition-colors duration-[400ms] ease-out hover:text-teal-100 text-semibold"
  >
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
      <h2 className="line-clamp-2 font-bold text-white">{video.title}</h2>
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
            to={video.owner?.username ? `/channel/${video.owner.username}` : "#"}
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
            <span>{formatRelativeTime(timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default VideoCollectionCard;