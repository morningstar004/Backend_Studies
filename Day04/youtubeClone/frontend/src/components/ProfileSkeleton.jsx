import { SkeletonCard } from "./States.jsx";

const Placeholder = ({ className }) => (
  <div
    className={`animate-pulse rounded bg-black/10 dark:bg-white/10 ${className}`}
  />
);

export const ProfileContentSkeleton = ({ section = "home" }) => {
  if (section === "playlists") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="surface animate-pulse space-y-3 p-4">
            <Placeholder className="h-5 w-3/5" />
            <Placeholder className="h-4 w-full" />
            <Placeholder className="h-3 w-2/5" />
          </div>
        ))}
      </div>
    );
  }

  if (section === "posts") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="surface animate-pulse space-y-3 p-4">
            <Placeholder className="h-4 w-full" />
            <Placeholder className="h-4 w-4/5" />
            <Placeholder className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (section === "videos") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Placeholder className="h-6 w-44" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="min-w-0 flex-1">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <Placeholder className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <Placeholder className="h-6 w-40" />
        <div className="surface animate-pulse space-y-3 p-4">
          <Placeholder className="h-4 w-full" />
          <Placeholder className="h-4 w-4/5" />
          <Placeholder className="h-3 w-1/4" />
        </div>
      </section>
    </div>
  );
};
