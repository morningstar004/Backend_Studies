import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Download,
  MessageCircle,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  commentService,
  likeService,
  userService,
  videoService,
} from "../api/services.ts";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "sonner";

const VideoDetail = () => {
  const { videoId } = useParams();
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const client = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => videoService.byId(videoId),
    enabled: !!user,
  });
  const video = data?.data;
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
      <div className="overflow-hidden rounded-2xl bg-black">
        <video
          autoPlay
          playsInline
          controls
          className="aspect-video w-full"
        >
          <source src={video.videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
