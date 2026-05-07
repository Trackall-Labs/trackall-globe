import { ActivityIcon, DatabaseIcon, RadioTowerIcon, TrendingUpIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card } from "@orbit/ui/card";
import { clamp, fmtCompact, fmtUsd } from "@/lib/format";
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

function lagTone(value: number | null) {
  if (value == null) return "pending";
  if (value < 1_000) return "fresh";
  if (value < 3_000) return "lagging";
  return "stale";
}

function formatLag(value: number | null) {
  if (value == null) return "Pending";
  if (value < 1_000) return `${Math.round(value)} ms`;
  return `${(value / 1_000).toFixed(1)} s`;
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
  const visible = blocks.slice(0, compact ? 24 : 32).reverse();
  const lastDurationMs = useMemo(() => lastBlockDurationMs(blocks), [blocks]);

  return (
    <Card className="data-panel block-panel" data-status={streamStatus} render={<aside />}>
      <div className="panel-header">
        <div className="panel-title">
          <span className="live-dot" />
          <span>Block Stream</span>
        </div>
        <span className="panel-kpi tabular-nums">{latest ? blockTitle(latest) : "..."}</span>
      </div>
      {visible.length > 0 ? (
        <div
          className="block-bars"
          aria-label="Recent Solana blocks"
          onPointerLeave={() => setHoveredBlock(null)}
        >
          {visible.map((block) => (
            <BlockCandle
              key={block.id}
              block={block}
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
          ))}
        </div>
      ) : (
        <div className="block-empty-state" role="status">
          {streamError ?? streamStatusLabel(streamStatus, false)}
        </div>
      )}
      {hoveredBlock ? <BlockHoverCard preview={hoveredBlock} /> : null}
      <div className="panel-footer">
        <span>{streamError ?? streamStatusLabel(streamStatus, blocks.length > 0)}</span>
        <strong className={`${latencyColor(lastDurationMs)} tabular-nums`}>
          {latest ? formatMs(lastDurationMs) : "No blocks"}
        </strong>
      </div>
    </Card>
  );
}

function BlockCandle({
  block,
  onBlur,
  onPreview,
}: {
  block: BlockEntry;
  onBlur: () => void;
  onPreview: (event: React.FocusEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const lag = block.receivedLagMs ?? 2_000;
  const height = `${Math.round(clamp(46 - lag / 100, 18, 46))}px`;
  const tone = lagTone(block.receivedLagMs);

  return (
    <button
      aria-label={`${block.blockHeight ? `Block ${block.blockHeight}` : `Slot ${block.slot}`}, received ${formatLag(block.receivedLagMs)}`}
      className={`block-bar block-bar-${tone}`}
      onBlur={onBlur}
      onFocus={onPreview}
      onPointerEnter={onPreview}
      style={{ height }}
      type="button"
    />
  );
}

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
        <Metric icon={<RadioTowerIcon />} label="Live TPS" value={liveTps} format={formatTps} />
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
  value,
  format,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  format: (n: number) => string;
  delta?: string;
}) {
  const deltaVariant = delta?.startsWith("-") ? "error" : delta?.startsWith("+") ? "success" : "info";

  return (
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      <span className="metric-label">{label}</span>
      <strong className="tabular-nums">
        <AnimatedNumber value={value} format={format} />
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
