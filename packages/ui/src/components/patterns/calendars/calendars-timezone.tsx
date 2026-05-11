import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2Icon,
  GlobeIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@orbit/ui/popover";

export interface Zone {
  name: string;
  city: string;
  iana: string;
  offset: number; // hours from home (NY/ET)
}

// Library of selectable zones, offsets relative to ET (New York). DST is
// approximated; the live clock uses real IANA timezones via Intl.
const ZONE_LIBRARY: Zone[] = [
  { name: "HST", city: "Honolulu", iana: "Pacific/Honolulu", offset: -6 },
  { name: "AKDT", city: "Anchorage", iana: "America/Anchorage", offset: -4 },
  { name: "PT", city: "San Francisco", iana: "America/Los_Angeles", offset: -3 },
  { name: "MT", city: "Denver", iana: "America/Denver", offset: -2 },
  { name: "CT", city: "Chicago", iana: "America/Chicago", offset: -1 },
  { name: "ET", city: "New York", iana: "America/New_York", offset: 0 },
  { name: "BRT", city: "São Paulo", iana: "America/Sao_Paulo", offset: 1 },
  { name: "ART", city: "Buenos Aires", iana: "America/Argentina/Buenos_Aires", offset: 1 },
  { name: "GMT", city: "Reykjavik", iana: "Atlantic/Reykjavik", offset: 4 },
  { name: "BST", city: "London", iana: "Europe/London", offset: 5 },
  { name: "CET", city: "Berlin", iana: "Europe/Berlin", offset: 6 },
  { name: "EET", city: "Athens", iana: "Europe/Athens", offset: 7 },
  { name: "WAT", city: "Lagos", iana: "Africa/Lagos", offset: 5 },
  { name: "EAT", city: "Nairobi", iana: "Africa/Nairobi", offset: 7 },
  { name: "MSK", city: "Moscow", iana: "Europe/Moscow", offset: 7 },
  { name: "GST", city: "Dubai", iana: "Asia/Dubai", offset: 8 },
  { name: "IST", city: "Bangalore", iana: "Asia/Kolkata", offset: 9.5 },
  { name: "ICT", city: "Bangkok", iana: "Asia/Bangkok", offset: 11 },
  { name: "SGT", city: "Singapore", iana: "Asia/Singapore", offset: 12 },
  { name: "HKT", city: "Hong Kong", iana: "Asia/Hong_Kong", offset: 12 },
  { name: "JST", city: "Tokyo", iana: "Asia/Tokyo", offset: 13 },
  { name: "AEST", city: "Sydney", iana: "Australia/Sydney", offset: 14 },
  { name: "NZST", city: "Auckland", iana: "Pacific/Auckland", offset: 16 },
];

const DEFAULT_ZONE_NAMES = ["PT", "ET", "BST", "CET", "IST", "JST"];
const DEFAULT_ZONES: Zone[] = ZONE_LIBRARY.filter((z) =>
  DEFAULT_ZONE_NAMES.includes(z.name),
);

const HOURS = 24;
const HOUR_W = 36;
const MIN_DURATION = 1;
const MAX_DURATION = 8;

export type DragMode = "move" | "left" | "right";

