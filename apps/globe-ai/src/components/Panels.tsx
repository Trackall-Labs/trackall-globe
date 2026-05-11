import { ActivityIcon, DatabaseIcon, RadioTowerIcon, TrendingUpIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card } from "@orbit/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@orbit/ui/tooltip";
import { fmtCompact, fmtUsd } from "@/lib/format";
import { type Network } from "@/lib/networks";
import type { TrackallSolanaChainMetrics } from "@/lib/trackall-api";
import type { BlockEntry, BlockStreamStatus } from "@/lib/use-block-stream";

type BlockPanelProps = {
  blocks: BlockEntry[];
  compact?: boolean;
  streamError?: string | null;
  streamStatus: BlockStreamStatus;
};

type MarketPanelProps = {
  chainMetrics?: TrackallSolanaChainMetrics | null;
  compact?: boolean;
  liveTps: number;
  network?: Network | null;
  protocolCount: number;
};

type BlockPreview = {
  block: BlockEntry;
  x: number;
  y: number;
};

function latencyColor(value: number | null) {
  if (value == null) return "latency-ok";
  if (value < 1_000) return "latency-good";
  if (value < 3_000) return "latency-ok";
  return "latency-warn";
}

function formatLag(value: number | null) {
  if (value == null) return "Pending";
  if (value < 1_000) return `${Math.round(value)} ms`;
  return `${(value / 1_000).toFixed(1)} s`;
}

const BLOCK_BAR_MIN_PX = 18;
const BLOCK_BAR_MAX_PX = 46;
const BLOCK_INTERVAL_MIN_MS = 200;
const BLOCK_INTERVAL_MAX_MS = 1_200;
const CONFIRMATION_DEPTH = 32;

type LiveBlockState = "processed" | "finalized" | "confirmed";

