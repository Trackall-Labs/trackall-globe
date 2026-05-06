import { useId, useMemo, useState } from "react";
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
import { Area, AreaChart } from "recharts";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Checkbox } from "@orbit/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@orbit/ui/input-group";
import { Chart } from "@orbit/ui/patterns/charts";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@orbit/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@orbit/ui/table";
import { Tabs, TabsList, TabsTab } from "@orbit/ui/tabs";
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
import type { Protocol } from "@/lib/types";

type Props = {
  network: Network | null;
  protocols: Protocol[];
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
type ChartRange = "7d" | "14d" | "30d";
type ChartMetric = "tvl" | "volume" | "tps";

const PRIMARY_KEYS: NetworkMetricKey[] = ["tvl", "volume", "users", "tps"];
const SECONDARY_KEYS: NetworkMetricKey[] = ["blockTime", "gas", "validators", "stakeRatio"];
const CHART_RANGES: { key: ChartRange; label: string; size: number }[] = [
  { key: "7d", label: "7D", size: 7 },
  { key: "14d", label: "14D", size: 14 },
  { key: "30d", label: "30D", size: 30 },
];

function formatMetric(metric: NetworkDetailMetric) {
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

function metricIcon(key: NetworkMetricKey) {
  if (key === "tvl") return <WalletIcon className="size-4" />;
  if (key === "volume") return <ActivityIcon className="size-4" />;
  if (key === "users") return <UsersIcon className="size-4" />;
  if (key === "tps") return <GaugeIcon className="size-4" />;
  if (key === "blockTime") return <TimerIcon className="size-4" />;
  if (key === "gas") return <FuelIcon className="size-4" />;
  if (key === "validators") return <ShieldCheckIcon className="size-4" />;
  return <LayersIcon className="size-4" />;
}

function chartLabel(metric: ChartMetric) {
  if (metric === "tvl") return "Total value locked";
  if (metric === "volume") return "Network volume";
  return "Throughput (TPS)";
}

function chartValue(metric: ChartMetric, value: number) {
  if (metric === "tps") return `${formatTps(value)} TPS`;
  return formatUsd(value);
}

function axisValue(metric: ChartMetric, value: number) {
  if (metric === "tps") return formatTps(Number(value));
  return formatUsd(Number(value)).replace(".00", "");
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

function DeltaPill({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
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
  metric: NetworkDetailMetric;
  chart: NetworkChartPoint[];
}) {
  const positive = metric.changes.h24 >= 0;
  const sparkKey: keyof NetworkChartPoint =
    metric.key === "volume"
      ? "volume"
      : metric.key === "users" || metric.key === "validators"
        ? "users"
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
        values={chart.slice(-14).map((point) => point[sparkKey] as number)}
        positive={positive}
        className="mt-3 h-10 w-full"
      />
    </div>
  );
}

function MiniMetric({ metric }: { metric: NetworkDetailMetric }) {
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
  onMetricChange,
  onRangeChange,
}: {
  metric: ChartMetric;
  range: ChartRange;
  points: NetworkChartPoint[];
  topProtocols: NetworkProtocolRow[];
  onMetricChange: (next: ChartMetric) => void;
  onRangeChange: (next: ChartRange) => void;
}) {
  const gradientId = useId().replace(/:/g, "");
  const series = useMemo(() => {
    const sourceRows = topProtocols.length > 0 ? topProtocols.slice(0, 4) : [];
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
  }, [topProtocols]);
  const today = useMemo(() => new Date(), []);
  const chartData = useMemo(
    () =>
      points.map((point) => {
        const daysAgo = parseInt(point.label.replace("D-", ""), 10);
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const row: Record<string, number | string> = { label };
        const total = point[metric];
        for (const item of series) row[item.key] = total * item.weight;
        return row;
      }),
    [metric, points, series, today],
  );
  const tickInterval = Math.max(0, Math.floor(points.length / 6) - 1);
  const latest = points.at(-1)?.[metric] ?? 0;
  const first = points.at(0)?.[metric] ?? latest;
  const delta = first === 0 ? 0 : ((latest - first) / first) * 100;

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
              <TabsTab value="tvl">TVL</TabsTab>
              <TabsTab value="volume">Volume</TabsTab>
              <TabsTab value="tps">TPS</TabsTab>
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

      <Chart.ChartContainer className="mt-4 h-60 [&_.recharts-yAxis_.recharts-cartesian-axis-tick_text]:tracking-normal">
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
          <Chart.ChartAxis dataKey="label" interval={tickInterval} />
          <Chart.ChartAxis
            axis="y"
            width={56}
            tickFormatter={(value) => axisValue(metric, Number(value))}
          />
          <Chart.ChartTooltip />
          {series.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stackId="network"
              stroke={item.color}
              strokeWidth={1.5}
              fill={`url(#${gradientId}-${item.key})`}
            />
          ))}
        </AreaChart>
      </Chart.ChartContainer>
    </section>
  );
}

