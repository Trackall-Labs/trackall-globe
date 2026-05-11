import { useState } from "react";
import { Button } from "@orbit/ui/button";

export function ToursBeaconShowcasePage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeApp />

      <Beacon
        x={520}
        y={140}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        align="right"
        title="Stack views are new."
        body="Group your inbox by project, sender, or status. Click the icon next to a list header to switch."
      />

      <Beacon
        x={120}
        y={420}
        open={false}
        onToggle={() => null}
        align="bottom"
        title=""
        body=""
        compact
      />
    </div>
  );
}

export function Beacon({
  x,
  y,
  open,
  onToggle,
  title,
  body,
  align,
  compact,
}: {
  x: number;
  y: number;
  open: boolean;
  onToggle: () => void;
  title: string;
  body: string;
  align: "right" | "bottom";
  compact?: boolean;
}) {
  return (
    <div className="absolute z-40" style={{ left: x, top: y }}>
      <button
        type="button"
        onClick={onToggle}
        aria-label="Show hint"
        className="relative flex size-4 items-center justify-center"
      >
        <span
          className="absolute size-4 animate-ping rounded-full bg-primary/60"
          style={{ animationDuration: "1.6s" }}
        />
        <span className="relative size-2 rounded-full bg-primary ring-2 ring-background" />
      </button>

      {open && !compact ? (
        <div
          className={`absolute w-72 rounded-xl border border-border/70 bg-background p-3.5 shadow-2xl ${
            align === "right" ? "left-6 -top-2" : "-left-2 top-6"
          }`}
        >
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
            {body}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em]">
              New · April 26
            </span>
            <Button size="xs" variant="ghost" type="button" onClick={onToggle}>
              Got it
            </Button>
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
        <div className="h-2 w-32 rounded bg-foreground/10" />
        <div className="h-2 w-28 rounded bg-foreground/10" />
        <div className="h-2 w-24 rounded bg-foreground/10" />
      </aside>
      <main className="p-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Inbox
            </div>
            <h1 className="mt-1 font-heading text-3xl">Today</h1>
          </div>
          <div className="h-9 w-44 rounded-md border border-border/60 bg-background/40" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-border/50 bg-foreground/[0.02] p-4"
            >
              <div className="h-2 w-24 rounded bg-foreground/15" />
              <div className="mt-2 h-2 w-32 rounded bg-foreground/10" />
              <div className="mt-2 h-2 w-28 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