function liveBlockState(ageFromNewest: number): LiveBlockState {
  if (ageFromNewest === 0) return "processed";
  if (ageFromNewest < CONFIRMATION_DEPTH) return "finalized";
  return "confirmed";
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

function averageIntervalMs(intervals: (number | null)[]) {
  let total = 0;
  let count = 0;
  for (const value of intervals) {
    if (value == null) continue;
    total += value;
    count += 1;
  }
  return count === 0 ? null : Math.round(total / count);
}

function intervalToHeightPx(intervalMs: number | null, fallbackMs: number) {
  const value = intervalMs ?? fallbackMs;
  const clamped = Math.max(BLOCK_INTERVAL_MIN_MS, Math.min(BLOCK_INTERVAL_MAX_MS, value));
  const ratio = (clamped - BLOCK_INTERVAL_MIN_MS) / (BLOCK_INTERVAL_MAX_MS - BLOCK_INTERVAL_MIN_MS);
  return `${BLOCK_BAR_MIN_PX + ratio * (BLOCK_BAR_MAX_PX - BLOCK_BAR_MIN_PX)}px`;
}

function formatMs(value: number | null) {
  return value == null ? "Pending" : `${Math.round(value)} ms`;
}

function formatTps(value: number) {
  if (value < 10) return value.toFixed(1);
  return fmtCompact(value);
}

function formatChangePct(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatHash(value: string | undefined) {
  if (!value) return "No hash";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function formatIsoTime(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

function formatBlockTime(value: string | undefined) {
  if (!value) return "No block time";
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return value;
  const ms = timestamp > 100_000_000_000 ? timestamp : timestamp * 1_000;
  return formatIsoTime(new Date(ms).toISOString());
}

function blockTitle(block: BlockEntry) {
  return block.blockHeight ? `#${Number(block.blockHeight).toLocaleString("en-US")}` : `Slot ${block.slot}`;
}

function streamStatusLabel(status: BlockStreamStatus, hasBlocks: boolean) {
  if (status === "subscribed") return "Live Solana";
  if (status === "connecting" && hasBlocks) return "Reconnecting";
  if (status === "connecting") return "Connecting";
  if (status === "error") return "Stream error";
  return "Idle";
}

function lastBlockDurationMs(blocks: BlockEntry[]) {
  const latest = blocks[0];
  const previous = blocks[1];
  if (!latest || !previous) return null;

  const latestReceivedAt = Date.parse(latest.receivedAt);
  const previousReceivedAt = Date.parse(previous.receivedAt);
  if (Number.isNaN(latestReceivedAt) || Number.isNaN(previousReceivedAt)) return null;

  return Math.max(0, latestReceivedAt - previousReceivedAt);
}

export function BlockHistoryPanel({ blocks, compact, streamError, streamStatus }: BlockPanelProps) {
  const latest = blocks[0];
  const [hoveredBlock, setHoveredBlock] = useState<BlockPreview | null>(null);
  const { ascending, intervals, fallbackIntervalMs } = useMemo(() => {
    const sorted = [...blocks].sort(compareLiveBlocksAscending).slice(-44);
    const intervalsMs = blockIntervalsMs(sorted);
    const avg = averageIntervalMs(intervalsMs);
    return { ascending: sorted, intervals: intervalsMs, fallbackIntervalMs: avg ?? 500 };
  }, [blocks]);
  const lastDurationMs = useMemo(() => lastBlockDurationMs(blocks), [blocks]);

  const hasEverHadBlocksRef = useRef(false);
  if (blocks.length > 0) hasEverHadBlocksRef.current = true;
  const [graceElapsed, setGraceElapsed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setGraceElapsed(true), 6_000);
    return () => window.clearTimeout(timer);
  }, []);
  const displayError = streamError && (hasEverHadBlocksRef.current || graceElapsed) ? streamError : null;
  const displayStatus: BlockStreamStatus =
    streamStatus === "error" && !displayError ? "connecting" : streamStatus;

  return (
    <Card className="data-panel block-panel" data-status={displayStatus} render={<aside />}>
      <div className="panel-header">
        <div className="panel-title">
          <span className="live-dot" />
          <span>Block Stream</span>
        </div>
        <span className="panel-kpi tabular-nums">{latest ? blockTitle(latest) : "..."}</span>
      </div>
      {ascending.length === 0 && (displayStatus === "error" || displayError) ? (
        <div className="block-empty-state" role="status">
          {displayError ?? streamStatusLabel(displayStatus, false)}
        </div>
      ) : (
        <div
          className="block-bars"
          aria-label="Recent Solana blocks"
          onPointerLeave={() => setHoveredBlock(null)}
        >
          {Array.from({ length: Math.max(0, SKELETON_BAR_COUNT - ascending.length) }, (_, i) => {
            const height = 20 + ((i * 13 + 7) % 24);
            const delay = (i * 70) % 1400;
            return (
              <span
                key={`skeleton-${i}`}
                className="block-bar block-bar-skeleton"
                style={{ height: `${height}px`, animationDelay: `${delay}ms` }}
                aria-hidden="true"
              />
            );
          })}
          {ascending.map((block, ascendingIndex) => {
            const ageFromNewest = ascending.length - 1 - ascendingIndex;
            const intervalMs = intervals[ascendingIndex] ?? null;
            return (
              <BlockCandle
                key={block.id}
                block={block}
                state={liveBlockState(ageFromNewest)}
                heightPx={intervalToHeightPx(intervalMs, fallbackIntervalMs)}
                intervalMs={intervalMs}
                onBlur={() => setHoveredBlock(null)}
                onPreview={(event) => {
                  const candleRect = event.currentTarget.getBoundingClientRect();
                  setHoveredBlock({
                    block,
                    x: Math.min(
                      Math.max(candleRect.left + candleRect.width / 2, 88),
                      window.innerWidth - 88,
                    ),
                    y: candleRect.top,
                  });
                }}
              />
            );
          })}
        </div>
      )}
      {hoveredBlock ? <BlockHoverCard preview={hoveredBlock} /> : null}
      <div className="panel-footer">
        <span>{displayError ?? streamStatusLabel(displayStatus, blocks.length > 0)}</span>
        <strong className={`${latencyColor(lastDurationMs)} tabular-nums`}>
          {latest ? formatMs(lastDurationMs) : "No blocks"}
        </strong>
      </div>
    </Card>
  );
}

function BlockCandle({
  block,
  state,
  heightPx,
  intervalMs,
  onBlur,
  onPreview,
}: {
  block: BlockEntry;
  state: LiveBlockState;
  heightPx: string;
  intervalMs: number | null;
  onBlur: () => void;
  onPreview: (event: React.FocusEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const label = block.blockHeight ? `Block ${block.blockHeight}` : `Slot ${block.slot}`;
  const intervalLabel = intervalMs == null ? "first block" : `+${intervalMs}ms`;

  return (
    <button
      aria-label={`${label}, ${state}, ${intervalLabel}`}
      className={`block-bar block-bar-${state}`}
      onBlur={onBlur}
      onFocus={onPreview}
      onPointerEnter={onPreview}
      style={{ height: heightPx }}
      type="button"
    />
  );
}

const SKELETON_BAR_COUNT = 44;

function BlockHoverCard({ preview }: { preview: BlockPreview }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="block-hover-card"
      style={{ left: `${preview.x}px`, top: `${preview.y}px` }}
      role="status"
    >
      <span className="block-tooltip-kicker">Solana block meta</span>
      <strong>{blockTitle(preview.block)}</strong>
      <span>Slot {Number(preview.block.slot).toLocaleString("en-US")}</span>
      <span>{formatHash(preview.block.blockhash)}</span>
      <span>Parent {preview.block.parentSlot ?? "unknown"}</span>
      <span>Block time {formatBlockTime(preview.block.blockTime)}</span>
      <span>Received {formatIsoTime(preview.block.receivedAt)} · {formatLag(preview.block.receivedLagMs)}</span>
    </div>,
    document.body,
  );
}

export function MarketMetricsPanel({
  chainMetrics,
  compact,
  liveTps,
  network,
  protocolCount,
}: MarketPanelProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1100);
    return () => window.clearInterval(interval);
  }, []);

  const tvl = chainMetrics?.tvlUsd ?? 62_460_000_000 + Math.sin(tick / 3) * 320_000_000;
  const volume = chainMetrics?.volume24hUsd ?? 14_240_000_000 + Math.cos(tick / 4) * 180_000_000;
  const tvlDelta = formatChangePct(chainMetrics?.tvlChange24hPct);
  const volumeDelta = formatChangePct(chainMetrics?.volumeChange24hPct);
  return (
    <Card className="data-panel market-panel" render={<aside />}>
      <div className="panel-header">
        <div className="panel-title">
          <span className="live-dot" />
          <span>Live Markets</span>
        </div>
        <span className="panel-kpi">{protocolCount} Protocols</span>
      </div>
      <div className="metric-grid" data-compact={compact ? "" : undefined}>
        <Metric icon={<TrendingUpIcon />} label="Total TVL" value={tvl} format={fmtUsd} delta={tvlDelta} />
        <Metric icon={<DatabaseIcon />} label="24h Volume" value={volume} format={fmtUsd} delta={volumeDelta} />
        <Metric icon={<RadioTowerIcon />} label="Live TPS" tooltip="DeFi transactions only" value={liveTps} format={formatTps} duration={400} />
      </div>
      <div className="panel-footer">
        <span className="network-footer-label">
          <img
            src={network?.logo ?? "/network-logos/solana.svg"}
            alt=""
            className="network-logo network-logo-img"
            aria-hidden="true"
          />
          {network ? network.name : "Mainnet"}
        </span>
        <strong>24h rolling</strong>
      </div>
    </Card>
  );
}

