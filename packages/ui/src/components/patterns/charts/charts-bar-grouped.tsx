import { Bar, BarChart, Cell } from "recharts";
import {
  ChartAxis,
  ChartContainer,
  ChartGrid,
  ChartTooltip,
  chartColor,
} from "@orbit/ui/patterns/charts/chart";

const SERIES = [
  { key: "y2024", name: "2024", color: "var(--muted-foreground)" },
  { key: "y2025", name: "2025", color: chartColor(0) },
  { key: "y2026", name: "2026", color: chartColor(1) },
] as const;

const DATA = [
  { quarter: "Q1", y2024: 124, y2025: 186, y2026: 254 },
  { quarter: "Q2", y2024: 142, y2025: 218, y2026: 312 },
  { quarter: "Q3", y2024: 168, y2025: 244, y2026: 378 },
  { quarter: "Q4", y2024: 191, y2025: 281, y2026: null },
];

export function ChartsBarGroupedShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Quarterly bookings · ARR (k)
        </div>
        <h1 className="mt-1 font-heading text-2xl">Year-over-year</h1>

        <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {SERIES.map((s) => (
                <span
                  key={s.key}
                  className="flex items-center gap-1.5 text-muted-foreground text-xs"
                >
                  <span
                    className="size-2.5 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </span>
              ))}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              vs prev year · +44%
            </span>
          </div>

          <ChartContainer className="mt-4 h-72">
            <BarChart data={DATA} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
              <ChartGrid />
              <ChartAxis dataKey="quarter" />
              <ChartAxis axis="y" width={36} />
              <ChartTooltip />
              {SERIES.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  fill={s.color}
                  radius={[3, 3, 0, 0]}
                >
                  {DATA.map((row, i) => {
                    const v = row[s.key as keyof typeof row];
                    return (
                      <Cell
                        key={i}
                        fillOpacity={v == null ? 0 : 1}
                        stroke={v == null ? s.color : undefined}
                        strokeDasharray={v == null ? "3 3" : undefined}
                        strokeOpacity={v == null ? 0.5 : 0}
                      />
                    );
                  })}
                </Bar>
              ))}
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
