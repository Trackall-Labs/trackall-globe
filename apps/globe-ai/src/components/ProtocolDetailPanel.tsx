import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  MapPinIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { findNetworkByName } from "@/lib/networks";
import { formatProtocolLocation } from "@/lib/protocols";
import { formatDelta, formatNumber, formatUsd } from "@/lib/protocol-stats";
import type { TrackallSolanaPlatformMetrics } from "@/lib/trackall-api";
import type { Protocol } from "@/lib/types";

type PreviewAnchor = { x: number; y: number };

const PREVIEW_WIDTH = 390;
const PREVIEW_ESTIMATED_HEIGHT = 356;
const PREVIEW_GAP = 14;
const MARKER_CLEARANCE = 42;

type Props = {
  protocol: Protocol;
  anchor?: PreviewAnchor | null;
  metrics?: TrackallSolanaPlatformMetrics | null;
  onClose: () => void;
  onOpen: (protocol: Protocol) => void;
  onOpenNetwork: (networkId: string) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

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

function panelPosition(anchor: PreviewAnchor | null | undefined): React.CSSProperties {
  if (!anchor || typeof window === "undefined") return {};

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(PREVIEW_WIDTH, viewportWidth - PREVIEW_GAP * 2);
  const height = Math.min(PREVIEW_ESTIMATED_HEIGHT, viewportHeight - PREVIEW_GAP * 2);
  const left = Math.min(
    viewportWidth - width - PREVIEW_GAP,
    Math.max(PREVIEW_GAP, anchor.x - width / 2),
  );

  const topIfAbove = anchor.y - height - PREVIEW_GAP;
  const topIfBelow = anchor.y + MARKER_CLEARANCE;
  const hasRoomAbove = topIfAbove >= PREVIEW_GAP;
  const hasRoomBelow = topIfBelow + height <= viewportHeight - PREVIEW_GAP;
  const preferredTop = hasRoomAbove || !hasRoomBelow ? topIfAbove : topIfBelow;
  const top = Math.min(
    viewportHeight - height - PREVIEW_GAP,
    Math.max(PREVIEW_GAP, preferredTop),
  );

  return {
    left,
    top,
  };
}

function optionalUsd(value: number | null | undefined) {
  return value == null ? "—" : formatUsd(value);
}

function optionalNumber(value: number | null | undefined) {
  return value == null ? "—" : formatNumber(value);
}

export function ProtocolDetailPanel({
  protocol,
  anchor,
  metrics,
  onClose,
  onOpen,
  onOpenNetwork,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  const delta = metrics?.tvlChange24hPct ?? null;
  const positive = (delta ?? 0) >= 0;
  const symbol = protocol.symbol?.trim();

  return (
    <div
      className="fixed z-[29] max-h-[calc(100vh-28px)] w-[min(390px,calc(100vw-28px))] overflow-auto rounded-xl border border-border/60 bg-background/80 p-4 backdrop-blur-md max-sm:bottom-[calc(max(14px,env(safe-area-inset-bottom))+58px)] max-sm:left-2.5 max-sm:right-2.5 max-sm:top-auto max-sm:w-auto max-sm:translate-x-0"
      style={panelPosition(anchor)}
      aria-label={`${protocol.name} summary`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background/40 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {protocol.logo ? (
            <img src={protocol.logo} alt="" className="size-10 rounded-xl object-contain" />
          ) : (
            protocolInitials(protocol)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {symbol ? <Badge variant="outline">{symbol}</Badge> : null}
            <Badge variant="secondary">{protocol.category}</Badge>
          </div>
          <div className="mt-1 truncate text-base font-medium">{protocol.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {protocol.networks.map((networkName) => {
              const network = findNetworkByName(networkName);
              if (!network) {
                return (
                  <Badge key={networkName} variant="outline" className="h-4 px-1 font-mono text-[9px]">
                    {networkName}
                  </Badge>
                );
              }

              return (
                <Badge
                  key={networkName}
                  variant="outline"
                  size="sm"
                  render={<button type="button" />}
                  onClick={() => onOpenNetwork(network.id)}
                  className="!h-6 !min-w-0 gap-1.5 rounded-md px-1.5 text-[11px] font-medium normal-case tracking-normal text-muted-foreground hover:border-foreground/30 hover:bg-muted/55 hover:text-foreground"
                  aria-label={`Open ${networkName} network`}
                >
                  <span>{network.name}</span>
                  <ArrowUpRightIcon className="size-3 opacity-55" />
                </Badge>
              );
            })}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close protocol panel"
        >
          <XIcon />
        </Button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{protocol.description}</p>

      <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <MapPinIcon className="size-3.5" />
        <span>{formatProtocolLocation(protocol)}</span>
      </div>

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
            {(protocol.programIds?.length ?? 0).toLocaleString("en-US")} programs
          </Badge>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 divide-x divide-border/60 border-y border-border/60">
        <div className="px-3 py-2.5">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">TVL</div>
          <div className="mt-0.5 truncate text-sm tabular-nums">
            {optionalUsd(metrics?.tvlUsd)}
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            24h Vol
          </div>
          <div className="mt-0.5 truncate text-sm tabular-nums">
            {optionalUsd(metrics?.volume24hUsd)}
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            Active users
          </div>
          <div className="mt-0.5 truncate text-sm tabular-nums">
            {optionalNumber(protocol.activeUsers)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {delta == null ? (
          <span className="inline-flex items-center rounded bg-muted/45 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            TVL change unavailable
          </span>
        ) : (
          <span
            className={
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] " +
              (positive
                ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/12 text-rose-600 dark:text-rose-400")
            }
          >
            {positive ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
            {formatDelta(delta)}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          {protocol.website ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              render={<a href={protocol.website} target="_blank" rel="noreferrer" />}
            >
              Site
              <ExternalLinkIcon />
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={() => onOpen(protocol)}>
            Explore Data
            <ArrowUpRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
