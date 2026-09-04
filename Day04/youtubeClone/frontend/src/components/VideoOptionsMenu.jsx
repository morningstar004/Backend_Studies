import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  BookMarked,
  Download,
  ListPlus,
  MoreVertical,
  Share2,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { playlistService, userService } from "../api/services.ts";

const VideoOptionsMenu = ({ videoId, videoFile, title = "video" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();

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

  const handleToggleWatchlist = async () => {
    if (!videoId) {
      toast.error("Video is missing.");
      return;
    }

    try {
      const response = await userService.toggleWatchlist(videoId);
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(response?.data?.message || "Watchlist updated.");
    } catch (error) {
      toast.error(error?.message || "Unable to update watchlist.");
    }
  };

  const handleAddPlaylist = async () => {
    if (!videoId) {
      toast.error("Video is missing.");
      return;
    }

    try {
      const safeTitle = (title || "My playlist").trim();
      const playlistName =
        safeTitle.length > 25 ? `${safeTitle.slice(0, 25)}...` : safeTitle;
      const createResponse = await playlistService.create({
        name: `${playlistName} playlist`,
        description: `Videos related to ${safeTitle}.`,
      });

      const playlistId = createResponse?.data?._id || createResponse?.data?.id;
      if (!playlistId) {
        throw new Error("Playlist was not created.");
      }

      await playlistService.add(playlistId, videoId);
      toast.success("Video added to playlist.");
    } catch (error) {
      toast.error(error?.message || "Unable to add the video to a playlist.");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/video/${videoId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Watch this video",
          text: `Check out this video: ${title || "video"}`,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Video link copied to clipboard.");
        return;
      }

      window.prompt("Copy this video link:", shareUrl);
    } catch {
      toast.error("Unable to share this video.");
    }
  };

  const handleRemoveFromHistory = async () => {
    if (!videoId) {
      toast.error("Video is missing.");
      return;
    }

    try {
      await userService.removeFromHistory(videoId);
      queryClient.invalidateQueries({ queryKey: ["watchHistory"] });
      toast.success("Video removed from history.");
    } catch (error) {
      toast.error(error?.message || "Unable to remove video from history.");
    }
  };

  const menuOptions = [
    { label: "Save watchlist", icon: Bookmark, action: handleToggleWatchlist },
    {
      label: "Remove from watchlist",
      icon: BookMarked,
      action: handleToggleWatchlist,
    },
    { label: "Add Playlist", icon: ListPlus, action: handleAddPlaylist },
    { label: "Download", icon: Download, action: handleDownload },
    { label: "Share", icon: Share2, action: handleShare },
    {
      label: "Remove from History",
      icon: History,
      action: handleRemoveFromHistory,
    },
  ];

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
        <div className="absolute bottom-10 right-0 z-20 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#111111]">
          {menuOptions.map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                action?.();
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
