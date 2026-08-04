import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Send } from "lucide-react";
import { commentService, likeService, videoService } from "../api/services.ts";
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
    onSuccess: (r) => toast.success(r.message),
  });

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
        <video controls className="aspect-video w-full">
          <source src={video.videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{video.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-black/55 dark:text-white/55">
          <span>
            {video.views ?? 0} views ·{" "}
            {new Date(video.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={() => like.mutate()}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 transition hover:border-primary hover:text-primary dark:border-white/10"
          >
            <Heart size={17} />
            Like
          </button>
        </div>
        <div className="surface mt-4 flex gap-3 p-4">
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
        <p className="whitespace-pre-wrap text-sm leading-6 text-black/70 dark:text-white/70">
          {video.description}
        </p>
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
