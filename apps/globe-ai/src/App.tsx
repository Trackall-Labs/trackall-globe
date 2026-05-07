import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ExternalLinkIcon, MousePointer2Icon } from "lucide-react";
import { Card } from "@orbit/ui/card";
import { toastManager } from "@orbit/ui/toast";
import { AppHeader, type AppHeaderRoute } from "./components/AppHeader";
import { GlobeScene } from "./components/GlobeScene";
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
import { NETWORKS, type Network } from "./lib/networks";
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
import { useBlockStream } from "./lib/use-block-stream";

type SelectedCountry = {
  country: string;
  feature: CountryFeature;
};

type PreviewAnchor = {
  x: number;
  y: number;
};

type MockActivityToast = {
  actionProps?: ComponentPropsWithoutRef<"button">;
  description: ReactNode;
  title: ReactNode;
  type: "info" | "success" | "warning";
};

type MockActivityEvent =
  | {
      amount: string;
      kind: "protocol-flow";
      network: Network;
      protocol: Protocol;
    }
  | {
      kind: "network-event";
      network: Network;
    }
  | {
      flow: string;
      kind: "wallet-transaction";
      network: Network;
      protocol: Protocol;
      txHash: string;
      wallet: string;
    }
  | {
      kind: "protocol-activity";
      network: Network;
      protocol: Protocol;
    };

type MockActivityHandlers = {
  onOpenNetwork: (networkId: string) => void;
  onOpenProtocol: (protocolId: string) => void;
};

const ACTIVITY_INITIAL_DELAY_MS = 900;
const ACTIVITY_INITIAL_BURST_COUNT = 4;
const ACTIVITY_INITIAL_BURST_STAGGER_MS = 650;
const ACTIVITY_INTERVAL_MIN_MS = 3600;
const ACTIVITY_INTERVAL_MAX_MS = 5600;
const ACTIVITY_TOAST_TIMEOUT_MS = 12_000;

const MOCK_WHALE_WALLETS = [
  "8dYbQ...n3M9p",
  "BABBC...Uwwwv",
  "4nq9K...8sL2a",
  "21112...59899",
] as const;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickMockItem<T>(items: readonly T[], index: number) {
  return items[index % items.length]!;
}

function compactUsd(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  return `$${(value / 1_000_000).toFixed(1)}M`;
}

function mockTransactionHash(index: number, network: Network) {
  if (network.id === "solana") {
    const solanaHashes = [
      "5YTXpWRiNqP4aHsxDhmvVb6sXehR9vZq9nVt2m4hQZ7fJ6u3A2rV8cWkLq9pNfE1bR7sT4xY8mK2dP6aC3hG9j",
      "3uYbLqK8pR5nVwS2xT9cAaD4eF7hJ1mN6zQ8rU2vX5kB9pC3dE7fG1hL4jM8nP2q",
      "4sNfT9rX2kL6aV3pQ8mC1dB7eH5jY4uW9zR2vP6qA8tK3nD5gF7hJ1lM9xC4bE",
    ];
    return pickMockItem(solanaHashes, index);
  }

  const hex = "0123456789abcdef";
  const body = Array.from({ length: 64 }, (_, position) => hex[(index * 11 + position * 7) % hex.length]).join("");
  return `0x${body}`;
}

function shortHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function buildMockActivityEvent(
  index: number,
  protocols: readonly Protocol[],
  networkFilter: Network | null,
): MockActivityEvent | null {
  if (protocols.length === 0) return null;
  const protocol = pickMockItem(protocols, index * 2);
  const networkName = pickMockItem(protocol.networks.length > 0 ? protocol.networks : ["Ethereum"], index);
  const network = networkFilter ?? NETWORKS.find((item) => item.name === networkName) ?? pickMockItem(NETWORKS, index);
  const wallet = pickMockItem(MOCK_WHALE_WALLETS, index);
  const amount = compactUsd(randomBetween(1_200_000, 24_000_000));
  const flow = compactUsd(randomBetween(800_000, 9_500_000));
  const txHash = mockTransactionHash(index, network);

  const events: MockActivityEvent[] = [
    {
      amount,
      kind: "protocol-flow",
      network,
      protocol,
    },
    {
      kind: "network-event",
      network,
    },
    {
      kind: "protocol-activity",
      network,
      protocol,
    },
    {
      flow,
      kind: "wallet-transaction",
      network,
      protocol,
      txHash,
      wallet,
    },
  ];

  return pickMockItem(events, index);
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

function renderMockActivityToast(
  event: MockActivityEvent,
  toastId: string,
  handlers: MockActivityHandlers,
): MockActivityToast {
  const openProtocol = (protocolId: string) => (clickEvent: MouseEvent<HTMLButtonElement>) => {
    clickEvent.stopPropagation();
    toastManager.close(toastId);
    handlers.onOpenProtocol(protocolId);
  };
  const openNetwork = (networkId: string) => (clickEvent: MouseEvent<HTMLButtonElement>) => {
    clickEvent.stopPropagation();
    toastManager.close(toastId);
    handlers.onOpenNetwork(networkId);
  };
  const protocolMention = (protocol: Protocol) => (
    <ActivityMention onClick={openProtocol(protocol.id)}>{protocol.name}</ActivityMention>
  );
  const networkMention = (network: Network) => (
    <ActivityMention onClick={openNetwork(network.id)}>{network.name}</ActivityMention>
  );

  if (event.kind === "protocol-flow") {
    return {
      type: "success",
      title: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {protocolMention(event.protocol)}
          <span>routed {event.amount}</span>
        </span>
      ),
      description: (
        <span className="inline-flex flex-wrap items-center gap-1.5 leading-snug">
          {networkMention(event.network)}
          <span>liquidity path settled across live markets.</span>
        </span>
      ),
    };
  }

  if (event.kind === "network-event") {
    return {
      type: "info",
      title: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {networkMention(event.network)}
          <span>finality stable</span>
        </span>
      ),
      description: `Blocks confirming near ${event.network.finalitySec}s with healthy relay activity.`,
    };
  }

  if (event.kind === "protocol-activity") {
    return {
      type: "info",
      title: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {protocolMention(event.protocol)}
          <span>user activity up</span>
        </span>
      ),
      description: (
        <span className="inline-flex flex-wrap items-center gap-1.5 leading-snug">
          {networkMention(event.network)}
          <span>saw a fresh burst of wallet interactions.</span>
        </span>
      ),
    };
  }

  const explorerUrl = transactionExplorerUrl(event.txHash, event.network);
  return {
    type: "warning",
    title: "Whale deposit detected",
    description: (
      <span className="inline-flex flex-wrap items-center gap-1.5 leading-snug">
        <span className="font-mono text-xs tabular-nums">{event.wallet}</span>
        <span>moved {event.flow} into</span>
        {protocolMention(event.protocol)}
        <span>vaults on</span>
        {networkMention(event.network)}
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">tx {shortHash(event.txHash)}</span>
      </span>
    ),
    actionProps: explorerUrl
      ? {
          "aria-label": `Open ${shortHash(event.txHash)} in explorer`,
          children: (
            <>
              View tx
              <ExternalLinkIcon />
            </>
          ),
          onClick: () => {
            toastManager.close(toastId);
            window.location.assign(explorerUrl);
          },
        }
      : undefined,
  };
}

