import { ArrowUpRightIcon, GlobeIcon, MoreHorizontalIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const SOURCES = [
  { label: "Direct", value: 4820, share: 38, color: "bg-foreground/85" },
  { label: "Search", value: 2940, share: 23, color: "bg-foreground/65" },
  { label: "Social", value: 2010, share: 16, color: "bg-foreground/45" },
  { label: "Referral", value: 1450, share: 12, color: "bg-foreground/30" },
  { label: "Email", value: 880, share: 7, color: "bg-foreground/20" },
  { label: "Other", value: 510, share: 4, color: "bg-foreground/12" },
];

const PAGES = [
  { path: "/", views: 14_280, change: "+12%" },
  { path: "/pricing", views: 6_410, change: "+34%" },
  { path: "/docs/quickstart", views: 4_180, change: "+8%" },
  { path: "/blog/launch", views: 3_022, change: "+220%" },
  { path: "/changelog", views: 1_840, change: "-3%" },
];

const COUNTRIES = [
  { name: "United States", code: "🇺🇸", share: 42 },
  { name: "United Kingdom", code: "🇬🇧", share: 14 },
  { name: "Germany", code: "🇩🇪", share: 9 },
  { name: "Canada", code: "🇨🇦", share: 7 },
  { name: "Australia", code: "🇦🇺", share: 5 },
];

const BARS = [
  18, 22, 19, 28, 24, 31, 35, 30, 38, 41, 36, 44, 48, 52, 46, 54, 58, 53, 61, 67, 62, 70, 75, 80,
  72, 84, 90, 86, 95, 100,
];

export function DashboardsAnalyticsShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="border-b border-border/60 px-10 py-6">
        <div className="mx-auto flex max-w-6xl items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Analytics · Pageviews
            </div>
            <h1 className="mt-1 font-heading text-2xl">Last 30 days</h1>
          </div>
          <div className="flex items-center gap-2">
            <RangePicker />
            <Button size="sm" type="button" variant="outline">
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-10 py-8">
        <section className="rounded-xl border border-border/60 bg-background/40 p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Pageviews
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-3xl">128,430</span>
                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/12 px-1.5 py-0.5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRightIcon className="size-3" />
                  +18%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-foreground" />
                This period
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-foreground/30" />
                Previous
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-1.5">
            {BARS.map((b, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ height: `${(b / 100) * 160}px` }}
              >
                <div
                  className="h-full w-full rounded-sm bg-foreground/75"
                  style={{ opacity: i > BARS.length - 5 ? 0.45 : 0.85 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-6 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
            <span>Mar 27</span>
            <span className="text-center">Apr 1</span>
            <span className="text-center">Apr 6</span>
            <span className="text-center">Apr 11</span>
            <span className="text-center">Apr 16</span>
            <span className="text-right">Apr 25</span>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <BreakdownCard title="Top sources">
            <ul className="mt-4 flex flex-col gap-3">
              {SOURCES.map((s) => (
                <li key={s.label} className="text-sm">
                  <div className="flex items-baseline justify-between">
                    <span>{s.label}</span>
                    <span className="font-mono text-xs">
                      <span className="text-foreground">{s.value.toLocaleString()}</span>
                      <span className="ml-1.5 text-muted-foreground/70">{s.share}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                    <div
                      className={`h-full ${s.color}`}
                      style={{ width: `${s.share * 2.6}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </BreakdownCard>

          <BreakdownCard title="Top pages">
            <ul className="mt-4 flex flex-col gap-1">
              {PAGES.map((p) => {
                const positive = p.change.startsWith("+");
                return (
                  <li
                    key={p.path}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-foreground/[0.03]"
                  >
                    <span className="truncate font-mono text-[12px]">{p.path}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs">
                        {p.views.toLocaleString()}
                      </span>
                      <span
                        className={`w-12 text-right font-mono text-[10px] ${
                          positive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {p.change}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </BreakdownCard>
        </div>

        <BreakdownCard title="Top countries" className="mt-3">
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {COUNTRIES.map((c) => (
              <li
                key={c.name}
                className="flex items-center gap-2.5 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-sm"
              >
                <span className="text-base">{c.code}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs">{c.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                    {c.share}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </BreakdownCard>
      </main>
    </div>
  );
}

export function BreakdownCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border/60 bg-background/40 p-5 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {title}
        </div>
        <button
          type="button"
          className="text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <MoreHorizontalIcon className="size-4" />
        </button>
      </div>
      {children}
    </section>
  );
}

export function RangePicker() {
  return (
    <div className="flex items-center rounded-md border border-border/70 bg-background/40 font-mono text-xs text-muted-foreground">
      <button
        type="button"
        className="px-2.5 py-1.5 transition-colors hover:text-foreground"
      >
        7d
      </button>
      <button
        type="button"
        className="bg-foreground/[0.06] px-2.5 py-1.5 text-foreground"
      >
        30d
      </button>
      <button
        type="button"
        className="px-2.5 py-1.5 transition-colors hover:text-foreground"
      >
        90d
      </button>
      <span className="mx-1 h-4 w-px bg-border/60" />
      <button
        type="button"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 transition-colors hover:text-foreground"
      >
        <GlobeIcon className="size-3" />
        Worldwide
      </button>
    </div>
  );
}
