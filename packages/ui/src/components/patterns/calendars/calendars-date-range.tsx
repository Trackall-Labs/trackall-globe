import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const PRESETS = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "This month",
  "Last month",
  "Last quarter",
  "Year to date",
];

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export interface MonthSpec {
  label: string;
  total: number;
  offset: number;
}

const MONTHS: MonthSpec[] = [
  { label: "March 2026", total: 31, offset: 6 }, // starts Sun
  { label: "April 2026", total: 30, offset: 2 }, // starts Wed
];

const RANGE_START = { month: 0, day: 27 };
const RANGE_END = { month: 1, day: 9 };

export function CalendarsDateRangeShowcasePage() {
  return (
    <div className="grid min-h-svh place-items-center bg-background p-8">
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        <div className="grid grid-cols-[180px_1fr]">
          <aside className="border-border/60 border-r bg-background p-3">
            <div className="px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Quick range
            </div>
            <ul className="mt-1 flex flex-col gap-0.5">
              {PRESETS.map((p) => {
                const active = p === "Last 14 days";
                return (
                  <li key={p}>
                    <button
                      type="button"
                      className={
                        "w-full rounded-md px-2 py-1.5 text-left text-sm " +
                        (active
                          ? "bg-foreground/[0.06] text-foreground"
                          : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground")
                      }
                    >
                      {p}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 border-border/60 border-t pt-3">
              <div className="px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Custom
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 px-1">
                <Field label="From" value="Mar 27, 2026" />
                <Field label="To" value="Apr 9, 2026" />
              </div>
            </div>
          </aside>

          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
              <div className="grid grid-cols-2 gap-12">
                {MONTHS.map((m) => (
                  <span key={m.label} className="font-mono text-xs">
                    {m.label}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <ChevronRightIcon className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {MONTHS.map((m, mi) => (
                <Month key={m.label} m={m} mi={mi} />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-border/60 border-t pt-4">
              <div className="font-mono text-[11px] text-muted-foreground">
                14 days · Mar 27 → Apr 9 · 2026
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" type="button">
                  Reset
                </Button>
                <Button type="button">Apply range</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Month({ m, mi }: { m: MonthSpec; mi: number }) {
  const cells = Array.from({ length: m.offset + m.total }, (_, i) => i);
  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 px-0.5">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center font-mono text-[9px] text-muted-foreground uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((c) => {
          const day = c - m.offset + 1;
          const out = day < 1 || day > m.total;
          if (out) return <span key={c} />;

          const point = { month: mi, day };
          const inRange = isBetween(point, RANGE_START, RANGE_END);
          const isStart = sameDay(point, RANGE_START);
          const isEnd = sameDay(point, RANGE_END);
          const isEdge = isStart || isEnd;

          return (
            <div key={c} className="relative">
              {inRange && !isEdge ? (
                <span className="absolute inset-0 bg-foreground/[0.06]" />
              ) : null}
              {isStart ? (
                <span className="absolute inset-y-0 right-0 left-1/2 bg-foreground/[0.06]" />
              ) : null}
              {isEnd ? (
                <span className="absolute inset-y-0 right-1/2 left-0 bg-foreground/[0.06]" />
              ) : null}
              <button
                type="button"
                className={
                  "relative grid h-8 w-8 mx-auto place-items-center rounded-full font-mono text-xs " +
                  (isEdge
                    ? "bg-foreground text-background"
                    : "text-foreground/85 hover:bg-foreground/[0.08]")
                }
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function sameDay(a: { month: number; day: number }, b: { month: number; day: number }) {
  return a.month === b.month && a.day === b.day;
}

function isBetween(
  p: { month: number; day: number },
  a: { month: number; day: number },
  b: { month: number; day: number },
) {
  if (p.month < a.month || p.month > b.month) return false;
  if (p.month === a.month && p.day < a.day) return false;
  if (p.month === b.month && p.day > b.day) return false;
  return true;
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background px-2 py-1.5">
      <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[11px]">{value}</div>
    </div>
  );
}
