import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowDownRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  BoxIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CopyIcon,
  CpuIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FuelIcon,
  GaugeIcon,
  LayersIcon,
  SearchIcon,
  ShieldCheckIcon,
  TimerIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Checkbox } from "@orbit/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@orbit/ui/input-group";
import { Chart } from "@orbit/ui/patterns/charts";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@orbit/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@orbit/ui/table";
import { Tabs, TabsList, TabsTab } from "@orbit/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@orbit/ui/tooltip";
import {
  formatNetworkLocation,
  networkInitials,
  type Network,
} from "@/lib/networks";
import { getPortfolioAddressPath } from "@/lib/protocol-route";
import {
  buildNetworkDetailMock,
  formatBlockTime,
  formatGas,
  formatPercent,
  formatTps,
  type NetworkBlockRow,
  type NetworkChartPoint,
  type NetworkDetailMetric,
  type NetworkMetricKey,
  type NetworkProtocolRow,
} from "@/lib/network-stats";
import {
  ACTIVITY_WINDOWS,
  PAGE_SIZE_OPTIONS,
  RISK_TIERS,
  USER_TYPES,
  formatDelta,
  formatLastActive,
  formatNumber,
  formatSignedUsd,
  formatUsd,
  shortWallet,
  type ProtocolActivityWindow,
  type ProtocolRiskTier,
  type ProtocolUserRow,
  type ProtocolUserType,
} from "@/lib/protocol-stats";
import { seriesChange } from "@/lib/series-change";
import type { Protocol } from "@/lib/types";
import {
  fetchSolanaTopAggregatePortfolioWallets,
  type TrackallAggregateTopWallet,
  type TrackallSolanaPlatformMetricsResponse,
} from "@/lib/trackall-api";
import type { BlockEntry, BlockStreamStatus } from "@/lib/use-block-stream";

type Props = {
  blockStreamBlocks: BlockEntry[];
  blockStreamError: string | null;
  blockStreamStatus: BlockStreamStatus;
  network: Network | null;
  protocols: Protocol[];
  solanaMetrics: TrackallSolanaPlatformMetricsResponse | null;
  solanaMetricsError: string | null;
  solanaMetricsStatus: "idle" | "loading" | "ready" | "error";
  requestedId: string | null;
  onBack: () => void;
  onOpenProtocol: (protocol: Protocol) => void;
  onOpenWallet: (address: string) => void;
};

type FilterValue = "all";
type WalletSortKey =
  | "depositedTvl"
  | "volume30d"
  | "netFlow"
  | "pnl"
  | "lastActiveHours";
type SortDirection = "asc" | "desc";
type ChartRange = "24h" | "7d" | "30d";
type ChartMetric = "tvl" | "volume" | "users" | "tps" | "transactions";
type DisplayMetricKey = NetworkMetricKey | "transactions";
type DisplayNetworkDetailMetric = Omit<NetworkDetailMetric, "changes" | "key" | "value"> & {
  key: DisplayMetricKey;
  value: number | null;
  changes: {
    h24: number | null;
    d7: number | null;
    d30: number | null;
  };
};
type DisplayNetworkChartPoint = {
  label: string;
  timestamp?: string;
  transactions?: number | null;
  tps?: number | null;
  tvl?: number | null;
  users?: number | null;
  volume?: number | null;
};
type DisplayNetworkDetail = {
  metrics: DisplayNetworkDetailMetric[];
  chart: DisplayNetworkChartPoint[];
  topProtocols: NetworkProtocolRow[];
  wallets: ProtocolUserRow[];
  recentBlocks: NetworkBlockRow[];
};
type SolanaWalletSortKey = "rank" | "totalUsd" | "positionCount" | "protocolCount" | "capturedAt";

const PRIMARY_KEYS: DisplayMetricKey[] = ["tvl", "volume", "users", "tps"];
const SECONDARY_KEYS: NetworkMetricKey[] = ["blockTime", "gas", "validators", "stakeRatio"];
const CHART_RANGES: { key: ChartRange; label: string; durationMs: number }[] = [
  { key: "24h", label: "24H", durationMs: 24 * 60 * 60 * 1000 },
  { key: "7d", label: "7D", durationMs: 7 * 24 * 60 * 60 * 1000 },
  { key: "30d", label: "30D", durationMs: 30 * 24 * 60 * 60 * 1000 },
];

function formatMetric(metric: DisplayNetworkDetailMetric) {
  if (metric.value == null) return "—";
  switch (metric.format) {
    case "usd":
      return formatUsd(metric.value);
    case "number":
      return formatNumber(metric.value);
    case "tps":
      return formatTps(metric.value);
    case "ms":
      return formatBlockTime(metric.value);
    case "gwei":
      return formatGas(metric.value);
    case "percent":
      return formatPercent(metric.value);
  }
}

function metricIcon(key: DisplayMetricKey) {
  if (key === "tvl") return <WalletIcon className="size-4" />;
  if (key === "volume") return <ActivityIcon className="size-4" />;
  if (key === "users") return <UsersIcon className="size-4" />;
  if (key === "tps") return <GaugeIcon className="size-4" />;
  if (key === "transactions") return <ActivityIcon className="size-4" />;
  if (key === "blockTime") return <TimerIcon className="size-4" />;
  if (key === "gas") return <FuelIcon className="size-4" />;
  if (key === "validators") return <ShieldCheckIcon className="size-4" />;
  return <LayersIcon className="size-4" />;
}

function chartLabel(metric: ChartMetric) {
  if (metric === "tvl") return "Total value locked";
  if (metric === "volume") return "24h volume";
  if (metric === "users") return "Active users";
  if (metric === "transactions") return "Indexed transactions";
  return "Throughput (TPS)";
}

function chartValue(metric: ChartMetric, value: number | null) {
  if (value == null) return "—";
  if (metric === "tps") return `${formatTps(value)} TPS`;
  if (metric === "users" || metric === "transactions") return formatNumber(value);
  return formatUsd(value);
}

function axisValue(metric: ChartMetric, value: number) {
  if (metric === "tps") return formatTps(Number(value));
  if (metric === "users" || metric === "transactions") return formatNumber(Number(value));
  return formatUsd(Number(value)).replace(".00", "");
}

function getChartMetricValue(point: DisplayNetworkChartPoint, metric: ChartMetric) {
  const value = point[metric];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function flowClass(value: number) {
  return value < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400";
}

const WALLET_TONES = [
  "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  "bg-teal-500/15 text-teal-600 dark:text-teal-300",
  "bg-orange-500/15 text-orange-600 dark:text-orange-300",
];

const RISK_DOT: Record<string, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-rose-500",
};

function walletTone(address: string) {
  let hash = 0;
  for (let index = 0; index < Math.min(address.length, 8); index += 1) {
    hash = (hash * 31 + address.charCodeAt(index)) >>> 0;
  }
  return WALLET_TONES[hash % WALLET_TONES.length] ?? WALLET_TONES[0]!;
}

function sortWallets(rows: ProtocolUserRow[], key: WalletSortKey, direction: SortDirection) {
  return [...rows].sort((a, b) => {
    const result = a[key] - b[key];
    return direction === "asc" ? result : -result;
  });
}

