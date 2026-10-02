import { useQuery } from "@tanstack/react-query";
import { subscriptionService, videoService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Subscriptions() {
  const { user } = useAuth();
  const videosQuery = useQuery({
    queryKey: ["subscription-videos", user?._id],
    queryFn: async () => {
      const subscriptions = await subscriptionService.subscribed(user._id);
      const channels = (subscriptions.data || [])
        .map((entry) => entry.channel)
        .filter((channel) => channel?._id);

      const videoResponses = await Promise.all(
        channels.map((channel) =>
          videoService.list({
            userId: channel._id,
            limit: 100,
            sortBy: "createdAt",
            sortType: "desc",
          }),
        ),
      );

      return videoResponses
        .flatMap((response) => response.data?.videos || [])
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime(),
        );
    },
    enabled: Boolean(user?._id),
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      {videosQuery.isPending ? (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : videosQuery.isError ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          <div className="font-semibold">Failed to load subscription videos</div>
          <div className="mt-1">
            {videosQuery.error.message || "Could not load subscription videos."}
          </div>
        </div>
      ) : videosQuery.data.length ? (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {videosQuery.data.map((video) => (
            <VideoCollectionCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No videos from your subscriptions"
          detail="New videos from channels you subscribe to will appear here."
        />
      )}
    </section>
  );
}