function useMockGlobeActivity(
  enabled: boolean,
  handlers: MockActivityHandlers,
  networkFilter: Network | null,
  protocols: readonly Protocol[],
) {
  const eventIndexRef = useRef(0);
  const activityToastIdsRef = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled) return;

    const timeoutIds = new Set<number>();
    let cancelled = false;

    const emitActivity = () => {
      const toastId = `globe-activity-${Date.now()}-${eventIndexRef.current}`;
      const activity = buildMockActivityEvent(eventIndexRef.current, protocols, networkFilter);
      eventIndexRef.current += 1;
      if (!activity) return;
      const event = renderMockActivityToast(activity, toastId, handlers);
      toastManager.add({
        description: event.description,
        id: toastId,
        actionProps: event.actionProps,
        onClose: () => {
          activityToastIdsRef.current.delete(toastId);
        },
        timeout: ACTIVITY_TOAST_TIMEOUT_MS,
        title: event.title,
        type: event.type,
      });
      activityToastIdsRef.current.add(toastId);
    };

    const schedule = (delay: number) => {
      const timeoutId = window.setTimeout(() => {
        timeoutIds.delete(timeoutId);
        if (cancelled) return;
        emitActivity();
        schedule(randomBetween(ACTIVITY_INTERVAL_MIN_MS, ACTIVITY_INTERVAL_MAX_MS));
      }, delay);
      timeoutIds.add(timeoutId);
    };

    for (let i = 0; i < ACTIVITY_INITIAL_BURST_COUNT; i += 1) {
      const timeoutId = window.setTimeout(() => {
        timeoutIds.delete(timeoutId);
        if (!cancelled) emitActivity();
      }, ACTIVITY_INITIAL_DELAY_MS + i * ACTIVITY_INITIAL_BURST_STAGGER_MS);
      timeoutIds.add(timeoutId);
    }
    schedule(
      ACTIVITY_INITIAL_DELAY_MS +
        ACTIVITY_INITIAL_BURST_COUNT * ACTIVITY_INITIAL_BURST_STAGGER_MS +
        randomBetween(ACTIVITY_INTERVAL_MIN_MS, ACTIVITY_INTERVAL_MAX_MS),
    );

    return () => {
      cancelled = true;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIds.clear();
    };
  }, [enabled, handlers, networkFilter, protocols]);

  useEffect(() => {
    if (enabled) return;

    activityToastIdsRef.current.forEach((toastId) => {
      toastManager.close(toastId);
    });
    activityToastIdsRef.current.clear();
  }, [enabled]);
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
  const { blocks } = useBlockStream();
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
    pushRoute("/networks");
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
      onOpenNetwork: handleOpenNetwork,
      onOpenProtocol: (protocolId: string) => {
        const protocol = allProtocols.find((item) => item.id === protocolId);
        if (protocol) handleOpenProtocol(protocol);
      },
    }),
    [allProtocols, handleOpenNetwork, handleOpenProtocol],
  );

  useMockGlobeActivity(homeRouteActive, activityHandlers, activeNetworkFilter, filteredProtocols);

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
                  <BlockHistoryPanel blocks={blocks} compact />
                </div>
              ) : null}
              {mobilePanel === "markets" ? (
                <div className="mobile-panel-sheet">
                  <MarketMetricsPanel
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
              <BlockHistoryPanel blocks={blocks} />
              <MarketMetricsPanel
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
