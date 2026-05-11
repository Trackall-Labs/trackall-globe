import {
  AlertTriangleIcon,
  ChevronDownIcon,
  CircleDotIcon,
  ClockIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";

export interface Bucket {
  label: string;
  count: number;
  color: string;
}

const STATES: Bucket[] = [
  { label: "open", count: 84, color: "rgb(245 158 11)" },
  { label: "in-progress", count: 32, color: "rgb(56 189 248)" },
  { label: "waiting", count: 41, color: "rgb(168 85 247)" },
  { label: "resolved", count: 612, color: "rgb(16 185 129)" },
];

export interface Breach {
  id: string;
  subject: string;
  customer: string;
  initials: string;
  due: string;
  overdueMin: number;
  priority: "p0" | "p1" | "p2";
}

const BREACHES: Breach[] = [
  {
    id: "T-8421",
    subject: "Webhooks not firing for delete events",
    customer: "Linear",
    initials: "LN",
    due: "p0 first response",
    overdueMin: 14,
    priority: "p0",
  },
  {
    id: "T-8413",
    subject: "Audit log export missing recent entries",
    customer: "Vercel",
    initials: "VC",
    due: "p0 resolution",
    overdueMin: 41,
    priority: "p0",
  },
  {
    id: "T-8398",
    subject: "SAML login redirect loop on iOS Safari",
    customer: "Supabase",
    initials: "SB",
    due: "p1 first response",
    overdueMin: 4,
    priority: "p1",
  },
  {
    id: "T-8412",
    subject: "Billing usage shows yesterday's totals",
    customer: "Resend",
    initials: "RS",
    due: "p1 resolution",
    overdueMin: 22,
    priority: "p1",
  },
];

export interface Agent {
  name: string;
  initials: string;
  resolved: number;
  avgFirstResp: string;
  csat: number;
  load: number;
}

const AGENTS: Agent[] = [
  { name: "Maya Okafor", initials: "MO", resolved: 41, avgFirstResp: "8m", csat: 4.9, load: 0.74 },
  { name: "James Lin", initials: "JL", resolved: 38, avgFirstResp: "12m", csat: 4.8, load: 0.62 },
  { name: "Riya Patel", initials: "RP", resolved: 36, avgFirstResp: "9m", csat: 4.9, load: 0.81 },
  { name: "Dani Kim", initials: "DK", resolved: 28, avgFirstResp: "14m", csat: 4.7, load: 0.55 },
];

const TAGS = [
  { name: "billing", count: 62, color: "bg-amber-500" },
  { name: "auth", count: 48, color: "bg-violet-500" },
  { name: "api", count: 41, color: "bg-sky-500" },
  { name: "webhooks", count: 28, color: "bg-emerald-500" },
  { name: "ui-bug", count: 22, color: "bg-pink-500" },
  { name: "perf", count: 14, color: "bg-rose-500" },
];

const FIRST_RESP_HOURS = [
  18, 14, 16, 12, 10, 14, 11, 9, 8, 10, 7, 8, 6, 8, 9, 7, 6, 8, 7, 6, 5, 7, 6, 8,
];

export function DashboardsSupportShowcasePage() {
  const totalActive = STATES.filter((s) => s.label !== "resolved").reduce(
    (acc, s) => acc + s.count,
    0,
  );
  const totalResolved = STATES.find((s) => s.label === "resolved")!.count;

  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Support · acme/help
            </div>
            <h1 className="mt-1 font-heading text-2xl">Queue overview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              All teams
              <ChevronDownIcon className="size-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              Today
              <ChevronDownIcon className="size-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 lg:grid-cols-[320px_1fr]">
          <div className="bg-background p-6">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Active tickets
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-5xl tabular-nums">
                {totalActive}
              </span>
              <span className="font-mono text-muted-foreground text-xs">
                of {(totalActive + totalResolved).toLocaleString()} total
              </span>
            </div>
            <div className="mt-5 flex items-center justify-center">
              <Donut buckets={STATES} />
            </div>
            <ul className="mt-5 space-y-1.5 font-mono text-[11px]">
              {STATES.map((s) => (
                <li key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="text-muted-foreground uppercase tracking-[0.2em]">
                      {s.label}
                    </span>
                  </span>
                  <span className="tabular-nums">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="size-4 text-rose-500" />
                <span className="font-mono text-[10px] text-rose-600 uppercase tracking-[0.3em] dark:text-rose-400">
                  SLA breaching
                </span>
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  · {BREACHES.length}
                </span>
              </div>
              <a
                href="#"
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
              >
                view all →
              </a>
            </div>
            <ul className="mt-3 divide-y divide-border/40">
              {BREACHES.map((b) => (
                <BreachRow key={b.id} breach={b} />
              ))}
            </ul>

            <div className="mt-5">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                Avg first response · last 24h
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-2xl tabular-nums">9m</span>
                <span className="font-mono text-emerald-600 text-xs dark:text-emerald-400">
                  ↓ 38% vs week
                </span>
              </div>
              <div className="mt-3">
                <BarSeries values={FIRST_RESP_HOURS} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 lg:grid-cols-[1fr_280px]">
          <div className="bg-background p-6">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Agent leaderboard · today
            </div>
            <ul className="mt-3 divide-y divide-border/40">
              {AGENTS.map((a, i) => (
                <li
                  key={a.name}
                  className="grid grid-cols-[2rem_auto_1fr_auto_auto_auto] items-center gap-4 py-2.5"
                >
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    #{i + 1}
                  </span>
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">
                      {a.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">{a.name}</div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-foreground/[0.04]">
                      <div
                        className={`h-full ${
                          a.load > 0.75
                            ? "bg-amber-500"
                            : "bg-emerald-500/60"
                        }`}
                        style={{ width: `${a.load * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] tabular-nums">
                    <div>
                      <span className="text-foreground">{a.resolved}</span>{" "}
                      <span className="text-muted-foreground">resolved</span>
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                      avg {a.avgFirstResp}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-amber-500 tabular-nums">
                      ★ {a.csat.toFixed(1)}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      csat
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] tabular-nums">
                    {Math.round(a.load * 100)}%
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background p-6">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Tag mix
            </div>
            <ul className="mt-3 space-y-2">
              {TAGS.map((t) => {
                const max = Math.max(...TAGS.map((x) => x.count));
                const pct = (t.count / max) * 100;
                return (
                  <li key={t.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{t.name}</span>
                      <span className="font-mono text-muted-foreground text-xs tabular-nums">
                        {t.count}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/[0.04]">
                      <div
                        className={`h-full ${t.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Donut({ buckets }: { buckets: Bucket[] }) {
  const total = buckets.reduce((acc, b) => acc + b.count, 0);
  const r = 56;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="-72 -72 144 144" className="size-36 -rotate-90">
      <circle r={r} fill="none" stroke="rgb(127 127 127 / 0.1)" strokeWidth="14" />
      {buckets.map((b) => {
        const len = (b.count / total) * c;
        const dash = `${len} ${c - len}`;
        const dashOffset = -offset;
        offset += len;
        return (
          <circle
            key={b.label}
            r={r}
            fill="none"
            stroke={b.color}
            strokeWidth="14"
            strokeDasharray={dash}
            strokeDashoffset={dashOffset}
          />
        );
      })}
    </svg>
  );
}

export function BreachRow({ breach: b }: { breach: Breach }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <PriorityChip p={b.priority} />
      <Avatar className="size-6">
        <AvatarFallback className="text-[10px]">{b.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            {b.id}
          </span>
          <span className="truncate text-sm">{b.subject}</span>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          {b.customer} · {b.due}
        </div>
      </div>
      <div className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-1 font-mono text-[11px] text-rose-700 tabular-nums dark:text-rose-400">
        <ClockIcon className="size-3" />
        {b.overdueMin}m over
      </div>
    </li>
  );
}

export function PriorityChip({ p }: { p: "p0" | "p1" | "p2" }) {
  const cls =
    p === "p0"
      ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
      : p === "p1"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
        : "bg-sky-500/15 text-sky-700 dark:text-sky-400";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] ${cls}`}
    >
      <CircleDotIcon className="size-2.5" />
      {p}
    </span>
  );
}

export function BarSeries({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-12 items-end gap-1">
      {values.map((v, i) => {
        const h = (v / max) * 100;
        const isLatest = i === values.length - 1;
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm ${
              isLatest ? "bg-emerald-500" : "bg-foreground/15"
            }`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}
