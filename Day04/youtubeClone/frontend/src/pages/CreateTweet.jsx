import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ImagePlus,
  MessageCircle,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { tweetService } from "../api/services.ts";
import { useAuth } from "../context/AuthContext.jsx";

const CreateTweet = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [cropPositions, setCropPositions] = useState([]);
  const [activeCropIndex, setActiveCropIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cropDragRef = useRef(null);

  useEffect(() => {
    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
    return () => previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
  }, [imageFiles]);

  const addImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedFiles.length) return;

    const remainingSlots = 10 - imageFiles.length;
    if (selectedFiles.length > remainingSlots) {
      toast.error("You can add up to 10 images to a post");
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    if (filesToAdd.length) {
      setImageFiles((files) => [...files, ...filesToAdd]);
      setCropPositions((positions) => [
        ...positions,
        ...filesToAdd.map(() => ({ x: 50, y: 50 })),
      ]);
      setActiveCropIndex(imageFiles.length);
    }
  };

  const removeImage = (indexToRemove) => {
    setImageFiles((files) => files.filter((_, index) => index !== indexToRemove));
    setCropPositions((positions) =>
      positions.filter((_, index) => index !== indexToRemove),
    );
    setActiveCropIndex((index) =>
      Math.max(0, Math.min(index, imageFiles.length - 2)),
    );
  };

  const startCropDrag = (event, index) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const crop = cropPositions[index] || { x: 50, y: 50 };

    cropDragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: bounds.width,
      height: bounds.height,
      cropX: crop.x,
      cropY: crop.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveCrop = (event) => {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const x = Math.max(
      0,
      Math.min(100, drag.cropX - ((event.clientX - drag.startX) / drag.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100, drag.cropY - ((event.clientY - drag.startY) / drag.height) * 100),
    );

    setCropPositions((positions) =>
      positions.map((position, index) =>
        index === drag.index ? { x, y } : position,
      ),
    );
  };

  const submitTweet = async (event) => {
    event.preventDefault();
    const trimmedCaption = caption.trim();
    if (!trimmedCaption) return;

    setIsSubmitting(true);
    try {
      await tweetService.create(trimmedCaption, imageFiles, cropPositions);
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
    <form onSubmit={submitTweet} className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Create post</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Share a moment with your audience.
        </p>
      </div>

      <article className="surface overflow-hidden">
        <header className="flex items-center gap-3 p-4 sm:p-5">
          <img
            src={user?.avatar}
            alt=""
            className="h-11 w-11 rounded-full bg-black/10 object-cover dark:bg-white/10"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {user?.fullName || "Your profile"}
            </p>
            {user?.username && (
              <p className="truncate text-xs text-black/50 dark:text-white/50">
                @{user.username}
              </p>
            )}
          </div>
        </header>

        <div className="mx-4 overflow-hidden rounded-xl border border-black/10 bg-black/3 p-2 dark:border-white/10 dark:bg-white/3 sm:mx-5 sm:p-3">
          {imagePreviews.length ? (
            <div
              className={`grid gap-2 ${
                imagePreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {imagePreviews.map((preview, index) => (
                <div
                  key={`${imageFiles[index].name}-${imageFiles[index].lastModified}-${index}`}
                  className={`group relative overflow-hidden rounded-lg ${
                    imagePreviews.length === 1 ? "aspect-4/3" : "aspect-square"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveCropIndex(index)}
                    onPointerDown={(event) => startCropDrag(event, index)}
                    onPointerMove={moveCrop}
                    onDragStart={(event) => event.preventDefault()}
                    onPointerUp={() => {
                      cropDragRef.current = null;
                    }}
                    onPointerCancel={() => {
                      cropDragRef.current = null;
                    }}
                    aria-label={`Adjust crop for image ${index + 1}`}
                    aria-pressed={activeCropIndex === index}
                    className={`block h-full w-full ${
                      activeCropIndex === index
                        ? "cursor-grab ring-2 ring-inset ring-primary active:cursor-grabbing"
                        : "cursor-grab active:cursor-grabbing"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    <img
                      src={preview}
                      alt={`Post image ${index + 1}`}
                      draggable={false}
                      className="pointer-events-none h-full w-full select-none object-cover"
                      style={{
                        objectPosition: `${cropPositions[index]?.x ?? 50}% ${cropPositions[index]?.y ?? 50}%`,
                      }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {imageFiles.length < 10 && (
                <label
                  htmlFor="tweet-image"
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 text-black/45 transition hover:border-primary hover:text-primary dark:border-white/20 dark:text-white/45"
                >
                  <ImagePlus size={24} />
                  <span className="text-xs font-medium">Add more</span>
                </label>
              )}
            </div>
          ) : (
            <label
              htmlFor="tweet-image"
              className="flex aspect-4/3 cursor-pointer flex-col items-center justify-center gap-3 text-black/45 transition hover:bg-black/2.5 hover:text-primary dark:text-white/45 dark:hover:bg-white/2.5"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-black/5 dark:bg-white/10">
                <ImagePlus size={26} />
              </span>
              <span className="text-sm font-medium">Add photos</span>
            </label>
          )}
          <input
            id="tweet-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={addImages}
          />
        </div>

        {imageFiles.length > 0 && (
          <p className="mx-4 mt-2 text-xs text-black/50 dark:text-white/50 sm:mx-5">
            Drag an image to adjust its crop · editing image {activeCropIndex + 1}{" "}
            of {imageFiles.length}
          </p>
        )}

        <div className="px-4 pb-3 pt-4 sm:px-5">
          <label className="sr-only" htmlFor="tweet-caption">
            Description
          </label>
          <textarea
            id="tweet-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={280}
            required
            rows={3}
            placeholder="Write a description..."
            className="w-full resize-y bg-transparent text-sm leading-6 outline-none placeholder:text-black/40 dark:placeholder:text-white/40"
          />
          <p className="mt-1 text-right text-xs text-black/45 dark:text-white/45">
            {caption.length}/280
          </p>
        </div>

        <div
          aria-label="Post actions preview"
          className="flex items-center gap-5 border-t border-black/10 px-4 py-3 text-black/35 dark:border-white/10 dark:text-white/35 sm:px-5"
        >
          <button
            type="button"
            disabled
            aria-label="Like (unavailable until posted)"
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <ThumbsUp size={17} />
            <span>Like</span>
          </button>
          <button
            type="button"
            disabled
            aria-label="Dislike (unavailable until posted)"
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <ThumbsDown size={17} />
            <span>Dislike</span>
          </button>
          <button
            type="button"
            disabled
            aria-label="Comment (unavailable until posted)"
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <MessageCircle size={17} />
            <span>Comment</span>
          </button>
          <button
            type="button"
            disabled
            aria-label="Share (unavailable until posted)"
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <Share2 size={17} />
            <span>Share</span>
          </button>
          <button
            type="submit"
            disabled={!caption.trim() || isSubmitting}
            aria-label={isSubmitting ? "Posting" : "Post"}
            title={isSubmitting ? "Posting..." : "Post"}
            className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </article>
    </form>
  );
};

export default CreateTweet;
