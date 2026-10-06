import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, LockKeyhole, Upload } from "lucide-react";
import { videoService } from "../api/services.ts";
import { toast } from "sonner";
const schema = z.object({
  title: z.string().trim().min(1, "A title is required"),
  description: z.string().trim().min(1, "A description is required"),
  isPublished: z.boolean(),
  videoFile: z.instanceof(File, { message: "Select a video file" }),
  thumbnail: z.instanceof(File, { message: "Select a thumbnail" }),
});

const UploadVideo = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isPublished: true },
  });
  const selectedVideo = watch("videoFile");
  const selectedThumbnail = watch("thumbnail");
  const isPublished = watch("isPublished");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!selectedThumbnail) {
      setThumbnailPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedThumbnail);
    setThumbnailPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedThumbnail]);

  useEffect(() => {
    if (!selectedVideo) {
      setVideoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedVideo);
    setVideoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedVideo]);

  const submit = async (form) => {
    try {
      setUploadProgress(0);
      const body = new FormData();
      body.append("title", form.title);
      body.append("description", form.description);
      body.append("isPublished", String(form.isPublished));
      body.append("videoFile", form.videoFile);
      body.append("thumbnail", form.thumbnail);
      const result = await videoService.publish(body, setUploadProgress);
      toast.success(
        form.isPublished ? "Video published" : "Video saved as private",
      );
      navigate(`/video/${result?.data?._id || ""}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="-m-4 grid min-h-[calc(100vh-4rem)] sm:-m-6 lg:h-[calc(100vh-4rem)] lg:min-h-0 lg:grid-cols-[minmax(320px,0.88fr)_minmax(0,1.12fr)] lg:grid-rows-[minmax(0,1fr)]"
    >
      <section className="flex flex-col px-5 py-8 sm:px-10 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:px-14 lg:py-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Video studio
          </p>
          <h1 className="mt-3 text-3xl font-bold">Publish a video</h1>
          <p className="mt-2 text-sm text-black/55 dark:text-white/55">
            Add the details viewers will see.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block text-sm font-medium">
            Title
            <input
              {...register("title")}
              placeholder="Add a title"
              className="input mt-2 transition-all duration-200 hover:-translate-y-0.2 hover:border-primary/50 hover:shadow-md"
            />
            {errors.title && (
              <span className="mt-1 block text-xs text-primary">
                {errors.title.message}
              </span>
            )}
          </label>
          <label className="block text-sm font-medium">
            Description
            <textarea
              {...register("description")}
              placeholder="Tell viewers about your video"
              className="input mt-2 min-h-36 resize-y transition-all duration-200 hover:-translate-y-0.2 hover:border-primary/50 hover:shadow-md"
            />
            {errors.description && (
              <span className="mt-1 block text-xs text-primary">
                {errors.description.message}
              </span>
            )}
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Visibility</legend>
            <div className="mt-2 inline-flex rounded-xl border border-black/10 bg-black/[0.035] p-1 dark:border-white/10 dark:bg-white/[0.04]">
              <button
                type="button"
                aria-pressed={isPublished}
                onClick={() =>
                  setValue("isPublished", true, { shouldDirty: true })
                }
                className={`relative inline-flex w-32 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isPublished
                    ? "text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {isPublished && (
                  <motion.span
                    layoutId="visibility-switch-indicator"
                    className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                    }}
                  />
                )}
                <Globe className="relative z-10" size={16} />
                <span className="relative z-10">Public</span>
              </button>
              <button
                type="button"
                aria-pressed={!isPublished}
                onClick={() =>
                  setValue("isPublished", false, { shouldDirty: true })
                }
                className={`relative inline-flex w-32 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  !isPublished
                    ? "text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {!isPublished && (
                  <motion.span
                    layoutId="visibility-switch-indicator"
                    className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                    }}
                  />
                )}
                <LockKeyhole className="relative z-10" size={16} />
                <span className="relative z-10">Private</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-black/55 dark:text-white/55">
              {isPublished
                ? "Anyone can find and watch this video."
                : "Only you can access this video."}
            </p>
          </fieldset>
          <label className="block text-sm font-medium">
            Thumbnail
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setValue("thumbnail", e.target.files?.[0], {
                    shouldValidate: true,
                  })
                }
                className="block min-w-0 flex-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-black/5 file:px-3 file:py-2 file:font-medium dark:file:bg-white/10"
              />
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Selected thumbnail preview"
                  className="h-16 w-28 rounded-lg border border-black/10 object-cover dark:border-white/10"
                />
              )}
            </div>
            {errors.thumbnail && (
              <span className="mt-1 block text-xs text-primary">
                {errors.thumbnail.message}
              </span>
            )}
          </label>
        </div>

        <button
          disabled={isSubmitting}
          className="mt-8 w-fit rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60 lg:mt-auto lg:pt-3"
        >
          {isSubmitting
            ? "Uploading..."
            : isPublished
              ? "Publish video"
              : "Save as private"}
        </button>
      </section>

      <section className="flex min-h-[360px] items-center justify-center bg-[#eceeef] p-5 dark:bg-[#17191b] sm:p-10 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:min-h-0 lg:self-start">
        <div className="relative aspect-video w-full max-w-4xl overflow-hidden">
          {selectedVideo ? (
            <>
              <video
                src={videoPreview}
                controls
                className="h-full w-full rounded-xl bg-black object-contain"
              />
              <label
                htmlFor="video-upload"
                className="absolute bottom-3 left-3 cursor-pointer rounded-lg bg-black/70 px-3 py-2 text-sm font-medium text-white hover:bg-black/85"
              >
                Choose a different video
              </label>
            </>
          ) : (
            <label
              htmlFor="video-upload"
              className="group flex h-full w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-black/20 bg-[#dfe2e4] px-5 text-center transition hover:border-primary hover:bg-[#d8dcdf] focus-within:border-primary dark:border-white/20 dark:bg-[#222527] dark:hover:bg-[#292d2f]"
            >
              <span className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-white/70 text-black/70 transition group-hover:text-primary dark:bg-white/10 dark:text-white/80">
                <Upload size={28} strokeWidth={1.8} />
              </span>
              <span className="text-lg font-semibold">
                Choose a video to upload
              </span>
              <span className="mt-2 text-sm text-black/55 dark:text-white/55">
                Click to browse your files
              </span>
            </label>
          )}
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={(e) =>
              setValue("videoFile", e.target.files?.[0], {
                shouldValidate: true,
              })
            }
            className="sr-only"
          />
          {isSubmitting && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-white"
              role="progressbar"
              aria-label="Video upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={uploadProgress}
            >
              <div className="relative h-24 w-24">
                <svg className="-rotate-90 h-full w-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="43"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="43"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 43}`}
                    strokeDashoffset={`${2 * Math.PI * 43 * (1 - uploadProgress / 100)}`}
                    className="text-primary transition-[stroke-dashoffset] duration-200"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                  {uploadProgress}%
                </span>
              </div>
              <span className="text-sm font-medium">Uploading video</span>
            </div>
          )}
          {errors.videoFile && !selectedVideo && (
            <span className="absolute bottom-3 text-xs text-primary">
              {errors.videoFile.message}
            </span>
          )}
        </div>
      </section>
    </form>
  );
};

export default UploadVideo;
