import { Area, AreaChart } from "recharts";
import { TrendingUpIcon } from "lucide-react";
import {
  ChartAxis,
  ChartContainer,
  ChartGrid,
  ChartTooltip,
  chartColor,
} from "@orbit/ui/patterns/charts/chart";

const SERIES = [
  { key: "subs", name: "Subscriptions", color: chartColor(0) },
  { key: "addons", name: "Add-ons", color: chartColor(1) },
  { key: "services", name: "Services", color: chartColor(2) },
] as const;

const MONTHS = [
  "May", "Jun", "Jul", "Aug", "Sep", "Oct",
  "Nov", "Dec", "Jan", "Feb", "Mar", "Apr",
];

const SUBS = [22, 26, 28, 31, 34, 38, 42, 47, 49, 52, 56, 62];
const ADDONS = [6, 8, 9, 11, 13, 14, 14, 15, 17, 19, 22, 24];
const SERVICES = [3, 4, 5, 5, 7, 8, 9, 10, 12, 11, 13, 14];

const DATA = MONTHS.map((m, i) => ({
  month: m,
  subs: SUBS[i],
  addons: ADDONS[i],
  services: SERVICES[i],
  total: SUBS[i] + ADDONS[i] + SERVICES[i],
}));

export function ChartsRevenueAreaShowcasePage() {
  const total = DATA[DATA.length - 1].total;

  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Revenue · last 12 months
        </div>
        <h1 className="mt-1 font-heading text-2xl">Net revenue</h1>

        <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-heading text-3xl tracking-tight">
                ${total}.4k
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-500/12 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                <TrendingUpIcon className="size-3" />
                +18.4% vs prev. 12mo
              </div>
            </div>
            <div className="flex items-center gap-3">
              {SERIES.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center gap-1.5 text-muted-foreground text-xs"
                >
                  <span
                    className="size-2 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          <ChartContainer className="mt-4 h-72">
            <AreaChart data={DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                {SERIES.map((s) => (
                  <linearGradient
                    key={s.key}
                    id={`gradient-${s.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <ChartGrid />
              <ChartAxis dataKey="month" />
              <ChartAxis
                axis="y"
                width={36}
                tickFormatter={(v) => `${v}k`}
              />
              <ChartTooltip />
              {SERIES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stackId="1"
                  stroke={s.color}
                  strokeWidth={1.5}
                  fill={`url(#gradient-${s.key})`}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
