import { useQuery } from "@tanstack/react-query";
import { likeService } from "../../api/services.ts";
import { EmptyState } from "../../components/States.jsx";
import VideoCollectionCard from "../../components/VideoCollectionCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const normalizeVideo = (entry) => entry?.video ?? entry;

export function LikedVideos() {
  const { user } = useAuth();
  const likedQuery = useQuery({
    queryKey: ["liked-videos"],
    queryFn: likeService.videos,
    enabled: !!user?._id,
  });
  const likedVideos = (likedQuery.data?.data || [])
    .map(normalizeVideo)
    .filter(Boolean);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Liked videos</h1>
      {likedVideos.length ? (
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {likedVideos.map((video) => (
            <VideoCollectionCard key={video._id} video={video} compact />
          ))}
        </div>
      ) : (
        <EmptyState title="No liked videos yet" />
      )}
    </section>
  );
}
