import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

export interface Event {
  day: number; // day of April
  title: string;
  span?: number; // number of days
  tone: "indigo" | "teal" | "amber" | "rose" | "violet" | "sky";
}

const EVENTS: Event[] = [
  { day: 1, title: "Q2 kickoff", span: 1, tone: "indigo" },
  { day: 3, title: "Eng offsite", span: 3, tone: "violet" },
  { day: 7, title: "1:1 Maya", tone: "amber" },
  { day: 9, title: "Sales review", tone: "teal" },
  { day: 12, title: "Design crit", tone: "rose" },
  { day: 14, title: "Launch v3.4", tone: "indigo" },
  { day: 15, title: "AMA", tone: "sky" },
  { day: 18, title: "Vacation", span: 5, tone: "teal" },
  { day: 22, title: "Board meeting", tone: "violet" },
  { day: 24, title: "Customer call · BigCorp", tone: "amber" },
  { day: 26, title: "Sprint demo", tone: "indigo" },
  { day: 26, title: "Coffee w/ Riya", tone: "rose" },
  { day: 26, title: "Audit log review", tone: "teal" },
  { day: 28, title: "Retro", tone: "sky" },
  { day: 30, title: "Q3 planning", tone: "violet" },
];

const TONE: Record<Event["tone"], string> = {
  indigo: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  teal: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarsMonthShowcasePage() {
  // April 2026 — starts on Wed (day 1)
  const offset = 2; // days before April 1 (Mon=0, Tue=1, Wed=2)
  const totalDays = 30;
  const cells = offset + totalDays;
  const rows = Math.ceil(cells / 7);

  return (
    <div className="min-h-svh bg-background px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Calendar · personal
            </div>
            <h1 className="mt-1 font-heading text-2xl">April 2026</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid size-8 place-items-center rounded-md border border-border/60 hover:bg-foreground/[0.04]"
            >
              <ChevronLeftIcon className="size-3.5" />
            </button>
            <button
              type="button"
              className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em]"
            >
              Today
            </button>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-md border border-border/60 hover:bg-foreground/[0.04]"
            >
              <ChevronRightIcon className="size-3.5" />
            </button>
            <div className="ml-2 flex items-center rounded-md border border-border/60 p-0.5 font-mono text-[10px] uppercase tracking-[0.2em]">
              <button
                type="button"
                className="rounded px-2 py-1 text-muted-foreground hover:text-foreground"
              >
                Day
              </button>
              <button
                type="button"
                className="rounded px-2 py-1 text-muted-foreground hover:text-foreground"
              >
                Week
              </button>
              <button
                type="button"
                className="rounded bg-foreground/[0.08] px-2 py-1"
              >
                Month
              </button>
            </div>
            <button
              type="button"
              className="ml-2 inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 font-mono text-[11px] text-background uppercase tracking-[0.2em]"
            >
              <PlusIcon className="size-3" />
              Event
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-background/40">
          <div className="grid grid-cols-7 border-border/40 border-b">
            {DAYS.map((d) => (
              <div
                key={d}
                className="px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-5">
            {Array.from({ length: rows * 7 }).map((_, i) => {
              const day = i - offset + 1;
              const out = day < 1 || day > totalDays;
              const today = day === 26;
              const dayEvents = EVENTS.filter((e) => e.day === day).slice(0, 3);
              const overflow = EVENTS.filter((e) => e.day === day).length - 3;
              return (
                <div
                  key={i}
                  className={
                    "min-h-[110px] border-border/40 border-r border-b p-1.5 last-of-type:border-r-0 " +
                    (out ? "bg-muted/20" : "")
                  }
                >
                  {!out ? (
                    <>
                      <div
                        className={
                          "mb-1 flex size-7 items-center justify-center rounded-full font-mono text-[12px] " +
                          (today
                            ? "bg-foreground text-background"
                            : "text-foreground/80")
                        }
                      >
                        {day}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {dayEvents.map((e, ei) => (
                          <div
                            key={ei}
                            className={
                              "truncate rounded border px-1.5 py-0.5 text-[10px] leading-tight " +
                              TONE[e.tone]
                            }
                            style={
                              e.span
                                ? { gridColumn: `span ${e.span}` }
                                : undefined
                            }
                          >
                            {e.title}
                          </div>
                        ))}
                        {overflow > 0 ? (
                          <div className="px-1 font-mono text-[10px] text-muted-foreground">
                            +{overflow} more
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
