import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Bookmark,
  Download,
  Maximize,
  Minimize,
  MessageCircle,
  Pause,
  Play,
  Send,
  Settings,
  Share2,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  commentService,
  likeService,
  subscriptionService,
  userService,
  videoService,
} from "../api/services.ts";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "sonner";

const VideoDetail = () => {
  const { videoId } = useParams();
  const [content, setContent] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { user } = useAuth();
  const client = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => videoService.byId(videoId),
    enabled: !!user,
  });
  const video = data?.data;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const togglePlayback = () => {
    const player = videoRef.current;
    if (!player) return;
    if (player.paused) player.play();
    else player.pause();
  };

  const seekVideo = (event) => {
    const nextTime = Number(event.target.value);
    if (videoRef.current) videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const changeVolume = (event) => {
    const nextVolume = Number(event.target.value);
    const player = videoRef.current;
    if (player) {
      player.volume = nextVolume;
      player.muted = nextVolume === 0;
    }
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  };

  const toggleMute = () => {
    const player = videoRef.current;
    if (!player) return;
    player.muted = !player.muted;
    setIsMuted(player.muted);
  };

  const changePlaybackRate = (rate) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setSettingsOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) playerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };
  const comments = useQuery({
    queryKey: ["comments", videoId],
    queryFn: () => commentService.list(videoId),
    enabled: !!video,
  });
  const addComment = useMutation({
    mutationFn: () => commentService.create(videoId, content),
    onSuccess: () => {
      setContent("");
      client.invalidateQueries({ queryKey: ["comments", videoId] });
      toast.success("Comment added");
    },
    onError: (e) => toast.error(e.message),
  });
  const like = useMutation({
    mutationFn: () => likeService.video(videoId),
    onSuccess: (r) => {
      client.invalidateQueries({ queryKey: ["video", videoId] });
      client.invalidateQueries({ queryKey: ["liked-videos"] });
      toast.success(r.message);
    },
    onError: (e) => toast.error(e.message),
  });
  const dislike = useMutation({
    mutationFn: () => likeService.videoDislike(videoId),
    onSuccess: (r) => {
      client.invalidateQueries({ queryKey: ["video", videoId] });
      client.invalidateQueries({ queryKey: ["liked-videos"] });
      toast.success(r.message);
    },
    onError: (e) => toast.error(e.message),
  });
  const watchlist = useMutation({
    mutationFn: () => userService.toggleWatchlist(videoId),
    onSuccess: (r) => {
      client.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(r.message);
    },
    onError: (e) => toast.error(e.message),
  });
  const subscription = useMutation({
    mutationFn: () => subscriptionService.toggle(video.owner._id),
    onSuccess: (r) => {
      client.invalidateQueries({ queryKey: ["video", videoId] });
      toast.success(r.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const shareVideo = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: video?.title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Video link copied to clipboard.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") toast.error("Unable to share video.");
    }
  };

  const downloadVideo = () => {
    const link = document.createElement("a");
    link.href = video.videoFile;
    link.download = `${video.title.replace(/\s+/g, "-").toLowerCase()}.mp4`;
    link.rel = "noopener noreferrer";
    link.click();
  };

  if (error) {
    return (
      <div className="rounded-3xl bg-danger/20 p-8 text-mist">{error}</div>
    );
  }

  if (!user)
    return (
      <div className="surface p-8 text-center">
        Sign in to watch videos and keep your history.
      </div>
    );
  if (isLoading || !video) {
    return <div className="surface animate-pulse p-8">Loading video…</div>;
  }

  return (
    <article className="mx-auto max-w-5xl space-y-6">
      <div
        ref={playerRef}
        className="group relative overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/25"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="aspect-video w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
          onVolumeChange={(event) => {
            setVolume(event.currentTarget.volume);
            setIsMuted(event.currentTarget.muted);
          }}
          onClick={togglePlayback}
        >
          <source src={video.videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-3 pb-3 pt-14 text-white sm:px-5 sm:pb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={seekVideo}
            aria-label="Video timeline"
            className="player-range player-timeline mb-3 w-full"
            style={{ "--progress": `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="player-control"
            >
              {isPlaying ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}
            </button>
            <div className="group/volume flex items-center">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted || volume === 0 ? "Unmute video" : "Mute video"}
                className="player-control"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={changeVolume}
                aria-label="Volume"
                className="player-range ml-1 w-0 opacity-0 transition-all duration-200 group-hover/volume:w-20 group-hover/volume:opacity-100 focus:w-20 focus:opacity-100"
                style={{ "--progress": `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums text-white/90 sm:text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((open) => !open)}
                  aria-label="Video settings"
                  aria-expanded={settingsOpen}
                  className="player-control"
                >
                  <Settings
                    size={20}
                    className={`transition-transform duration-300 ease-out ${
                      settingsOpen ? "rotate-[30deg]" : "rotate-0"
                    }`}
                  />
                </button>
                {settingsOpen && (
                  <div className="absolute bottom-11 right-0 w-40 overflow-hidden rounded-xl border border-white/15 bg-black/90 p-1.5 shadow-xl backdrop-blur">
                    <p className="px-2 py-1.5 text-xs font-semibold text-white/60">Playback speed</p>
                    {[0.5, 1, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => changePlaybackRate(rate)}
                        className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/15"
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="player-control"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{video.title}</h1>
        <div className="surface flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={video.owner?.avatar}
              alt=""
            />
            <div>
              <p className="font-semibold">{video.owner?.fullName}</p>
              <p className="text-sm text-black/55 dark:text-white/55">
                @{video.owner?.username}
              </p>
            </div>
            {video.owner?._id !== user?._id && (
              <button
                type="button"
                onClick={() => subscription.mutate()}
                disabled={subscription.isPending}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                  video.owner?.isSubscribed
                    ? "border border-black/10 hover:border-primary hover:text-primary dark:border-white/10"
                    : "bg-primary text-white hover:brightness-110"
                }`}
              >
                {video.owner?.isSubscribed ? (
                  <>
                    <Bell size={16} className="fill-current" />
                    Subscribed
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Subscribe
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => like.mutate()}
              disabled={like.isPending}
              aria-label="Like video"
              title="Like"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 transition hover:border-primary hover:text-primary disabled:opacity-50 dark:border-white/10"
            >
              <ThumbsUp
                size={17}
                className={video.isLiked ? "fill-primary text-primary" : ""}
              />
              {video.likeCount ?? 0}
            </button>
            <button
              type="button"
              onClick={() => dislike.mutate()}
              disabled={dislike.isPending}
              aria-label="Dislike video"
              title="Dislike"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 transition hover:border-primary hover:text-primary disabled:opacity-50 dark:border-white/10"
            >
              <ThumbsDown
                size={17}
                className={video.isDisliked ? "fill-primary text-primary" : ""}
              />
              {video.dislikeCount ?? 0}
            </button>
            <button
              type="button"
              onClick={shareVideo}
              aria-label="Share video"
              title="Share"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 transition hover:border-primary hover:text-primary dark:border-white/10"
            >
              <Share2 size={17} />
            </button>
            <button
              type="button"
              onClick={() => watchlist.mutate()}
              disabled={watchlist.isPending}
              aria-label="Save to watchlist"
              title="Save to watchlist"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 transition hover:border-primary hover:text-primary disabled:opacity-50 dark:border-white/10"
            >
              <Bookmark size={17} />
            </button>
            <button
              type="button"
              onClick={downloadVideo}
              aria-label="Download video"
              title="Download"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 transition hover:border-primary hover:text-primary dark:border-white/10"
            >
              <Download size={17} />
            </button>
          </div>
        </div>
        <section className="surface space-y-3 bg-black/[0.06] p-4 dark:bg-white/[0.08]">
          <p className="text-sm font-medium text-black/65 dark:text-white/65">
            {video.views ?? 0} views · {new Date(video.createdAt).toLocaleDateString()}
          </p>
          <p className="whitespace-pre-wrap text-sm leading-6 text-black/70 dark:text-white/70">
            {video.description}
          </p>
        </section>
      </div>
      <section className="space-y-4 border-t border-black/10 pt-6 dark:border-white/10">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <MessageCircle size={19} />
          Comments
        </h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (content.trim()) addComment.mutate();
          }}
        >
          <input
            className="input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            placeholder="Add a comment…"
          />
          <button
            className="rounded-xl bg-primary px-4 text-white disabled:opacity-50"
            disabled={addComment.isPending}
          >
            <Send size={17} />
          </button>
        </form>
        {comments.data?.data?.docs?.map((comment) => (
          <div className="flex gap-3" key={comment._id}>
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={comment.owner?.avatar}
              alt=""
            />
            <div>
              <p className="text-sm font-semibold">
                {comment.owner?.fullName}{" "}
                <span className="font-normal text-black/45 dark:text-white/45">
                  @{comment.owner?.username}
                </span>
              </p>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </section>
    </article>
  );
};

export default VideoDetail;
