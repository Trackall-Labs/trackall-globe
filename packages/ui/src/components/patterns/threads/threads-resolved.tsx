import { CheckCircle2Icon, ChevronDownIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

export interface Thread {
  id: number;
  initials: string;
  tone: string;
  name: string;
  time: string;
  preview: string;
  resolvedBy: { initials: string; tone: string; name: string };
  replyCount: number;
}

const THREADS: Thread[] = [
  {
    id: 1,
    initials: "MO",
    tone: "bg-emerald-500/85 text-white",
    name: "Maya Okafor",
    time: "yesterday",
    preview: "Should we keep this paragraph? It's nicely written but covers the same ground as the diagram below.",
    resolvedBy: { initials: "JL", tone: "bg-amber-500/85 text-white", name: "James" },
    replyCount: 3,
  },
  {
    id: 2,
    initials: "RP",
    tone: "bg-violet-500/85 text-white",
    name: "Riya Patel",
    time: "Mon",
    preview: "+1 from me. Also: can you tag the migration with audit-q3 so we can roll back cleanly if needed?",
    resolvedBy: { initials: "MO", tone: "bg-emerald-500/85 text-white", name: "Maya" },
    replyCount: 1,
  },
  {
    id: 3,
    initials: "DK",
    tone: "bg-sky-500/85 text-white",
    name: "Dani Kim",
    time: "Apr 21",
    preview: "Tightened the corner radius on the empty-state cards — I think it reads better now.",
    resolvedBy: { initials: "DK", tone: "bg-sky-500/85 text-white", name: "Dani" },
    replyCount: 0,
  },
];

export function ThreadsResolvedShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Comments · Resolved
            </div>
            <h1 className="mt-1 font-heading text-3xl">Resolved threads</h1>
          </div>
          <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 p-0.5 font-mono text-[10px] uppercase tracking-[0.25em]">
            <button
              type="button"
              className="rounded px-2 py-1 text-muted-foreground hover:text-foreground"
            >
              Open · 4
            </button>
            <button
              type="button"
              className="rounded bg-foreground px-2 py-1 text-background"
            >
              Resolved · {THREADS.length}
            </button>
          </div>
        </div>

        <ul className="mt-8 flex flex-col gap-3">
          {THREADS.map((t) => (
            <li
              key={t.id}
              className="group overflow-hidden rounded-lg border border-border/60 bg-background/40 transition-colors hover:border-border"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-3.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex size-5 items-center justify-center rounded-full font-medium text-[9px] ${t.tone}`}
                    >
                      {t.initials}
                    </div>
                    <span className="truncate font-medium text-sm">
                      {t.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                      {t.time}
                    </span>
                    {t.replyCount > 0 ? (
                      <span className="ml-1 rounded-full bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                        +{t.replyCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-muted-foreground text-sm">
                    {t.preview}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] sm:flex">
                    by
                    <span
                      className={`flex size-4 items-center justify-center rounded-full font-medium text-[8px] ${t.resolvedBy.tone}`}
                    >
                      {t.resolvedBy.initials}
                    </span>
                    {t.resolvedBy.name}
                  </span>
                  <Button variant="ghost" size="xs" type="button">
                    Reopen
                  </Button>
                  <button
                    type="button"
                    aria-label="Expand"
                    className="rounded-md p-1 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-foreground/[0.05] hover:text-foreground"
                  >
                    <ChevronDownIcon className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
