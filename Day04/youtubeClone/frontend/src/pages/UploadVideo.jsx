import { useState } from "react";
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
  const isPublished = watch("isPublished");

  const submit = async (form) => {
    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("description", form.description);
      body.append("isPublished", String(form.isPublished));
      body.append("videoFile", form.videoFile);
      body.append("thumbnail", form.thumbnail);
      const result = await videoService.publish(body);
      toast.success(form.isPublished ? "Video published" : "Video saved as private");
      navigate(`/video/${result?.data?._id || ""}`);
    } catch (err) {
      toast.error(err.message);
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setValue("thumbnail", e.target.files?.[0], {
                  shouldValidate: true,
                })
              }
              className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-black/5 file:px-3 file:py-2 file:font-medium dark:file:bg-white/10"
            />
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
        <label
          htmlFor="video-upload"
          className="group flex aspect-video w-full max-w-4xl cursor-pointer flex-col items-center justify-center border-2 border-dashed border-black/20 bg-[#dfe2e4] px-5 text-center transition hover:border-primary hover:bg-[#d8dcdf] focus-within:border-primary dark:border-white/20 dark:bg-[#222527] dark:hover:bg-[#292d2f]"
        >
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
          <span className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-white/70 text-black/70 transition group-hover:text-primary dark:bg-white/10 dark:text-white/80">
            <Upload size={28} strokeWidth={1.8} />
          </span>
          <span className="text-lg font-semibold">
            {selectedVideo?.name || "Choose a video to upload"}
          </span>
          <span className="mt-2 text-sm text-black/55 dark:text-white/55">
            Click to browse your files
          </span>
          {errors.videoFile && (
            <span className="mt-3 text-xs text-primary">
              {errors.videoFile.message}
            </span>
          )}
        </label>
      </section>
    </form>
  );
};

export default UploadVideo;