function ProtocolLogo({ protocol }: { protocol: Protocol }) {
  return (
    <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-border/60 bg-background/40 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      {protocol.logo ? (
        <img src={protocol.logo} alt="" className="size-full object-cover" />
      ) : (
        protocol.symbol.slice(0, 3)
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
  onOpenProtocol,
}: {
  rows: NetworkProtocolRow[];
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
            <TableHead className="text-right text-xs font-medium text-muted-foreground">30d Volume</TableHead>
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
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {row.protocol.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatUsd(row.tvl)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatUsd(row.volume30d)}</TableCell>
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

function RecentBlocksStrip({ blocks }: { blocks: NetworkBlockRow[] }) {
  const avgFinality = useMemo(() => {
    if (blocks.length === 0) return 0;
    return Math.round(blocks.reduce((sum, block) => sum + block.finalityMs, 0) / blocks.length);
  }, [blocks]);
  const successRate = useMemo(() => {
    if (blocks.length === 0) return 0;
    const success = blocks.filter((block) => block.proposalResult === "success").length;
    return (success / blocks.length) * 100;
  }, [blocks]);

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

export function NetworkPage({
  network,
  protocols,
  requestedId,
  onBack,
  onOpenProtocol,
  onOpenWallet,
}: Props) {
  const [chartMetric, setChartMetric] = useState<ChartMetric>("tvl");
  const [chartRange, setChartRange] = useState<ChartRange>("30d");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProtocolUserType | FilterValue>("all");
  const [riskFilter, setRiskFilter] = useState<ProtocolRiskTier | FilterValue>("all");
  const [activityFilter, setActivityFilter] = useState<ProtocolActivityWindow | FilterValue>("all");
  const [sortKey, setSortKey] = useState<WalletSortKey>("depositedTvl");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(12);
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(() => new Set());

  const detail = useMemo(() => (network ? buildNetworkDetailMock(network, protocols) : null), [network, protocols]);
  const chartPoints = useMemo(() => {
    if (!detail) return [];
    const size = CHART_RANGES.find((entry) => entry.key === chartRange)?.size ?? 30;
    return detail.chart.slice(-size);
  }, [chartRange, detail]);
  const primaryMetrics = useMemo(() => {
    if (!detail) return [];
    const lookup = new Map(detail.metrics.map((metric) => [metric.key, metric]));
    return PRIMARY_KEYS.map((key) => lookup.get(key)).filter(Boolean) as NetworkDetailMetric[];
  }, [detail]);
  const secondaryMetrics = useMemo(() => {
    if (!detail) return [];
    const lookup = new Map(detail.metrics.map((metric) => [metric.key, metric]));
    return SECONDARY_KEYS.map((key) => lookup.get(key)).filter(Boolean) as NetworkDetailMetric[];
  }, [detail]);
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
            Network · Local mock
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

        <section className="grid grid-cols-2 divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-background/40 sm:grid-cols-4 sm:divide-x">
          {secondaryMetrics.map((metric) => (
            <MiniMetric key={metric.key} metric={metric} />
          ))}
        </section>

        <ActivityChartCard
          metric={chartMetric}
          range={chartRange}
          points={chartPoints}
          topProtocols={detail.topProtocols}
          onMetricChange={setChartMetric}
          onRangeChange={setChartRange}
        />

        <RecentBlocksStrip blocks={detail.recentBlocks} />

        <TopProtocolsTable rows={detail.topProtocols} onOpenProtocol={onOpenProtocol} />

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
      </main>
    </div>
  );
}
