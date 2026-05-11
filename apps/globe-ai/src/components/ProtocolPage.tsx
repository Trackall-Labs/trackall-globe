import { useEffect, useId, useMemo, useState } from "react";
import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowDownRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  SearchIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Checkbox } from "@orbit/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@orbit/ui/input-group";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Chart } from "@orbit/ui/patterns/charts";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@orbit/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@orbit/ui/table";
import { Tabs, TabsList, TabsTab } from "@orbit/ui/tabs";
import { nameToNetworkId } from "@/lib/networks";
import { getPortfolioAddressPath } from "@/lib/protocol-route";
import { formatProtocolLocation } from "@/lib/protocols";
import {
  fetchSolanaTopPortfolioWallets,
  type TrackallSolanaPlatformMetrics,
  type TrackallTopWallet,
} from "@/lib/trackall-api";
import {
  PAGE_SIZE_OPTIONS,
  formatDelta,
  formatNumber,
  formatUsd,
  shortWallet,
} from "@/lib/protocol-stats";
import type { Protocol } from "@/lib/types";

type Props = {
  protocol: Protocol | null;
  metrics: TrackallSolanaPlatformMetrics | null;
  metricsError: string | null;
  metricsStatus: "idle" | "loading" | "ready" | "error";
  requestedId: string | null;
  onBack: () => void;
  onOpenNetwork: (networkId: string) => void;
  onOpenWallet: (address: string) => void;
};

type WalletSortKey = "rank" | "totalUsd" | "positionCount" | "capturedAt";
type SortDirection = "asc" | "desc";
type ChartRange = "7d" | "14d" | "30d";
type ProtocolMetricKey = "tvl" | "volume" | "users" | "transactions";
type ProtocolMetricCardKey = ProtocolMetricKey;
type ProtocolChartPoint = {
  label: string;
  timestamp: string;
  tvl: number | null;
  volume: number | null;
  users: number | null;
  transactions: number | null;
};
type ProtocolDetailMetric = {
  key: ProtocolMetricCardKey;
  label: string;
  value: number | null;
  format: "usd" | "number";
  change24h: number | null;
};
type ProtocolDetail = {
  chart: ProtocolChartPoint[];
  metrics: ProtocolDetailMetric[];
};
type WalletsState = {
  asOfRunId: number | null;
  error: string | null;
  status: "idle" | "loading" | "ready" | "error";
  wallets: TrackallTopWallet[];
};

const METRIC_KEYS = ["tvl", "volume", "users", "transactions"] as const;
const CHART_METRIC_KEYS: ProtocolMetricKey[] = ["tvl", "volume", "users", "transactions"];
const CHART_RANGES: { key: ChartRange; label: string; size: number }[] = [
  { key: "7d", label: "7D", size: 7 },
  { key: "14d", label: "14D", size: 14 },
  { key: "30d", label: "30D", size: 30 },
];

