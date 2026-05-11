import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";

export interface Dora {
  label: string;
  value: string;
  trend: number;
  rating: "elite" | "high" | "med" | "low";
  series: number[];
}

const DORA: Dora[] = [
  { label: "Deploy frequency", value: "14 / day", trend: 0.18, rating: "elite", series: [9, 11, 10, 12, 11, 13, 14] },
  { label: "Lead time", value: "2h 18m", trend: -0.22, rating: "elite", series: [180, 174, 165, 160, 152, 144, 138] },
  { label: "Change failure rate", value: "4.2%", trend: 0.06, rating: "high", series: [3.2, 3.4, 3.6, 3.8, 4.0, 4.1, 4.2] },
  { label: "MTTR", value: "32m", trend: -0.14, rating: "elite", series: [48, 44, 41, 39, 36, 34, 32] },
];

const RATING_TONE: Record<Dora["rating"], string> = {
  elite: "text-emerald-600 dark:text-emerald-400",
  high: "text-sky-600 dark:text-sky-400",
  med: "text-amber-600 dark:text-amber-400",
  low: "text-rose-600 dark:text-rose-400",
};

const PR_WEEKS: { week: string; merged: number; open: number; closed: number }[] = [
  { week: "W18", merged: 38, open: 12, closed: 4 },
  { week: "W19", merged: 42, open: 14, closed: 3 },
  { week: "W20", merged: 51, open: 11, closed: 6 },
  { week: "W21", merged: 47, open: 16, closed: 4 },
  { week: "W22", merged: 58, open: 12, closed: 5 },
  { week: "W23", merged: 64, open: 9, closed: 7 },
  { week: "W24", merged: 61, open: 14, closed: 4 },
  { week: "W25", merged: 73, open: 10, closed: 6 },
];

const CONTRIBUTORS = [
  { name: "Maya Okafor", initials: "MO", merged: 18, reviewed: 41, leadTime: "1h 42m" },
  { name: "James Lin", initials: "JL", merged: 15, reviewed: 36, leadTime: "2h 04m" },
  { name: "Riya Patel", initials: "RP", merged: 12, reviewed: 28, leadTime: "1h 58m" },
  { name: "Dani Kim", initials: "DK", merged: 11, reviewed: 22, leadTime: "3h 12m" },
  { name: "Sean Brydon", initials: "SB", merged: 9, reviewed: 18, leadTime: "2h 36m" },
];

const CI_HEALTH = {
  passRate: 94.6,
  flakeRate: 1.8,
  avgDuration: "9m 14s",
  totalRuns: 8421,
};

