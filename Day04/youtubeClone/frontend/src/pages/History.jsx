import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { userService } from "../api/services.ts";
import { EmptyState, SkeletonCard } from "../components/States.jsx";
import VideoCollectionCard from "../components/VideoCollectionCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const getLocalDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const groupHistoryVideos = (videos) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayKey = getLocalDateKey(today);
  const yesterdayKey = getLocalDateKey(yesterday);
  const currentYear = today.getFullYear();
  const groups = new Map();

  videos.forEach((video) => {
    const parsedDate = video.historyDate ? new Date(video.historyDate) : null;
    const watchedAt =
      parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate : null;
    const dateKey = watchedAt ? getLocalDateKey(watchedAt) : "unavailable";
    let label = "Date unavailable";

    if (dateKey === todayKey) {
      label = "Today";
    } else if (dateKey === yesterdayKey) {
      label = "Yesterday";
    } else if (watchedAt) {
      label = watchedAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        ...(watchedAt.getFullYear() !== currentYear && { year: "numeric" }),
      });
    }

    if (!groups.has(dateKey)) {
      const groupDate = watchedAt ? new Date(watchedAt) : null;
      groupDate?.setHours(0, 0, 0, 0);
      groups.set(dateKey, { key: dateKey, label, date: groupDate, videos: [] });
    }

    groups.get(dateKey).videos.push(video);
  });

  return [...groups.values()].sort((left, right) => {
    if (!left.date) return 1;
    if (!right.date) return -1;
    return right.date - left.date;
  });
};

export default function History() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [historySearch, setHistorySearch] = useState("");
  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: userService.history,
    enabled: !!user?._id,
  });
  const historyVideos = historyQuery.data?.data || [];
  const filteredVideos = historyVideos.filter((video) =>
    String(video.title || "")
      .toLowerCase()
      .includes(historySearch.trim().toLowerCase()),
  );
  const historyGroups = groupHistoryVideos(filteredVideos);

  const handleClearHistory = async () => {
    if (!historyVideos.length) return;
    if (!window.confirm("Clear your entire watch history?")) return;

    try {
      await userService.clearHistory();
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Watch history cleared.");
    } catch (error) {
      toast.error(error?.message || "Unable to clear watch history.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Watch history</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
              size={17}
            />
            <input
              type="search"
              aria-label="Search watch history"
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
              placeholder="Search watch history"
              className="input w-full rounded-3xl pl-9"
            />
          </label>
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={!historyVideos.length}
            className="inline-flex items-center justify-center gap-2 rounded-3xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />
            Clear history
          </button>
        </div>
      </header>

      {historyQuery.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : historyQuery.isError ? (
        <EmptyState
          title="History unavailable"
          detail={historyQuery.error?.message || "Unable to load watch history."}
        />
      ) : historyGroups.length ? (
        <div className="space-y-8">
          {historyGroups.map(({ key, label, videos }) => (
            <section key={key} className="space-y-4">
              <h2 className="text-lg font-semibold">{label}</h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {videos.map((video) => (
                  <VideoCollectionCard
                    key={video._id}
                    video={video}
                    timestamp={video.historyDate}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : historySearch.trim() ? (
        <EmptyState
          title="No matching videos"
          detail="Try a different search."
        />
      ) : (
        <EmptyState
          title="No watch history yet"
          detail="Videos you watch will appear here."
        />
      )}
    </section>
  );
}