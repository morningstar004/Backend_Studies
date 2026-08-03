import { Inbox } from "lucide-react";
export const SkeletonCard = () => (
  <div className="animate-pulse space-y-3">
    <div className="aspect-video rounded-xl bg-black/10 dark:bg-white/10" />
    <div className="h-4 w-4/5 rounded bg-black/10 dark:bg-white/10" />
    <div className="h-3 w-2/5 rounded bg-black/10 dark:bg-white/10" />
  </div>
);
export const EmptyState = ({
  title = "Nothing here yet",
  detail = "Try again later or create something new.",
}) => (
  <div className="surface grid min-h-64 place-items-center p-8 text-center">
    <div>
      <Inbox className="mx-auto mb-3 text-primary" size={34} />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-black/55 dark:text-white/55">{detail}</p>
    </div>
  </div>
);