export function DashboardsEngineeringShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Engineering · last 30 days
            </div>
            <h1 className="mt-1 font-heading text-2xl">Velocity</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              All teams
              <ChevronDownIcon className="size-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              30d
              <ChevronDownIcon className="size-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DORA.map((d) => (
            <DoraTile key={d.label} dora={d} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 lg:grid-cols-[1fr_320px]">
          <div className="bg-background p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                  PR throughput · last 8 weeks
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-heading text-3xl tabular-nums">434</span>
                  <span className="font-mono text-muted-foreground text-xs">
                    merged · 98 closed
                  </span>
                </div>
              </div>
              <Legend />
            </div>
            <div className="mt-5">
              <PrChart weeks={PR_WEEKS} />
            </div>
          </div>

          <div className="bg-background p-6">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              CI health
            </div>
            <div className="mt-3 space-y-3">
              <KV label="Pass rate" value={`${CI_HEALTH.passRate}%`} tone="ok" />
              <KV label="Flake rate" value={`${CI_HEALTH.flakeRate}%`} tone="warn" />
              <KV label="Avg duration" value={CI_HEALTH.avgDuration} />
              <KV label="Total runs" value={CI_HEALTH.totalRuns.toLocaleString()} />
            </div>
            <div className="mt-5">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                Slowest jobs
              </div>
              <ul className="mt-2 space-y-1.5 font-mono text-[11px]">
                <SlowJob name="test/e2e" duration="9m 14s" />
                <SlowJob name="build/docker" duration="6m 02s" />
                <SlowJob name="visual/regression" duration="4m 41s" />
              </ul>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
          <div className="flex items-baseline justify-between border-border/40 border-b px-5 py-3">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Top contributors
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              ranked by merged PRs
            </span>
          </div>
          <ul className="divide-y divide-border/40">
            {CONTRIBUTORS.map((c, i) => {
              const max = Math.max(...CONTRIBUTORS.map((x) => x.merged));
              const pct = (c.merged / max) * 100;
              return (
                <li
                  key={c.name}
                  className="grid grid-cols-[2rem_auto_1fr_auto_auto] items-center gap-4 px-5 py-2.5"
                >
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    #{i + 1}
                  </span>
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">
                      {c.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm">{c.name}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/[0.04]">
                      <div
                        className="h-full bg-emerald-500/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] tabular-nums">
                    <div>
                      <span className="text-foreground">{c.merged}</span>{" "}
                      <span className="text-muted-foreground">merged</span>
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                      {c.reviewed} reviewed
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                    {c.leadTime}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function DoraTile({ dora }: { dora: Dora }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {dora.label}
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span className="font-heading text-2xl tabular-nums">{dora.value}</span>
        <span
          className={`inline-flex items-baseline gap-0.5 font-mono text-[11px] tabular-nums ${
            dora.trend > 0 === isHigherBetter(dora.label)
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {dora.trend > 0 ? (
            <ArrowUpRightIcon className="size-3" />
          ) : (
            <ArrowDownRightIcon className="size-3" />
          )}
          {Math.abs(dora.trend * 100).toFixed(0)}%
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.25em] ${RATING_TONE[dora.rating]}`}
        >
          {dora.rating}
        </span>
        <MiniSpark values={dora.series} />
      </div>
    </div>
  );
}

function isHigherBetter(label: string) {
  // Deploy frequency: higher better. Lead time, change failure, MTTR: lower better.
  return label === "Deploy frequency";
}

export function MiniSpark({ values }: { values: number[] }) {
  const w = 80;
  const h = 18;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(0.001, max - min);
  const stepX = w / (values.length - 1);
  const points = values
    .map((v, i) => `${i * stepX},${h - ((v - min) / range) * (h - 2) - 1}`)
    .join(" L ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-4 flex-1"
      preserveAspectRatio="none"
    >
      <path
        d={`M ${points}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-foreground/40"
      />
    </svg>
  );
}

export function Legend() {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-sm bg-emerald-500" />
        merged
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-sm bg-sky-500/60" />
        open
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-sm bg-rose-500/60" />
        closed
      </span>
    </div>
  );
}

export function PrChart({
  weeks,
}: {
  weeks: { week: string; merged: number; open: number; closed: number }[];
}) {
  const max = Math.max(...weeks.map((w) => w.merged + w.open + w.closed));
  return (
    <div className="flex h-48 items-end gap-3">
      {weeks.map((w) => {
        const total = w.merged + w.open + w.closed;
        const totalPct = (total / max) * 100;
        const mergedPct = (w.merged / total) * 100;
        const openPct = (w.open / total) * 100;
        const closedPct = (w.closed / total) * 100;
        return (
          <div key={w.week} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="relative w-full overflow-hidden rounded-md"
              style={{ height: `${totalPct}%` }}
            >
              <div className="flex h-full w-full flex-col">
                <div
                  className="bg-rose-500/60"
                  style={{ height: `${closedPct}%` }}
                />
                <div
                  className="bg-sky-500/60"
                  style={{ height: `${openPct}%` }}
                />
                <div
                  className="bg-emerald-500"
                  style={{ height: `${mergedPct}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              {w.week}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function KV({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  const t =
    tone === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : "text-foreground";
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums ${t}`}>{value}</span>
    </div>
  );
}

export function SlowJob({ name, duration }: { name: string; duration: string }) {
  return (
    <li className="flex items-center justify-between">
      <span>{name}</span>
      <span className="text-muted-foreground tabular-nums">{duration}</span>
    </li>
  );
}
