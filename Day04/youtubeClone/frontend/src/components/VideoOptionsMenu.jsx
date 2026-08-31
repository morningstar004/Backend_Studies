import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Download,
  ListPlus,
  MoreVertical,
  Share2,
} from "lucide-react";

const menuOptions = [
  { label: "Save watchlist", icon: Bookmark },
  { label: "Add Playlist", icon: ListPlus },
  { label: "Download", icon: Download },
  { label: "Share", icon: Share2 },
];

const VideoOptionsMenu = ({ videoFile, title = "video" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDownload = async () => {
    if (!videoFile) return;

    try {
      const response = await fetch(videoFile, { mode: "cors" });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${(title || "video").replace(/\s+/g, "-").toLowerCase()}.mp4`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.href = videoFile;
      link.download = `${(title || "video").replace(/\s+/g, "-").toLowerCase()}.mp4`;
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open video options"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-none border-0 bg-transparent p-0 text-white transition hover:bg-transparent"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-10 right-0 z-20 w-48 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#111111]">
          {menuOptions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (label === "Download") {
                  handleDownload();
                }

                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoOptionsMenu;
