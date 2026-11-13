import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const sortOptions = [
  { value: "uploaded-desc", label: "Newest (date published)" },
  { value: "uploaded-asc", label: "Oldest (date published)" },
  { value: "views-desc", label: "Most viewed" },
  { value: "duration-asc", label: "Shortest (duration)" },
  { value: "duration-desc", label: "Longest(duration)" },
];

const getSortValue = (video, sortBy) => {
  if (sortBy.startsWith("uploaded")) {
    const timestamp = new Date(video.createdAt).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  const value = Number(
    video[sortBy.startsWith("duration") ? "duration" : "views"],
  );
  return Number.isFinite(value) ? value : null;
};

export const sortVideos = (videos, sortBy) => {
  const descending = sortBy.endsWith("desc");
  const sortedEntries = videos.map((video, index) => ({
    video,
    index,
    value: getSortValue(video, sortBy),
  }));

  sortedEntries.sort((left, right) => {
    if (left.value === null)
      return right.value === null ? left.index - right.index : 1;
    if (right.value === null) return -1;
    if (left.value === right.value) return left.index - right.index;
    return (left.value - right.value) * (descending ? -1 : 1);
  });

  return sortedEntries.map(({ video }) => video);
};

export default function VideoSort({
  value,
  onChange,
  ariaLabel = "Sort videos",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const menuId = useId();
  const selectedOption =
    sortOptions.find((option) => option.value === value) ?? sortOptions[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm text-slateDark/60 dark:text-white/60">Sort by</span>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#22333B]/10 bg-white px-4 py-2 text-sm font-medium text-slateDark shadow-sm transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/10 dark:bg-[#141C1E] dark:text-white dark:hover:bg-white/10"
        >
          <span>{selectedOption.label}</span>
          <span className="relative grid h-4 w-4 shrink-0 place-items-center">
            <AnimatePresence initial={false}>
              <motion.span
                key={isOpen ? "up" : "down"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="absolute inset-0 grid place-items-center"
              >
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={menuId}
              role="menu"
              aria-label={ariaLabel}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: "top right" }}
              className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-[#22333B]/10 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#141C1E]"
            >
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center px-6 py-3 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/10 ${
                    option.value === value ? "font-semibold " : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