function Metric({
  icon,
  label,
  tooltip,
  value,
  format,
  duration,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
  value: number;
  format: (n: number) => string;
  duration?: number;
  delta?: string;
}) {
  const deltaVariant = delta?.startsWith("-") ? "error" : delta?.startsWith("+") ? "success" : "info";

  return (
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<span className="metric-label" />}>{label}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="metric-label">{label}</span>
      )}
      <strong className="tabular-nums">
        <AnimatedNumber value={value} format={format} duration={duration} />
      </strong>
      {delta ? (
        <Badge variant={deltaVariant} size="sm" className="metric-delta font-mono tabular-nums">
          {delta}
        </Badge>
      ) : null}
    </div>
  );
}

function AnimatedNumber({
  value,
  format,
  duration = 900,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const toRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  const reduceMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (reduceMotion.current) {
      setDisplay(value);
      return;
    }
    if (value === toRef.current) return;
    fromRef.current = display;
    toRef.current = value;
    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(fromRef.current + (toRef.current - fromRef.current) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: tween from current display, not on every display change
  }, [value, duration]);

  return <>{format(display)}</>;
}

export function MobilePanelTabs({
  active,
  onChange,
}: {
  active: "blocks" | "markets" | null;
  onChange: (value: "blocks" | "markets" | null) => void;
}) {
  return (
    <div className="mobile-tabs">
      <Button
        type="button"
        variant={active === "blocks" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(active === "blocks" ? null : "blocks")}
      >
        <ActivityIcon />
        Blocks
      </Button>
      <Button
        type="button"
        variant={active === "markets" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(active === "markets" ? null : "markets")}
      >
        <TrendingUpIcon />
        Markets
      </Button>
    </div>
  );
}