function DeltaPill({ value, size = "md" }: { value: number | null; size?: "sm" | "md" }) {
  if (value == null) {
    const compact = size === "sm";
    return (
      <span
        className={
          "inline-flex items-center rounded bg-muted/45 font-mono text-muted-foreground " +
          (compact ? "h-4 px-1.5 text-[10px] leading-none" : "px-1.5 py-0.5 text-[10px]")
        }
      >
        —
      </span>
    );
  }

  const positive = value >= 0;
  const compact = size === "sm";
  const sizing = compact
    ? "h-4 px-1.5 text-[10px] tabular-nums leading-none"
    : "px-1.5 py-0.5 text-[10px] tabular-nums";
  return (
    <span
      className={
        "inline-flex items-center gap-0.5 rounded font-mono " +
        sizing +
        " " +
        (positive
          ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/12 text-rose-600 dark:text-rose-400")
      }
    >
      {positive ? (
        <ArrowUpRightIcon className={compact ? "size-2.5" : "size-3"} />
      ) : (
        <ArrowDownRightIcon className={compact ? "size-2.5" : "size-3"} />
      )}
      {formatDelta(value)}
    </span>
  );
}

function Sparkline({
  values,
  positive,
  className,
}: {
  values: number[];
  positive: boolean;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const geometry = useMemo(() => {
    const points = values.length > 0 ? values : [0, 0];
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = Math.max(1, max - min);
    const width = 200;
    const height = 54;
    const padY = 6;
    const coords = points.map((value, index) => {
      const x = (index / Math.max(1, points.length - 1)) * width;
      const y = padY + (1 - (value - min) / span) * (height - padY * 2);
      return [x, y] as const;
    });
    const line = coords
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(" ");
    const last = coords[coords.length - 1] ?? [0, 0];
    const first = coords[0] ?? [0, 0];
    const area = `${line} L${last[0].toFixed(2)},${height} L${first[0].toFixed(2)},${height} Z`;
    return { area, height, last, line, width };
  }, [values]);

  return (
    <svg
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className={
        (positive ? "text-emerald-500 " : "text-rose-500 ") + (className ?? "h-10 w-full")
      }
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={geometry.area} fill={`url(#${gradientId})`} />
      <path
        d={geometry.line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={geometry.last[0]} cy={geometry.last[1]} r="2.4" fill="currentColor" />
    </svg>
  );
}

function NotFound({ requestedId, onBack }: Pick<Props, "requestedId" | "onBack">) {
  return (
    <div className="grid min-h-svh place-items-center bg-background px-6">
      <div className="max-w-md rounded-xl border border-border/60 bg-background/40 p-6 text-center">
        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-[0.25em]">
          Local registry
        </Badge>
        <h2 className="mt-3 font-heading text-2xl tracking-tight">Network not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No local MVP network matches{" "}
          {requestedId ? <code className="font-mono">"{requestedId}"</code> : "this route"}.
        </p>
        <Button className="mt-5" onClick={onBack}>
          <ArrowLeftIcon />
          Back to globe
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  metric,
  chart,
}: {
  metric: DisplayNetworkDetailMetric;
  chart: DisplayNetworkChartPoint[];
}) {
  const positive = (metric.changes.h24 ?? 0) >= 0;
  const sparkKey: keyof DisplayNetworkChartPoint =
    metric.key === "volume"
      ? "volume"
      : metric.key === "users" || metric.key === "validators"
        ? "users"
        : metric.key === "transactions"
          ? "transactions"
        : metric.key === "tps"
          ? "tps"
          : "tvl";
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {metric.label}
        </div>
        <span className="text-muted-foreground/60">{metricIcon(metric.key)}</span>
      </div>
      <div className="mt-2 font-heading text-3xl tracking-tight tabular-nums">
        {formatMetric(metric)}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <DeltaPill value={metric.changes.h24} />
        <span className="text-xs text-muted-foreground">vs prev 24h</span>
      </div>
      <Sparkline
        values={chart
          .slice(-14)
          .map((point) => point[sparkKey])
          .filter((value): value is number => typeof value === "number" && Number.isFinite(value))}
        positive={positive}
        className="mt-3 h-10 w-full"
      />
    </div>
  );
}

function MiniMetric({ metric }: { metric: DisplayNetworkDetailMetric }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground">
        {metricIcon(metric.key)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {metric.label}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="truncate text-sm font-medium tabular-nums">{formatMetric(metric)}</span>
          <DeltaPill value={metric.changes.h24} size="sm" />
        </div>
      </div>
    </div>
  );
}

function ActivityChartCard({
  metric,
  range,
  points,
  topProtocols,
  metricOptions,
  splitByTopProtocols = true,
  onMetricChange,
  onRangeChange,
}: {
  metric: ChartMetric;
  range: ChartRange;
  points: DisplayNetworkChartPoint[];
  topProtocols: NetworkProtocolRow[];
  metricOptions: ChartMetric[];
  splitByTopProtocols?: boolean;
  onMetricChange: (next: ChartMetric) => void;
  onRangeChange: (next: ChartRange) => void;
}) {
  const gradientId = useId().replace(/:/g, "");
  const series = useMemo(() => {
    const sourceRows = splitByTopProtocols && topProtocols.length > 0 ? topProtocols.slice(0, 4) : [];
    const names =
      sourceRows.length > 0
        ? sourceRows.map((row) => row.protocol.name)
        : ["Network total"];
    const weights = names.map((_, index) => 1 / (index + 1.35));
    const total = weights.reduce((sum, value) => sum + value, 0);
    return names.map((name, index) => ({
      color: Chart.chartColor(index),
      key: `series${index}`,
      name,
      weight: weights[index]! / total,
    }));
  }, [splitByTopProtocols, topProtocols]);
  const today = useMemo(() => new Date(), []);
  const metricPoints = useMemo(
    () => points.filter((point) => getChartMetricValue(point, metric) != null),
    [metric, points],
  );
  const showTimeLabels = useMemo(() => {
    const dayCounts = new Map<string, number>();
    for (const point of metricPoints) {
      if (!point.timestamp) continue;
      const day = new Date(point.timestamp).toISOString().slice(0, 10);
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    return [...dayCounts.values()].some((count) => count > 1);
  }, [metricPoints]);
  const chartData = useMemo(
    () =>
      metricPoints.map((point) => {
        const daysAgo = parseInt(point.label.replace("D-", ""), 10);
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        const label = point.timestamp
          ? formatChartTimestamp(point.timestamp, showTimeLabels)
          : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const row: Record<string, number | string> = { label };
        const total = getChartMetricValue(point, metric) ?? 0;
        for (const item of series) row[item.key] = total * item.weight;
        return row;
      }),
    [metric, metricPoints, series, showTimeLabels, today],
  );
  const tickInterval = Math.max(0, Math.floor(metricPoints.length / 6) - 1);
  const latest = getChartMetricValue(metricPoints.at(-1) ?? { label: "" }, metric);
  const first = getChartMetricValue(metricPoints.at(0) ?? { label: "" }, metric);
  const delta = first == null || first === 0 || latest == null ? null : ((latest - first) / first) * 100;
  const yDomain = useMemo<[number, number]>(() => {
    const totals = metricPoints
      .map((point) => getChartMetricValue(point, metric))
      .filter((value): value is number => value != null && Number.isFinite(value));
    if (totals.length === 0) return [0, 1];
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    if (min === max) {
      const fallback = Math.max(Math.abs(max) * 0.05, 1);
      return [Math.max(0, min - fallback), max + fallback];
    }
    const pad = (max - min) * 0.2;
    const lowerCandidate = min - pad;
    const lower = min >= 0 && lowerCandidate < 0 ? 0 : lowerCandidate;
    return [lower, max + pad];
  }, [metric, metricPoints]);

  return (
    <section className="rounded-xl border border-border/60 bg-background/40 p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 sm:items-end">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            Activity · {chartLabel(metric)}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-2xl tracking-tight tabular-nums">
              {chartValue(metric, latest)}
            </span>
            <DeltaPill value={delta} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={metric}
            onValueChange={(value) => onMetricChange(value as ChartMetric)}
          >
            <TabsList aria-label="Chart metric">
              {metricOptions.map((option) => (
                <TabsTab key={option} value={option}>
                  {option === "tvl"
                    ? "TVL"
                    : option === "volume"
                      ? "Volume"
                      : option === "users"
                        ? "Users"
                        : option === "transactions"
                          ? "Txns"
                          : "TPS"}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>
          <Tabs
            value={range}
            onValueChange={(value) => onRangeChange(value as ChartRange)}
          >
            <TabsList aria-label="Chart range">
              {CHART_RANGES.map((entry) => (
                <TabsTab key={entry.key} value={entry.key}>
                  {entry.label}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {series.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
        ))}
      </div>

      <Chart.ChartContainer className="mt-4 h-60 [&_.recharts-cartesian-axis-tick_text]:!tracking-normal">
        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((item) => (
              <linearGradient
                key={item.key}
                id={`${gradientId}-${item.key}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={item.color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={item.color} stopOpacity="0.1" />
              </linearGradient>
            ))}
          </defs>
          <Chart.ChartGrid />
          <XAxis
            dataKey="label"
            interval={tickInterval}
            tick={{ fontSize: 10, letterSpacing: 0 }}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={8}
            stroke="currentColor"
          />
          <YAxis
            width={56}
            domain={yDomain}
            allowDataOverflow
            allowDecimals={false}
            tickFormatter={(value) => axisValue(metric, Number(value))}
            tick={{ fontSize: 10, letterSpacing: 0 }}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={8}
            stroke="currentColor"
          />
          <Chart.ChartTooltip />
          {series.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              {...(series.length > 1 ? { stackId: "network" } : { baseValue: yDomain[0] })}
              stroke={item.color}
              strokeWidth={1.5}
              fill={`url(#${gradientId}-${item.key})`}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </Chart.ChartContainer>
    </section>
  );
}

function ProtocolLogo({ protocol }: { protocol: Protocol }) {
  const symbol = protocol.symbol?.trim();
  return (
    <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-border/60 bg-background/40 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      {protocol.logo ? (
        <img src={protocol.logo} alt="" className="size-full object-cover" />
      ) : symbol ? (
        symbol.slice(0, 3)
      ) : (
        protocol.name
          .split(/\s+/)
          .map((part) => part[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase()
      )}
    </div>
  );
}

function ShareBar({ value }: { value: number }) {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/70">
        <div
          className="h-full rounded-full bg-foreground/70 transition-[width] duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

function TopProtocolsTable({
  rows,
  volumeLabel = "30d Volume",
  onOpenProtocol,
}: {
  rows: NetworkProtocolRow[];
  volumeLabel?: string;
  onOpenProtocol: (protocol: Protocol) => void;
}) {
  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-border/60 bg-background/40 px-5 py-6 text-sm text-muted-foreground">
        No protocols indexed on this network yet.
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border/60 bg-background/40">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          Top protocols
        </div>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {rows.length} on network
        </span>
      </header>
      <Table>
        <TableHeader className="[&_tr]:border-border/60">
          <TableRow>
            <TableHead className="text-xs font-medium text-muted-foreground">Protocol</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">TVL</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">{volumeLabel}</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Network share</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">24h</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-border/60">
          {rows.map((row) => (
            <TableRow
              key={row.protocol.id}
              className="cursor-pointer transition-colors hover:bg-muted/40"
              onClick={() => onOpenProtocol(row.protocol)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <ProtocolLogo protocol={row.protocol} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{row.protocol.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge variant="outline" className="h-4 px-1 font-mono text-[9px]">
                        {row.protocol.category}
                      </Badge>
                      {row.protocol.symbol?.trim() ? (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {row.protocol.symbol?.trim()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.tvl == null ? "—" : formatUsd(row.tvl)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.volume30d == null ? "—" : formatUsd(row.volume30d)}
              </TableCell>
              <TableCell>
                <ShareBar value={row.share} />
              </TableCell>
              <TableCell className="text-right">
                <DeltaPill value={row.change24h} />
              </TableCell>
              <TableCell className="text-right text-muted-foreground/60">
                <ArrowUpRightIcon className="ml-auto size-3.5" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function blockResultLabel(result: NetworkBlockRow["proposalResult"]) {
  if (result === "success") return "Finalized";
  if (result === "failed") return "Failed";
  return "Pending";
}

function blockResultTone(result: NetworkBlockRow["proposalResult"]) {
  if (result === "success") return "bg-emerald-500/80";
  if (result === "failed") return "bg-rose-500/80";
  return "bg-amber-500/80";
}

function liveStreamStatusLabel(status: BlockStreamStatus, hasBlocks: boolean) {
  if (status === "subscribed") return "Live";
  if (status === "connecting" && hasBlocks) return "Reconnecting";
  if (status === "connecting") return "Connecting";
  if (status === "error") return "Stream error";
  return "Idle";
}

function formatLiveBlockAge(receivedAt: string) {
  const parsed = Date.parse(receivedAt);
  if (!Number.isFinite(parsed)) return "just now";
  const elapsed = Math.max(0, Date.now() - parsed);
  if (elapsed < 1_000) return "just now";
  if (elapsed < 60_000) return `${(elapsed / 1_000).toFixed(1)}s ago`;
  return `${Math.round(elapsed / 60_000)}m ago`;
}

function formatLiveBlockHash(value: string | undefined) {
  if (!value) return "no hash";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function formatLiveBlockTime(value: string | undefined) {
  if (!value) return "No block time";
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return value;
  const ms = timestamp > 100_000_000_000 ? timestamp : timestamp * 1_000;
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(ms);
}

function liveBlockTitle(block: BlockEntry) {
  const height = block.blockHeight == null ? null : Number(block.blockHeight);
  if (height != null && Number.isFinite(height)) return `#${height.toLocaleString("en-US")}`;
  return `Slot ${Number(block.slot).toLocaleString("en-US")}`;
}

function averageLiveBlockMs(blocks: BlockEntry[]) {
  if (blocks.length < 2) return null;
  let total = 0;
  let count = 0;
  for (let index = 0; index < blocks.length - 1; index += 1) {
    const previous = Date.parse(blocks[index]!.receivedAt);
    const current = Date.parse(blocks[index + 1]!.receivedAt);
    if (!Number.isFinite(current) || !Number.isFinite(previous)) continue;
    total += Math.max(0, current - previous);
    count += 1;
  }
  return count === 0 ? null : Math.round(total / count);
}

function liveBlockSlot(block: BlockEntry) {
  const slot = Number(block.slot);
  return Number.isFinite(slot) ? slot : null;
}

function compareLiveBlocksAscending(a: BlockEntry, b: BlockEntry) {
  const aSlot = liveBlockSlot(a);
  const bSlot = liveBlockSlot(b);
  if (aSlot != null && bSlot != null && aSlot !== bSlot) return aSlot - bSlot;

  const aReceivedAt = Date.parse(a.receivedAt);
  const bReceivedAt = Date.parse(b.receivedAt);
  return (Number.isFinite(aReceivedAt) ? aReceivedAt : 0) - (Number.isFinite(bReceivedAt) ? bReceivedAt : 0);
}

const CONFIRMATION_DEPTH = 32;

type LiveBlockState = "processed" | "finalized" | "confirmed";

function liveBlockState(ageFromNewest: number): LiveBlockState {
  if (ageFromNewest === 0) return "processed";
  if (ageFromNewest < CONFIRMATION_DEPTH) return "finalized";
  return "confirmed";
}

function liveBlockTone(state: LiveBlockState) {
  if (state === "processed") return "bg-muted-foreground/45";
  if (state === "finalized") return "bg-sky-500/80";
  return "bg-emerald-500/80";
}

function liveBlockDotTone(state: LiveBlockState) {
  if (state === "processed") return "bg-muted-foreground/60";
  if (state === "finalized") return "bg-sky-500";
  return "bg-emerald-500";
}

const BLOCK_BAR_MIN_PX = 32;
const BLOCK_BAR_MAX_PX = 60;
const BLOCK_INTERVAL_MIN_MS = 200;
const BLOCK_INTERVAL_MAX_MS = 1_200;

function blockIntervalsMs(blocks: BlockEntry[]) {
  const intervals: (number | null)[] = [];
  for (let i = 0; i < blocks.length; i += 1) {
    if (i === 0) {
      intervals.push(null);
      continue;
    }
    const current = Date.parse(blocks[i]!.receivedAt);
    const previous = Date.parse(blocks[i - 1]!.receivedAt);
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      intervals.push(null);
      continue;
    }
    intervals.push(Math.max(0, current - previous));
  }
  return intervals;
}

function intervalToHeightPx(intervalMs: number | null, fallbackMs: number) {
  const value = intervalMs ?? fallbackMs;
  const clamped = Math.max(BLOCK_INTERVAL_MIN_MS, Math.min(BLOCK_INTERVAL_MAX_MS, value));
  const ratio = (clamped - BLOCK_INTERVAL_MIN_MS) / (BLOCK_INTERVAL_MAX_MS - BLOCK_INTERVAL_MIN_MS);
  return `${BLOCK_BAR_MIN_PX + ratio * (BLOCK_BAR_MAX_PX - BLOCK_BAR_MIN_PX)}px`;
}

const LIVE_BLOCKS_SLOT_COUNT = 64;
const LIVE_BLOCKS_ERROR_GRACE_MS = 6_000;

function RecentBlocksStrip({
  blocks,
  liveBlocks = [],
  streamError = null,
  streamStatus = "idle",
}: {
  blocks: NetworkBlockRow[];
  liveBlocks?: BlockEntry[];
  streamError?: string | null;
  streamStatus?: BlockStreamStatus;
}) {
  const hasEverHadBlocksRef = useRef(false);
  if (liveBlocks.length > 0) hasEverHadBlocksRef.current = true;
  const [graceElapsed, setGraceElapsed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setGraceElapsed(true), LIVE_BLOCKS_ERROR_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, []);
  const displayError =
    streamError && (hasEverHadBlocksRef.current || graceElapsed) ? streamError : null;
  const displayStatus: BlockStreamStatus =
    streamStatus === "error" && !displayError ? "connecting" : streamStatus;

  if (liveBlocks.length > 0 || displayStatus !== "idle" || displayError) {
    const visibleLiveBlocks = [...liveBlocks]
      .sort(compareLiveBlocksAscending)
      .slice(-LIVE_BLOCKS_SLOT_COUNT);
    const avgBlockMs = averageLiveBlockMs(visibleLiveBlocks);
    const intervalsMs = blockIntervalsMs(visibleLiveBlocks);
    const fallbackIntervalMs = avgBlockMs ?? 500;
    const latest = visibleLiveBlocks.at(-1);
    const padCount = Math.max(0, LIVE_BLOCKS_SLOT_COUNT - visibleLiveBlocks.length);
    const showErrorBanner = displayError != null && visibleLiveBlocks.length === 0;

    return (
      <section className="rounded-xl border border-border/60 bg-background/40 p-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BoxIcon className="size-4 text-muted-foreground" />
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Block stream
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-sm bg-muted-foreground/45" />
              <span>processed</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-sm bg-sky-500/80" />
              <span>confirmed</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-sm bg-emerald-500/80" />
              <span>finalized</span>
            </span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span className="tabular-nums">
              avg {avgBlockMs == null ? "pending" : `${avgBlockMs}ms`}
            </span>
          </div>
        </header>

        {showErrorBanner ? (
          <div className="mt-4 rounded-lg border border-border/60 bg-background/35 px-4 py-6 text-center text-sm text-muted-foreground">
            {displayError}
          </div>
        ) : (
          <TooltipProvider delay={80} closeDelay={40}>
            <div className="mt-4 grid grid-cols-64 gap-0.5" dir="rtl" role="list">
              {[...visibleLiveBlocks].reverse().map((block, ageFromNewest) => {
                const state = liveBlockState(ageFromNewest);
                const ascendingIndex = visibleLiveBlocks.length - 1 - ageFromNewest;
                const intervalMs = intervalsMs[ascendingIndex] ?? null;
                return (
                  <Tooltip key={block.id}>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          role="listitem"
                          className="group relative flex h-16 items-end justify-center rounded-md transition-[background-color,scale] hover:scale-110 hover:bg-muted/40"
                        />
                      }
                    >
                      <span
                        className={
                          "block w-full origin-bottom rounded-sm transition-all group-hover:opacity-100 " +
                          liveBlockTone(state)
                        }
                        style={{ height: intervalToHeightPx(intervalMs, fallbackIntervalMs) }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-0.5 text-[11px] leading-snug" dir="ltr">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className={"size-1.5 rounded-full " + liveBlockDotTone(state)} />
                          <span>{liveBlockTitle(block)}</span>
                          <span className="text-muted-foreground">· {state}</span>
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {formatLiveBlockHash(block.blockhash)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {intervalMs == null ? "first block" : `+${intervalMs}ms`} · {formatLiveBlockAge(block.receivedAt)}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {Array.from({ length: padCount }, (_, i) => {
                const height = 28 + ((i * 13 + 7) % 28);
                const delay = (i * 70) % 1400;
                return (
                  <div
                    key={`skeleton-${i}`}
                    role="listitem"
                    aria-hidden="true"
                    className="relative flex h-16 items-end justify-center rounded-md"
                  >
                    <span
                      className="block w-full origin-bottom animate-pulse rounded-sm bg-muted-foreground/25"
                      style={{ height: `${height}px`, animationDelay: `${delay}ms` }}
                    />
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        )}

        <footer className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">
            {latest
              ? liveBlockTitle(latest)
              : displayError ?? liveStreamStatusLabel(displayStatus, false)}
          </span>
          <span className="truncate font-mono uppercase tracking-[0.18em]">
            {latest
              ? `${formatLiveBlockHash(latest.blockhash)} · ${formatLiveBlockTime(latest.blockTime)}`
              : "waiting for blocks.meta"}
          </span>
        </footer>
      </section>
    );
  }

  const avgFinality =
    blocks.length === 0
      ? 0
      : Math.round(blocks.reduce((sum, block) => sum + block.finalityMs, 0) / blocks.length);
  const successRate =
    blocks.length === 0
      ? 0
      : (blocks.filter((block) => block.proposalResult === "success").length / blocks.length) * 100;

  return (
    <section className="rounded-xl border border-border/60 bg-background/40 p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BoxIcon className="size-4 text-muted-foreground" />
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            Recent blocks
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
          <span className="tabular-nums">avg {avgFinality}ms</span>
          <span className="size-1 rounded-full bg-muted-foreground/40" />
          <span className="tabular-nums">{successRate.toFixed(1)}% finalized</span>
        </div>
      </header>
      <div className="mt-4 grid grid-cols-12 gap-1 sm:grid-cols-24" role="list">
        {blocks.map((block) => {
          const height = `${Math.max(20, block.loadPct * 0.55)}px`;
          return (
            <button
              key={block.id}
              type="button"
              role="listitem"
              title={`#${block.blockNum.toLocaleString("en-US")} · ${block.validator} · ${block.finalityMs}ms`}
              className="group relative flex h-12 items-end justify-center rounded-md transition-colors hover:bg-muted/40"
            >
              <span
                className={
                  "block w-full origin-bottom rounded-sm transition-all group-hover:opacity-100 " +
                  blockResultTone(block.proposalResult)
                }
                style={{ height }}
              />
            </button>
          );
        })}
      </div>
      <footer className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">
          #{blocks[0]?.blockNum.toLocaleString("en-US") ?? "—"}
        </span>
        <span className="font-mono uppercase tracking-[0.25em]">last {blocks.length} blocks</span>
      </footer>
    </section>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | FilterValue;
  options: readonly T[];
  onChange: (value: T | FilterValue) => void;
}) {
  return (
    <Select value={String(value)} onValueChange={(next) => next && onChange(next as T | FilterValue)}>
      <SelectTrigger className="w-full sm:w-36">
        <SelectValue>{value === "all" ? `All ${label}` : value}</SelectValue>
      </SelectTrigger>
      <SelectPopup>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}

function SortableHead({
  active,
  align,
  direction,
  label,
  onClick,
}: {
  active: boolean;
  align?: "left" | "right";
  direction: SortDirection;
  label: string;
  onClick: () => void;
}) {
  const Indicator = active ? (direction === "asc" ? ArrowUpIcon : ArrowDownIcon) : ChevronsUpDownIcon;
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        data-active={active || undefined}
        onClick={onClick}
        className={
          "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium tracking-normal text-muted-foreground transition-colors hover:bg-muted/55 hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground " +
          (align === "right" ? "ml-auto justify-end" : "")
        }
      >
        <span>{label}</span>
        <Indicator className="size-3.5 opacity-70" />
      </button>
    </TableHead>
  );
}

function latestPlotValue(points: Array<{ activeUsers?: number | null; timestamp: string }>) {
  for (const point of [...points].reverse()) {
    if (point.activeUsers != null) return point.activeUsers;
  }
  return null;
}

function chartPointLabel(timestamp: string) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatChartTimestamp(timestamp: string, includeTime: boolean) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    hour: includeTime ? "numeric" : undefined,
    month: "short",
  });
}

function buildSolanaTransactionPlot(metrics: TrackallSolanaPlatformMetricsResponse | null) {
  const countsByTimestamp = new Map<string, number>();
  for (const platform of metrics?.platforms ?? []) {
    for (const point of platform.transactionsPlot) {
      if (point.transactionCount == null) continue;
      countsByTimestamp.set(point.timestamp, (countsByTimestamp.get(point.timestamp) ?? 0) + point.transactionCount);
    }
  }
  return [...countsByTimestamp.entries()]
    .sort(([a], [b]) => Date.parse(a) - Date.parse(b))
    .map(([timestamp, transactionCount]) => ({ timestamp, transactionCount }));
}

function buildSolanaChart(
  metrics: TrackallSolanaPlatformMetricsResponse | null,
  transactionPlot: { timestamp: string; transactionCount: number }[],
): DisplayNetworkChartPoint[] {
  const pointsByTimestamp = new Map<string, DisplayNetworkChartPoint>();
  const ensurePoint = (timestamp: string) => {
    let point = pointsByTimestamp.get(timestamp);
    if (!point) {
      point = {
        label: chartPointLabel(timestamp),
        timestamp,
      };
      pointsByTimestamp.set(timestamp, point);
    }
    return point;
  };

  for (const point of metrics?.chain.plot ?? []) {
    const chartPoint = ensurePoint(point.timestamp);
    chartPoint.tvl = point.tvlUsd;
    chartPoint.volume = point.volume24hUsd;
  }

  for (const point of metrics?.chain.usersPlot ?? []) {
    ensurePoint(point.timestamp).users = point.activeUsers;
  }

  for (const point of transactionPlot) {
    ensurePoint(point.timestamp).transactions = point.transactionCount;
  }

  const sorted = [...pointsByTimestamp.values()].sort(
    (a, b) => Date.parse(a.timestamp ?? "") - Date.parse(b.timestamp ?? ""),
  );

  let lastTvl: number | null = null;
  let lastVolume: number | null = null;
  let lastUsers: number | null = null;
  for (const point of sorted) {
    if (point.tvl != null) lastTvl = point.tvl;
    else if (lastTvl != null) point.tvl = lastTvl;
    if (point.volume != null) lastVolume = point.volume;
    else if (lastVolume != null) point.volume = lastVolume;
    if (point.users != null) lastUsers = point.users;
    else if (lastUsers != null) point.users = lastUsers;
  }
  let nextTvl: number | null = null;
  let nextVolume: number | null = null;
  let nextUsers: number | null = null;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const point = sorted[index]!;
    if (point.tvl != null) nextTvl = point.tvl;
    else if (nextTvl != null) point.tvl = nextTvl;
    if (point.volume != null) nextVolume = point.volume;
    else if (nextVolume != null) point.volume = nextVolume;
    if (point.users != null) nextUsers = point.users;
    else if (nextUsers != null) point.users = nextUsers;
  }

  return sorted;
}

function buildSolanaTopProtocols(
  metrics: TrackallSolanaPlatformMetricsResponse | null,
  protocols: Protocol[],
): NetworkProtocolRow[] {
  const protocolsById = new Map(protocols.map((protocol) => [protocol.id, protocol]));
  const rows = (metrics?.platforms ?? [])
    .map((platform) => {
      const protocol = protocolsById.get(platform.platformId);
      if (!protocol) return null;
      return {
        change24h: platform.tvlChange24hPct ?? 0,
        netFlow: 0,
        protocol,
        share: 0,
        tvl: platform.tvlUsd,
        volume30d: platform.volume24hUsd,
      } satisfies NetworkProtocolRow;
    })
    .filter((row): row is NetworkProtocolRow => row !== null)
    .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0));

  const totalTvl = rows.reduce((sum, row) => sum + (row.tvl ?? 0), 0);
  for (const row of rows) {
    row.share = totalTvl === 0 ? 0 : ((row.tvl ?? 0) / totalTvl) * 100;
  }
  return rows;
}

function buildSolanaNetworkDetail(
  metrics: TrackallSolanaPlatformMetricsResponse | null,
  protocols: Protocol[],
  recentBlocks: NetworkBlockRow[],
  chart: DisplayNetworkChartPoint[],
  transactionPlot: { timestamp: string; transactionCount: number }[],
): DisplayNetworkDetail {
  const usersSeries = (metrics?.chain.usersPlot ?? []).map((point) => ({
    timestamp: point.timestamp,
    value: point.activeUsers,
  }));
  const transactionSeries = transactionPlot.map((point) => ({
    timestamp: point.timestamp,
    value: point.transactionCount,
  }));
  const transactionCount = (metrics?.platforms ?? []).reduce((sum, platform) => sum + (platform.transactionCount ?? 0), 0);

  return {
    chart,
    metrics: [
      {
        changes: {
          d7: seriesChange((metrics?.chain.plot ?? []).map((point) => ({ timestamp: point.timestamp, value: point.tvlUsd })), 7),
          d30: seriesChange((metrics?.chain.plot ?? []).map((point) => ({ timestamp: point.timestamp, value: point.tvlUsd })), 30),
          h24: metrics?.chain.tvlChange24hPct ?? null,
        },
        format: "usd",
        key: "tvl",
        label: "TVL",
        value: metrics?.chain.tvlUsd ?? null,
      },
      {
        changes: {
          d7: seriesChange((metrics?.chain.plot ?? []).map((point) => ({ timestamp: point.timestamp, value: point.volume24hUsd })), 7),
          d30: seriesChange((metrics?.chain.plot ?? []).map((point) => ({ timestamp: point.timestamp, value: point.volume24hUsd })), 30),
          h24: metrics?.chain.volumeChange24hPct ?? null,
        },
        format: "usd",
        key: "volume",
        label: "24h Volume",
        value: metrics?.chain.volume24hUsd ?? null,
      },
      {
        changes: {
          d7: seriesChange(usersSeries, 7),
          d30: seriesChange(usersSeries, 30),
          h24: seriesChange(usersSeries, 1),
        },
        format: "number",
        key: "users",
        label: "Active Users",
        value: latestPlotValue(metrics?.chain.usersPlot ?? []),
      },
      {
        changes: {
          d7: seriesChange(transactionSeries, 7),
          d30: seriesChange(transactionSeries, 30),
          h24: seriesChange(transactionSeries, 1),
        },
        format: "number",
        key: "transactions",
        label: "Indexed Txns",
        value: metrics == null ? null : transactionCount,
      },
    ],
    recentBlocks,
    topProtocols: buildSolanaTopProtocols(metrics, protocols),
    wallets: [],
  };
}

function formatCapturedAt(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function sortSolanaWallets(wallets: TrackallAggregateTopWallet[], key: SolanaWalletSortKey, direction: SortDirection) {
  return [...wallets].sort((a, b) => {
    const result =
      key === "capturedAt"
        ? Date.parse(a.capturedAt) - Date.parse(b.capturedAt)
        : a[key] - b[key];
    return direction === "asc" ? result : -result;
  });
}

function exportSolanaWalletRows(wallets: TrackallAggregateTopWallet[], asOfRunId: number | null) {
  const csvCell = (value: number | string | null) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = [
    ["rank", "address", "totalUsd", "positionCount", "protocolCount", "capturedAt", "asOfRunId"],
    ...wallets.map((wallet) => [
      String(wallet.rank),
      wallet.address,
      String(wallet.totalUsd),
      String(wallet.positionCount),
      String(wallet.protocolCount),
      wallet.capturedAt,
      asOfRunId == null ? "" : String(asOfRunId),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "solana-top-wallets.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function SolanaWalletsTable({ onOpenWallet }: { onOpenWallet: (address: string) => void }) {
  const [wallets, setWallets] = useState<TrackallAggregateTopWallet[]>([]);
  const [asOfRunId, setAsOfRunId] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SolanaWalletSortKey>("totalUsd");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(12);
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    fetchSolanaTopAggregatePortfolioWallets(
      100,
      {
        apiKey: import.meta.env.VITE_TRACKALL_API_KEY,
        baseUrl: import.meta.env.VITE_TRACKALL_API_URL,
      },
      controller.signal,
    )
      .then((result) => {
        setWallets(result.wallets);
        setAsOfRunId(result.asOfRunId);
        setStatus("ready");
      })
      .catch((reason) => {
        if (controller.signal.aborted) return;
        console.error(reason);
        setError(reason instanceof Error ? reason.message : "Unable to load top wallets");
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  const filteredWallets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return wallets;
    return wallets.filter((wallet) =>
      `${wallet.rank} ${wallet.address} ${wallet.protocols.map((protocol) => protocol.platformId).join(" ")}`.toLowerCase().includes(query),
    );
  }, [search, wallets]);
  const sortedWallets = useMemo(
    () => sortSolanaWallets(filteredWallets, sortKey, sortDirection),
    [filteredWallets, sortDirection, sortKey],
  );
  const totalPages = Math.max(1, Math.ceil(sortedWallets.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedWallets = sortedWallets.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const allOnPage = pagedWallets.length > 0 && pagedWallets.every((wallet) => selectedWallets.has(wallet.address));
  const someOnPage = !allOnPage && pagedWallets.some((wallet) => selectedWallets.has(wallet.address));
  const start = sortedWallets.length === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min(sortedWallets.length, (safePage + 1) * pageSize);

  const selectSort = (key: SolanaWalletSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "rank" ? "asc" : "desc");
  };
  const toggleWallet = (address: string) => {
    setSelectedWallets((current) => {
      const next = new Set(current);
      if (next.has(address)) next.delete(address);
      else next.add(address);
      return next;
    });
  };
  const togglePageSelection = () => {
    setSelectedWallets((current) => {
      const next = new Set(current);
      for (const wallet of pagedWallets) {
        if (allOnPage) next.delete(wallet.address);
        else next.add(wallet.address);
      }
      return next;
    });
  };

  return (
    <section className="rounded-xl border border-border/60 bg-background/40">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            Top indexed portfolios
          </div>
          {asOfRunId != null ? (
            <div className="mt-1 font-mono text-[10px] text-muted-foreground tabular-nums">
              run #{asOfRunId}
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={sortedWallets.length === 0}
          onClick={() => exportSolanaWalletRows(sortedWallets, asOfRunId)}
        >
          <DownloadIcon />
          Export
        </Button>
      </header>

      <div className="border-b border-border/60 px-5 py-3">
        <InputGroup className="sm:max-w-sm">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            nativeInput
            type="search"
            value={search}
            placeholder="Search wallets"
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(0);
            }}
          />
        </InputGroup>
      </div>

      {status === "error" ? (
        <div className="border-b border-border/60 px-5 py-3 text-sm text-rose-600 dark:text-rose-400">
          {error ?? "Unable to load top wallets"}
        </div>
      ) : status === "loading" || status === "idle" ? (
        <div className="border-b border-border/60 px-5 py-3 text-sm text-muted-foreground">
          Loading top wallets...
        </div>
      ) : null}

      <Table>
        <TableHeader className="[&_tr]:border-border/60">
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allOnPage}
                indeterminate={someOnPage}
                onCheckedChange={togglePageSelection}
                aria-label="Select all rows on this page"
              />
            </TableHead>
            <SortableHead
              active={sortKey === "rank"}
              direction={sortDirection}
              label="Wallet"
              onClick={() => selectSort("rank")}
            />
            <SortableHead
              active={sortKey === "totalUsd"}
              align="right"
              direction={sortDirection}
              label="Portfolio value"
              onClick={() => selectSort("totalUsd")}
            />
            <SortableHead
              active={sortKey === "positionCount"}
              align="right"
              direction={sortDirection}
              label="Positions"
              onClick={() => selectSort("positionCount")}
            />
            <SortableHead
              active={sortKey === "protocolCount"}
              align="right"
              direction={sortDirection}
              label="Protocols"
              onClick={() => selectSort("protocolCount")}
            />
            <SortableHead
              active={sortKey === "capturedAt"}
              align="right"
              direction={sortDirection}
              label="Captured"
              onClick={() => selectSort("capturedAt")}
            />
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-border/60">
          {pagedWallets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                {status === "ready" ? "No wallets match these filters." : "No wallet data loaded yet."}
              </TableCell>
            </TableRow>
          ) : (
            pagedWallets.map((wallet) => {
              const selected = selectedWallets.has(wallet.address);
              return (
                <TableRow key={wallet.address} data-state={selected ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleWallet(wallet.address)}
                      aria-label={`Select ${shortWallet(wallet.address)}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className={"size-8 shrink-0 " + walletTone(wallet.address)}>
                        <AvatarFallback className="bg-transparent font-mono text-[11px] leading-none font-medium [text-rendering:geometricPrecision]">
                          {wallet.address.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="h-4 px-1 font-mono text-[9px]">
                            #{wallet.rank}
                          </Badge>
                          <a
                            href={getPortfolioAddressPath(wallet.address)}
                            onClick={(event) => {
                              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                              event.preventDefault();
                              onOpenWallet(wallet.address);
                            }}
                            className="wallet-address-link font-mono text-xs"
                            aria-label={`Open ${shortWallet(wallet.address)} portfolio`}
                          >
                            {shortWallet(wallet.address)}
                          </a>
                          <button
                            type="button"
                            onClick={() => void navigator.clipboard?.writeText(wallet.address)}
                            aria-label="Copy wallet"
                            className="text-muted-foreground/60 transition-colors hover:text-foreground"
                          >
                            <CopyIcon className="size-3" />
                          </button>
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {wallet.protocols.slice(0, 3).map((protocol) => protocol.platformId).join(", ") || "Solana"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatUsd(wallet.totalUsd)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(wallet.positionCount)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(wallet.protocolCount)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCapturedAt(wallet.capturedAt)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="font-mono tabular-nums">
            {start}-{end} of {sortedWallets.length}
          </span>
          {selectedWallets.size > 0 ? (
            <>
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              <span className="font-mono tabular-nums">{selectedWallets.size} selected</span>
              <Button type="button" variant="ghost" size="xs" onClick={() => setSelectedWallets(new Set())}>
                Clear
              </Button>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const next = Number(value);
              if (PAGE_SIZE_OPTIONS.includes(next as (typeof PAGE_SIZE_OPTIONS)[number])) {
                setPageSize(next as (typeof PAGE_SIZE_OPTIONS)[number]);
                setPage(0);
              }
            }}
          >
            <SelectTrigger size="sm" className="w-28">
              <SelectValue>{pageSize} rows</SelectValue>
            </SelectTrigger>
            <SelectPopup>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} rows
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={safePage === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </Button>
          <span className="font-mono tabular-nums text-muted-foreground">
            {safePage + 1} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </footer>
    </section>
  );
}

export function NetworkPage({
  blockStreamBlocks,
  blockStreamError,
  blockStreamStatus,
  network,
  protocols,
  solanaMetrics,
  solanaMetricsError,
  solanaMetricsStatus,
  requestedId,
  onBack,
  onOpenProtocol,
  onOpenWallet,
}: Props) {
  const [chartMetric, setChartMetric] = useState<ChartMetric>("tvl");
  const [chartRange, setChartRange] = useState<ChartRange>("7d");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProtocolUserType | FilterValue>("all");
  const [riskFilter, setRiskFilter] = useState<ProtocolRiskTier | FilterValue>("all");
  const [activityFilter, setActivityFilter] = useState<ProtocolActivityWindow | FilterValue>("all");
  const [sortKey, setSortKey] = useState<WalletSortKey>("depositedTvl");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(12);
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(() => new Set());

  const mockDetail = useMemo(() => (network ? buildNetworkDetailMock(network, protocols) : null), [network, protocols]);
  const isSolanaNetwork = network?.id === "solana";
  const solanaTransactionPlot = useMemo(
    () => (isSolanaNetwork ? buildSolanaTransactionPlot(solanaMetrics) : null),
    [isSolanaNetwork, solanaMetrics],
  );
  const solanaChart = useMemo(
    () => (isSolanaNetwork && solanaTransactionPlot ? buildSolanaChart(solanaMetrics, solanaTransactionPlot) : null),
    [isSolanaNetwork, solanaMetrics, solanaTransactionPlot],
  );
  const detail = useMemo<DisplayNetworkDetail | null>(() => {
    if (!network || !mockDetail) return null;
    if (isSolanaNetwork && solanaChart && solanaTransactionPlot) {
      return buildSolanaNetworkDetail(
        solanaMetrics,
        protocols,
        mockDetail.recentBlocks,
        solanaChart,
        solanaTransactionPlot,
      );
    }
    return mockDetail;
  }, [isSolanaNetwork, mockDetail, network, protocols, solanaChart, solanaMetrics, solanaTransactionPlot]);
  const chartPoints = useMemo(() => {
    const source = isSolanaNetwork ? solanaChart : detail?.chart;
    if (!source) return [];
    const durationMs =
      CHART_RANGES.find((entry) => entry.key === chartRange)?.durationMs ?? 7 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - durationMs;
    const filtered = source.filter((point) => {
      if (!point.timestamp) return false;
      const time = Date.parse(point.timestamp);
      return Number.isFinite(time) && time >= cutoff;
    });
    return filtered.length > 0 ? filtered : source.slice(-1);
  }, [chartRange, detail?.chart, isSolanaNetwork, solanaChart]);
  const chartMetricOptions = useMemo<ChartMetric[]>(
    () => (isSolanaNetwork ? ["tvl", "volume", "users", "transactions"] : ["tvl", "volume", "tps"]),
    [isSolanaNetwork],
  );
  const activeChartMetric = chartMetricOptions.includes(chartMetric) ? chartMetric : chartMetricOptions[0]!;
  const primaryMetrics = useMemo(() => {
    if (!detail) return [];
    const lookup = new Map(detail.metrics.map((metric) => [metric.key, metric]));
    const keys = isSolanaNetwork ? (["tvl", "volume", "users", "transactions"] as DisplayMetricKey[]) : PRIMARY_KEYS;
    return keys.map((key) => lookup.get(key)).filter(Boolean) as DisplayNetworkDetailMetric[];
  }, [detail, isSolanaNetwork]);
  const secondaryMetrics = useMemo(() => {
    if (!detail || isSolanaNetwork) return [];
    const lookup = new Map(detail.metrics.map((metric) => [metric.key, metric]));
    return SECONDARY_KEYS.map((key) => lookup.get(key)).filter(Boolean) as DisplayNetworkDetailMetric[];
  }, [detail, isSolanaNetwork]);
  const filteredWallets = useMemo(() => {
    if (!detail) return [];
    const query = search.trim().toLowerCase();
    return detail.wallets.filter((row) => {
      if (query && !`${row.wallet} ${row.network} ${row.type}`.toLowerCase().includes(query)) return false;
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (riskFilter !== "all" && row.risk !== riskFilter) return false;
      if (activityFilter !== "all" && row.activity !== activityFilter) return false;
      return true;
    });
  }, [activityFilter, detail, riskFilter, search, typeFilter]);
  const sortedWallets = useMemo(
    () => sortWallets(filteredWallets, sortKey, sortDirection),
    [filteredWallets, sortDirection, sortKey],
  );
  const totalPages = Math.max(1, Math.ceil(sortedWallets.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedWallets = sortedWallets.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const allOnPage = pagedWallets.length > 0 && pagedWallets.every((row) => selectedWallets.has(row.wallet));
  const someOnPage = !allOnPage && pagedWallets.some((row) => selectedWallets.has(row.wallet));

  if (!network || !detail) return <NotFound requestedId={requestedId} onBack={onBack} />;

  const selectSort = (key: WalletSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDirection("desc");
  };

  const resetPage = () => setPage(0);
  const toggleWallet = (wallet: string) => {
    setSelectedWallets((current) => {
      const next = new Set(current);
      if (next.has(wallet)) next.delete(wallet);
      else next.add(wallet);
      return next;
    });
  };
  const togglePageSelection = () => {
    setSelectedWallets((current) => {
      const next = new Set(current);
      for (const row of pagedWallets) {
        if (allOnPage) next.delete(row.wallet);
        else next.add(row.wallet);
      }
      return next;
    });
  };
  const start = sortedWallets.length === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min(sortedWallets.length, (safePage + 1) * pageSize);

  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto overflow-x-hidden bg-background pt-[64px] text-foreground"
      aria-label={`${network.name} network analytics`}
    >
      <header className="border-b border-border/60 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Networks · {network.name}
          </div>
          {network.website ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              render={<a href={network.website} target="_blank" rel="noreferrer" />}
            >
              Website
              <ExternalLinkIcon />
            </Button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-6 py-8">
        <section className="space-y-6">
          <div className="flex items-start gap-5">
            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/60 bg-background/40 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {network.logo ? (
                <img src={network.logo} alt="" className="size-10 rounded-xl object-contain" />
              ) : (
                networkInitials(network)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                <span>{network.category}</span>
                <span className="size-1 rounded-full bg-muted-foreground/40" />
                <span>{network.symbol}</span>
                <span className="size-1 rounded-full bg-muted-foreground/40" />
                <span>{network.consensus}</span>
              </div>
              <h1 className="mt-1 font-heading text-3xl tracking-tight">{network.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {network.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/60 bg-background/55 px-2.5">
                  <LayersIcon className="size-3.5 text-muted-foreground/80" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {network.category}
                  </span>
                </div>
                <div className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/60 bg-background/55 px-2.5">
                  <ShieldCheckIcon className="size-3.5 text-muted-foreground/80" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {network.consensus}
                  </span>
                </div>
                {network.evmCompatible ? (
                  <div className="inline-flex h-7 items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/8 px-2.5">
                    <CheckIcon className="size-3.5 text-emerald-500" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-500/90">
                      EVM
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/60 bg-background/55 px-2.5">
                    <CpuIcon className="size-3.5 text-muted-foreground/80" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Native
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-border/60 pt-4 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Native asset
              </dt>
              <dd className="mt-1 flex items-center gap-2 text-sm">
                {network.logo ? (
                  <span className="grid size-5 place-items-center overflow-hidden rounded border border-border/60 bg-background/55">
                    <img src={network.logo} alt="" className="size-4 object-contain" />
                  </span>
                ) : null}
                <span className="font-medium">{network.symbol}</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Hub
              </dt>
              <dd className="mt-1 text-sm">{formatNetworkLocation(network)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Finality target
              </dt>
              <dd className="mt-1 text-sm tabular-nums">~{network.finalitySec}s</dd>
            </div>
          </dl>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {primaryMetrics.map((metric) => (
            <StatCard key={metric.key} metric={metric} chart={detail.chart} />
          ))}
        </section>

        {isSolanaNetwork && solanaMetricsStatus === "error" ? (
          <section className="rounded-xl border border-rose-500/30 bg-rose-500/8 px-5 py-3 text-sm text-rose-600 dark:text-rose-400">
            {solanaMetricsError ?? "Unable to load Trackall Solana metrics"}
          </section>
        ) : null}

        {isSolanaNetwork && (solanaMetricsStatus === "loading" || solanaMetricsStatus === "idle") ? (
          <section className="rounded-xl border border-border/60 bg-background/40 px-5 py-3 text-sm text-muted-foreground">
            Loading Solana network metrics...
          </section>
        ) : null}

        {secondaryMetrics.length > 0 ? (
          <section className="grid grid-cols-2 divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-background/40 sm:grid-cols-4 sm:divide-x">
            {secondaryMetrics.map((metric) => (
              <MiniMetric key={metric.key} metric={metric} />
            ))}
          </section>
        ) : null}

        <ActivityChartCard
          metric={activeChartMetric}
          range={chartRange}
          points={chartPoints}
          topProtocols={detail.topProtocols}
          metricOptions={chartMetricOptions}
          splitByTopProtocols={!isSolanaNetwork}
          onMetricChange={setChartMetric}
          onRangeChange={setChartRange}
        />

        <RecentBlocksStrip
          blocks={detail.recentBlocks}
          liveBlocks={isSolanaNetwork ? blockStreamBlocks : []}
          streamError={isSolanaNetwork ? blockStreamError : null}
          streamStatus={isSolanaNetwork ? blockStreamStatus : "idle"}
        />

        <TopProtocolsTable
          rows={detail.topProtocols}
          volumeLabel={isSolanaNetwork ? "24h Volume" : "30d Volume"}
          onOpenProtocol={onOpenProtocol}
        />

        {isSolanaNetwork ? (
          <SolanaWalletsTable onOpenWallet={onOpenWallet} />
        ) : (
        <section className="rounded-xl border border-border/60 bg-background/40">
          <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Top wallets
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0">
              <DownloadIcon />
              Export
            </Button>
          </header>

          <div className="flex flex-col gap-2.5 border-b border-border/60 px-5 py-3 sm:flex-row sm:items-center">
            <InputGroup className="sm:max-w-sm">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                nativeInput
                type="search"
                value={search}
                placeholder="Search wallets"
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  resetPage();
                }}
              />
            </InputGroup>
            <div className="grid grid-cols-3 gap-2 sm:ml-auto sm:flex sm:flex-none">
              <FilterSelect
                label="types"
                value={typeFilter}
                options={USER_TYPES}
                onChange={(value) => {
                  setTypeFilter(value);
                  resetPage();
                }}
              />
              <FilterSelect
                label="risks"
                value={riskFilter}
                options={RISK_TIERS}
                onChange={(value) => {
                  setRiskFilter(value);
                  resetPage();
                }}
              />
              <FilterSelect
                label="activity"
                value={activityFilter}
                options={ACTIVITY_WINDOWS}
                onChange={(value) => {
                  setActivityFilter(value);
                  resetPage();
                }}
              />
            </div>
          </div>

          <Table>
            <TableHeader className="[&_tr]:border-border/60">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allOnPage}
                    indeterminate={someOnPage}
                    onCheckedChange={togglePageSelection}
                    aria-label="Select all rows on this page"
                  />
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Wallet</TableHead>
                <SortableHead
                  active={sortKey === "depositedTvl"}
                  align="right"
                  direction={sortDirection}
                  label="TVL"
                  onClick={() => selectSort("depositedTvl")}
                />
                <SortableHead
                  active={sortKey === "volume30d"}
                  align="right"
                  direction={sortDirection}
                  label="30d Vol"
                  onClick={() => selectSort("volume30d")}
                />
                <SortableHead
                  active={sortKey === "netFlow"}
                  align="right"
                  direction={sortDirection}
                  label="Performance"
                  onClick={() => selectSort("netFlow")}
                />
                <SortableHead
                  active={sortKey === "lastActiveHours"}
                  align="right"
                  direction={sortDirection}
                  label="Last active"
                  onClick={() => selectSort("lastActiveHours")}
                />
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-border/60">
              {pagedWallets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No wallets match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedWallets.map((row) => {
                  const selected = selectedWallets.has(row.wallet);
                  return (
                    <TableRow key={row.wallet} data-state={selected ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleWallet(row.wallet)}
                          aria-label={`Select ${shortWallet(row.wallet)}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className={"size-8 shrink-0 " + walletTone(row.wallet)}>
                            <AvatarFallback className="bg-transparent font-mono text-[11px] leading-none font-medium [text-rendering:geometricPrecision]">
                              {row.wallet.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={getPortfolioAddressPath(row.wallet)}
                                onClick={(event) => {
                                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                                  event.preventDefault();
                                  onOpenWallet(row.wallet);
                                }}
                                className="wallet-address-link font-mono text-xs"
                                aria-label={`Open ${shortWallet(row.wallet)} portfolio`}
                              >
                                {shortWallet(row.wallet)}
                              </a>
                              <button
                                type="button"
                                onClick={() => void navigator.clipboard?.writeText(row.wallet)}
                                aria-label="Copy wallet"
                                className="text-muted-foreground/60 transition-colors hover:text-foreground"
                              >
                                <CopyIcon className="size-3" />
                              </button>
                              <span
                                className={"size-1.5 shrink-0 rounded-full " + (RISK_DOT[row.risk] ?? "bg-border")}
                              />
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-muted-foreground">{row.network}</span>
                              <Badge variant="outline" className="h-4 px-1 font-mono text-[9px]">{row.type}</Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUsd(row.depositedTvl)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUsd(row.volume30d)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={"tabular-nums text-xs font-medium " + flowClass(row.netFlow)}>
                          {formatSignedUsd(row.netFlow)}
                        </div>
                        <div className="mt-0.5 tabular-nums text-[10px] text-muted-foreground">
                          PnL {formatSignedUsd(row.pnl)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatLastActive(row.lastActiveHours)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3 text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="font-mono tabular-nums">
                {start}-{end} of {sortedWallets.length}
              </span>
              {selectedWallets.size > 0 ? (
                <>
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  <span className="font-mono tabular-nums">
                    {selectedWallets.size} selected
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setSelectedWallets(new Set())}
                  >
                    Clear
                  </Button>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  const next = Number(value);
                  if (PAGE_SIZE_OPTIONS.includes(next as (typeof PAGE_SIZE_OPTIONS)[number])) {
                    setPageSize(next as (typeof PAGE_SIZE_OPTIONS)[number]);
                    setPage(0);
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-28">
                  <SelectValue>{pageSize} rows</SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} rows
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={safePage === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                aria-label="Previous page"
              >
                <ChevronLeftIcon />
              </Button>
              <span className="font-mono tabular-nums text-muted-foreground">
                {safePage + 1} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                aria-label="Next page"
              >
                <ChevronRightIcon />
              </Button>
            </div>
          </footer>
        </section>
        )}
      </main>
    </div>
  );
}
