import { useId, useMemo, useState } from "react";
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
  DatabaseIcon,
  DownloadIcon,
  ExternalLinkIcon,
  SearchIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { Area, AreaChart } from "recharts";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Checkbox } from "@orbit/ui/checkbox";
import { Input } from "@orbit/ui/input";
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
  ACTIVITY_WINDOWS,
  PAGE_SIZE_OPTIONS,
  RISK_TIERS,
  USER_TYPES,
  buildProtocolDetailMock,
  formatDelta,
  formatLastActive,
  formatNumber,
  formatSignedUsd,
  formatUsd,
  shortWallet,
  type ProtocolActivityWindow,
  type ProtocolChartPoint,
  type ProtocolDetailMetric,
  type ProtocolMetricKey,
  type ProtocolRiskTier,
  type ProtocolUserRow,
  type ProtocolUserType,
} from "@/lib/protocol-stats";
import type { Protocol } from "@/lib/types";

type Props = {
  protocol: Protocol | null;
  requestedId: string | null;
  onBack: () => void;
  onOpenNetwork: (networkId: string) => void;
  onOpenWallet: (address: string) => void;
};

type FilterValue = "all";
type UserSortKey =
  | "depositedTvl"
  | "volume30d"
  | "netFlow"
  | "pnl"
  | "lastActiveHours";
type SortDirection = "asc" | "desc";
type ChartRange = "7d" | "14d" | "30d";

const METRIC_KEYS = ["tvl", "volume", "users", "deposits"] as const;
const CHART_RANGES: { key: ChartRange; label: string; size: number }[] = [
  { key: "7d", label: "7D", size: 7 },
  { key: "14d", label: "14D", size: 14 },
  { key: "30d", label: "30D", size: 30 },
];

function protocolInitials(protocol: Protocol) {
  return protocol.symbol.slice(0, 4);
}

function metricValue(metric: ProtocolDetailMetric) {
  return metric.format === "usd" ? formatUsd(metric.value) : formatNumber(metric.value);
}

function metricIcon(key: ProtocolDetailMetric["key"]) {
  if (key === "tvl") return <WalletIcon className="size-4" />;
  if (key === "volume") return <ActivityIcon className="size-4" />;
  if (key === "users") return <UsersIcon className="size-4" />;
  return <DatabaseIcon className="size-4" />;
}

function chartLabel(metric: ProtocolMetricKey) {
  if (metric === "tvl") return "Total value locked";
  if (metric === "volume") return "Protocol volume";
  return "Active users";
}

function chartValue(metric: ProtocolMetricKey, value: number) {
  return metric === "users" ? formatNumber(value) : formatUsd(value);
}

function axisValue(metric: ProtocolMetricKey, value: number) {
  if (metric === "users") return formatNumber(value);
  return formatUsd(value).replace(".00", "");
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
  return WALLET_TONES[parseInt(address.slice(2, 4), 16) % WALLET_TONES.length] ?? WALLET_TONES[0]!;
}

function sortUsers(users: ProtocolUserRow[], key: UserSortKey, direction: SortDirection) {
  return [...users].sort((a, b) => {
    const result = a[key] - b[key];
    return direction === "asc" ? result : -result;
  });
}

function DeltaPill({ value }: { value: number }) {
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
  const positive = metric.changes.h24 >= 0;
  const sparkKey: ProtocolMetricKey = metric.key === "volume" || metric.key === "users" ? metric.key : "tvl";
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
        <DeltaPill value={metric.changes.h24} />
        <span className="text-xs text-muted-foreground">vs prev 24h</span>
      </div>
      <Sparkline
        values={chart.slice(-14).map((point) => point[sparkKey])}
        positive={positive}
        className="mt-3 h-10 w-full"
      />
    </div>
  );
}

