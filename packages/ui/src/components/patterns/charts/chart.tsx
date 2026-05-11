/**
 * Thin coss-design wrappers around Recharts.
 *
 * Goal: every chart in the scratchpad shares the same visual language —
 * mono uppercase axis labels, hairline grid lines, themed palette pulled
 * from `--chart-1`..`--chart-5`, frosted tooltip card. Author each
 * showcase with the underlying Recharts components (LineChart, BarChart,
 * etc.) and drop in `<ChartContainer>` + `<ChartTooltip>` + `<ChartLegend>`
 * to inherit the styling.
 *
 * Pattern (mirrors shadcn's chart recipe):
 *
 *   <ChartContainer className="h-64">
 *     <LineChart data={data}>
 *       <ChartGrid />
 *       <ChartAxis dataKey="month" />
 *       <ChartAxis tickFormatter={fmt} orientation="left" axis="y" />
 *       <ChartTooltip />
 *       <Line dataKey="revenue" stroke="var(--chart-1)" />
 *     </LineChart>
 *   </ChartContainer>
 */

import type { ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipProps,
  type TooltipValueType,
} from "recharts";

export type NameType = number | string;

/** Themed series palette. Drive Lines, Bars, etc. with these. */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

/** Pick a palette colour by index, wrapping if needed. */
export function chartColor(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length]!;
}

/**
 * Outer wrapper. Sets the font family + colour context, makes Recharts
 * inherit the muted token for axis text, and wraps in a
 * <ResponsiveContainer> so showcases just need to provide a height.
 */
export function ChartContainer({
  children,
  className = "h-72",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${className} text-foreground [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:font-mono [&_.recharts-cartesian-axis-tick_text]:text-[10px] [&_.recharts-cartesian-axis-tick_text]:uppercase [&_.recharts-cartesian-axis-tick_text]:tracking-[0.2em] [&_.recharts-cartesian-grid-bg]:fill-transparent [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-polar-grid_line]:stroke-border [&_.recharts-polar-angle-axis-tick_text]:fill-muted-foreground [&_.recharts-polar-angle-axis-tick_text]:font-mono [&_.recharts-polar-angle-axis-tick_text]:text-[10px]`}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

/** Hairline cartesian grid in the design's `--border` token. */
export function ChartGrid({
  vertical = false,
  horizontal = true,
}: {
  vertical?: boolean;
  horizontal?: boolean;
}) {
  return (
    <CartesianGrid
      vertical={vertical}
      horizontal={horizontal}
      strokeDasharray="2 4"
      stroke="currentColor"
      strokeOpacity={0.25}
    />
  );
}

/**
 * Themed XAxis or YAxis. Pass `axis="y"` for the Y axis. By default
 * tickLine + axisLine are hidden so the chart reads as data-first.
 */
export function ChartAxis({
  axis = "x",
  dataKey,
  tickFormatter,
  ticks,
  tickCount,
  domain,
  hide,
  width,
  type,
  orientation,
  interval,
  padding,
}: {
  axis?: "x" | "y";
  dataKey?: string;
  // biome-ignore lint/suspicious/noExplicitAny: recharts' axis tickFormatter is loosely typed
  tickFormatter?: (value: any, index: number) => string;
  ticks?: ReadonlyArray<string | number>;
  tickCount?: number;
  domain?: [number | string, number | string];
  hide?: boolean;
  width?: number;
  type?: "number" | "category";
  orientation?: "top" | "bottom" | "left" | "right";
  interval?: number | "preserveStart" | "preserveEnd" | "preserveStartEnd";
  padding?: { left?: number; right?: number; top?: number; bottom?: number };
}) {
  const common = {
    dataKey,
    tickFormatter,
    ticks,
    tickCount,
    domain,
    hide,
    width,
    type,
    interval,
    padding,
    tickLine: false,
    axisLine: false,
    tickMargin: 10,
    minTickGap: 8,
    stroke: "currentColor",
  } as const;
  if (axis === "y") {
    const o =
      orientation === "left" || orientation === "right" ? orientation : undefined;
    return <YAxis {...common} orientation={o} />;
  }
  const o =
    orientation === "top" || orientation === "bottom" ? orientation : undefined;
  return <XAxis {...common} orientation={o} />;
}

/**
 * Default Recharts tooltip swapped for a frosted card matching the
 * scratchpad's design language (mono labels, themed border/background).
 */
export function ChartTooltip(props: Partial<TooltipProps>) {
  return (
    <Tooltip
      cursor={{
        stroke: "currentColor",
        strokeOpacity: 0.25,
        strokeDasharray: "2 4",
      }}
      content={ChartTooltipContent}
      {...props}
    />
  );
}

export function ChartTooltipContent(props: TooltipContentProps<TooltipValueType, NameType>) {
  const { active, label, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/70 bg-background/95 px-3 py-2 text-foreground text-xs shadow-lg backdrop-blur">
      {label !== undefined ? (
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {String(label)}
        </div>
      ) : null}
      <ul className="mt-1 flex flex-col gap-1">
        {payload.map((p, i) => (
          <li key={`${p.dataKey ?? p.name}-${i}`} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: (p.color as string) ?? chartColor(i) }}
            />
            <span className="text-muted-foreground">{String(p.name ?? p.dataKey)}</span>
            <span className="ml-auto font-mono tabular-nums text-foreground">
              {typeof p.value === "number"
                ? p.value.toLocaleString()
                : String(p.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Themed legend. Use `keys` to provide names + colors directly when not relying on Recharts' auto-generated entries. */
export function ChartLegend({
  keys,
}: {
  keys?: { name: string; color: string }[];
}) {
  if (keys && keys.length > 0) {
    return (
      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
        {keys.map((k) => (
          <li key={k.name} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: k.color }}
            />
            {k.name}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <Legend
      iconType="circle"
      iconSize={8}
      wrapperStyle={{
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        color: "var(--muted-foreground)",
        paddingTop: "12px",
      }}
    />
  );
}
