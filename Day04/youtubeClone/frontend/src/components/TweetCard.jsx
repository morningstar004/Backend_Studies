import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MessageCircle,
  MoreVertical,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  UserRound,
  UserRoundMinus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  likeService,
  subscriptionService,
  tweetService,
} from "../api/services.ts";
import { useAuth } from "../context/AuthContext.jsx";

const TweetImages = ({ tweet, compact }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = tweet.imageContents?.length
    ? tweet.imageContents
    : tweet.imageContent
      ? [tweet.imageContent]
      : [];

  if (!images.length) return null;
  const currentImageIndex = Math.min(activeImageIndex, images.length - 1);

  return (
    <div className="relative mt-3 overflow-hidden rounded-lg">
      <div
        className={`flex transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          compact ? "aspect-[3/4]" : "max-h-[32rem]"
        }`}
        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
      >
        {images.map((image, index) => {
          const crop = tweet.imageCrops?.[index];
          return (
            <img
              key={`${image}-${index}`}
              src={image}
              alt={`Post image ${index + 1}`}
              aria-hidden={index !== currentImageIndex}
              className={`w-full shrink-0 object-cover ${
                compact ? "h-full" : "max-h-[32rem]"
              }`}
              style={{
                objectPosition: `${crop?.x ?? 50}% ${crop?.y ?? 50}%`,
              }}
            />
          );
        })}
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setActiveImageIndex(Math.max(0, currentImageIndex - 1))
            }
            disabled={currentImageIndex === 0}
            aria-label="Show previous image"
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={21} />
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveImageIndex((index) =>
                Math.min(images.length - 1, currentImageIndex + 1),
              )
            }
            disabled={currentImageIndex === images.length - 1}
            aria-label="Show next image"
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={21} />
          </button>
          <span
            aria-live="polite"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white"
          >
            {currentImageIndex + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
};

const actionButtonClass =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-black/60 transition hover:bg-black/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white/60 dark:hover:bg-white/10";

function TweetOptionsMenu({
  canUnsubscribe,
  username,
  onUnsubscribe,
  onCopyLink,
  onShare,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuWidth = 192;
  const menuHeight = canUnsubscribe ? 184 : 140;

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const top =
      rect.bottom + menuHeight + 8 <= window.innerHeight
        ? rect.bottom + 8
        : Math.max(8, rect.top - menuHeight - 8);
    setPosition({
      left: Math.max(
        8,
        Math.min(rect.left, window.innerWidth - menuWidth - 8),
      ),
      top,
    });
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsidePointer = (event) => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    updatePosition();
    document.addEventListener("mousedown", handleOutsidePointer);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsidePointer);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, canUnsubscribe]);

  const menuItemClass =
    "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/10";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          if (!isOpen) requestAnimationFrame(updatePosition);
          setIsOpen((open) => !open);
        }}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/60 transition hover:bg-black/5 hover:text-primary dark:text-white/60 dark:hover:bg-white/10"
      >
        <MoreVertical size={19} />
      </button>
      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Post options"
            style={{
              position: "fixed",
              left: position.left,
              top: position.top,
            }}
            onClick={(event) => event.stopPropagation()}
            className="z-100 w-48 overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#111111]"
          >
            {canUnsubscribe && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onUnsubscribe();
                }}
                className={menuItemClass}
              >
                <UserRoundMinus size={17} />
                Unsubscribe
              </button>
            )}
            {username && (
              <Link
                role="menuitem"
                to={`/channel/${encodeURIComponent(username)}`}
                onClick={() => setIsOpen(false)}
                className={menuItemClass}
              >
                <UserRound size={17} />
                Go to account
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onCopyLink();
              }}
              className={menuItemClass}
            >
              <Copy size={17} />
              Copy link
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onShare();
              }}
              className={menuItemClass}
            >
              <Share2 size={17} />
              Share
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

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
    onSuccess: async (response, isSubscribing) => {
      await Promise.all([
        refreshTweets(),
        queryClient.invalidateQueries({
          queryKey: ["subscriptions", user?._id],
        }),
      ]);
      toast.success(
        response.message || (isSubscribing ? "Subscribed." : "Unsubscribed."),
      );
    },
    onError: (error, isSubscribing) =>
      toast.error(
        error.message ||
          (isSubscribing
            ? "Unable to subscribe to this creator."
            : "Unable to unsubscribe from this creator."),
      ),
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
    const url = getTweetUrl();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${owner?.fullName || "creator"}`,
          text: tweet.caption,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Post link copied to clipboard.");
      } else {
        window.prompt("Copy this post link:", url);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast.error("Unable to share this post.");
      }
    }
  };

  const getTweetUrl = () => {
    const sharePath = owner?.username
      ? `/channel/${encodeURIComponent(owner.username)}/posts#tweet-${tweet._id}`
      : `/tweets#tweet-${tweet._id}`;
    return `${window.location.origin}${sharePath}`;
  };

  const copyTweetLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(getTweetUrl());
        toast.success("Post link copied to clipboard.");
      } else {
        window.prompt("Copy this post link:", getTweetUrl());
      }
    } catch {
      toast.error("Unable to copy this post link.");
    }
  };

  const commentList = commentsQuery.data?.data || [];

  const cardClass = compact
    ? "surface !rounded-lg scroll-mt-24 overflow-hidden p-2.5 border-0"
    : "surface scroll-mt-24 p-4";
  const compactActionButtonClass = compact ? "px-2 py-1.5 text-xs" : "";

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
            {owner?.username ? `@${owner.username}` : ""}
            {/* {owner?.subscribersCount != null &&
              `${owner?.username ? " · " : ""}${owner.subscribersCount} subscribers`} */}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {showSubscribe && (
            <button
              type="button"
              onClick={() => subscribeMutation.mutate(true)}
              disabled={subscribeMutation.isPending}
              className={`inline-flex items-center gap-1.5 rounded-full bg-primary ${compact ? "px-2.5 py-1.5" : "px-3 py-2"} text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60`}
            >
              <UserPlus size={15} />
              Subscribe
            </button>
          )}
          <TweetOptionsMenu
            canUnsubscribe={Boolean(owner?.isSubscribed && !isOwnTweet)}
            username={owner?.username}
            onUnsubscribe={() => subscribeMutation.mutate(false)}
            onCopyLink={copyTweetLink}
            onShare={shareTweet}
          />
        </div>
      </header>

      <TweetImages tweet={tweet} compact={compact} />
      <div
        className={`${compact ? "mt-2" : "mt-3"} flex items-start justify-between gap-3`}
      >
        <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm">
          {tweet.caption}
        </p>
        <time className="shrink-0 whitespace-nowrap text-xs text-black/50 dark:text-white/50">
          {createdAt}
        </time>
      </div>

      <div
        className={`${compact ? "mt-2" : "mt-3"} flex flex-wrap items-center gap-1`}
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
          ) : commentsQuery.error && !commentList.length ? (
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
