import { useState } from "react";
import { LightbulbIcon, XIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

export function ToursInlineHintShowcasePage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeApp />

      {open ? (
        <div className="absolute right-6 bottom-6 z-50 w-80">
          <div className="rounded-xl border border-border/70 bg-background p-4 shadow-xl backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <LightbulbIcon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">
                  Group projects by team
                </div>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  You have 6 projects now — try grouping the sidebar by team to
                  keep the noise down.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="xs" variant="outline" type="button">
                    Try it
                  </Button>
                  <Button size="xs" variant="ghost" type="button">
                    Not now
                  </Button>
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setOpen(false)}
                className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em]">
              <span>Tip · 1 of 8</span>
              <button
                type="button"
                className="transition-colors hover:text-foreground"
              >
                See all tips →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FakeApp() {
  return (
    <div className="absolute inset-0 grid grid-cols-[220px_1fr]">
      <aside className="border-r border-border/60 bg-foreground/[0.02] p-4 space-y-2">
        <div className="h-3 w-28 rounded bg-foreground/15" />
        <div className="mt-3 h-2 w-32 rounded bg-foreground/10" />
        <div className="h-2 w-28 rounded bg-foreground/10" />
        <div className="h-2 w-30 rounded bg-foreground/10" />
        <div className="h-2 w-26 rounded bg-foreground/10" />
        <div className="h-2 w-24 rounded bg-foreground/10" />
      </aside>
      <main className="p-10">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Projects
        </div>
        <h1 className="mt-1 font-heading text-3xl">All projects</h1>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border/50 bg-foreground/[0.02] p-3"
            >
              <div className="h-2 w-20 rounded bg-foreground/20" />
              <div className="mt-2 h-2 w-24 rounded bg-foreground/10" />
              <div className="mt-2 h-2 w-16 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
