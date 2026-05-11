import { ArrowUpRightIcon, ZapIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

export interface UsageRow {
  label: string;
  used: number;
  limit: number;
  unit: string;
  warn?: boolean;
}

const ROWS: UsageRow[] = [
  { label: "Seats", used: 18, limit: 25, unit: "of 25 seats" },
  { label: "Projects", used: 47, limit: 50, unit: "of 50 projects", warn: true },
  { label: "API requests", used: 612_000, limit: 1_000_000, unit: "of 1M / month" },
  { label: "Storage", used: 84, limit: 200, unit: "GB of 200 GB" },
  { label: "Webhooks", used: 6, limit: 20, unit: "of 20 active" },
];

export function DashboardsUsageShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="border-b border-border/60 px-10 py-6">
        <div className="mx-auto flex max-w-5xl items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Billing · Usage
            </div>
            <h1 className="mt-1 font-heading text-2xl">This month</h1>
          </div>
          <Button size="sm" type="button" variant="outline">
            View invoice
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-10 py-8">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-border/60 bg-background/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Plan
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-heading text-xl">Pro</span>
                  <span className="rounded bg-foreground/[0.08] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]">
                    Annual
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-heading text-2xl">$240</div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  per month
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3">
              <div>
                <div className="font-medium text-sm">Renews May 14</div>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  Card on file: Visa ending 4242
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </div>

            <Button variant="outline" size="sm" className="mt-4 w-full">
              <ZapIcon />
              Upgrade to Enterprise
              <ArrowUpRightIcon />
            </Button>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/40 p-6">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Cycle
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl">12</span>
              <span className="text-muted-foreground text-xs">/ 31 days</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]">
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${(12 / 31) * 100}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              <div>
                <div className="text-foreground/70">Apr 14</div>
                <div className="mt-0.5 normal-case tracking-normal">Cycle start</div>
              </div>
              <div className="text-right">
                <div className="text-foreground/70">May 14</div>
                <div className="mt-0.5 normal-case tracking-normal">Renews</div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-border/60 bg-background/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-base">Limits</h2>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Resets May 14
            </span>
          </div>
          <ul className="mt-4 flex flex-col gap-5">
            {ROWS.map((r) => (
              <UsageMeter key={r.label} row={r} />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export function UsageMeter({ row }: { row: UsageRow }) {
  const pct = Math.min(100, (row.used / row.limit) * 100);
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : `${n}`;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-medium text-sm">{row.label}</div>
        <div className="font-mono text-xs">
          <span className="text-foreground">{fmt(row.used)}</span>
          <span className="text-muted-foreground">
            {" "}
            / {fmt(row.limit)} {row.unit.includes("GB") ? "GB" : ""}
          </span>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
        <div
          className={`h-full rounded-full transition-all ${
            row.warn ? "bg-amber-500" : "bg-foreground/70"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{row.unit}</span>
        {row.warn ? (
          <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-[0.25em]">
            {Math.round(pct)}% used
          </span>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em]">
            {Math.round(pct)}% used
          </span>
        )}
      </div>
    </li>
  );
}
