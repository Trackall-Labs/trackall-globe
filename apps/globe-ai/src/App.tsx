import {
  type MouseEvent,
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ExternalLinkIcon, MousePointer2Icon } from "lucide-react";
import { Card } from "@orbit/ui/card";
import { toastManager } from "@orbit/ui/toast";
import { AppHeader, type AppHeaderRoute } from "./components/AppHeader";
import { GlobeScene, type GlobeSceneHandle } from "./components/GlobeScene";
import { NetworkFilterChip } from "./components/NetworkFilterChip";
import { NetworkIndexPage } from "./components/NetworkIndexPage";
import { BlockHistoryPanel, MarketMetricsPanel, MobilePanelTabs } from "./components/Panels";
import { NetworkPage } from "./components/NetworkPage";
import { PortfolioPage } from "./components/PortfolioPage";
import { ProductPricingPage } from "./components/ProductPricingPage";
import { ProjectIndexPage } from "./components/ProjectIndexPage";
import { ProtocolDetailPanel } from "./components/ProtocolDetailPanel";
import { ProtocolPage } from "./components/ProtocolPage";
import { WalletPinDialog } from "./components/WalletPinDialog";
import type { CountryFeature } from "./lib/countries";
import { transactionExplorerUrl } from "./lib/explorer";
import {
  getNetworkFromPath,
  getNetworkIdFromPath,
  isAnyNetworkPath,
  isNetworkIndexPath,
  isNetworkPath,
} from "./lib/network-route";
import {
  getCurrentRoute,
  getNetworkFilterFromRoute,
  pathWithNetworkFilter,
  routePathname,
} from "./lib/network-filter";
import {
  getProtocolIdFromPath,
  getPortfolioAddressFromPath,
  isPortfolioPath,
  isProjectIndexPath,
  isProtocolPath,
} from "./lib/protocol-route";
import {
  fetchSolanaPlatformMetrics,
  fetchSolanaPlatforms,
  mapTrackallPlatformToProtocol,
  sortTrackallProtocols,
  trackallRefreshMs,
  type TrackallSolanaPlatformMetricsResponse,
  type TrackallSolanaPlatformMetrics,
} from "./lib/trackall-api";
import type { Protocol, WalletPin } from "./lib/types";
import { useBlockStream, type SolanaTransactionMessage } from "./lib/use-block-stream";

type SelectedCountry = {
  country: string;
  feature: CountryFeature;
};

type PreviewAnchor = {
  x: number;
  y: number;
};

type LiveActivityHandlers = {
  onOpenProtocol: (protocolId: string) => void;
};

type ProgramMatch = {
  programId: string;
  protocol: Protocol | null;
};

type ProtocolMatch = {
  programIds: string[];
  protocol: Protocol;
};

const ACTIVITY_TOAST_TIMEOUT_MS = 12_000;
const LIVE_TOAST_GLOBAL_SPACING_MS = 1_200;
const CROSS_PROGRAM_COOLDOWN_MS = 8_000;
const FAILURE_COOLDOWN_MS = 20_000;
const PROTOCOL_BURST_WINDOW_MS = 5_000;
const PROTOCOL_BURST_MIN_TX = 10;
const PROTOCOL_BURST_COOLDOWN_MS = 18_000;

function shortHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function shortProgramId(programId: string) {
  if (programId.length <= 12) return programId;
  return `${programId.slice(0, 4)}...${programId.slice(-4)}`;
}