function ActivityChartCard({
  metric,
  range,
  points,
  protocol,
  onMetricChange,
  onRangeChange,
}: {
  metric: ProtocolMetricKey;
  range: ChartRange;
  points: ProtocolChartPoint[];
  protocol: Protocol;
  onMetricChange: (next: ProtocolMetricKey) => void;
  onRangeChange: (next: ChartRange) => void;
}) {
  const gradientId = useId().replace(/:/g, "");
  const series = useMemo(() => {
    const names = protocol.networks.length > 0 ? protocol.networks.slice(0, 3) : [protocol.category];
    const weights = names.map((_, index) => 1 / (index + 1.35));
    const total = weights.reduce((sum, value) => sum + value, 0);
    return names.map((name, index) => ({
      color: Chart.chartColor(index),
      key: `series${index}`,
      name,
      weight: weights[index]! / total,
    }));
  }, [protocol.category, protocol.networks]);
  const today = useMemo(() => new Date(), []);
  const chartData = useMemo(
    () =>
      points.map((point) => {
        const daysAgo = parseInt(point.label.replace("D-", ""), 10);
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const row: Record<string, number | string> = { label };
        for (const item of series) row[item.key] = point[metric] * item.weight;
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
            onValueChange={(value) => onMetricChange(value as ProtocolMetricKey)}
          >
            <TabsList aria-label="Chart metric">
              <TabsTab value="tvl">TVL</TabsTab>
              <TabsTab value="volume">Volume</TabsTab>
              <TabsTab value="users">Users</TabsTab>
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
                stackId="protocol"
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

export function ProtocolPage({ protocol, requestedId, onBack, onOpenNetwork, onOpenWallet }: Props) {
  const [chartMetric, setChartMetric] = useState<ProtocolMetricKey>("tvl");
  const [chartRange, setChartRange] = useState<ChartRange>("30d");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProtocolUserType | FilterValue>("all");
  const [riskFilter, setRiskFilter] = useState<ProtocolRiskTier | FilterValue>("all");
  const [activityFilter, setActivityFilter] = useState<ProtocolActivityWindow | FilterValue>("all");
  const [sortKey, setSortKey] = useState<UserSortKey>("depositedTvl");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(12);
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(() => new Set());

  const detail = useMemo(() => (protocol ? buildProtocolDetailMock(protocol) : null), [protocol]);
  const chartPoints = useMemo(() => {
    if (!detail) return [];
    const size = CHART_RANGES.find((entry) => entry.key === chartRange)?.size ?? 30;
    return detail.chart.slice(-size);
  }, [chartRange, detail]);
  const visibleMetrics = useMemo(() => {
    if (!detail) return [];
    const lookup = new Map(detail.metrics.map((metric) => [metric.key, metric]));
    return METRIC_KEYS.map((key) => lookup.get(key)).filter(Boolean) as ProtocolDetailMetric[];
  }, [detail]);
  const filteredUsers = useMemo(() => {
    if (!detail) return [];
    const query = search.trim().toLowerCase();
    return detail.users.filter((user) => {
      if (query && !`${user.wallet} ${user.network} ${user.type}`.toLowerCase().includes(query)) return false;
      if (typeFilter !== "all" && user.type !== typeFilter) return false;
      if (riskFilter !== "all" && user.risk !== riskFilter) return false;
      if (activityFilter !== "all" && user.activity !== activityFilter) return false;
      return true;
    });
  }, [activityFilter, detail, riskFilter, search, typeFilter]);
  const sortedUsers = useMemo(
    () => sortUsers(filteredUsers, sortKey, sortDirection),
    [filteredUsers, sortDirection, sortKey],
  );
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedUsers = sortedUsers.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const allOnPage = pagedUsers.length > 0 && pagedUsers.every((user) => selectedWallets.has(user.wallet));
  const someOnPage = !allOnPage && pagedUsers.some((user) => selectedWallets.has(user.wallet));

  if (!protocol || !detail) return <NotFound requestedId={requestedId} onBack={onBack} />;

  const selectSort = (key: UserSortKey) => {
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
      for (const user of pagedUsers) {
        if (allOnPage) next.delete(user.wallet);
        else next.add(user.wallet);
      }
      return next;
    });
  };
  const start = sortedUsers.length === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min(sortedUsers.length, (safePage + 1) * pageSize);

  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto overflow-x-hidden bg-background pt-[64px] text-foreground"
      aria-label={`${protocol.name} protocol analytics`}
    >
      <header className="border-b border-border/60 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Protocol · Local mock
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
                {protocol.category} · {protocol.symbol}
              </div>
              <h1 className="mt-1 font-heading text-3xl tracking-tight">{protocol.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {protocol.description}
              </p>
              {(protocol.activeUsers != null && protocol.activeUsers > 0) || protocol.programIds ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {protocol.activeUsers != null && protocol.activeUsers > 0 ? (
                    <Badge variant="outline" className="gap-1.5 font-mono text-[10px]">
                      <UsersIcon className="size-3" />
                      {protocol.activeUsers.toLocaleString("en-US")} active users
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="gap-1.5 font-mono text-[10px]">
                    <DatabaseIcon className="size-3" />
                    {(protocol.programIds?.length ?? 0).toLocaleString("en-US")} indexed programs
                  </Badge>
                </div>
              ) : null}
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-border/60 pt-4 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Symbol
              </dt>
              <dd className="mt-1 text-sm">{protocol.symbol}</dd>
            </div>
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

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {visibleMetrics.map((metric) => (
            <StatCard key={metric.key} metric={metric} chart={detail.chart} />
          ))}
        </section>

        <ActivityChartCard
          metric={chartMetric}
          range={chartRange}
          points={chartPoints}
          protocol={protocol}
          onMetricChange={setChartMetric}
          onRangeChange={setChartRange}
        />

        <section className="rounded-xl border border-border/60 bg-background/40">
          <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Wallets
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
              {pagedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No users match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedUsers.map((user) => {
                  const selected = selectedWallets.has(user.wallet);
                  return (
                    <TableRow key={user.wallet} data-state={selected ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleWallet(user.wallet)}
                          aria-label={`Select ${shortWallet(user.wallet)}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className={"size-8 shrink-0 " + walletTone(user.wallet)}>
                            <AvatarFallback className="bg-transparent font-mono text-[11px] font-medium">
                              {user.wallet.slice(2, 4).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={getPortfolioAddressPath(user.wallet)}
                                onClick={(event) => {
                                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                                  event.preventDefault();
                                  onOpenWallet(user.wallet);
                                }}
                                className="wallet-address-link font-mono text-xs"
                                aria-label={`Open ${shortWallet(user.wallet)} portfolio`}
                              >
                                {shortWallet(user.wallet)}
                              </a>
                              <button
                                type="button"
                                onClick={() => void navigator.clipboard?.writeText(user.wallet)}
                                aria-label="Copy wallet"
                                className="text-muted-foreground/60 transition-colors hover:text-foreground"
                              >
                                <CopyIcon className="size-3" />
                              </button>
                              <span
                                className={"size-1.5 shrink-0 rounded-full " + (RISK_DOT[user.risk] ?? "bg-border")}
                              />
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-muted-foreground">{user.network}</span>
                              <Badge variant="outline" className="h-4 px-1 font-mono text-[9px]">{user.type}</Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUsd(user.depositedTvl)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUsd(user.volume30d)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={"tabular-nums text-xs font-medium " + flowClass(user.netFlow)}>
                          {formatSignedUsd(user.netFlow)}
                        </div>
                        <div className="mt-0.5 tabular-nums text-[10px] text-muted-foreground">
                          PnL {formatSignedUsd(user.pnl)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatLastActive(user.lastActiveHours)}
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
                {start}-{end} of {sortedUsers.length}
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
