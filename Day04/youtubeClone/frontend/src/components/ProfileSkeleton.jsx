import { SkeletonCard } from "./States.jsx";

const Placeholder = ({ className }) => (
  <div className={`animate-pulse rounded bg-black/10 dark:bg-white/10 ${className}`} />
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

const ProfileSkeleton = ({ section = "home" }) => (
  <div className="space-y-5" role="status" aria-label="Loading profile">
    <div className="surface animate-pulse overflow-hidden">
      <Placeholder className="h-64 rounded-none" />
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
        <Placeholder className="-mt-16 h-36 w-36 shrink-0 rounded-2xl border-4 border-white dark:border-black sm:h-44 sm:w-44" />
        <div className="w-full space-y-3 sm:-mt-10">
          <Placeholder className="h-8 w-56 max-w-full" />
          <Placeholder className="h-4 w-36" />
          <Placeholder className="h-4 w-52 max-w-full" />
        </div>
      </div>
    </div>

    <div className="surface overflow-hidden">
      <div className="flex gap-2 border-b border-black/10 px-2 py-2 dark:border-white/10">
        {Array.from({ length: 4 }, (_, index) => (
          <Placeholder key={index} className="h-9 w-20 shrink-0 rounded-lg" />
        ))}
      </div>
      <div className="p-5 sm:p-7">
        <ProfileContentSkeleton section={section} />
      </div>
    </div>
    <span className="sr-only">Loading profile content</span>
  </div>
);

export default ProfileSkeleton;