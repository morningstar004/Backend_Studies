import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { tweetService } from "../api/services.ts";
import TweetCard from "../components/TweetCard.jsx";
import { EmptyState } from "../components/States.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export function Tweets() {
  const { user } = useAuth();
  const tweetsQuery = useQuery({
    queryKey: ["profile-tweets", user?._id],
    queryFn: () => tweetService.list(user._id),
    enabled: Boolean(user?._id),
  });
  const tweets = tweetsQuery.data?.data || [];

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/library"
            className="mb-2 inline-flex items-center gap-1 text-sm text-black/55 transition hover:text-black dark:text-white/55 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Library
          </Link>
          <h1 className="text-2xl font-bold">Your tweets</h1>
        </div>
        <Link
          to="/create-tweet"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <Plus size={16} />
          Create post
        </Link>
      </header>

      {tweetsQuery.isLoading ? (
        <div className="surface animate-pulse p-8 text-sm text-black/55 dark:text-white/55">
          Loading tweets...
        </div>
      ) : tweetsQuery.error ? (
        <div
          role="alert"
          className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary"
        >
          {tweetsQuery.error.message || "Failed to load tweets."}
        </div>
      ) : tweets.length ? (
        <div className="glass-texture bg-glass backdrop-blur-glass mx-auto m-8 w-[65%] max-w-116 space-y-3 rounded-lg">
          {tweets.map((tweet) => (
            <TweetCard key={tweet._id} tweet={tweet} compact />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <EmptyState
            title="No tweets yet"
            detail="Posts you share will appear here."
          />
          <Link
            to="/create-tweet"
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Plus size={16} />
            Create your first post
          </Link>
        </div>
      )}
    </section>
  );
}
