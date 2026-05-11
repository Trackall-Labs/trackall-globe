import { CheckCircle2Icon } from "lucide-react";

export type Severity = "investigating" | "identified" | "monitoring" | "resolved";

export interface Update {
  state: Severity;
  at: string;
  text: string;
}

export interface Incident {
  title: string;
  affected: string[];
  severity: "minor" | "major" | "critical";
  state: "ongoing" | "resolved";
  startedAt: string;
  resolvedAt?: string;
  updates: Update[];
}

const COMPONENTS = [
  { name: "API", uptime: "99.984%", status: "operational" },
  { name: "Dashboard", uptime: "99.972%", status: "operational" },
  { name: "Webhooks", uptime: "99.812%", status: "degraded" },
  { name: "Email delivery", uptime: "99.999%", status: "operational" },
];

const INCIDENTS: Incident[] = [
  {
    title: "Webhook delivery delays in EU region",
    affected: ["Webhooks"],
    severity: "minor",
    state: "ongoing",
    startedAt: "2026-04-26T14:12:00Z",
    updates: [
      {
        state: "monitoring",
        at: "14:54 UTC",
        text: "Backlog drained. Watching tail latency for the next 30 min.",
      },
      {
        state: "identified",
        at: "14:31 UTC",
        text: "Root cause is a saturated worker pool in fra1. Scaling up.",
      },
      {
        state: "investigating",
        at: "14:12 UTC",
        text: "Customers in EU may see webhook delivery delays of up to 4 minutes.",
      },
    ],
  },
  {
    title: "Brief 502s on /v3/auth",
    affected: ["API"],
    severity: "minor",
    state: "resolved",
    startedAt: "2026-04-24T09:02:00Z",
    resolvedAt: "2026-04-24T09:18:00Z",
    updates: [
      {
        state: "resolved",
        at: "Apr 24 · 09:18",
        text: "All endpoints back to baseline. Postmortem at status.acme.dev/p/0426",
      },
      {
        state: "investigating",
        at: "Apr 24 · 09:02",
        text: "Some requests to /v3/auth returned 502 for ~3 minutes.",
      },
    ],
  },
];

const SEV_TONE: Record<"minor" | "major" | "critical", string> = {
  minor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-amber-500/20",
  major: "bg-rose-500/15 text-rose-700 dark:text-rose-400 ring-rose-500/20",
  critical: "bg-rose-500/15 text-rose-700 dark:text-rose-400 ring-rose-500/20",
};

const STATE_DOT: Record<Severity, string> = {
  investigating: "bg-rose-500",
  identified: "bg-amber-500",
  monitoring: "bg-sky-500",
  resolved: "bg-emerald-500",
};

export function TimelinesStatusPageShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Acme Status · status.acme.dev
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-1.5 font-mono text-[12px] text-amber-700 dark:text-amber-400">
            <span className="size-2 animate-pulse rounded-full bg-amber-500" />
            One service is experiencing degraded performance
          </div>
          <h1 className="mt-4 font-heading text-3xl tracking-tight">
            All other systems operational
          </h1>
        </header>

        <div className="mt-8 rounded-xl border border-border/60 bg-background/40 px-5 py-4">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            90-day uptime
          </div>
          <ul className="mt-3 divide-y divide-border/40">
            {COMPONENTS.map((c) => (
              <li key={c.name} className="flex items-center gap-4 py-3">
                <span
                  className={
                    "size-2 rounded-full " +
                    (c.status === "operational" ? "bg-emerald-500" : "bg-amber-500")
                  }
                />
                <div className="flex-1">
                  <div className="text-sm">{c.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    {c.status}
                  </div>
                </div>
                <UptimeBars degraded={c.status !== "operational"} />
                <span className="w-20 text-right font-mono text-[11px] text-muted-foreground">
                  {c.uptime}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="mt-10 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          Incidents
        </h2>
        <div className="mt-3 flex flex-col gap-4">
          {INCIDENTS.map((inc) => (
            <article
              key={inc.title}
              className="rounded-xl border border-border/60 bg-background/40 p-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className={
                    "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] ring-1 " +
                    SEV_TONE[inc.severity]
                  }
                >
                  {inc.state === "resolved" ? "Resolved" : inc.severity}
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg">{inc.title}</h3>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Affecting {inc.affected.join(", ")} ·{" "}
                    {inc.state === "resolved"
                      ? "duration 16m"
                      : "ongoing for 42m"}
                  </div>
                </div>
                {inc.state === "resolved" ? (
                  <CheckCircle2Icon className="size-5 text-emerald-500" />
                ) : null}
              </div>

              <ol className="relative mt-5">
                <span
                  aria-hidden
                  className="absolute top-1 bottom-1 left-[5px] w-px bg-border/50"
                />
                {inc.updates.map((u, i) => (
                  <li
                    key={i}
                    className="relative grid grid-cols-[24px_1fr] gap-3 py-2"
                  >
                    <span className="z-10 mt-1.5 grid size-[12px] place-items-center rounded-full ring-2 ring-background">
                      <span
                        className={"size-2 rounded-full " + STATE_DOT[u.state]}
                      />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                        <span className="text-foreground">{u.state}</span>
                        <span className="text-muted-foreground">{u.at}</span>
                      </div>
                      <div className="mt-1 text-foreground/85 text-sm">
                        {u.text}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UptimeBars({ degraded }: { degraded: boolean }) {
  return (
    <div className="hidden gap-[2px] sm:flex">
      {Array.from({ length: 60 }).map((_, i) => {
        const bad = degraded && i > 56;
        return (
          <span
            key={i}
            className={
              "h-7 w-[3px] rounded-sm " +
              (bad ? "bg-amber-500" : "bg-emerald-500/80")
            }
          />
        );
      })}
    </div>
  );
}