function ActivityMention({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-5 items-center rounded-md border border-border/60 bg-muted/40 px-1.5 font-medium text-foreground text-xs transition-[background-color,border-color,color,scale] hover:border-border hover:bg-accent hover:text-accent-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function buildProgramProtocolMap(protocols: readonly Protocol[]) {
  const map = new Map<string, Protocol>();
  for (const protocol of protocols) {
    for (const programId of protocol.programIds ?? []) {
      if (!map.has(programId)) map.set(programId, protocol);
    }
  }
  return map;
}

function uniqueProgramMatches(tx: SolanaTransactionMessage, protocolByProgramId: Map<string, Protocol>) {
  const seen = new Set<string>();
  const matches: ProgramMatch[] = [];
  for (const programId of tx.matchedProgramIds) {
    if (seen.has(programId)) continue;
    seen.add(programId);
    matches.push({ programId, protocol: protocolByProgramId.get(programId) ?? null });
  }
  return matches;
}

function uniqueProtocolMatches(matches: readonly ProgramMatch[]) {
  const protocols = new Map<string, ProtocolMatch>();
  for (const match of matches) {
    if (!match.protocol) continue;
    const current = protocols.get(match.protocol.id);
    if (current) {
      current.programIds.push(match.programId);
      continue;
    }
    protocols.set(match.protocol.id, { programIds: [match.programId], protocol: match.protocol });
  }
  return Array.from(protocols.values());
}

function interactionKey(protocolMatches: readonly ProtocolMatch[], fallbackPrograms: readonly ProgramMatch[]) {
  const keys =
    protocolMatches.length > 0
      ? protocolMatches.map((match) => match.protocol.id)
      : fallbackPrograms.map((match) => match.programId);
  return keys.sort().join(":");
}

function matchLabel(protocolMatches: readonly ProtocolMatch[], programMatches: readonly ProgramMatch[]) {
  if (protocolMatches.length > 0) {
    return protocolMatches.map((match) => match.protocol.name).join(" + ");
  }
  return programMatches.map((match) => shortProgramId(match.programId)).join(" + ");
}

function formatSlot(slot: string) {
  const parsed = Number(slot);
  return Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : slot;
}

function formatTps(value: number) {
  return value >= 10 ? value.toFixed(0) : value.toFixed(1);
}

function openExplorer(toastId: string, signature: string) {
  const explorerUrl = transactionExplorerUrl(signature, "Solana");
  if (!explorerUrl) return;
  toastManager.close(toastId);
  window.location.assign(explorerUrl);
}

function protocolMention(
  protocol: Protocol,
  toastId: string,
  handlers: LiveActivityHandlers,
) {
  const openProtocol = (protocolId: string) => (clickEvent: MouseEvent<HTMLButtonElement>) => {
    clickEvent.stopPropagation();
    toastManager.close(toastId);
    handlers.onOpenProtocol(protocolId);
  };

  return <ActivityMention onClick={openProtocol(protocol.id)}>{protocol.name}</ActivityMention>;
}

function protocolMentions(
  protocolMatches: readonly ProtocolMatch[],
  toastId: string,
  handlers: LiveActivityHandlers,
) {
  return protocolMatches.map((match, index) => (
    <span className="contents" key={match.protocol.id}>
      {index > 0 ? <span>+</span> : null}
      {protocolMention(match.protocol, toastId, handlers)}
    </span>
  ));
}

function emitCrossProgramToast(
  toastId: string,
  tx: SolanaTransactionMessage,
  programMatches: readonly ProgramMatch[],
  protocolMatches: readonly ProtocolMatch[],
  handlers: LiveActivityHandlers,
  onClose: () => void,
) {
  toastManager.add({
    id: toastId,
    type: "success",
    timeout: ACTIVITY_TOAST_TIMEOUT_MS,
    onClose,
    title: (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        {protocolMatches.length > 0 ? (
          protocolMentions(protocolMatches.slice(0, 3), toastId, handlers)
        ) : (
          <span>{matchLabel([], programMatches.slice(0, 3))}</span>
        )}
        <span>shared one transaction</span>
      </span>
    ),
    description: (
      <span className="inline-flex flex-wrap items-center gap-1.5 leading-snug">
        <span>{programMatches.length.toLocaleString("en-US")} matched programs</span>
        <span>{tx.accountKeys.length.toLocaleString("en-US")} accounts</span>
        <span>slot {formatSlot(tx.slot)}</span>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          tx {shortHash(tx.signature)}
        </span>
      </span>
    ),
    actionProps: {
      "aria-label": `Open ${shortHash(tx.signature)} in explorer`,
      children: (
        <>
          View tx
          <ExternalLinkIcon />
        </>
      ),
      onClick: () => openExplorer(toastId, tx.signature),
    },
  });
}

function emitFailureToast(
  toastId: string,
  tx: SolanaTransactionMessage,
  programMatches: readonly ProgramMatch[],
  protocolMatches: readonly ProtocolMatch[],
  handlers: LiveActivityHandlers,
  onClose: () => void,
) {
  toastManager.add({
    id: toastId,
    type: "warning",
    timeout: ACTIVITY_TOAST_TIMEOUT_MS,
    onClose,
    title: (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span>Failed interaction</span>
        {protocolMatches.length > 0 ? (
          <>
            <span>on</span>
            {protocolMentions(protocolMatches.slice(0, 2), toastId, handlers)}
          </>
        ) : null}
      </span>
    ),
    description: (
      <span className="inline-flex flex-wrap items-center gap-1.5 leading-snug">
        <span>{programMatches.length.toLocaleString("en-US")} matched programs</span>
        <span>instruction #{tx.index}</span>
        <span>slot {formatSlot(tx.slot)}</span>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          tx {shortHash(tx.signature)}
        </span>
      </span>
    ),
    actionProps: {
      "aria-label": `Open ${shortHash(tx.signature)} in explorer`,
      children: (
        <>
          View tx
          <ExternalLinkIcon />
        </>
      ),
      onClick: () => openExplorer(toastId, tx.signature),
    },
  });
}

function emitBurstToast(
  toastId: string,
  protocol: Protocol,
  count: number,
  handlers: LiveActivityHandlers,
  onClose: () => void,
) {
  toastManager.add({
    id: toastId,
    type: "info",
    timeout: ACTIVITY_TOAST_TIMEOUT_MS,
    onClose,
    title: (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        {protocolMention(protocol, toastId, handlers)}
        <span>activity burst</span>
      </span>
    ),
    description: (
      <span className="inline-flex flex-wrap items-center gap-1.5 leading-snug">
        <span>{count.toLocaleString("en-US")} matched tx in 5s</span>
        <span>{formatTps(count / (PROTOCOL_BURST_WINDOW_MS / 1_000))} tx/s</span>
      </span>
    ),
  });
}

function useLiveGlobeActivity(
  enabled: boolean,
  handlers: LiveActivityHandlers,
  protocols: readonly Protocol[],
  onLiveTransactionRef: MutableRefObject<((tx: SolanaTransactionMessage) => void) | null>,
) {
  const activityToastIdsRef = useRef(new Set<string>());
  const protocolByProgramIdRef = useRef(new Map<string, Protocol>());
  const enabledRef = useRef(enabled);
  const handlersRef = useRef(handlers);
  const lastToastAtRef = useRef(0);
  const crossProgramCooldownRef = useRef(new Map<string, number>());
  const failureCooldownRef = useRef(new Map<string, number>());
  const burstCooldownRef = useRef(new Map<string, number>());
  const burstWindowsRef = useRef(new Map<string, number[]>());

  useLayoutEffect(() => {
    protocolByProgramIdRef.current = buildProgramProtocolMap(protocols);
  }, [protocols]);

  useLayoutEffect(() => {
    enabledRef.current = enabled;
    handlersRef.current = handlers;
  }, [enabled, handlers]);

  useLayoutEffect(() => {
    onLiveTransactionRef.current = (tx) => {
      if (!enabledRef.current) return;
      if (tx.matchedProgramIds.length === 0) return;

      const now = Date.now();
      const programMatches = uniqueProgramMatches(tx, protocolByProgramIdRef.current);
      if (programMatches.length === 0) return;

      const protocolMatches = uniqueProtocolMatches(programMatches);
      const markToast = (toastId: string) => {
        lastToastAtRef.current = now;
        activityToastIdsRef.current.add(toastId);
        return () => {
          activityToastIdsRef.current.delete(toastId);
        };
      };
      const canShowGlobalToast = now - lastToastAtRef.current >= LIVE_TOAST_GLOBAL_SPACING_MS;

      if (tx.failed) {
        const key = interactionKey(protocolMatches, programMatches);
        const lastFailure = failureCooldownRef.current.get(key) ?? 0;
        if (canShowGlobalToast && now - lastFailure >= FAILURE_COOLDOWN_MS) {
          const toastId = `live-failed-${tx.signature}`;
          failureCooldownRef.current.set(key, now);
          emitFailureToast(toastId, tx, programMatches, protocolMatches, handlersRef.current, markToast(toastId));
        }
        return;
      }

      for (const match of protocolMatches) {
        const current = burstWindowsRef.current.get(match.protocol.id) ?? [];
        current.push(now);
        const cutoff = now - PROTOCOL_BURST_WINDOW_MS;
        while (current.length > 0 && current[0]! < cutoff) current.shift();
        burstWindowsRef.current.set(match.protocol.id, current);

        const lastBurst = burstCooldownRef.current.get(match.protocol.id) ?? 0;
        if (
          current.length >= PROTOCOL_BURST_MIN_TX &&
          canShowGlobalToast &&
          now - lastBurst >= PROTOCOL_BURST_COOLDOWN_MS
        ) {
          const toastId = `live-burst-${match.protocol.id}-${Math.floor(now / PROTOCOL_BURST_WINDOW_MS)}`;
          burstCooldownRef.current.set(match.protocol.id, now);
          emitBurstToast(toastId, match.protocol, current.length, handlersRef.current, markToast(toastId));
          return;
        }
      }

      if (programMatches.length < 2) return;

      const key = interactionKey(protocolMatches, programMatches);
      const lastCrossProgram = crossProgramCooldownRef.current.get(key) ?? 0;
      if (!canShowGlobalToast || now - lastCrossProgram < CROSS_PROGRAM_COOLDOWN_MS) return;

      const toastId = `live-cross-${tx.signature}`;
      crossProgramCooldownRef.current.set(key, now);
      emitCrossProgramToast(toastId, tx, programMatches, protocolMatches, handlersRef.current, markToast(toastId));
    };

    return () => {
      onLiveTransactionRef.current = null;
    };
  }, [onLiveTransactionRef]);

  useEffect(() => {
    if (enabled) return;

    activityToastIdsRef.current.forEach((toastId) => {
      toastManager.close(toastId);
    });
    activityToastIdsRef.current.clear();
    burstWindowsRef.current.clear();
  }, [enabled]);

  useEffect(() => {
    const sweep = () => {
      const now = Date.now();
      const pruneOlderThan = (map: Map<string, number>, maxAgeMs: number) => {
        const cutoff = now - maxAgeMs;
        for (const [key, timestamp] of map) {
          if (timestamp < cutoff) map.delete(key);
        }
      };
      pruneOlderThan(crossProgramCooldownRef.current, CROSS_PROGRAM_COOLDOWN_MS);
      pruneOlderThan(failureCooldownRef.current, FAILURE_COOLDOWN_MS);
      pruneOlderThan(burstCooldownRef.current, PROTOCOL_BURST_COOLDOWN_MS);
    };
    const interval = window.setInterval(sweep, 10_000);
    return () => window.clearInterval(interval);
  }, []);
}

function useCompactLayout() {
  const [compact, setCompact] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 980 || window.innerHeight < 680;
  });

  useEffect(() => {
    const update = () => setCompact(window.innerWidth < 980 || window.innerHeight < 680);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return compact;
}

type RoutePageId = "1" | "2";

type RouteSnapshot = {
  content: ReactNode;
  key: string;
  page: RoutePageId;
};

type RouteSlots = Record<RoutePageId, RouteSnapshot | null>;

function parseCssDuration(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .reduce((max, part) => {
      if (!part) return max;
      const duration = part.endsWith("ms")
        ? Number(part.slice(0, -2))
        : part.endsWith("s")
          ? Number(part.slice(0, -1)) * 1000
          : Number(part);
      return Number.isFinite(duration) ? Math.max(max, duration) : max;
    }, 0);
}

function readPageTransitionDuration(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return 200;
  const style = window.getComputedStyle(element);
  return Math.max(
    parseCssDuration(style.getPropertyValue("--page-slide-dur")),
    parseCssDuration(style.getPropertyValue("--page-fade-dur")),
    200,
  );
}

function RouteTransition({
  children,
  routeKey,
  surface,
}: {
  children: ReactNode;
  routeKey: string;
  surface: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const activateFrameRef = useRef<number | null>(null);
  const activePageRef = useRef<RoutePageId>("1");
  const slotsRef = useRef<RouteSlots>({
    "1": { content: children, key: routeKey, page: "1" },
    "2": null,
  });
  const [activePage, setActivePage] = useState<RoutePageId>("1");
  const [slots, setSlots] = useState<RouteSlots>(() => slotsRef.current);

  const visibleSlots: RouteSlots = {
    "1": slots["1"]?.key === routeKey ? { ...slots["1"], content: children } : slots["1"],
    "2": slots["2"]?.key === routeKey ? { ...slots["2"], content: children } : slots["2"],
  };
  activePageRef.current = activePage;
  slotsRef.current = visibleSlots;

  useEffect(() => {
    const previous = slotsRef.current[activePageRef.current];
    if (!previous || previous.key === routeKey) return;

    const nextPage: RoutePageId = previous.page === "1" ? "2" : "1";
    const next: RouteSnapshot = { content: children, key: routeKey, page: nextPage };

    if (cleanupRef.current) window.clearTimeout(cleanupRef.current);
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    if (activateFrameRef.current) window.cancelAnimationFrame(activateFrameRef.current);

    setSlots((current) => ({
      ...current,
      [nextPage]: next,
    }));

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      activateFrameRef.current = window.requestAnimationFrame(() => {
        activateFrameRef.current = null;
        setActivePage(nextPage);

        const duration = readPageTransitionDuration(containerRef.current);
        cleanupRef.current = window.setTimeout(() => {
          setSlots((current) => ({
            ...current,
            [previous.page]: current[previous.page]?.key === previous.key ? null : current[previous.page],
          }));
          cleanupRef.current = null;
        }, duration + 40);
      });
    });
  }, [children, routeKey]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (activateFrameRef.current) {
        window.cancelAnimationFrame(activateFrameRef.current);
        activateFrameRef.current = null;
      }
      if (cleanupRef.current) {
        window.clearTimeout(cleanupRef.current);
        cleanupRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="app-route-transition t-page-slide"
      data-page={activePage}
      data-surface={surface ? "true" : undefined}
    >
      {visibleSlots["1"] ? (
        <section className="t-page" data-page-id="1" key={`1:${visibleSlots["1"].key}`} aria-hidden={activePage === "1" ? undefined : "true"}>
          {visibleSlots["1"].content}
        </section>
      ) : null}
      {visibleSlots["2"] ? (
        <section className="t-page" data-page-id="2" key={`2:${visibleSlots["2"].key}`} aria-hidden={activePage === "2" ? undefined : "true"}>
          {visibleSlots["2"].content}
        </section>
      ) : null}
    </div>
  );
}

export function App() {
  const globeSceneRef = useRef<GlobeSceneHandle | null>(null);
  const liveActivityTransactionRef = useRef<((tx: SolanaTransactionMessage) => void) | null>(null);
  const handleStreamTransaction = useCallback((tx: SolanaTransactionMessage) => {
    liveActivityTransactionRef.current?.(tx);
    if (tx.failed) return;
    if (tx.matchedProgramIds.length === 0) return;
    globeSceneRef.current?.spawnArcsForTransaction(tx.matchedProgramIds);
  }, []);
  const {
    blocks,
    error: blockStreamError,
    status: blockStreamStatus,
    transactionsPerSecond,
  } = useBlockStream({ onTransaction: handleStreamTransaction });
  const compact = useCompactLayout();
  const [pinMode, setPinMode] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [routePath, setRoutePath] = useState(() => {
    return getCurrentRoute();
  });
  const [pins, setPins] = useState<WalletPin[]>([]);
  const [mobilePanel, setMobilePanel] = useState<"blocks" | "markets" | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [protocolPreviewAnchor, setProtocolPreviewAnchor] = useState<PreviewAnchor | null>(null);
  const [trackallProtocols, setTrackallProtocols] = useState<Protocol[]>([]);
  const [trackallMetricsById, setTrackallMetricsById] = useState<Map<string, TrackallSolanaPlatformMetrics>>(
    () => new Map(),
  );
  const [trackallSolanaMetrics, setTrackallSolanaMetrics] = useState<TrackallSolanaPlatformMetricsResponse | null>(
    null,
  );
  const [trackallMetricsStatus, setTrackallMetricsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [trackallMetricsError, setTrackallMetricsError] = useState<string | null>(null);
  const protocolPreviewCloseRef = useRef<number | null>(null);
  const protocolPreviewHoverRef = useRef(false);
  const currentPathname = useMemo(() => routePathname(routePath), [routePath]);
  const activeNetworkFilter = useMemo(() => getNetworkFilterFromRoute(routePath), [routePath]);
  const activeProtocolId = useMemo(() => getProtocolIdFromPath(currentPathname), [currentPathname]);
  const allProtocols = trackallProtocols;
  const activeProtocol = useMemo(() => {
    if (!activeProtocolId) return null;
    return allProtocols.find((protocol) => protocol.id === activeProtocolId) ?? null;
  }, [activeProtocolId, allProtocols]);
  const activeProtocolMetrics = activeProtocol ? trackallMetricsById.get(activeProtocol.id) ?? null : null;
  const protocolRouteActive = isProtocolPath(currentPathname);
  const activeNetwork = useMemo(() => getNetworkFromPath(currentPathname), [currentPathname]);
  const activeNetworkId = useMemo(() => getNetworkIdFromPath(currentPathname), [currentPathname]);
  const networkIndexRouteActive = isNetworkIndexPath(currentPathname);
  const networkRouteActive = isNetworkPath(currentPathname);
  const anyNetworkRouteActive = isAnyNetworkPath(currentPathname);
  const projectIndexRouteActive = isProjectIndexPath(currentPathname);
  const portfolioRouteActive = isPortfolioPath(currentPathname);
  const portfolioAddress = useMemo(() => getPortfolioAddressFromPath(currentPathname), [currentPathname]);
  const pricingRouteActive = currentPathname === "/pricing";
  const homeRouteActive = currentPathname === "/";
  const filteredProtocols = useMemo(() => {
    if (!activeNetworkFilter) return allProtocols;
    return allProtocols.filter((protocol) =>
      protocol.networks.some((network) => network.toLowerCase() === activeNetworkFilter.name.toLowerCase()),
    );
  }, [activeNetworkFilter, allProtocols]);

  useEffect(() => {
    const updateRoute = () => setRoutePath(getCurrentRoute());
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;

    const loadPlatforms = async () => {
      controller?.abort();
      const activeController = new AbortController();
      controller = activeController;
      setTrackallMetricsStatus((current) => (current === "idle" ? "loading" : current));

      try {
        const config = {
          apiKey: import.meta.env.VITE_TRACKALL_API_KEY,
          baseUrl: import.meta.env.VITE_TRACKALL_API_URL,
        };
        const [platformsResult, metricsResult] = await Promise.allSettled([
          fetchSolanaPlatforms(config, activeController.signal),
          fetchSolanaPlatformMetrics(config, activeController.signal),
        ]);
        if (cancelled || activeController.signal.aborted || controller !== activeController) return;

        if (platformsResult.status === "fulfilled") {
          setTrackallProtocols(sortTrackallProtocols(platformsResult.value.map(mapTrackallPlatformToProtocol)));
        } else {
          console.error(platformsResult.reason);
        }

        if (metricsResult.status === "fulfilled") {
          setTrackallSolanaMetrics(metricsResult.value);
          setTrackallMetricsById(
            new Map(metricsResult.value.platforms.map((metrics) => [metrics.platformId, metrics])),
          );
          setTrackallMetricsStatus("ready");
          setTrackallMetricsError(null);
        } else {
          console.error(metricsResult.reason);
          setTrackallSolanaMetrics(null);
          setTrackallMetricsStatus("error");
          setTrackallMetricsError(
            metricsResult.reason instanceof Error ? metricsResult.reason.message : "Unable to load Trackall metrics",
          );
        }
      } catch (error) {
        if (cancelled || activeController.signal.aborted || controller !== activeController) return;
        console.error(error);
      }
    };

    loadPlatforms();
    const intervalId = window.setInterval(loadPlatforms, trackallRefreshMs());

    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const pushRoute = useCallback((pathname: string, networkId: string | null = activeNetworkFilter?.id ?? null) => {
    window.history.pushState(null, "", pathWithNetworkFilter(pathname, networkId));
    setRoutePath(getCurrentRoute());
  }, [activeNetworkFilter]);

  const handleCountrySelected = useCallback((country: string, feature: CountryFeature) => {
    setSelectedCountry({ country, feature });
  }, []);

  const handlePinCreated = useCallback((pin: WalletPin) => {
    setPins((current) => [pin, ...current].slice(0, 24));
    setPinMode(false);
  }, []);

  const handleProtocolSelected = useCallback((protocol: Protocol) => {
    pushRoute(`/protocol/${encodeURIComponent(protocol.id)}`);
    setSelectedProtocol(null);
    setProtocolPreviewAnchor(null);
    setPinMode(false);
    setSelectedCountry(null);
    setMobilePanel(null);
  }, [pushRoute]);

  const handleProtocolPreviewChange = useCallback((protocol: Protocol | null, anchor?: PreviewAnchor) => {
    if (protocolPreviewCloseRef.current) {
      window.clearTimeout(protocolPreviewCloseRef.current);
      protocolPreviewCloseRef.current = null;
    }

    if (!protocol) {
      protocolPreviewCloseRef.current = window.setTimeout(() => {
        if (protocolPreviewHoverRef.current) return;
        setSelectedProtocol(null);
        setProtocolPreviewAnchor(null);
        protocolPreviewCloseRef.current = null;
      }, 120);
      return;
    }

    setSelectedProtocol(protocol);
    if (anchor) setProtocolPreviewAnchor(anchor);
    if (protocol) {
      setPinMode(false);
      setSelectedCountry(null);
      setMobilePanel(null);
    }
  }, []);

  const handleProtocolPreviewClose = useCallback(() => {
    if (protocolPreviewCloseRef.current) {
      window.clearTimeout(protocolPreviewCloseRef.current);
      protocolPreviewCloseRef.current = null;
    }
    protocolPreviewHoverRef.current = false;
    setSelectedProtocol(null);
    setProtocolPreviewAnchor(null);
  }, []);

  useEffect(() => {
    return () => {
      if (protocolPreviewCloseRef.current) {
        window.clearTimeout(protocolPreviewCloseRef.current);
      }
    };
  }, []);

  const handleOpenProtocol = useCallback((protocol: Protocol) => {
    pushRoute(`/protocol/${encodeURIComponent(protocol.id)}`);
    setSelectedProtocol(null);
    setPinMode(false);
    setSelectedCountry(null);
    setMobilePanel(null);
  }, [pushRoute]);

  const handleOpenNetwork = useCallback((networkId: string) => {
    pushRoute(`/network/${encodeURIComponent(networkId)}`, networkId);
    setSelectedProtocol(null);
    setPinMode(false);
    setSelectedCountry(null);
    setMobilePanel(null);
  }, [pushRoute]);

  const handleFilterNetwork = useCallback((networkId: string) => {
    pushRoute(currentPathname, networkId);
    setSelectedProtocol(null);
    setProtocolPreviewAnchor(null);
    setPinMode(false);
    setSelectedCountry(null);
    setMobilePanel(null);
  }, [currentPathname, pushRoute]);

  const handleClearNetworkFilter = useCallback(() => {
    pushRoute(currentPathname, null);
  }, [currentPathname, pushRoute]);

  const handleBackToGlobe = useCallback(() => {
    pushRoute("/");
    setSelectedProtocol(null);
  }, [pushRoute]);

  const handleNavigateNetworks = useCallback(() => {
    pushRoute("/network/solana", null);
    setSelectedProtocol(null);
    setProtocolPreviewAnchor(null);
    setPinMode(false);
    setSelectedCountry(null);
    setMobilePanel(null);
  }, [pushRoute]);

  const handleNavigateProjects = useCallback(() => {
    pushRoute("/projects");
    setSelectedProtocol(null);
    setProtocolPreviewAnchor(null);
    setPinMode(false);
    setSelectedCountry(null);
    setMobilePanel(null);
  }, [pushRoute]);

  const handleNavigatePortfolio = useCallback(() => {
    pushRoute("/portfolio");
    setSelectedProtocol(null);
    setProtocolPreviewAnchor(null);
    setPinMode(false);
    setSelectedCountry(null);
    setMobilePanel(null);
  }, [pushRoute]);

  const handleOpenPortfolioAddress = useCallback((address: string) => {
    pushRoute(`/portfolio/${encodeURIComponent(address)}`);
    setSelectedProtocol(null);
    setProtocolPreviewAnchor(null);
    setPinMode(false);
    setSelectedCountry(null);
    setMobilePanel(null);
  }, [pushRoute]);

  const activeHeaderRoute: AppHeaderRoute = homeRouteActive
    ? "home"
    : anyNetworkRouteActive
      ? "networks"
      : portfolioRouteActive
        ? "portfolio"
        : projectIndexRouteActive || protocolRouteActive
          ? "projects"
          : null;

  const activityHandlers = useMemo(
    () => ({
      onOpenProtocol: (protocolId: string) => {
        const protocol = allProtocols.find((item) => item.id === protocolId);
        if (protocol) handleOpenProtocol(protocol);
      },
    }),
    [allProtocols, handleOpenProtocol],
  );

  useLiveGlobeActivity(homeRouteActive, activityHandlers, filteredProtocols, liveActivityTransactionRef);

  return (
    <main className="app-shell">
      <div className="starfield" aria-hidden="true" />
      <div className="ambient-grid" aria-hidden="true" />

      <AppHeader
        current={activeHeaderRoute}
        onNavigateHome={handleBackToGlobe}
        onNavigateNetworks={handleNavigateNetworks}
        onNavigateProjects={handleNavigateProjects}
        onNavigatePortfolio={handleNavigatePortfolio}
      />

      {activeNetworkFilter && !pricingRouteActive ? (
        <NetworkFilterChip network={activeNetworkFilter} onClear={handleClearNetworkFilter} />
      ) : null}

      <GlobeScene
        ref={globeSceneRef}
        active={homeRouteActive}
        protocols={filteredProtocols}
        pins={pins}
        pinMode={pinMode}
        onCountrySelected={handleCountrySelected}
        onProtocolSelected={handleProtocolSelected}
        onProtocolPreviewChange={handleProtocolPreviewChange}
      />

      <RouteTransition routeKey={routePath} surface={!homeRouteActive}>
        {pricingRouteActive ? (
          <ProductPricingPage />
        ) : protocolRouteActive ? (
          <ProtocolPage
            protocol={activeProtocol}
            metrics={activeProtocolMetrics}
            metricsError={trackallMetricsError}
            metricsStatus={trackallMetricsStatus}
            requestedId={activeProtocolId}
            onBack={handleBackToGlobe}
            onOpenNetwork={handleOpenNetwork}
            onOpenWallet={handleOpenPortfolioAddress}
          />
        ) : portfolioRouteActive ? (
          <PortfolioPage
            activeNetworkFilter={activeNetworkFilter}
            protocols={allProtocols}
            walletAddress={portfolioAddress}
            onClearWallet={handleNavigatePortfolio}
            onOpenWallet={handleOpenPortfolioAddress}
          />
        ) : projectIndexRouteActive ? (
          <ProjectIndexPage
            activeNetworkFilter={activeNetworkFilter}
            protocols={filteredProtocols}
            onOpenProtocol={(protocolId) => {
              const protocol = allProtocols.find((item) => item.id === protocolId);
              if (protocol) handleOpenProtocol(protocol);
            }}
          />
        ) : networkIndexRouteActive ? (
          <NetworkIndexPage
            activeNetworkFilter={activeNetworkFilter}
            onFilterNetwork={handleFilterNetwork}
            onOpenNetwork={handleOpenNetwork}
          />
        ) : networkRouteActive ? (
          <NetworkPage
            blockStreamBlocks={blocks}
            blockStreamError={blockStreamError}
            blockStreamStatus={blockStreamStatus}
            protocols={allProtocols}
            network={activeNetwork}
            solanaMetrics={trackallSolanaMetrics}
            solanaMetricsError={trackallMetricsError}
            solanaMetricsStatus={trackallMetricsStatus}
            requestedId={activeNetworkId}
            onBack={handleBackToGlobe}
            onOpenProtocol={handleOpenProtocol}
            onOpenWallet={handleOpenPortfolioAddress}
          />
        ) : anyNetworkRouteActive ? (
          <NetworkPage
            blockStreamBlocks={blocks}
            blockStreamError={blockStreamError}
            blockStreamStatus={blockStreamStatus}
            protocols={allProtocols}
            network={null}
            solanaMetrics={trackallSolanaMetrics}
            solanaMetricsError={trackallMetricsError}
            solanaMetricsStatus={trackallMetricsStatus}
            requestedId={activeNetworkId}
            onBack={handleBackToGlobe}
            onOpenProtocol={handleOpenProtocol}
            onOpenWallet={handleOpenPortfolioAddress}
          />
        ) : null}
      </RouteTransition>

      {homeRouteActive ? (
        <>
          {pinMode ? (
            <Card className="pin-mode-banner">
              <MousePointer2Icon />
              Click a country to attach a local wallet pin. Press the button again to exit.
            </Card>
          ) : null}

          {selectedProtocol ? (
            <ProtocolDetailPanel
              protocol={selectedProtocol}
              anchor={protocolPreviewAnchor}
              metrics={trackallMetricsById.get(selectedProtocol.id) ?? null}
              onClose={handleProtocolPreviewClose}
              onOpen={handleOpenProtocol}
              onOpenNetwork={handleOpenNetwork}
              onPointerEnter={() => {
                protocolPreviewHoverRef.current = true;
                handleProtocolPreviewChange(selectedProtocol);
              }}
              onPointerLeave={() => {
                protocolPreviewHoverRef.current = false;
                handleProtocolPreviewChange(null);
              }}
            />
          ) : null}

          {compact ? (
            <>
              {mobilePanel === "blocks" ? (
                <div className="mobile-panel-sheet">
                  <BlockHistoryPanel
                    blocks={blocks}
                    compact
                    streamError={blockStreamError}
                    streamStatus={blockStreamStatus}
                  />
                </div>
              ) : null}
              {mobilePanel === "markets" ? (
                <div className="mobile-panel-sheet">
                  <MarketMetricsPanel
                    chainMetrics={trackallSolanaMetrics?.chain ?? null}
                    liveTps={transactionsPerSecond}
                    network={activeNetworkFilter}
                    protocolCount={filteredProtocols.length}
                    compact
                  />
                </div>
              ) : null}
              <MobilePanelTabs active={mobilePanel} onChange={setMobilePanel} />
            </>
          ) : (
            <>
              <BlockHistoryPanel
                blocks={blocks}
                streamError={blockStreamError}
                streamStatus={blockStreamStatus}
              />
              <MarketMetricsPanel
                chainMetrics={trackallSolanaMetrics?.chain ?? null}
                liveTps={transactionsPerSecond}
                network={activeNetworkFilter}
                protocolCount={filteredProtocols.length}
              />
            </>
          )}

          <WalletPinDialog
            selected={selectedCountry}
            onClose={() => setSelectedCountry(null)}
            onPinCreated={handlePinCreated}
            onOpenWallet={handleOpenPortfolioAddress}
          />
        </>
      ) : null}
    </main>
  );
}
