import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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

export default function VideoSort({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
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
      <span className="text-sm text-black/60 dark:text-white/60">Sort by</span>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/10 dark:bg-[#111111] dark:hover:bg-white/10"
        >
          <span>{selectedOption.label}</span>
          <ChevronDown
            size={16}
            className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isOpen && (
          <div
            role="menu"
            aria-label="Sort watchlist videos"
            className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#111111]"
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
          </div>
        )}
      </div>
    </div>
  );
}
