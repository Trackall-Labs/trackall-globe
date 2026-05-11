import { InfoIcon, XIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

export function ToastsInfoBannerShowcasePage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="sticky top-0 z-50 border-b border-amber-500/40 bg-amber-500/10 backdrop-blur dark:bg-amber-500/[0.08]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2.5">
          <InfoIcon className="size-4 shrink-0 text-amber-700 dark:text-amber-400" />
          <p className="flex-1 truncate text-amber-900 text-sm dark:text-amber-100">
            <span className="font-medium">Scheduled maintenance</span>{" "}
            <span className="text-amber-800/80 dark:text-amber-200/80">
              · Tue Apr 29 from 2:00–2:30 UTC. Brief downtime expected.
            </span>
          </p>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="text-amber-900 hover:bg-amber-500/15 dark:text-amber-100"
          >
            Learn more
          </Button>
          <button
            type="button"
            aria-label="Dismiss"
            className="rounded-md p-1 text-amber-900/70 transition-colors hover:bg-amber-500/10 hover:text-amber-900 dark:text-amber-100/70 dark:hover:text-amber-100"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <FakeAppBody />
    </div>
  );
}

export function FakeAppBody() {
  return (
    <div className="grid min-h-[calc(100svh-44px)] grid-cols-[220px_1fr]">
      <aside className="border-r border-border/60 bg-foreground/[0.02] p-4">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Workspace
        </div>
        <div className="mt-1 font-medium text-sm">Acme inc.</div>
        <ul className="mt-6 space-y-1.5 text-muted-foreground text-sm">
          <li className="text-foreground">● Home</li>
          <li>○ Inbox</li>
          <li>○ Projects</li>
          <li>○ People</li>
        </ul>
      </aside>
      <main className="p-10">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Overview
        </div>
        <h1 className="mt-1 font-heading text-3xl">Welcome back, Sean</h1>
        <p className="mt-2 max-w-md text-muted-foreground text-sm">
          A typical landing pane sits underneath. The banner is sticky and
          adapts to the scroll position.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="h-24 rounded-xl border border-border/60 bg-background/40" />
          <div className="h-24 rounded-xl border border-border/60 bg-background/40" />
          <div className="h-24 rounded-xl border border-border/60 bg-background/40" />
        </div>
      </main>
    </div>
  );
}
