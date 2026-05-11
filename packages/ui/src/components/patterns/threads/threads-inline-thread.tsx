import { MessageSquareIcon, SmileIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

export interface Comment {
  initials: string;
  tone: string;
  name: string;
  time: string;
  body: string;
}

const COMMENTS: Comment[] = [
  {
    initials: "MO",
    tone: "bg-emerald-500/85 text-white",
    name: "Maya Okafor",
    time: "10m",
    body: "Should we keep this paragraph? It's nicely written but covers the same ground as the diagram below.",
  },
  {
    initials: "JL",
    tone: "bg-amber-500/85 text-white",
    name: "James Lin",
    time: "8m",
    body: "I'd keep it. New readers don't always parse the diagram on first pass — the prose is the safety net.",
  },
];

export function ThreadsInlineThreadShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_320px] gap-10 px-8 py-12">
        <article className="prose">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Doc · Engineering · Q3 planning
          </div>
          <h1 className="mt-1 font-heading text-3xl tracking-tight">
            How we ship.
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Three things have shaped how Orbit ships in the last quarter:
            tighter audit log retention, scoped invites, and the new pricing
            page. Each landed in under two weeks.
          </p>

          <p
            id="anchored-paragraph"
            className="mt-4 rounded-md bg-amber-500/[0.08] px-3 py-2 text-foreground/90 text-sm leading-relaxed ring-1 ring-amber-500/30"
          >
            We've been able to move quickly because the kernel is small and
            the scope of each change is narrow. When something fails, the blast
            radius is one bounded context — the auth, billing, or audit module.
          </p>

          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            That's the bet, anyway. The alternative — a single sprawling
            domain — looked appealing in the early days, but every refactor
            since has paid for itself in confidence.
          </p>

          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Next quarter we're adding two more contexts: webhooks and the
            jobs runtime. Both are heavily tested in isolation already.
          </p>
        </article>

        <aside className="space-y-3 border-l border-border/60 pl-6">
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            <MessageSquareIcon className="size-3" />
            Thread · 2 replies
          </div>

          <div className="-ml-6 mt-1 flex items-center gap-2 rounded-r-md bg-amber-500/[0.06] px-2.5 py-1 ring-1 ring-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span className="font-mono text-[10px] text-amber-700 uppercase tracking-[0.25em] dark:text-amber-400">
              Anchored
            </span>
          </div>

          {COMMENTS.map((c, i) => (
            <article key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-6 items-center justify-center rounded-full font-medium text-[10px] ${c.tone}`}
                >
                  {c.initials}
                </div>
                <span className="font-medium text-sm">{c.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                  {c.time}
                </span>
              </div>
              <p className="ml-8 text-muted-foreground text-sm leading-relaxed">
                {c.body}
              </p>
              <div className="ml-7 flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                >
                  <SmileIcon className="size-3" />
                  React
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                >
                  Reply
                </button>
              </div>
            </article>
          ))}

          <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-2">
            <input
              placeholder="Reply…"
              className="h-8 w-full bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between border-t border-border/40 pt-2">
              <span className="font-mono text-[9px] text-muted-foreground/70 uppercase tracking-[0.25em]">
                ⌘ + ↵ to send
              </span>
              <Button size="xs" type="button">
                Send
              </Button>
            </div>
          </div>

          <button
            type="button"
            className="rounded px-1.5 py-1 font-mono text-[10px] text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            Resolve thread
          </button>
        </aside>
      </div>
    </div>
  );
}
