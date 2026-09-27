import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { tweetService } from "../api/services.ts";

const CreateTweet = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const submitTweet = async (event) => {
    event.preventDefault();
    const trimmedCaption = caption.trim();
    if (!trimmedCaption) return;

    setIsSubmitting(true);
    try {
      await tweetService.create(trimmedCaption, imageFile || undefined);
      await queryClient.invalidateQueries({ queryKey: ["profile-tweets"] });
      toast.success("Tweet posted");
      navigate("/profile/posts");
    } catch (error) {
      toast.error(error.message || "Could not post tweet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submitTweet}
      className="surface mx-auto max-w-2xl p-5 sm:p-7"
    >
      <h1 className="text-2xl font-bold">Create tweet</h1>
      <p className="mt-1 text-sm text-black/55 dark:text-white/55">
        Share an update with your audience.
      </p>

      <label className="mt-6 block text-sm font-medium" htmlFor="tweet-caption">
        Caption
        <textarea
          id="tweet-caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={280}
          required
          rows={5}
          placeholder="What's happening?"
          className="input mt-2 min-h-32 resize-y"
        />
      </label>
      <p className="mt-1 text-right text-xs text-black/50 dark:text-white/50">
        {caption.length}/280
      </p>

      {imagePreview && (
        <div className="relative mt-4 inline-block max-w-full">
          <img
            src={imagePreview}
            alt="Selected tweet attachment"
            className="max-h-80 max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={() => setImageFile(null)}
            aria-label="Remove image"
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
          <ImagePlus size={17} />
          Add image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          />
        </label>
        <button
          type="submit"
          disabled={!caption.trim() || isSubmitting}
          className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Posting..." : "Post tweet"}
        </button>
      </div>
    </form>
  );
};

export default CreateTweet;
