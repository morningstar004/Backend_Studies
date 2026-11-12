import { Inbox } from "lucide-react";

export const SkeletonCard = () => (
  <div className="animate-pulse space-y-3 p-1">
    <div className="aspect-video w-full rounded-2xl bg-[#22333B]/10 dark:bg-white/10" />
    <div className="flex gap-3 pt-1">
      <div className="h-9 w-9 shrink-0 rounded-full bg-[#22333B]/10 dark:bg-white/10" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="h-4 w-4/5 rounded-md bg-[#22333B]/10 dark:bg-white/10" />
        <div className="h-3 w-2/5 rounded-md bg-[#22333B]/10 dark:bg-white/10" />
      </div>
    </div>
  </div>
);

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  detail = "Try again later or create something new.",
  action = null,
}) => (
  <div className="surface mx-auto grid min-h-64 max-w-xl place-items-center p-8 text-center">
    <div className="flex flex-col items-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={28} />
      </div>
      <h2 className="text-lg font-bold text-slateDark dark:text-white">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-slateDark/60 dark:text-white/60">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  </div>
);
