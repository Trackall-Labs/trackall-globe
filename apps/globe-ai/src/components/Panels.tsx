import { ActivityIcon, DatabaseIcon, RadioTowerIcon, TrendingUpIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card } from "@orbit/ui/card";
import { fmtCompact, fmtUsd } from "@/lib/format";
import { type Network } from "@/lib/networks";
import type { BlockEntry } from "@/lib/use-block-stream";

type BlockPanelProps = {
  blocks: BlockEntry[];
  compact?: boolean;
};

type MarketPanelProps = {
  compact?: boolean;
  network?: Network | null;
  protocolCount: number;
};

type BlockPreview = {
  block: BlockEntry;
  x: number;
  y: number;
};

function latencyColor(value: number) {
  if (value < 620) return "latency-good";
  if (value < 980) return "latency-ok";
  return "latency-warn";
}

export function BlockHistoryPanel({ blocks, compact }: BlockPanelProps) {
  const latest = blocks[0];
  const [hoveredBlock, setHoveredBlock] = useState<BlockPreview | null>(null);
  const visible = blocks.slice(0, compact ? 24 : 32).reverse();
  const avgLatency = useMemo(() => {
    if (visible.length === 0) return 0;
    return Math.round(
      visible.reduce((total, block) => total + block.finalityMs, 0) / visible.length,
    );
  }, [visible]);

  return (
    <Card className="data-panel block-panel" render={<aside />}>
      <div className="panel-header">
        <div className="panel-title">
          <span className="live-dot" />
          <span>Block Stream</span>
        </div>
        <span className="panel-kpi tabular-nums">
          {latest ? (
            <AnimatedNumber
              value={latest.blockNum}
              format={(n) => `#${Math.round(n).toLocaleString("en-US")}`}
              duration={1100}
            />
          ) : null}
        </span>
      </div>
      <div
        className="block-bars"
        aria-label="Recent blocks"
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
      {hoveredBlock ? <BlockHoverCard preview={hoveredBlock} /> : null}
      <div className="panel-footer">
        <span>Avg latency</span>
        <strong className={`${latencyColor(avgLatency)} tabular-nums`}>
          <AnimatedNumber
            value={avgLatency}
            format={(n) => `${Math.round(n)} ms`}
            duration={900}
          />
        </strong>
      </div>
    </Card>
  );
}

function blockResultLabel(result: BlockEntry["proposalResult"]) {
  if (result === "success") return "Finalized";
  if (result === "failed") return "Failed";
  return "Pending";
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
  const height = `${Math.max(18, block.loadPct * 0.42)}px`;
  const resultLabel = blockResultLabel(block.proposalResult);

  return (
    <button
      aria-label={`Block ${block.blockNum.toLocaleString("en-US")}, ${resultLabel}, ${block.finalityMs}ms finality`}
      className={`block-bar block-bar-${block.proposalResult}`}
      onBlur={onBlur}
      onFocus={onPreview}
      onPointerEnter={onPreview}
      style={{ height }}
      type="button"
    />
  );
}

function BlockHoverCard({ preview }: { preview: BlockPreview }) {
  const resultLabel = blockResultLabel(preview.block.proposalResult);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="block-hover-card"
      style={{ left: `${preview.x}px`, top: `${preview.y}px` }}
      role="status"
    >
      <span className="block-tooltip-kicker">{resultLabel}</span>
      <strong>#{preview.block.blockNum.toLocaleString("en-US")}</strong>
      <span>{preview.block.validator}</span>
      <span>{preview.block.finalityMs} ms finality</span>
    </div>,
    document.body,
  );
}

export function MarketMetricsPanel({ protocolCount, compact, network }: MarketPanelProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1100);
    return () => window.clearInterval(interval);
  }, []);

  const tvl = 62_460_000_000 + Math.sin(tick / 3) * 320_000_000;
  const volume = 14_240_000_000 + Math.cos(tick / 4) * 180_000_000;
  const tps = Math.round(3842 + Math.sin(tick / 2) * 420);

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
        <Metric icon={<TrendingUpIcon />} label="Total TVL" value={tvl} format={fmtUsd} delta="+1.84%" />
        <Metric icon={<DatabaseIcon />} label="24h Volume" value={volume} format={fmtUsd} delta="-0.42%" />
        <Metric icon={<RadioTowerIcon />} label="Live TPS" value={tps} format={fmtCompact} delta="rolling" />
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
  delta: string;
}) {
  const deltaVariant = delta.startsWith("-") ? "error" : delta.startsWith("+") ? "success" : "info";

  return (
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      <span className="metric-label">{label}</span>
      <strong className="tabular-nums">
        <AnimatedNumber value={value} format={format} />
      </strong>
      <Badge variant={deltaVariant} size="sm" className="metric-delta font-mono tabular-nums">
        {delta}
      </Badge>
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
