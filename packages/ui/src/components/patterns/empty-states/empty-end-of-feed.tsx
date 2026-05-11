import { CheckIcon, RotateCwIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const FEED = [
  { id: 1, who: "Lina", what: "shipped pricing-v2 to production", when: "12m" },
  { id: 2, who: "Marc", what: "merged #2914 into main", when: "47m" },
  { id: 3, who: "Priya", what: "opened a PR for billing webhooks", when: "2h" },
];

export function EmptyEndOfFeedShowcasePage() {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-xl">Activity</h1>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Today · 3 events
          </span>
        </div>

        <ol className="flex flex-col gap-3">
          {FEED.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-border/70 bg-background px-4 py-3 text-sm"
            >
              <span className="font-medium">{event.who}</span>{" "}
              <span className="text-muted-foreground">{event.what}</span>
              <span className="ml-2 font-mono text-[11px] text-muted-foreground/80">
                {event.when}
              </span>
            </li>
          ))}
        </ol>

        <EndMarker />
      </div>
    </div>
  );
}

export function EndMarker() {
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border/70" />
        <div className="flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
          <CheckIcon className="size-3" />
        </div>
        <div className="h-px flex-1 bg-border/70" />
      </div>
      <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.25em]">
        End of feed
      </p>
      <p className="max-w-xs text-balance text-center text-muted-foreground text-xs">
        You've seen everything from the last 24 hours. New events will appear
        at the top.
      </p>
      <Button variant="ghost" size="sm" className="mt-1">
        <RotateCwIcon />
        Refresh
      </Button>
    </div>
  );
}
