import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export interface Event {
  day: number; // 0–6 from Mon
  start: number; // minutes from 08:00
  duration: number; // minutes
  title: string;
  tone: "indigo" | "teal" | "amber" | "rose" | "violet" | "sky";
  attendees?: number;
  lane?: number;
  laneCount?: number;
}

const EVENTS: Event[] = [
  { day: 0, start: 0, duration: 30, title: "Eng standup", tone: "indigo" },
  { day: 0, start: 90, duration: 60, title: "1:1 Maya", tone: "amber" },
  { day: 0, start: 240, duration: 90, title: "Design crit", tone: "rose", attendees: 6 },
  { day: 1, start: 60, duration: 45, title: "Q2 planning", tone: "violet" },
  { day: 1, start: 180, duration: 60, title: "BigCorp call", tone: "teal" },
  { day: 1, start: 180, duration: 60, title: "Riya · sync", tone: "sky", lane: 1, laneCount: 2 },
  { day: 2, start: 0, duration: 30, title: "Eng standup", tone: "indigo" },
  { day: 2, start: 120, duration: 60, title: "Audit log review", tone: "violet", attendees: 4 },
  { day: 2, start: 360, duration: 60, title: "Lunch w/ Riya", tone: "amber" },
  { day: 3, start: 30, duration: 60, title: "Sales review", tone: "teal" },
  { day: 3, start: 180, duration: 90, title: "Sprint demo", tone: "rose", attendees: 12 },
  { day: 4, start: 0, duration: 30, title: "Eng standup", tone: "indigo" },
  { day: 4, start: 60, duration: 90, title: "Roadmap", tone: "violet" },
  { day: 4, start: 300, duration: 60, title: "AMA", tone: "sky", attendees: 32 },
];

const TONE_BG: Record<Event["tone"], string> = {
  indigo: "bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300",
  teal: "bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300",
  amber: "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
  rose: "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300",
  violet: "bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-300",
  sky: "bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300",
};

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 08:00 – 18:00
const HOUR_PX = 60;

const DAYS = [
  { label: "Mon", num: 26, today: true },
  { label: "Tue", num: 27 },
  { label: "Wed", num: 28 },
  { label: "Thu", num: 29 },
  { label: "Fri", num: 30 },
];

export function CalendarsWeekShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Apr 26 – May 2 · Week 17
            </div>
            <h1 className="mt-1 font-heading text-2xl">Schedule</h1>
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
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-background/40">
          {/* Day headers */}
          <div className="grid grid-cols-[64px_repeat(5,1fr)] border-border/40 border-b">
            <div className="border-border/40 border-r" />
            {DAYS.map((d) => (
              <div
                key={d.label}
                className="border-border/40 px-3 py-3 last:border-r-0 sm:border-r"
              >
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  {d.label}
                </div>
                <div
                  className={
                    "mt-0.5 inline-flex size-7 items-center justify-center rounded-full font-heading text-base " +
                    (d.today ? "bg-foreground text-background" : "")
                  }
                >
                  {d.num}
                </div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-[64px_repeat(5,1fr)]">
            {/* Hour rail */}
            <div className="border-border/40 border-r">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="flex items-start justify-end px-2 py-1 font-mono text-[10px] text-muted-foreground"
                  style={{ height: HOUR_PX }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((d, di) => (
              <div
                key={d.label}
                className="relative border-border/40 last:border-r-0 sm:border-r"
                style={{ height: HOURS.length * HOUR_PX }}
              >
                {/* Hour grid lines */}
                {HOURS.map((h, hi) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-border/30 border-t"
                    style={{ top: hi * HOUR_PX }}
                  />
                ))}

                {/* Now line on today */}
                {d.today ? (
                  <div
                    className="absolute inset-x-0 z-10 flex items-center"
                    style={{ top: HOUR_PX * 1.5 }}
                  >
                    <span className="size-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
                    <span className="h-px flex-1 bg-rose-500" />
                  </div>
                ) : null}

                {/* Events */}
                {EVENTS.filter((e) => e.day === di).map((e, ei) => {
                  const top = (e.start / 60) * HOUR_PX;
                  const height = (e.duration / 60) * HOUR_PX;
                  const width = e.laneCount ? `calc(${100 / e.laneCount}% - 4px)` : "calc(100% - 8px)";
                  const left = e.lane ? `calc(${(e.lane / (e.laneCount ?? 1)) * 100}%)` : 4;
                  return (
                    <div
                      key={ei}
                      className={
                        "absolute overflow-hidden rounded-md border px-2 py-1 " +
                        TONE_BG[e.tone]
                      }
                      style={{
                        top,
                        height: Math.max(20, height - 2),
                        left,
                        width,
                      }}
                    >
                      <div className="truncate text-[11px] font-medium leading-tight">
                        {e.title}
                      </div>
                      <div className="font-mono text-[9px] opacity-70">
                        {formatTime(e.start)}–{formatTime(e.start + e.duration)}
                        {e.attendees ? ` · ${e.attendees}` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(min: number) {
  const total = 8 * 60 + min;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