function protocolInitials(protocol: Protocol) {
  const symbol = protocol.symbol?.trim();
  if (symbol) return symbol.slice(0, 4);
  return protocol.name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function metricValue(metric: ProtocolDetailMetric) {
  if (metric.value == null) return "—";
  return metric.format === "usd" ? formatUsd(metric.value) : formatNumber(metric.value);
}

function metricIcon(key: ProtocolMetricCardKey) {
  if (key === "tvl") return <WalletIcon className="size-4" />;
  if (key === "volume") return <ActivityIcon className="size-4" />;
  if (key === "users") return <UsersIcon className="size-4" />;
  return <ActivityIcon className="size-4" />;
}

function chartLabel(metric: ProtocolMetricKey) {
  if (metric === "tvl") return "Total value locked";
  if (metric === "volume") return "Protocol volume";
  if (metric === "users") return "Active users";
  return "Transactions";
}

function chartValue(metric: ProtocolMetricKey, value: number | null) {
  if (value == null) return "—";
  return metric === "users" || metric === "transactions" ? formatNumber(value) : formatUsd(value);
}

function axisValue(metric: ProtocolMetricKey, value: number) {
  return metric === "users" || metric === "transactions" ? formatNumber(value) : formatUsd(value).replace(".00", "");
}

function chartColor(metric: ProtocolMetricKey) {
  if (metric === "tvl") return Chart.chartColor(0);
  if (metric === "volume") return Chart.chartColor(1);
  if (metric === "users") return Chart.chartColor(2);
  return Chart.chartColor(3);
}

function chartName(metric: ProtocolMetricKey) {
  if (metric === "tvl") return "TVL";
  if (metric === "volume") return "24h Volume";
  if (metric === "users") return "Active Users";
  return "Transactions";
}

function chartTabLabel(metric: ProtocolMetricKey) {
  if (metric === "tvl") return "TVL";
  if (metric === "volume") return "Volume";
  if (metric === "users") return "Users";
  return "Transactions";
}

function shouldShowMetricCard(metric: ProtocolDetailMetric) {
  if (metric.key === "tvl" || metric.key === "volume") return metric.value != null;
  if (metric.key === "users") return metric.value != null && metric.value > 0;
  return true;
}

function metricGridClassName(count: number) {
  if (count <= 1) return "grid grid-cols-1 gap-3";
  if (count === 2) return "grid grid-cols-1 gap-3 sm:grid-cols-2";
  if (count === 3) return "grid grid-cols-1 gap-3 sm:grid-cols-3";
  return "grid grid-cols-2 gap-3 lg:grid-cols-4";
}

function hasChartMetricPoints(detail: ProtocolDetail, metric: ProtocolMetricKey) {
  return detail.chart.some((point) => point[metric] != null);
}

function isChartMetricAvailable(detail: ProtocolDetail, metric: ProtocolMetricKey) {
  if (metric === "tvl" || metric === "volume") {
    const currentValue = detail.metrics.find((entry) => entry.key === metric)?.value ?? null;
    return currentValue != null || hasChartMetricPoints(detail, metric);
  }
  if (metric === "users") {
    const currentValue = detail.metrics.find((entry) => entry.key === metric)?.value ?? null;
    return (currentValue != null && currentValue > 0) || detail.chart.some((point) => (point.users ?? 0) > 0);
  }
  return true;
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

function walletTone(address: string) {
  let hash = 0;
  for (let index = 0; index < address.length; index += 1) {
    hash = Math.imul(hash ^ address.charCodeAt(index), 16777619);
  }
  return WALLET_TONES[(hash >>> 0) % WALLET_TONES.length] ?? WALLET_TONES[0]!;
}

function sortWallets(wallets: TrackallTopWallet[], key: WalletSortKey, direction: SortDirection) {
  return [...wallets].sort((a, b) => {
    const result =
      key === "capturedAt"
        ? Date.parse(a.capturedAt) - Date.parse(b.capturedAt)
        : a[key] - b[key];
    return direction === "asc" ? result : -result;
  });
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

function csvCell(value: number | string | null) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportWalletRows(protocol: Protocol, wallets: TrackallTopWallet[], asOfRunId: number | null) {
  const rows = [
    ["rank", "address", "totalUsd", "positionCount", "capturedAt", "platformId", "asOfRunId"],
    ...wallets.map((wallet) => [
      String(wallet.rank),
      wallet.address,
      String(wallet.totalUsd),
      String(wallet.positionCount),
      wallet.capturedAt,
      protocol.id,
      asOfRunId == null ? "" : String(asOfRunId),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${protocol.id}-top-wallets.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function chartPointLabel(timestamp: string) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return "—";
  if (date.getUTCHours() !== 0 || date.getUTCMinutes() !== 0) {
    return date.toLocaleDateString("en-US", { day: "numeric", hour: "numeric", month: "short" });
  }
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function buildProtocolChart(metrics: TrackallSolanaPlatformMetrics | null): ProtocolChartPoint[] {
  const pointsByTimestamp = new Map<string, ProtocolChartPoint>();

  function ensurePoint(timestamp: string) {
    let point = pointsByTimestamp.get(timestamp);
    if (!point) {
      point = {
        label: chartPointLabel(timestamp),
        timestamp,
        tvl: null,
        volume: null,
        users: null,
        transactions: null,
      };
      pointsByTimestamp.set(timestamp, point);
    }
    return point;
  }

  for (const point of metrics?.plot ?? []) {
    const chartPoint = ensurePoint(point.timestamp);
    chartPoint.tvl = point.tvlUsd;
    chartPoint.volume = point.volume24hUsd;
  }

  for (const point of metrics?.transactionsPlot ?? []) {
    ensurePoint(point.timestamp).transactions = point.transactionCount;
  }

  for (const point of metrics?.usersPlot ?? []) {
    ensurePoint(point.timestamp).users = point.activeUsers;
  }

  return Array.from(pointsByTimestamp.values()).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

function buildProtocolDetail(protocol: Protocol, metrics: TrackallSolanaPlatformMetrics | null): ProtocolDetail {
  return {
    chart: buildProtocolChart(metrics),
    metrics: [
      {
        key: "tvl",
        label: "TVL",
        value: metrics?.tvlUsd ?? null,
        format: "usd",
        change24h: metrics?.tvlChange24hPct ?? null,
      },
      {
        key: "volume",
        label: "24h Volume",
        value: metrics?.volume24hUsd ?? null,
        format: "usd",
        change24h: metrics?.volumeChange24hPct ?? null,
      },
      {
        key: "users",
        label: "Active Users",
        value: protocol.activeUsers ?? null,
        format: "number",
        change24h: null,
      },
      {
        key: "transactions",
        label: "Transactions",
        value: metrics?.transactionCount ?? null,
        format: "number",
        change24h: null,
      },
    ],
  };
}

function DeltaPill({ value }: { value: number | null }) {
  if (value == null) {
    return (
      <span className="inline-flex items-center rounded bg-muted/45 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        —
      </span>
    );
  }

  const positive = value >= 0;
  return (
    <span
      className={
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] " +
        (positive
          ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/12 text-rose-600 dark:text-rose-400")
      }
    >
      {positive ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
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
    const range = Math.max(1, max - min);
    const width = 200;
    const height = 54;
    const padY = 6;
    const coords = points.map((value, index) => {
      const x = (index / Math.max(1, points.length - 1)) * width;
      const y = padY + (1 - (value - min) / range) * (height - padY * 2);
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
        <h2 className="mt-3 font-heading text-2xl tracking-tight">Protocol not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No local MVP protocol matches{" "}
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

function StatCard({ metric, chart }: { metric: ProtocolDetailMetric; chart: ProtocolChartPoint[] }) {
  const positive = (metric.change24h ?? 0) >= 0;
  const sparkValues = chart
    .map((point) => point[metric.key])
    .filter((value): value is number => value != null)
    .slice(-14);
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {metric.label}
        </div>
        <span className="text-muted-foreground/60">{metricIcon(metric.key)}</span>
      </div>
      <div className="mt-2 font-heading text-3xl tracking-tight tabular-nums">
        {metricValue(metric)}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <DeltaPill value={metric.change24h} />
        <span className="text-xs text-muted-foreground">
          {metric.change24h == null ? "24h change unavailable" : "vs prev 24h"}
        </span>
      </div>
      {sparkValues.length > 1 ? (
        <Sparkline values={sparkValues} positive={positive} className="mt-3 h-10 w-full" />
      ) : (
        <div className="mt-3 grid h-10 place-items-center rounded-md border border-dashed border-border/60 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          No plot
        </div>
      )}
    </div>
  );
}

function ActivityChartCard({
  availableMetrics,
  metric,
  range,
  points,
  onMetricChange,
  onRangeChange,
}: {
  availableMetrics: ProtocolMetricKey[];
  metric: ProtocolMetricKey;
  range: ChartRange;
  points: ProtocolChartPoint[];
  onMetricChange: (next: ProtocolMetricKey) => void;
  onRangeChange: (next: ChartRange) => void;
}) {
  const gradientId = useId().replace(/:/g, "");
  const chartData = useMemo(
    () =>
      points.map((point) => ({
        label: point.label,
        value: point[metric],
      })),
    [metric, points],
  );
  const tickInterval = Math.max(0, Math.floor(points.length / 6) - 1);
  const values = points.map((point) => point[metric]).filter((value): value is number => value != null);
  const latest = values.at(-1) ?? null;
  const first = values.at(0) ?? latest;
  const delta = latest == null || first == null || first === 0 ? null : ((latest - first) / first) * 100;
  const color = chartColor(metric);

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
            onValueChange={(value) => onMetricChange(value as ProtocolMetricKey)}
          >
            <TabsList aria-label="Chart metric">
              {availableMetrics.map((entry) => (
                <TabsTab key={entry} value={entry}>
                  {chartTabLabel(entry)}
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

      {values.length > 1 ? (
        <Chart.ChartContainer className="mt-4 h-60 [&_.recharts-cartesian-axis-tick_text]:!tracking-normal">
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </linearGradient>
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
              tickFormatter={(value) => axisValue(metric, Number(value))}
              tick={{ fontSize: 10, letterSpacing: 0 }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={8}
              stroke="currentColor"
            />
            <Chart.ChartTooltip />
            <Area
              type="monotone"
              dataKey="value"
              name={chartName(metric)}
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              connectNulls
            />
          </AreaChart>
        </Chart.ChartContainer>
      ) : (
        <div className="mt-4 grid h-60 place-items-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
          No Trackall plot data returned for this metric.
        </div>
      )}
    </section>
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

export function ProtocolPage({
  protocol,
  metrics,
  metricsError,
  metricsStatus,
  requestedId,
  onBack,
  onOpenNetwork,
  onOpenWallet,
}: Props) {
  const [chartMetric, setChartMetric] = useState<ProtocolMetricKey>("tvl");
  const [chartRange, setChartRange] = useState<ChartRange>("30d");
  const [search, setSearch] = useState("");
  const [walletsState, setWalletsState] = useState<WalletsState>({
    asOfRunId: null,
    error: null,
    status: "idle",
    wallets: [],
  });
  const [sortKey, setSortKey] = useState<WalletSortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(12);
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!protocol) {
      setWalletsState({ asOfRunId: null, error: null, status: "idle", wallets: [] });
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setSearch("");
    setPage(0);
    setSelectedWallets(new Set());
    setSortKey("rank");
    setSortDirection("asc");
    setWalletsState({ asOfRunId: null, error: null, status: "loading", wallets: [] });

    fetchSolanaTopPortfolioWallets(
      protocol.id,
      100,
      {
        apiKey: import.meta.env.VITE_TRACKALL_API_KEY,
        baseUrl: import.meta.env.VITE_TRACKALL_API_URL,
      },
      controller.signal,
    )
      .then((result) => {
        if (cancelled) return;
        const platform = result.platforms.find((entry) => entry.platformId === protocol.id) ?? result.platforms[0];
        setWalletsState({
          asOfRunId: result.asOfRunId,
          error: null,
          status: "ready",
          wallets: platform?.wallets ?? [],
        });
      })
      .catch((error) => {
        if (cancelled || controller.signal.aborted) return;
        console.error(error);
        setWalletsState({
          asOfRunId: null,
          error: error instanceof Error ? error.message : "Unable to load wallets",
          status: "error",
          wallets: [],
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [protocol?.id]);

  const detail = useMemo(() => (protocol ? buildProtocolDetail(protocol, metrics) : null), [metrics, protocol]);
  const availableChartMetrics = useMemo(() => {
    if (!detail) return [];
    return CHART_METRIC_KEYS.filter((metric) => isChartMetricAvailable(detail, metric));
  }, [detail]);
  const chartPoints = useMemo(() => {
    if (!detail) return [];
    const size = CHART_RANGES.find((entry) => entry.key === chartRange)?.size ?? 30;
    return detail.chart.filter((point) => point[chartMetric] != null).slice(-size);
  }, [chartMetric, chartRange, detail]);
  const visibleMetrics = useMemo(() => {
    if (!detail) return [];
    const lookup = new Map(detail.metrics.map((metric) => [metric.key, metric]));
    return METRIC_KEYS.map((key) => lookup.get(key))
      .filter((metric): metric is ProtocolDetailMetric => Boolean(metric))
      .filter(shouldShowMetricCard);
  }, [detail]);

  useEffect(() => {
    if (!detail || availableChartMetrics.includes(chartMetric)) return;
    setChartMetric(availableChartMetrics[0] ?? "users");
  }, [availableChartMetrics, chartMetric, detail]);
  const filteredWallets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return walletsState.wallets;
    return walletsState.wallets.filter((wallet) =>
      `${wallet.rank} ${wallet.address}`.toLowerCase().includes(query),
    );
  }, [search, walletsState.wallets]);
  const sortedWallets = useMemo(
    () => sortWallets(filteredWallets, sortKey, sortDirection),
    [filteredWallets, sortDirection, sortKey],
  );
  const totalPages = Math.max(1, Math.ceil(sortedWallets.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedWallets = sortedWallets.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const allOnPage = pagedWallets.length > 0 && pagedWallets.every((wallet) => selectedWallets.has(wallet.address));
  const someOnPage = !allOnPage && pagedWallets.some((wallet) => selectedWallets.has(wallet.address));

  if (!protocol || !detail) return <NotFound requestedId={requestedId} onBack={onBack} />;
  const symbol = protocol.symbol?.trim();

  const selectSort = (key: WalletSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "rank" ? "asc" : "desc");
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
      for (const wallet of pagedWallets) {
        if (allOnPage) next.delete(wallet.address);
        else next.add(wallet.address);
      }
      return next;
    });
  };
  const start = sortedWallets.length === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min(sortedWallets.length, (safePage + 1) * pageSize);

  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto overflow-x-hidden bg-background pt-[64px] text-foreground"
      aria-label={`${protocol.name} protocol analytics`}
    >
      <header className="border-b border-border/60 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Protocol · {protocol.name}
          </div>
          {protocol.website ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              render={<a href={protocol.website} target="_blank" rel="noreferrer" />}
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
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/40 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {protocol.logo ? (
                <img src={protocol.logo} alt="" className="size-full rounded-xl object-cover" />
              ) : (
                protocolInitials(protocol)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                {symbol ? `${protocol.category} · ${symbol}` : protocol.category}
              </div>
              <h1 className="mt-1 font-heading text-3xl tracking-tight">{protocol.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {protocol.description}
              </p>
              {(protocol.activeUsers != null && protocol.activeUsers > 0) || metrics?.transactionCount != null ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {protocol.activeUsers != null && protocol.activeUsers > 0 ? (
                    <Badge variant="outline" className="gap-1.5 font-mono text-[10px]">
                      <UsersIcon className="size-3" />
                      {protocol.activeUsers.toLocaleString("en-US")} active users
                    </Badge>
                  ) : null}
                  {metrics?.transactionCount != null ? (
                    <Badge variant="outline" className="gap-1.5 font-mono text-[10px]">
                      <ActivityIcon className="size-3" />
                      {metrics.transactionCount.toLocaleString("en-US")} transactions
                    </Badge>
                  ) : null}
                </div>
              ) : null}
              {metricsStatus === "error" && metricsError ? (
                <div className="mt-3 text-xs text-muted-foreground">{metricsError}</div>
              ) : null}
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-border/60 pt-4 sm:grid-cols-3">
            {symbol ? (
              <div>
                <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Symbol
                </dt>
                <dd className="mt-1 text-sm">{symbol}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Chains
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-1">
                {protocol.networks.map((name) => {
                  const networkId = nameToNetworkId(name);
                  if (!networkId) {
                    return (
                      <Badge key={name} variant="outline" className="font-mono text-[10px]">
                        {name}
                      </Badge>
                    );
                  }
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onOpenNetwork(networkId)}
                      className="inline-flex h-6 items-center gap-1 rounded-md border border-border/60 bg-background/40 px-2 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted/55 hover:text-foreground"
                      aria-label={`Open ${name} network`}
                    >
                      {name}
                      <ArrowUpRightIcon className="size-3 opacity-70" />
                    </button>
                  );
                })}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Location
              </dt>
              <dd className="mt-1 text-sm">{formatProtocolLocation(protocol)}</dd>
            </div>
          </dl>
        </section>

        <section className={metricGridClassName(visibleMetrics.length)}>
          {visibleMetrics.map((metric) => (
            <StatCard key={metric.key} metric={metric} chart={detail.chart} />
          ))}
        </section>

        <ActivityChartCard
          availableMetrics={availableChartMetrics}
          metric={chartMetric}
          range={chartRange}
          points={chartPoints}
          onMetricChange={setChartMetric}
          onRangeChange={setChartRange}
        />

        <section className="rounded-xl border border-border/60 bg-background/40">
          <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Wallets
              </div>
              {walletsState.asOfRunId != null ? (
                <Badge variant="outline" className="font-mono text-[10px]">
                  Run {walletsState.asOfRunId}
                </Badge>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={sortedWallets.length === 0}
              onClick={() => exportWalletRows(protocol, sortedWallets, walletsState.asOfRunId)}
            >
              <DownloadIcon />
              Export
            </Button>
          </header>

          <div className="flex flex-col gap-2.5 border-b border-border/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              {walletsState.status === "loading"
                ? "Loading"
                : `${sortedWallets.length.toLocaleString("en-US")} wallets`}
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
                <SortableHead
                  active={sortKey === "rank"}
                  direction={sortDirection}
                  label="Rank"
                  onClick={() => selectSort("rank")}
                />
                <TableHead className="text-xs font-medium text-muted-foreground">Wallet</TableHead>
                <SortableHead
                  active={sortKey === "totalUsd"}
                  align="right"
                  direction={sortDirection}
                  label="Total value"
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
                  active={sortKey === "capturedAt"}
                  align="right"
                  direction={sortDirection}
                  label="Captured"
                  onClick={() => selectSort("capturedAt")}
                />
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-border/60">
              {walletsState.status === "loading" ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    Loading wallets from Trackall API.
                  </TableCell>
                </TableRow>
              ) : walletsState.status === "error" ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {walletsState.error ?? "Could not load wallets."}
                  </TableCell>
                </TableRow>
              ) : pagedWallets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {search.trim() ? "No wallets match this search." : "No wallets returned for this protocol."}
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
                      <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                        #{wallet.rank}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className={"size-8 shrink-0 " + walletTone(wallet.address)}>
                            <AvatarFallback className="bg-transparent font-mono text-[11px] font-medium">
                              {wallet.address.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
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
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUsd(wallet.totalUsd)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {wallet.positionCount.toLocaleString("en-US")}
                      </TableCell>
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
