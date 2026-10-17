import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  likeService,
  subscriptionService,
  tweetService,
} from "../api/services.ts";
import { useAuth } from "../context/AuthContext.jsx";

const TweetImages = ({ tweet, compact }) => {
  const images = tweet.imageContents?.length
    ? tweet.imageContents
    : tweet.imageContent
      ? [tweet.imageContent]
      : [];

  if (!images.length) return null;

  return (
    <div
      className={`mt-3 grid gap-1 overflow-hidden rounded-lg ${
        images.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {images.map((image, index) => {
        const crop = tweet.imageCrops?.[index];
        return (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`Post image ${index + 1}`}
            className={`w-full object-cover ${
              compact && images.length === 1
                ? "aspect-[3/4]"
                : images.length === 1
                  ? "max-h-[32rem]"
                  : "aspect-square"
            }`}
            style={{
              objectPosition: `${crop?.x ?? 50}% ${crop?.y ?? 50}%`,
            }}
          />
        );
      })}
    </div>
  );
};

const actionButtonClass =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-black/60 transition hover:bg-black/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white/60 dark:hover:bg-white/10";

export default function TweetCard({ tweet, compact = false }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const owner = tweet.owner;
  const ownerId = owner?._id || owner;
  const isOwnTweet = Boolean(user?._id && ownerId === user._id);
  const showSubscribe = Boolean(
    user?._id && owner?._id && !isOwnTweet && !owner.isSubscribed,
  );
  const createdAt = tweet.createdAt
    ? new Date(tweet.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";

  const commentsQuery = useQuery({
    queryKey: ["tweet-comments", tweet._id],
    queryFn: () => tweetService.comments(tweet._id),
    enabled: commentsOpen,
  });
  const refreshTweets = () =>
    queryClient.invalidateQueries({ queryKey: ["profile-tweets"] });

  const likeMutation = useMutation({
    mutationFn: () => likeService.tweet(tweet._id),
    onSuccess: refreshTweets,
    onError: (error) => toast.error(error.message || "Unable to like post."),
  });
  const dislikeMutation = useMutation({
    mutationFn: () => likeService.tweetDislike(tweet._id),
    onSuccess: refreshTweets,
    onError: (error) => toast.error(error.message || "Unable to dislike post."),
  });
  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionService.toggle(owner._id),
    onSuccess: async (response) => {
      await Promise.all([
        refreshTweets(),
        queryClient.invalidateQueries({
          queryKey: ["subscriptions", user?._id],
        }),
      ]);
      toast.success(response.message || "Subscribed.");
    },
    onError: (error) =>
      toast.error(error.message || "Unable to subscribe to this creator."),
  });
  const addCommentMutation = useMutation({
    mutationFn: () => tweetService.addComment(tweet._id, commentContent.trim()),
    onSuccess: async () => {
      setCommentContent("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["tweet-comments", tweet._id],
        }),
        refreshTweets(),
      ]);
      toast.success("Comment added.");
    },
    onError: (error) => toast.error(error.message || "Unable to add comment."),
  });

  const shareTweet = async () => {
    const sharePath = owner?.username
      ? `/channel/${encodeURIComponent(owner.username)}/posts#tweet-${tweet._id}`
      : `/tweets#tweet-${tweet._id}`;
    const url = `${window.location.origin}${sharePath}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${owner?.fullName || "creator"}`,
          text: tweet.caption,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Post link copied to clipboard.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast.error("Unable to share this post.");
      }
    }
  };

  const commentList = commentsQuery.data?.data || [];

  const cardClass = compact
    ? "surface !rounded-lg scroll-mt-24 overflow-hidden p-2.5"
    : "surface scroll-mt-24 p-4";
  const compactActionButtonClass = compact
    ? "px-2 py-1.5 text-xs"
    : "";

  return (
    <article id={`tweet-${tweet._id}`} className={cardClass}>
      <header className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
        {owner?.username ? (
          <Link
            to={`/channel/${encodeURIComponent(owner.username)}`}
            aria-label={`Open ${owner.fullName || owner.username}'s channel`}
            className="shrink-0"
          >
            <img
              src={owner.avatar}
              alt=""
              className={`${compact ? "h-8 w-8" : "h-11 w-11"} rounded-full bg-black/10 object-cover dark:bg-white/10`}
            />
          </Link>
        ) : (
          <img
            src={owner?.avatar}
            alt=""
            className={`${compact ? "h-8 w-8" : "h-11 w-11"} rounded-full bg-black/10 object-cover dark:bg-white/10`}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {owner?.fullName || "Creator"}
          </p>
          <p className="truncate text-xs text-black/50 dark:text-white/50">
            {owner?.username ? `@${owner.username} · ` : ""}
            {createdAt}
            {owner?.subscribersCount != null &&
              ` · ${owner.subscribersCount} subscribers`}
          </p>
        </div>
        {showSubscribe && (
          <button
            type="button"
            onClick={() => subscribeMutation.mutate()}
            disabled={subscribeMutation.isPending}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary ${compact ? "px-2.5 py-1.5" : "px-3 py-2"} text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60`}
          >
            <UserPlus size={15} />
            Subscribe
          </button>
        )}
      </header>

      <p
        className={`${compact ? "mt-2" : "mt-3"} whitespace-pre-wrap text-sm`}
      >
        {tweet.caption}
      </p>
      <TweetImages tweet={tweet} compact={compact} />

      <div
        className={`${compact ? "mt-2" : "mt-3"} flex flex-wrap items-center gap-1 border-t border-black/10 pt-2 dark:border-white/10`}
      >
        {user && (
          <>
            <button
              type="button"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending || dislikeMutation.isPending}
              aria-label="Like post"
              aria-pressed={Boolean(tweet.isLiked)}
              className={`${actionButtonClass} ${compactActionButtonClass} ${tweet.isLiked ? "text-primary" : ""}`}
            >
              <ThumbsUp
                size={17}
                className={tweet.isLiked ? "fill-primary" : ""}
              />
              {tweet.likeCount ?? 0}
            </button>
            <button
              type="button"
              onClick={() => dislikeMutation.mutate()}
              disabled={dislikeMutation.isPending || likeMutation.isPending}
              aria-label="Dislike post"
              aria-pressed={Boolean(tweet.isDisliked)}
              className={`${actionButtonClass} ${compactActionButtonClass} ${tweet.isDisliked ? "text-primary" : ""}`}
            >
              <ThumbsDown
                size={17}
                className={tweet.isDisliked ? "fill-primary" : ""}
              />
              {tweet.dislikeCount ?? 0}
            </button>
            <button
              type="button"
              onClick={() => setCommentsOpen((isOpen) => !isOpen)}
              aria-expanded={commentsOpen}
              aria-label="Show comments"
              className={`${actionButtonClass} ${compactActionButtonClass}`}
            >
              <MessageCircle size={17} />
              {tweet.commentCount ?? 0}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={shareTweet}
          className={`${actionButtonClass} ${compactActionButtonClass}`}
          aria-label="Share post"
        >
          <Share2 size={17} />
          Share
        </button>
      </div>

      {commentsOpen && user && (
        <section
          aria-label="Post comments"
          className="mt-2 space-y-3 border-t border-black/10 pt-3 dark:border-white/10"
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (commentContent.trim()) addCommentMutation.mutate();
            }}
            className="flex items-start gap-2"
          >
            <input
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              maxLength={1000}
              aria-label="Write a comment"
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-full border border-black/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-primary dark:border-white/15"
            />
            <button
              type="submit"
              disabled={!commentContent.trim() || addCommentMutation.isPending}
              aria-label="Post comment"
              className="rounded-full bg-primary p-2 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>

          {commentsQuery.isLoading ? (
            <p className="text-sm text-black/50 dark:text-white/50">
              Loading comments...
            </p>
          ) : commentsQuery.error ? (
            <p role="alert" className="text-sm text-primary">
              {commentsQuery.error.message || "Unable to load comments."}
            </p>
          ) : commentList.length ? (
            <div className="space-y-3">
              {commentList.map((comment) => (
                <div key={comment._id} className="flex items-start gap-2.5">
                  <img
                    src={comment.owner?.avatar}
                    alt=""
                    className="mt-0.5 h-8 w-8 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1 rounded-2xl bg-black/5 px-3 py-2 dark:bg-white/5">
                    <p className="text-xs font-semibold">
                      {comment.owner?.fullName || "User"}
                      {comment.owner?.username &&
                        ` · @${comment.owner.username}`}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/50 dark:text-white/50">
              No comments yet.
            </p>
          )}
        </section>
      )}
    </article>
  );
}