export function CalendarsTimezoneShowcasePage() {
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);
  const [start, setStart] = useState(13);
  const [duration, setDuration] = useState(3);
  const [now, setNow] = useState(() => new Date());
  const [bestPulse, setBestPulse] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startStart: number;
    startDuration: number;
  } | null>(null);

  const beginDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      mode,
      startX: e.clientX,
      startStart: start,
      startDuration: duration,
    };
  };

  const onDragMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const hourDelta = Math.round((e.clientX - drag.startX) / HOUR_W);

    if (drag.mode === "move") {
      const next = clamp(drag.startStart + hourDelta, 0, HOURS - duration);
      setStart(next);
      return;
    }
    if (drag.mode === "left") {
      const newStart = clamp(
        drag.startStart + hourDelta,
        0,
        drag.startStart + drag.startDuration - MIN_DURATION,
      );
      const newDuration = drag.startStart + drag.startDuration - newStart;
      setStart(newStart);
      setDuration(clamp(newDuration, MIN_DURATION, MAX_DURATION));
      return;
    }
    if (drag.mode === "right") {
      const next = clamp(
        drag.startDuration + hourDelta,
        MIN_DURATION,
        Math.min(MAX_DURATION, HOURS - drag.startStart),
      );
      setDuration(next);
    }
  };

  const onDragEnd = (e: React.PointerEvent) => {
    if (dragRef.current) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current = null;
    }
  };

  const onTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hour = clamp(Math.floor(x / HOUR_W), 0, HOURS - duration);
    setStart(hour);
  };

  const verdicts = useMemo(
    () =>
      zones.map((z) => {
        let asleep = 0;
        let edge = 0;
        let work = 0;
        for (let i = 0; i < duration; i++) {
          const h = (start + i + z.offset + 24) % 24;
          if (h < 7 || h >= 22) asleep++;
          else if ((h >= 7 && h < 9) || (h >= 17 && h < 22)) edge++;
          else work++;
        }
        const tone: "ok" | "edge" | "asleep" =
          asleep > 0 ? "asleep" : edge > 0 ? "edge" : "ok";
        return { zone: z, tone, asleep, edge, work };
      }),
    [zones, start, duration],
  );

  const goodCount = verdicts.filter((v) => v.tone === "ok").length;
  const edgeCount = verdicts.filter((v) => v.tone === "edge").length;
  const asleepCount = verdicts.filter((v) => v.tone === "asleep").length;

  const headline =
    zones.length === 0
      ? "Add a timezone to begin."
      : asleepCount === 0 && edgeCount === 0
        ? "Everyone in working hours."
        : asleepCount === 0
          ? `${goodCount} working · ${edgeCount} on the edge.`
          : `${asleepCount} asleep — try a different window.`;

  const findBest = () => {
    if (zones.length === 0) return;
    const best = findBestStart(zones, duration);
    setStart(best);
    setBestPulse(true);
    window.setTimeout(() => setBestPulse(false), 900);
  };

  const available = ZONE_LIBRARY.filter(
    (z) => !zones.some((existing) => existing.name === z.name),
  );

  const addZone = (z: Zone) => {
    setZones((prev) => [...prev, z].sort((a, b) => a.offset - b.offset));
  };
  const removeZone = (name: string) =>
    setZones((prev) => prev.filter((z) => z.name !== name));

  return (
    <div className="min-h-svh bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              {fmtDate(now)} · sliding window
            </div>
            <h1 className="mt-1 font-heading text-2xl">Find a meeting time</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Drag the window or grab its edges. Click any hour to jump.{" "}
              <span className="text-foreground">{headline}</span>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={findBest}
            disabled={zones.length === 0}
            className={bestPulse ? "ring-2 ring-emerald-500/40" : ""}
          >
            <SparklesIcon />
            Find best
          </Button>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-background/40">
          <div className="grid grid-cols-[220px_1fr]">
            <div className="border-border/40 border-r" />
            <div className="overflow-x-auto">
              <div
                className="relative grid border-border/40 border-b"
                style={{
                  gridTemplateColumns: `repeat(${HOURS}, ${HOUR_W}px)`,
                  width: HOURS * HOUR_W,
                }}
              >
                {Array.from({ length: HOURS }).map((_, h) => (
                  <div
                    key={h}
                    className={
                      "border-border/40 border-l py-1.5 text-center font-mono text-[10px] " +
                      (h >= start && h < start + duration
                        ? "text-foreground"
                        : "text-muted-foreground")
                    }
                  >
                    {String(h).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ul>
            {zones.map((z, zi) => {
              const v = verdicts[zi]!;
              return (
                <li
                  key={z.name}
                  className="group grid grid-cols-[220px_1fr] border-border/40 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-2 border-border/40 border-r px-3 py-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground/[0.06] font-mono text-[10px]">
                      {z.name}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{z.city}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {liveTime(now, z.iana)}
                      </div>
                    </div>
                    <VerdictPill tone={v.tone} />
                    <button
                      type="button"
                      onClick={() => removeZone(z.name)}
                      aria-label={`Remove ${z.city}`}
                      className="inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/50 opacity-0 transition-all hover:bg-foreground/[0.06] hover:text-destructive group-hover:opacity-100"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                  <div
                    className="overflow-hidden"
                    onPointerMove={onDragMove}
                    onPointerUp={onDragEnd}
                    onPointerCancel={onDragEnd}
                  >
                    <div
                      ref={zi === 0 ? trackRef : undefined}
                      className="relative h-12 cursor-pointer"
                      style={{ width: HOURS * HOUR_W }}
                      onClick={onTrackClick}
                    >
                      {Array.from({ length: HOURS }).map((_, h) => {
                        const local = (h + z.offset + 24) % 24;
                        const sleeping = local < 7 || local >= 22;
                        const morning = local >= 7 && local < 12;
                        const evening = local >= 18 && local < 22;
                        return (
                          <div
                            key={h}
                            className={
                              "absolute top-0 bottom-0 border-border/40 border-l " +
                              (sleeping
                                ? "bg-indigo-500/[0.18]"
                                : morning
                                  ? "bg-amber-500/[0.08]"
                                  : evening
                                    ? "bg-rose-500/[0.06]"
                                    : "")
                            }
                            style={{ left: h * HOUR_W, width: HOUR_W }}
                          />
                        );
                      })}

                      {Array.from({ length: HOURS }).map((_, h) => {
                        const local = (h + z.offset + 24) % 24;
                        return (
                          <span
                            key={h}
                            className={
                              "pointer-events-none absolute top-1/2 -translate-y-1/2 font-mono text-[10px] " +
                              (local < 7 || local >= 22
                                ? "text-foreground/40"
                                : "text-foreground/85")
                            }
                            style={{ left: h * HOUR_W + 4 }}
                          >
                            {String(local).padStart(2, "0")}
                            {local === 0 ? (
                              <MoonIcon className="ml-1 inline-block size-2.5 opacity-50" />
                            ) : null}
                            {local === 12 ? (
                              <SunIcon className="ml-1 inline-block size-2.5 opacity-50" />
                            ) : null}
                          </span>
                        );
                      })}

                      <div
                        onPointerDown={beginDrag("move")}
                        className={
                          "absolute top-1 bottom-1 select-none rounded-md border-2 transition-all " +
                          (v.tone === "asleep"
                            ? "border-rose-500/70 bg-rose-500/[0.08]"
                            : v.tone === "edge"
                              ? "border-amber-500/70 bg-amber-500/[0.08]"
                              : "border-foreground bg-foreground/[0.06]") +
                          " cursor-grab active:cursor-grabbing shadow-sm" +
                          (bestPulse ? " ring-2 ring-emerald-500/60" : "")
                        }
                        style={{
                          left: start * HOUR_W,
                          width: duration * HOUR_W,
                        }}
                      >
                        <div
                          onPointerDown={beginDrag("left")}
                          className="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize rounded-l-md bg-foreground/20 transition-colors hover:bg-foreground/40"
                        />
                        <div
                          onPointerDown={beginDrag("right")}
                          className="absolute top-0 bottom-0 right-0 w-1.5 cursor-ew-resize rounded-r-md bg-foreground/20 transition-colors hover:bg-foreground/40"
                        />
                        {zi === 0 ? (
                          <div className="-top-5 absolute right-0 left-0 truncate text-center font-mono text-[10px] text-foreground/80 uppercase tracking-[0.2em]">
                            {String(start).padStart(2, "0")}:00 –{" "}
                            {String(start + duration).padStart(2, "0")}:00 ·{" "}
                            {duration}h
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            {zones.length === 0 ? (
              <li className="px-6 py-12 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                No timezones yet.
              </li>
            ) : null}
          </ul>

          <div className="flex items-center justify-between gap-3 border-border/40 border-t px-3 py-2.5">
            <ZonePicker available={available} onAdd={addZone} />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              {zones.length} zone{zones.length === 1 ? "" : "s"} ·{" "}
              {available.length} more available
            </span>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 border-border/40 border-t px-4 py-3 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              <GlobeIcon className="size-3" />
              24h · home: NY · live clock
            </span>
            <span className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded bg-amber-500/40" /> morning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded bg-rose-500/30" /> evening
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded bg-indigo-500/40" /> asleep
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            Quick:
          </span>
          {[
            { label: "Mornings (NY)", start: 9, duration: 1 },
            { label: "Afternoon overlap", start: 13, duration: 3 },
            { label: "Late EU", start: 11, duration: 1 },
            { label: "Tokyo morning", start: 19, duration: 1 },
          ].map((p) => {
            const active = p.start === start && p.duration === duration;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setStart(p.start);
                  setDuration(p.duration);
                }}
                className={
                  "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors " +
                  (active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground")
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ZonePicker({
  available,
  onAdd,
}: {
  available: Zone[];
  onAdd: (z: Zone) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = available.filter((z) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      z.name.toLowerCase().includes(q) ||
      z.city.toLowerCase().includes(q) ||
      z.iana.toLowerCase().includes(q)
    );
  });

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={available.length === 0}
          />
        }
      >
        <PlusIcon />
        Add timezone
      </PopoverTrigger>
      <PopoverPopup
        className="!w-80 !p-0 overflow-hidden"
        side="top"
        align="start"
      >
        <div className="flex items-center gap-2 border-border/60 border-b px-3 py-2">
          <SearchIcon className="size-3.5 opacity-50" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search zones, cities…"
            className="h-7 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              No matches
            </li>
          ) : (
            filtered.map((z) => (
              <li key={z.name}>
                <button
                  type="button"
                  onClick={() => {
                    onAdd(z);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-foreground/[0.04]"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground/[0.06] font-mono text-[10px]">
                    {z.name}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{z.city}</div>
                    <div className="truncate font-mono text-[10px] text-muted-foreground">
                      {z.iana} · {fmtOffset(z.offset)}
                    </div>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverPopup>
    </Popover>
  );
}

/** Score every possible window start (0..HOURS-duration) and return the best.
 *  Working hour = +3, edge = +1, asleep = -3 per zone-hour. Tiebreaker: prefer
 *  windows whose midpoint is closer to NY 13:00 (typical convening time). */
function findBestStart(zones: Zone[], duration: number): number {
  let bestStart = 0;
  let bestScore = -Infinity;
  for (let s = 0; s + duration <= HOURS; s++) {
    let score = 0;
    for (const z of zones) {
      for (let i = 0; i < duration; i++) {
        const h = (s + i + z.offset + 24) % 24;
        if (h < 7 || h >= 22) score -= 3;
        else if ((h >= 7 && h < 9) || (h >= 17 && h < 22)) score += 1;
        else score += 3;
      }
    }
    // tiebreak: prefer mid-day NY (~13:00)
    const mid = s + duration / 2;
    score -= Math.abs(mid - 13) * 0.05;
    if (score > bestScore) {
      bestScore = score;
      bestStart = s;
    }
  }
  return bestStart;
}

export function VerdictPill({ tone }: { tone: "ok" | "edge" | "asleep" }) {
  const cfg = {
    ok: {
      Icon: CheckCircle2Icon,
      label: "Working",
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    },
    edge: {
      Icon: SunIcon,
      label: "Edge",
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    },
    asleep: {
      Icon: XCircleIcon,
      label: "Asleep",
      className: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    },
  }[tone];
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] " +
        cfg.className
      }
    >
      <cfg.Icon className="size-2.5" />
      {cfg.label}
    </span>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function liveTime(now: Date, iana: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: iana,
    }).format(now);
  } catch {
    return "--:--";
  }
}

function fmtDate(now: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(now);
  } catch {
    return "Today";
  }
}

function fmtOffset(o: number): string {
  const sign = o > 0 ? "+" : o < 0 ? "−" : "±";
  const abs = Math.abs(o);
  const whole = Math.floor(abs);
  const frac = abs - whole;
  return `NY${sign}${whole}${frac ? `:${Math.round(frac * 60)}` : ""}h`;
}
