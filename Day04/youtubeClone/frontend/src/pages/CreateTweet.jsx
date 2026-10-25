import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
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
  const [cropHintPosition, setCropHintPosition] = useState(null);
  const cropDragRef = useRef(null);
  const submitLockRef = useRef(false);

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
    setActiveCropIndex((index) => {
      if (indexToRemove < index) return index - 1;
      if (indexToRemove === index) return Math.max(0, index - 1);
      return index;
    });
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
    if (submitLockRef.current) return;
    const trimmedCaption = caption.trim();
    if (!trimmedCaption) return;

    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      await tweetService.create(trimmedCaption, imageFiles, cropPositions);
      await queryClient.invalidateQueries({ queryKey: ["profile-tweets"] });
      toast.success("Tweet posted");
      navigate("/profile/posts");
    } catch (error) {
      toast.error(error.message || "Could not post tweet");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submitTweet}
      className="mx-auto w-[65%] max-w-[29rem]"
    >
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Create post</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Share a moment with your audience.
        </p>
      </div>

      <article
        className="surface !rounded-lg overflow-hidden"
        // style={{ aspectRatio: "9 / 16" }}
      >
        <header className="flex items-center gap-3 p-2 sm:p-2.5">
          <img
            src={user?.avatar}
            alt=""
            className="h-8 w-8 rounded-full bg-black/10 object-cover dark:bg-white/10"
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

        <div className="overflow-hidden rounded-xl border border-black/10 bg-black/3 dark:border-white/10 dark:bg-white/3">
          {imagePreviews.length ? (
            <div className="relative overflow-hidden rounded-lg">
              <div
                className="group relative overflow-hidden"
                style={{ aspectRatio: "3 / 4" }}
              >
                <div
                  className="flex h-full transition-transform duration-300 ease-in-out motion-reduce:transition-none"
                  style={{ transform: `translateX(-${activeCropIndex * 100}%)` }}
                >
                  {imagePreviews.map((preview, index) => (
                    <button
                      key={preview}
                      type="button"
                      onPointerDown={(event) => {
                        setCropHintPosition(null);
                        startCropDrag(event, index);
                      }}
                      onPointerMove={moveCrop}
                      onMouseMove={(event) => {
                        if (!cropDragRef.current) {
                          setCropHintPosition({
                            x: event.clientX,
                            y: event.clientY,
                          });
                        }
                      }}
                      onMouseLeave={() => setCropHintPosition(null)}
                      onDragStart={(event) => event.preventDefault()}
                      onPointerUp={() => {
                        cropDragRef.current = null;
                      }}
                      onPointerCancel={() => {
                        cropDragRef.current = null;
                      }}
                      aria-label={`Adjust crop for image ${index + 1}`}
                      aria-hidden={index !== activeCropIndex}
                      tabIndex={index === activeCropIndex ? 0 : -1}
                      className="relative h-full min-w-full cursor-grab overflow-hidden active:cursor-grabbing"
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
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                      >
                        <span className="absolute inset-y-0 left-1/3 border-l border-white/80 shadow-[1px_0_1px_rgba(0,0,0,0.45)]" />
                        <span className="absolute inset-y-0 left-2/3 border-l border-white/80 shadow-[1px_0_1px_rgba(0,0,0,0.45)]" />
                        <span className="absolute inset-x-0 top-1/3 border-t border-white/80 shadow-[0_1px_1px_rgba(0,0,0,0.45)]" />
                        <span className="absolute inset-x-0 top-2/3 border-t border-white/80 shadow-[0_1px_1px_rgba(0,0,0,0.45)]" />
                      </span>
                    </button>
                  ))}
                </div>
                {cropHintPosition && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none fixed z-50 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white shadow"
                    style={{
                      left: cropHintPosition.x + 14,
                      top: cropHintPosition.y + 14,
                    }}
                  >
                    Drag to adjust image
                  </span>
                )}
                {imagePreviews.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveCropIndex((index) => Math.max(0, index - 1))
                      }
                      disabled={activeCropIndex === 0}
                      aria-label="Show previous image"
                      className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={21} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveCropIndex((index) =>
                          Math.min(imagePreviews.length - 1, index + 1),
                        )
                      }
                      disabled={activeCropIndex === imagePreviews.length - 1}
                      aria-label="Show next image"
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={21} />
                    </button>
                    <span
                      aria-live="polite"
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white"
                    >
                      {activeCropIndex + 1} / {imagePreviews.length}
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(activeCropIndex)}
                  aria-label={`Remove image ${activeCropIndex + 1}`}
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black"
                >
                  <X size={16} />
                </button>
                {imageFiles.length < 10 && (
                  <label
                    htmlFor="tweet-image"
                    aria-label="Add more photos"
                    title="Add more photos"
                    className="absolute bottom-3 right-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black/70 text-white transition hover:bg-black"
                  >
                    <ImagePlus size={18} />
                  </label>
                )}
              </div>
            </div>
          ) : (
            <label
              htmlFor="tweet-image"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 text-black/45 transition hover:bg-black/2.5 hover:text-primary dark:text-white/45 dark:hover:bg-white/2.5"
              style={{ aspectRatio: "3 / 4" }}
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

        <div className="relative px-2.5 pb-3 pt-4 sm:px-3.5">
          <textarea
            id="tweet-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={120}
            required
            rows={2}
            placeholder="Write a description..."
            className="w-full resize-none bg-transparent pb-4 text-sm leading-6 outline-none placeholder:text-black/40 dark:placeholder:text-white/40"
          />
          <p className="pointer-events-none absolute bottom-3 right-2.5 text-[10px] text-black/45 dark:text-white/45 sm:right-3.5">
            {caption.length}/120
          </p>
        </div>

        <div
          aria-label="Post actions preview"
          className="flex items-center gap-5 border-t border-black/10 px-4 py-1.5 text-black/35 dark:border-white/10 dark:text-white/35 sm:px-3.5"
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
