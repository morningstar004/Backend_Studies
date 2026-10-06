import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { videoService } from "../api/services.ts";

export default function UpdateVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const videoQuery = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => videoService.byId(videoId),
    enabled: Boolean(videoId),
  });
  const video = videoQuery.data?.data;

  useEffect(() => {
    if (!video) return;
    setTitle(video.title);
    setDescription(video.description);
  }, [video]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(video?.thumbnail ?? "");
      return;
    }

    const objectUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnailFile, video?.thumbnail]);

  const updateMutation = useMutation({
    mutationFn: (body) => videoService.update(videoId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["video", videoId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "videos"] }),
      ]);
      toast.success("Video updated");
      navigate(`/video/${videoId}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const submit = (event) => {
    event.preventDefault();
    const body = new FormData();
    body.append("title", title.trim());
    body.append("description", description.trim());
    if (thumbnailFile) body.append("thumbnail", thumbnailFile);
    updateMutation.mutate(body);
  };

  if (videoQuery.isLoading) {
    return (
      <p className="p-6 text-sm text-black/55 dark:text-white/55">
        Loading video...
      </p>
    );
  }

  if (videoQuery.isError || !video) {
    return (
      <section className="surface space-y-4 p-6">
        <p className="text-sm text-primary">
          {videoQuery.error?.message || "Video not found."}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft size={16} />
          Back to creator studio
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft size={16} />
          Creator studio
        </Link>
        <h1 className="text-2xl font-bold">Edit video</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Update your video details and thumbnail.
        </p>
      </div>

      <form onSubmit={submit} className="surface space-y-5 p-5 sm:p-7">
        <label className="block text-sm font-medium">
          Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="input mt-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="input mt-2 min-h-36 resize-y"
          />
        </label>

        <div>
          <p className="text-sm font-medium">Thumbnail</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="h-20 w-36 rounded-lg border border-black/10 object-cover dark:border-white/10"
              />
            ) : (
              <div className="grid h-20 w-36 place-items-center rounded-lg bg-black/5 text-black/35 dark:bg-white/10 dark:text-white/45">
                <ImagePlus size={24} />
              </div>
            )}
            <label className="cursor-pointer text-sm font-semibold text-primary hover:underline">
              Choose a new thumbnail
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setThumbnailFile(event.target.files?.[0] ?? null)
                }
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </button>
          <Link
            to={`/video/${videoId}`}
            className="rounded-xl border border-black/10 px-5 py-3 font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
