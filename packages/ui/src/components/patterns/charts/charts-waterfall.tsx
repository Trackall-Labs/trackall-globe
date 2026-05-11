import { Bar, BarChart, Cell, LabelList } from "recharts";
import {
  ChartAxis,
  ChartContainer,
  ChartGrid,
  ChartTooltip,
} from "@orbit/ui/patterns/charts/chart";

export interface Step {
  label: string;
  value: number;
  type: "start" | "delta" | "end";
}

const STEPS: Step[] = [
  { label: "Q4 ARR", value: 1640, type: "start" },
  { label: "New", value: 412, type: "delta" },
  { label: "Expansion", value: 184, type: "delta" },
  { label: "Reactivation", value: 38, type: "delta" },
  { label: "Contraction", value: -94, type: "delta" },
  { label: "Churn", value: -126, type: "delta" },
  { label: "Q1 ARR", value: 2054, type: "end" },
];

export interface Bar {
  label: string;
  value: number;
  type: Step["type"];
  base: number;
  delta: number;
  color: string;
}

function buildBars(): Bar[] {
  let running = 0;
  return STEPS.map((s) => {
    if (s.type === "start") {
      running = s.value;
      return {
        label: s.label,
        value: s.value,
        type: s.type,
        base: 0,
        delta: s.value,
        color: "rgb(82 82 91)",
      };
    }
    if (s.type === "end") {
      return {
        label: s.label,
        value: s.value,
        type: s.type,
        base: 0,
        delta: s.value,
        color: "rgb(82 82 91)",
      };
    }
    const before = running;
    running += s.value;
    const positive = s.value >= 0;
    return {
      label: s.label,
      value: s.value,
      type: s.type,
      base: positive ? before : running,
      delta: Math.abs(s.value),
      color: positive ? "rgb(16 185 129)" : "rgb(244 63 94)",
    };
  });
}

const BARS = buildBars();

export function ChartsWaterfallShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          ARR movement · Q4 → Q1 (k)
        </div>
        <h1 className="mt-1 font-heading text-2xl">Net retention waterfall</h1>

        <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-6">
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-foreground/70" />
              start / end
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-emerald-500" />
              addition
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-rose-500" />
              loss
            </span>
            <span className="ml-auto text-foreground">
              NRR <span className="font-mono">125.2%</span>
            </span>
          </div>

          <ChartContainer className="h-80">
            <BarChart data={BARS} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
              <ChartGrid />
              <ChartAxis dataKey="label" />
              <ChartAxis axis="y" width={40} />
              <ChartTooltip />
              <Bar dataKey="base" stackId="w" fill="transparent" />
              <Bar dataKey="delta" stackId="w" radius={[3, 3, 0, 0]}>
                {BARS.map((b, i) => (
                  <Cell key={i} fill={b.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  fontSize={10}
                  fill="currentColor"
                  className="font-mono"
                  formatter={(v) => {
                    const n = Number(v);
                    return n > 0 &&
                      BARS.some((b) => b.value === n && b.type === "delta")
                      ? `+${n}`
                      : `${n}`;
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
