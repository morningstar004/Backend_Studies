const VideoDetailSkeleton = () => (
  <div
    className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
    role="status"
    aria-label="Loading video"
    aria-busy="true"
  >
    <article className="min-w-0 animate-pulse space-y-6">
      <div className="aspect-video w-full rounded-2xl bg-[#22333B]/10 dark:bg-white/10" />
      <div className="space-y-4">
        <div className="h-6 w-3/4 rounded bg-[#22333B]/10 dark:bg-white/10" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-[#22333B]/10 dark:bg-white/10" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-[#22333B]/10 dark:bg-white/10" />
              <div className="h-3 w-24 rounded bg-[#22333B]/10 dark:bg-white/10" />
            </div>
          </div>
          <div className="h-10 w-48 rounded-full bg-[#22333B]/10 dark:bg-white/10" />
        </div>
        <div className="space-y-2 rounded-xl bg-[#22333B]/5 p-4 dark:bg-white/5">
          <div className="h-4 w-1/3 rounded bg-[#22333B]/10 dark:bg-white/10" />
          <div className="h-3 w-full rounded bg-[#22333B]/10 dark:bg-white/10" />
          <div className="h-3 w-2/3 rounded bg-[#22333B]/10 dark:bg-white/10" />
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-5 w-36 rounded bg-[#22333B]/10 dark:bg-white/10" />
          <div className="h-11 w-full rounded-lg bg-[#22333B]/10 dark:bg-white/10" />
          {[0, 1].map((item) => (
            <div className="flex gap-3" key={item}>
              <div className="size-10 shrink-0 rounded-full bg-[#22333B]/10 dark:bg-white/10" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-1/4 rounded bg-[#22333B]/10 dark:bg-white/10" />
                <div className="h-4 w-4/5 rounded bg-[#22333B]/10 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
    <aside className="space-y-4">
      <div className="h-6 w-44 animate-pulse rounded bg-[#22333B]/10 dark:bg-white/10" />
      {[0, 1, 2, 3].map((item) => (
        <div className="flex animate-pulse gap-3" key={item}>
          <div className="aspect-video w-36 shrink-0 rounded-lg bg-[#22333B]/10 dark:bg-white/10" />
          <div className="min-w-0 flex-1 space-y-2 py-1">
            <div className="h-4 rounded bg-[#22333B]/10 dark:bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-[#22333B]/10 dark:bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-[#22333B]/10 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </aside>
    <span className="sr-only">Loading video details…</span>
  </div>
);

export default VideoDetailSkeleton;
