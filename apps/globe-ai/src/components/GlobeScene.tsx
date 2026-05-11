import createGlobe, { type COBEOptions, type Marker } from "cobe";
import {
  Fragment,
  type Ref,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  getCountryName,
  loadCountryFeatures,
  type CountryFeature,
} from "@/lib/countries";
import { clusterProtocols, zoomToSplit, type Cluster } from "@/lib/clusters";
import type { Protocol, WalletPin } from "@/lib/types";

export type GlobeSceneHandle = {
  spawnArcsForTransaction: (matchedProgramIds: string[]) => void;
};

type Props = {
  active?: boolean;
  protocols: Protocol[];
  pins: WalletPin[];
  pinMode: boolean;
  onCountrySelected: (country: string, feature: CountryFeature) => void;
  onProtocolSelected: (protocol: Protocol) => void;
  onProtocolPreviewChange?: (protocol: Protocol | null, anchor?: { x: number; y: number }) => void;
  ref?: Ref<GlobeSceneHandle>;
};

type CobeTheme = {
  foreground: [number, number, number];
  primary: [number, number, number];
  info: [number, number, number];
  success: [number, number, number];
  warning: [number, number, number];
  muted: [number, number, number];
  chart: [number, number, number][];
};

type MarkerStyle = React.CSSProperties & {
  positionAnchor?: string;
  "--cobe-marker-visibility"?: string;
  "--cobe-marker-events"?: string;
  "--fan-radius-x"?: string;
  "--fan-radius-y"?: string;
  "--fan-progress"?: string;
};

type CameraTarget = {
  startedAt: number;
  duration: number;
  fromPhi: number;
  fromTheta: number;
  fromZoom: number;
  toPhi: number;
  toTheta: number;
  toZoom: number;
};

const CAMERA_TWEEN_MS = 700;
const FAN_AUTO_START_ZOOM = 1.0;
const MAX_FAN_RADIUS = 56;
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const GOLDEN_ANGLE_RAD = Math.PI * (3 - Math.sqrt(5));

function computeFanProgress(zoom: number) {
  if (zoom <= FAN_AUTO_START_ZOOM) return 0;
  const raw = (zoom - FAN_AUTO_START_ZOOM) / (MAX_GLOBE_ZOOM - FAN_AUTO_START_ZOOM);
  const t = Math.min(1, Math.max(0, raw));
  return t * t * (3 - 2 * t);
}

function hashUnit(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

function getFanOffset(clusterId: string, protocolId: string, index: number, radius: number) {
  const rotation = hashUnit(clusterId) * Math.PI * 2;
  const angleJitter = (hashUnit(`${clusterId}:${protocolId}:angle`) - 0.5) * 0.72;
  const radiusJitter = 0.72 + hashUnit(`${protocolId}:${clusterId}:radius`) * 0.34;
  const angle = rotation + index * GOLDEN_ANGLE_RAD + angleJitter - Math.PI / 2;
  const distance = radius * radiusJitter;

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

function protocolInitials(protocol: Protocol, maxLength: number) {
  const symbol = protocol.symbol?.trim();
  if (symbol) return symbol.slice(0, maxLength);
  return protocol.name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, Math.max(1, Math.min(maxLength, 2)))
    .join("")
    .toUpperCase();
}

type DragState = {
  x: number;
  y: number;
  distance: number;
};

const CHART_TOKENS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
] as const;

type ArcTone = "info" | "infoBright" | "primary";

const ARC_TONE_ORDER: readonly ArcTone[] = ["info", "infoBright", "primary"];

const ARC_DURATION_MIN_MS = 300;
const ARC_DURATION_MAX_MS = 400;
const ARC_ORIGIN_LAT_MAX_SIN = 0.92;
const ARC_FADE_START = 0.75;
const ARC_TOTAL_BUDGET = 20;
const ARC_TPS_WINDOW_MS = 1000;
const ARC_RECONCILE_INTERVAL_MS = 120;

const ARC_SEGMENTS = 48;
const ARC_SURFACE_RADIUS = 0.8;
const ARC_ALTITUDE_BASE = 0.015;
const ARC_ALTITUDE_GAIN = 0.5;
const ARC_DASH_RATIO = 0.24;
const ARC_LINE_WIDTH = 1.65;
const ARC_BASE_LINE_WIDTH = 0.9;
const ARC_BASE_ALPHA = 0.11;
const ARC_GLOW_BLUR = 4;

const PIN_COUNTRY_TARGETS = [
  { country: "United States of America", label: "United States", lat: 37.7749, lng: -122.4194 },
  { country: "United Kingdom", label: "United Kingdom", lat: 51.5072, lng: -0.1276 },
  { country: "Germany", label: "Germany", lat: 52.52, lng: 13.405 },
  { country: "France", label: "France", lat: 48.8566, lng: 2.3522 },
  { country: "Singapore", label: "Singapore", lat: 1.3521, lng: 103.8198 },
  { country: "Japan", label: "Japan", lat: 35.6762, lng: 139.6503 },
  { country: "India", label: "India", lat: 19.076, lng: 72.8777 },
  { country: "Brazil", label: "Brazil", lat: -23.5505, lng: -46.6333 },
] as const;

const MIN_GLOBE_ZOOM = 0.72;
const MAX_GLOBE_ZOOM = 1.82;
const WHEEL_ZOOM_SPEED = 0.0012;
const AUTO_ROTATION_SPEED = 0.0021;
const DRAG_ROTATION_SPEED = 1.18;
const DRAG_INERTIA_FRICTION = 0.9;
const DRAG_INERTIA_STOP = 0.00004;
const DRAG_MAX_VELOCITY = 0.045;
const SELECT_DRAG_THRESHOLD = 6;
const SELECT_SUPPRESS_MS = 260;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashStringToIndex(value: string, modulo: number) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return ((hash % modulo) + modulo) % modulo;
}

function wrapRadians(value: number) {
  const twoPi = Math.PI * 2;
  return ((((value + Math.PI) % twoPi) + twoPi) % twoPi) - Math.PI;
}

function cobeLatLngToVec(lat: number, lng: number): [number, number, number] {
  const r = (lat * Math.PI) / 180;
  const a = (lng * Math.PI) / 180 - Math.PI;
  const o = Math.cos(r);
  return [-o * Math.cos(a), Math.sin(r), o * Math.sin(a)];
}

function slerpVec(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  const omega = Math.acos(dot);
  if (omega < 1e-4) return [a[0], a[1], a[2]];
  const sinO = Math.sin(omega);
  const wA = Math.sin((1 - t) * omega) / sinO;
  const wB = Math.sin(t * omega) / sinO;
  return [a[0] * wA + b[0] * wB, a[1] * wA + b[1] * wB, a[2] * wA + b[2] * wB];
}

function buildArcWaypoints(
  from: [number, number],
  to: [number, number],
): [number, number, number][] {
  const a = cobeLatLngToVec(from[0], from[1]);
  const b = cobeLatLngToVec(to[0], to[1]);
  const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  const omega = Math.acos(dot);
  const altitude = ARC_ALTITUDE_BASE + ARC_ALTITUDE_GAIN * Math.sin(omega / 2);
  const points: [number, number, number][] = [];
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS;
    const u = slerpVec(a, b, t);
    const r = ARC_SURFACE_RADIUS + altitude * Math.sin(t * Math.PI);
    points.push([u[0] * r, u[1] * r, u[2] * r]);
  }
  return points;
}

function mixColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function rgbToCss(rgb: [number, number, number], alpha = 1): string {
  return `rgba(${Math.round(clamp(rgb[0], 0, 1) * 255)}, ${Math.round(
    clamp(rgb[1], 0, 1) * 255,
  )}, ${Math.round(clamp(rgb[2], 0, 1) * 255)}, ${alpha})`;
}

function baseGlobeScale(width: number) {
  return width < 680 ? 0.9 : 1.08;
}

function getCanvasDpr() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
}

function getInitialSize() {
  if (typeof window === "undefined") return { width: 1, height: 1 };
  return {
    width: Math.max(1, Math.round(window.innerWidth)),
    height: Math.max(1, Math.round(window.innerHeight)),
  };
}

function pointerDistance(points: Map<number, { x: number; y: number }>) {
  const [first, second] = Array.from(points.values());
  if (!first || !second) return 0;
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function globeDragRadius(width: number, height: number, scale: number) {
  return Math.max(180, (Math.min(width, height) * scale) / 2);
}

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function parseColorNumbers(value: string) {
  return value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?%?/gi) ?? [];
}

function parseColorChannel(value: string, scale = 255) {
  if (value.endsWith("%")) return (Number(value.slice(0, -1)) / 100) * scale;
  const number = Number(value);
  return number <= 1 ? number * scale : number;
}

function linearToSrgb(value: number) {
  const channel = Math.min(1, Math.max(0, value));
  if (channel <= 0.0031308) return channel * 12.92;
  return 1.055 * channel ** (1 / 2.4) - 0.055;
}

function oklabToRgb(lightness: number, a: number, b: number): [number, number, number] {
  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;

  return [
    clampChannel(linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) * 255),
    clampChannel(linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) * 255),
    clampChannel(linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) * 255),
  ];
}

function colorStringToRgb(color: string): [number, number, number] | null {
  const trimmed = color.trim();
  const numbers = parseColorNumbers(trimmed);

  if (trimmed.startsWith("color(srgb") && numbers.length >= 3) {
    return [
      clampChannel(parseColorChannel(numbers[0]!)),
      clampChannel(parseColorChannel(numbers[1]!)),
      clampChannel(parseColorChannel(numbers[2]!)),
    ];
  }

  if (trimmed.startsWith("oklab(") && numbers.length >= 3) {
    return oklabToRgb(
      parseColorChannel(numbers[0]!, 1),
      Number(numbers[1]),
      Number(numbers[2]),
    );
  }

  if (trimmed.startsWith("oklch(") && numbers.length >= 3) {
    const lightness = parseColorChannel(numbers[0]!, 1);
    const chroma = Number(numbers[1]);
    const hue = (Number(numbers[2]) * Math.PI) / 180;
    return oklabToRgb(lightness, chroma * Math.cos(hue), chroma * Math.sin(hue));
  }

  const hex = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((value) => value + value)
            .join("")
        : hex;
    const value = Number.parseInt(normalized, 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  if (numbers.length >= 3) {
    return [
      clampChannel(Number(numbers[0])),
      clampChannel(Number(numbers[1])),
      clampChannel(Number(numbers[2])),
    ];
  }

  return null;
}

function resolveTokenColor(token: string, fallback: [number, number, number]) {
  if (typeof document === "undefined") return fallback;

  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  probe.style.position = "absolute";
  probe.style.pointerEvents = "none";
  probe.style.visibility = "hidden";
  document.body.append(probe);
  const computedColor = getComputedStyle(probe).color;
  probe.remove();

  return colorStringToRgb(computedColor) ?? fallback;
}

function toUnitColor(color: [number, number, number]): [number, number, number] {
  return [color[0] / 255, color[1] / 255, color[2] / 255];
}

function readTheme(): CobeTheme {
  return {
    foreground: toUnitColor(resolveTokenColor("--foreground", [245, 245, 245])),
    primary: toUnitColor(resolveTokenColor("--primary", [245, 245, 245])),
    info: toUnitColor(resolveTokenColor("--info", [96, 165, 250])),
    success: toUnitColor(resolveTokenColor("--success", [16, 185, 129])),
    warning: toUnitColor(resolveTokenColor("--warning", [245, 158, 11])),
    muted: toUnitColor(resolveTokenColor("--muted-foreground", [161, 161, 170])),
    chart: CHART_TOKENS.map((token) =>
      toUnitColor(resolveTokenColor(token, [96, 165, 250])),
    ),
  };
}

function markerAnchorStyle(id: string): MarkerStyle {
  return {
    positionAnchor: `--cobe-${id}`,
    "--cobe-marker-visibility": `var(--cobe-visible-${id}, 0)`,
    "--cobe-marker-events": `var(--cobe-events-${id}, none)`,
  };
}

function markerFacesCamera(lat: number, lng: number, phi: number, theta: number) {
  const p = cobeLatLngToVec(lat, lng);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const zR = -sinPhi * cosT * p[0] + sinT * p[1] + cosPhi * cosT * p[2];

  return zR > 0.02;
}

function markerId(prefix: string, value: string) {
  return `${prefix}-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function findCountryFeature(features: CountryFeature[], country: string) {
  return features.find((feature) => getCountryName(feature) === country) ?? null;
}

function formatActiveUsers(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-US");
}

type ActiveArc = {
  protocolId: string;
  startedAt: number;
  duration: number;
  tone: ArcTone;
  waypoints: [number, number, number][];
};

export function GlobeScene({
  active = true,
  protocols,
  pins,
  pinMode,
  onCountrySelected,
  onProtocolSelected,
  onProtocolPreviewChange,
  ref,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arcsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const activeRef = useRef(active);
  const phiRef = useRef(-0.46);
  const thetaRef = useRef(0.24);
  const zoomRef = useRef(1);
  const dragRef = useRef<DragState | null>(null);
  const rotationVelocityRef = useRef({ phi: 0, theta: 0 });
  const markerHoverRef = useRef(false);
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const suppressSelectionUntilRef = useRef(0);
  const activeArcsRef = useRef<Map<string, ActiveArc>>(new Map());
  const txCountsRef = useRef<Map<string, number[]>>(new Map());
  const protocolByIdRef = useRef<Map<string, Protocol>>(new Map());
  const arcUidRef = useRef(0);
  const lastReconcileRef = useRef(0);
  const cameraTargetRef = useRef<CameraTarget | null>(null);
  const lastFanProgressRef = useRef(-1);
  const lastFanActiveRef = useRef(false);
  const [size, setSize] = useState(getInitialSize);
  const [countryFeatures, setCountryFeatures] = useState<CountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [anchorRoot, setAnchorRoot] = useState<HTMLElement | null>(null);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);

  const clusters = useMemo<Cluster[]>(
    () => clusterProtocols(protocols, 0.25),
    [protocols],
  );

  useEffect(() => {
    if (!expandedClusterId) return;
    if (!clusters.some((c) => c.id === expandedClusterId && c.collocated)) {
      setExpandedClusterId(null);
    }
  }, [clusters, expandedClusterId]);


  const protocolMarkers = useMemo<Marker[]>(
    () =>
      clusters.map((cluster, index) => ({
        id: cluster.id,
        location: [cluster.lat, cluster.lng],
        size: 0,
        color: readTheme().chart[index % CHART_TOKENS.length] ?? readTheme().muted,
      })),
    [clusters],
  );

  const pinMarkers = useMemo<Marker[]>(
    () =>
      pins.map((pin) => ({
        id: markerId("pin", pin.id),
        location: [pin.lat, pin.lng],
        size: 0.03,
        color: readTheme().success,
      })),
    [pins],
  );

  const pinTargetMarkers = useMemo<Marker[]>(
    () =>
      PIN_COUNTRY_TARGETS.map((target) => ({
        id: markerId("target", target.country),
        location: [target.lat, target.lng],
        size: pinMode ? 0.028 : 0.001,
        color: readTheme().warning,
      })),
    [pinMode],
  );

  const markers = useMemo(
    () => [...protocolMarkers, ...pinMarkers, ...pinTargetMarkers],
    [pinMarkers, pinTargetMarkers, protocolMarkers],
  );

  const markersRef = useRef(markers);
  const markersDirtyRef = useRef(false);
  const markerInteractivityTargetsRef = useRef(
    clusters.map((cluster) => ({
      id: cluster.id,
      lat: cluster.lat,
      lng: cluster.lng,
    })),
  );
  const markerEventsRef = useRef(new Map<string, string>());
  useLayoutEffect(() => {
    markersRef.current = markers;
    markersDirtyRef.current = true;
    globeRef.current?.update({ markers });
    const wrapper = anchorRoot;
    if (wrapper) {
      const layer = wrapper.querySelector(".cobe-marker-layer");
      if (layer && wrapper.lastElementChild !== layer) {
        wrapper.appendChild(layer);
      }
    }
  }, [anchorRoot, markers]);
  useEffect(() => {
    markerInteractivityTargetsRef.current = clusters.map((cluster) => ({
      id: cluster.id,
      lat: cluster.lat,
      lng: cluster.lng,
    }));
  }, [clusters]);

  const programIdToProtocolRef = useRef<Map<string, Protocol>>(new Map());
  useEffect(() => {
    const programIdMap = new Map<string, Protocol>();
    const protocolMap = new Map<string, Protocol>();
    for (const protocol of protocols) {
      protocolMap.set(protocol.id, protocol);
      const ids = protocol.programIds;
      if (!ids) continue;
      for (const programId of ids) {
        if (!programIdMap.has(programId)) programIdMap.set(programId, protocol);
      }
    }
    programIdToProtocolRef.current = programIdMap;
    protocolByIdRef.current = protocolMap;
  }, [protocols]);

  useEffect(() => {
    const known = new Set(protocols.map((protocol) => protocol.id));
    const arcs = activeArcsRef.current;
    for (const [key, arc] of Array.from(arcs.entries())) {
      if (!known.has(arc.protocolId)) arcs.delete(key);
    }
    const txCounts = txCountsRef.current;
    for (const protocolId of Array.from(txCounts.keys())) {
      if (!known.has(protocolId)) txCounts.delete(protocolId);
    }
  }, [protocols]);

  useImperativeHandle(
    ref,
    () => ({
      spawnArcsForTransaction(matchedProgramIds) {
        if (!matchedProgramIds || matchedProgramIds.length === 0) return;
        const programIdToProtocol = programIdToProtocolRef.current;
        const txCounts = txCountsRef.current;
        const now = performance.now();
        for (const programId of matchedProgramIds) {
          const protocol = programIdToProtocol.get(programId);
          if (!protocol) continue;
          let timestamps = txCounts.get(protocol.id);
          if (!timestamps) {
            timestamps = [];
            txCounts.set(protocol.id, timestamps);
          }
          timestamps.push(now);
        }
      },
    }),
    [],
  );

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    let cancelled = false;
    loadCountryFeatures()
      .then((features) => {
        if (!cancelled) setCountryFeatures(features);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: Math.max(1, Math.round(entry.contentRect.width)),
        height: Math.max(1, Math.round(entry.contentRect.height)),
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const theme = readTheme();
    const dpr = getCanvasDpr();
    const width = Math.round(size.width * dpr);
    const height = Math.round(size.height * dpr);
    const baseScale = baseGlobeScale(size.width);
    let animationFrame = 0;
    let pausedUntil = 0;

    const tonePalette: Record<ArcTone, [number, number, number]> = {
      info: theme.info,
      infoBright: mixColor(theme.info, theme.foreground, 0.4),
      primary: mixColor(theme.primary, theme.info, 0.3),
    };

    const sceneOffset: [number, number] = [0, size.width < 680 ? 26 : 18];

    const arcsCanvas = arcsCanvasRef.current;
    const arcsCtx = arcsCanvas?.getContext("2d") ?? null;

    const reconcileArcs = (now: number) => {
      if (now - lastReconcileRef.current < ARC_RECONCILE_INTERVAL_MS) return;
      lastReconcileRef.current = now;

      const txCounts = txCountsRef.current;
      const cutoff = now - ARC_TPS_WINDOW_MS;
      let totalCount = 0;
      for (const [protocolId, timestamps] of Array.from(txCounts.entries())) {
        let drop = 0;
        while (drop < timestamps.length && timestamps[drop]! < cutoff) drop++;
        if (drop > 0) timestamps.splice(0, drop);
        if (timestamps.length === 0) txCounts.delete(protocolId);
        else totalCount += timestamps.length;
      }
      if (totalCount === 0) return;

      const desired = new Map<string, number>();
      const fractions: Array<[string, number]> = [];
      let allocated = 0;
      for (const [protocolId, timestamps] of txCounts) {
        const share = (ARC_TOTAL_BUDGET * timestamps.length) / totalCount;
        const base = Math.floor(share);
        desired.set(protocolId, base);
        allocated += base;
        fractions.push([protocolId, share - base]);
      }
      fractions.sort((a, b) => b[1] - a[1]);
      for (const [protocolId] of fractions) {
        if (allocated >= ARC_TOTAL_BUDGET) break;
        desired.set(protocolId, (desired.get(protocolId) ?? 0) + 1);
        allocated++;
      }

      const arcs = activeArcsRef.current;
      const current = new Map<string, number>();
      for (const arc of arcs.values()) {
        current.set(arc.protocolId, (current.get(arc.protocolId) ?? 0) + 1);
      }

      const protocolById = protocolByIdRef.current;
      for (const [protocolId, want] of desired) {
        const have = current.get(protocolId) ?? 0;
        if (have >= want) continue;
        const protocol = protocolById.get(protocolId);
        if (!protocol) continue;
        const tone = ARC_TONE_ORDER[hashStringToIndex(protocol.id, ARC_TONE_ORDER.length)]!;
        const toLatLng: [number, number] = [protocol.lat, protocol.lng];
        for (let i = 0; i < want - have; i++) {
          const sinLat = (Math.random() * 2 - 1) * ARC_ORIGIN_LAT_MAX_SIN;
          const fromLat = (Math.asin(sinLat) * 180) / Math.PI;
          const fromLng = Math.random() * 360 - 180;
          const fromLatLng: [number, number] = [fromLat, fromLng];
          const duration =
            ARC_DURATION_MIN_MS +
            Math.random() * (ARC_DURATION_MAX_MS - ARC_DURATION_MIN_MS);
          const uid = `${protocol.id}#${arcUidRef.current++}`;
          arcs.set(uid, {
            protocolId: protocol.id,
            startedAt: now - Math.random() * duration * 0.6,
            duration,
            tone,
            waypoints: buildArcWaypoints(fromLatLng, toLatLng),
          });
        }
      }
    };

    const drawArcs = (now: number) => {
      reconcileArcs(now);
      if (!arcsCanvas || !arcsCtx) return;
      const cssW = size.width;
      const cssH = size.height;
      const aspect = cssW / cssH;
      const currentScale = baseScale * zoomRef.current;
      const offX = sceneOffset[0];
      const offY = sceneOffset[1];
      const phi = phiRef.current;
      const theta = thetaRef.current;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      arcsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      arcsCtx.clearRect(0, 0, cssW, cssH);
      arcsCtx.lineCap = "round";
      arcsCtx.lineJoin = "round";

      const arcs = activeArcsRef.current;
      const expired: string[] = [];

      for (const [key, arc] of arcs) {
        const elapsed = now - arc.startedAt;
        const cycle = elapsed / arc.duration;
        if (cycle >= 1) {
          expired.push(key);
          continue;
        }
        const fadeAlpha =
          cycle < ARC_FADE_START
            ? 1
            : Math.max(0, 1 - (cycle - ARC_FADE_START) / (1 - ARC_FADE_START));
        const points = arc.waypoints;
        const projected: { x: number; y: number; visible: boolean }[] = new Array(
          points.length,
        );
        for (let i = 0; i < points.length; i++) {
          const p = points[i]!;
          const xR = cosPhi * p[0] + sinPhi * p[2];
          const yR = sinPhi * sinT * p[0] + cosT * p[1] - cosPhi * sinT * p[2];
          const zR = -sinPhi * cosT * p[0] + sinT * p[1] + cosPhi * cosT * p[2];
          const xCss =
            (xR / aspect) * currentScale * (cssW / 2) + (offX * currentScale) / 2 + cssW / 2;
          const yCss =
            -yR * currentScale * (cssH / 2) + (offY * currentScale) / 2 + cssH / 2;
          const visible = zR >= 0 || xR * xR + yR * yR >= 0.64;
          projected[i] = { x: xCss, y: yCss, visible };
        }

        const cumulative: number[] = new Array(points.length);
        cumulative[0] = 0;
        let totalLen = 0;
        for (let i = 1; i < points.length; i++) {
          const a = projected[i - 1]!;
          const b = projected[i]!;
          totalLen += Math.hypot(b.x - a.x, b.y - a.y);
          cumulative[i] = totalLen;
        }
        if (totalLen < 1) continue;

        const runs: {
          startLen: number;
          points: [number, number][];
        }[] = [];
        let current: { startLen: number; points: [number, number][] } | null = null;
        for (let i = 0; i < projected.length; i++) {
          const point = projected[i]!;
          if (point.visible) {
            if (!current) {
              current = {
                startLen: cumulative[i] ?? 0,
                points: [[point.x, point.y]],
              };
            } else {
              current.points.push([point.x, point.y]);
            }
          } else if (current) {
            runs.push(current);
            current = null;
          }
        }
        if (current) runs.push(current);
        if (runs.length === 0) continue;

        const baseColor = tonePalette[arc.tone];
        const baseCss = rgbToCss(baseColor, ARC_BASE_ALPHA);
        const brightCss = rgbToCss(baseColor, 0.95);
        const glowCss = rgbToCss(baseColor, 0.55);

        arcsCtx.setLineDash([]);
        arcsCtx.lineDashOffset = 0;
        arcsCtx.lineWidth = ARC_BASE_LINE_WIDTH;
        arcsCtx.strokeStyle = baseCss;
        arcsCtx.shadowBlur = 0;
        arcsCtx.globalAlpha = fadeAlpha;
        for (const run of runs) {
          arcsCtx.beginPath();
          const first = run.points[0]!;
          arcsCtx.moveTo(first[0], first[1]);
          for (let j = 1; j < run.points.length; j++) {
            const point = run.points[j]!;
            arcsCtx.lineTo(point[0], point[1]);
          }
          arcsCtx.stroke();
        }

        const dashLen = Math.max(10, totalLen * ARC_DASH_RATIO);
        const gapLen = Math.max(totalLen * 6, dashLen * 6);
        const traversal = totalLen + dashLen;

        arcsCtx.lineWidth = ARC_LINE_WIDTH;
        arcsCtx.strokeStyle = brightCss;
        arcsCtx.shadowColor = glowCss;
        arcsCtx.shadowBlur = ARC_GLOW_BLUR;
        arcsCtx.setLineDash([dashLen, gapLen]);

        const pulse = 0.42 + 0.44 * Math.sin(cycle * Math.PI);
        arcsCtx.globalAlpha = pulse * fadeAlpha;

        for (const run of runs) {
          arcsCtx.lineDashOffset = run.startLen + dashLen - cycle * traversal;
          arcsCtx.beginPath();
          const first = run.points[0]!;
          arcsCtx.moveTo(first[0], first[1]);
          for (let j = 1; j < run.points.length; j++) {
            const point = run.points[j]!;
            arcsCtx.lineTo(point[0], point[1]);
          }
          arcsCtx.stroke();
        }
        arcsCtx.globalAlpha = 1;
        arcsCtx.shadowBlur = 0;
      }

      for (const key of expired) {
        arcs.delete(key);
      }
    };

    const options: COBEOptions = {
      devicePixelRatio: dpr,
      width,
      height,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 2.4,
      mapSamples: 14000,
      mapBrightness: 4.8,
      mapBaseBrightness: 0.03,
      baseColor: [0.16, 0.17, 0.18],
      markerColor: theme.info,
      glowColor: theme.primary,
      markerElevation: 0.025,
      scale: baseScale * zoomRef.current,
      offset: sceneOffset,
      opacity: 0.96,
      markers: markersRef.current,
      context: {
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: false,
      },
    };

    const globe = createGlobe(canvas, options);
    const cobeWrapper = canvas.parentElement;
    const cobeHost = cobeWrapper?.parentElement;
    const wheelTarget = cobeWrapper ?? canvas;
    globeRef.current = globe;
    setAnchorRoot(cobeWrapper ?? null);

    const dragSensitivity = () => {
      const radius = globeDragRadius(size.width, size.height, baseScale * zoomRef.current);
      return DRAG_ROTATION_SPEED / radius;
    };

    const animate = () => {
      if (!activeRef.current) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const velocity = rotationVelocityRef.current;
      const tween = cameraTargetRef.current;

      if (tween) {
        const t = Math.min(1, (performance.now() - tween.startedAt) / tween.duration);
        const eased = 1 - Math.pow(1 - t, 3);
        phiRef.current = wrapRadians(tween.fromPhi + (tween.toPhi - tween.fromPhi) * eased);
        thetaRef.current = wrapRadians(tween.fromTheta + (tween.toTheta - tween.fromTheta) * eased);
        zoomRef.current = tween.fromZoom + (tween.toZoom - tween.fromZoom) * eased;
        velocity.phi = 0;
        velocity.theta = 0;
        if (t >= 1) cameraTargetRef.current = null;
      } else if (!dragRef.current && (Math.abs(velocity.phi) > 0 || Math.abs(velocity.theta) > 0)) {
        phiRef.current = wrapRadians(phiRef.current + velocity.phi);
        thetaRef.current = wrapRadians(thetaRef.current + velocity.theta);
        velocity.phi *= DRAG_INERTIA_FRICTION;
        velocity.theta *= DRAG_INERTIA_FRICTION;

        if (Math.abs(velocity.phi) < DRAG_INERTIA_STOP) velocity.phi = 0;
        if (Math.abs(velocity.theta) < DRAG_INERTIA_STOP) velocity.theta = 0;
      } else if (!dragRef.current && !markerHoverRef.current && Date.now() > pausedUntil) {
        phiRef.current += AUTO_ROTATION_SPEED;
      }

      if (cobeWrapper) {
        const progress = computeFanProgress(zoomRef.current);
        if (Math.abs(progress - lastFanProgressRef.current) > 0.01) {
          lastFanProgressRef.current = progress;
          cobeWrapper.style.setProperty("--fan-progress", progress.toFixed(3));
        }
        const nextActive = progress > 0.5;
        if (nextActive !== lastFanActiveRef.current) {
          lastFanActiveRef.current = nextActive;
          cobeWrapper.classList.toggle("fan-active", nextActive);
        }

        for (const target of markerInteractivityTargetsRef.current) {
          const nextEvents = markerFacesCamera(
            target.lat,
            target.lng,
            phiRef.current,
            thetaRef.current,
          )
            ? "auto"
            : "none";
          if (markerEventsRef.current.get(target.id) !== nextEvents) {
            markerEventsRef.current.set(target.id, nextEvents);
            cobeWrapper.style.setProperty(`--cobe-events-${target.id}`, nextEvents);
          }
        }
      }

      const updatePayload: Parameters<typeof globe.update>[0] = {
        phi: phiRef.current,
        theta: thetaRef.current,
        scale: baseScale * zoomRef.current,
      };
      if (markersDirtyRef.current) {
        updatePayload.markers = markersRef.current;
        markersDirtyRef.current = false;
      }
      globe.update(updatePayload);
      drawArcs(performance.now());
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);

    const pause = () => {
      pausedUntil = Date.now() + 9000;
    };

    const suppressSelection = () => {
      suppressSelectionUntilRef.current = Date.now() + SELECT_SUPPRESS_MS;
    };

    const resetInput = () => {
      for (const pointerId of activePointersRef.current.keys()) {
        if (canvas.hasPointerCapture(pointerId)) {
          canvas.releasePointerCapture(pointerId);
        }
      }
      activePointersRef.current.clear();
      pinchRef.current = null;
      dragRef.current = null;
      rotationVelocityRef.current = { phi: 0, theta: 0 };
    };

    const updateZoom = (nextZoom: number) => {
      const zoom = clamp(nextZoom, MIN_GLOBE_ZOOM, MAX_GLOBE_ZOOM);
      if (zoom === zoomRef.current) return;
      zoomRef.current = zoom;
      cameraTargetRef.current = null;
    };

    const handleWheel = (event: WheelEvent) => {
      const nextZoom = clamp(
        zoomRef.current * Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED),
        MIN_GLOBE_ZOOM,
        MAX_GLOBE_ZOOM,
      );
      const zoomWillChange = Math.abs(nextZoom - zoomRef.current) > 0.0001;
      if (!zoomWillChange) return;

      event.preventDefault();
      updateZoom(nextZoom);
      suppressSelection();
      pause();
    };

    const handlePointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      rotationVelocityRef.current = { phi: 0, theta: 0 };
      cameraTargetRef.current = null;
      setExpandedClusterId(null);

      if (activePointersRef.current.size >= 2) {
        pinchRef.current = {
          distance: pointerDistance(activePointersRef.current),
          zoom: zoomRef.current,
        };
        dragRef.current = null;
        pause();
        return;
      }

      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        distance: 0,
      };
      pause();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointersRef.current.has(event.pointerId)) {
        activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }

      const pinch = pinchRef.current;
      if (pinch && activePointersRef.current.size >= 2) {
        const distance = pointerDistance(activePointersRef.current);
        if (distance > 0 && pinch.distance > 0) {
          updateZoom(pinch.zoom * (distance / pinch.distance));
        }
        rotationVelocityRef.current = { phi: 0, theta: 0 };
        suppressSelection();
        pause();
        return;
      }

      const drag = dragRef.current;
      if (!drag) return;
      if (event.buttons === 0) {
        resetInput();
        return;
      }
      const sensitivity = dragSensitivity();
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      const distance = drag.distance + Math.hypot(deltaX, deltaY);
      const nextPhi = wrapRadians(phiRef.current + deltaX * sensitivity);
      const nextTheta = wrapRadians(thetaRef.current + deltaY * sensitivity);
      rotationVelocityRef.current = {
        phi: clamp(deltaX * sensitivity, -DRAG_MAX_VELOCITY, DRAG_MAX_VELOCITY),
        theta: clamp(deltaY * sensitivity, -DRAG_MAX_VELOCITY, DRAG_MAX_VELOCITY),
      };
      phiRef.current = nextPhi;
      thetaRef.current = nextTheta;
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        distance,
      };
      if (distance > SELECT_DRAG_THRESHOLD) suppressSelection();
      pause();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.type === "pointercancel") {
        resetInput();
        suppressSelection();
        pause();
        return;
      }

      activePointersRef.current.delete(event.pointerId);
      pinchRef.current = null;

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      const [remainingPointer] = activePointersRef.current.values();
      dragRef.current = remainingPointer
        ? {
            x: remainingPointer.x,
            y: remainingPointer.y,
            distance: 0,
          }
        : null;
      pause();
    };

    const handleLostPointerCapture = () => {
      if (activePointersRef.current.size > 0 || dragRef.current || pinchRef.current) {
        resetInput();
        suppressSelection();
        pause();
      }
    };

    const handleWindowBlur = () => {
      resetInput();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) resetInput();
    };

    wheelTarget.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("lostpointercapture", handleLostPointerCapture);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrame);
      wheelTarget.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("lostpointercapture", handleLostPointerCapture);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resetInput();
      markerHoverRef.current = false;
      setAnchorRoot(null);
      globe.destroy();
      if (cobeHost && cobeWrapper && canvas.parentElement === cobeWrapper) {
        cobeHost.insertBefore(canvas, cobeWrapper);
        cobeWrapper.remove();
      }
      globeRef.current = null;
    };
  }, [size.height, size.width]);

  const selectCountry = (country: string) => {
    if (Date.now() < suppressSelectionUntilRef.current) return;
    const feature = findCountryFeature(countryFeatures, country);
    if (feature) onCountrySelected(country, feature);
  };

  const selectProtocol = (protocol: Protocol) => {
    if (Date.now() < suppressSelectionUntilRef.current) return;
    setExpandedClusterId(null);
    onProtocolSelected(protocol);
  };

  const expandCluster = (cluster: Cluster) => {
    if (Date.now() < suppressSelectionUntilRef.current) return;
    if (cluster.collocated) {
      setExpandedClusterId(cluster.id);
      return;
    }
    setExpandedClusterId(null);
    const targetPhiRaw = -Math.PI / 2 - cluster.lng * (Math.PI / 180);
    const targetThetaRaw = cluster.lat * (Math.PI / 180);
    const fromPhi = phiRef.current;
    const fromTheta = thetaRef.current;
    const deltaPhi = wrapRadians(targetPhiRaw - fromPhi);
    const deltaTheta = wrapRadians(targetThetaRaw - fromTheta);
    cameraTargetRef.current = {
      startedAt: performance.now(),
      duration: CAMERA_TWEEN_MS,
      fromPhi,
      fromTheta,
      fromZoom: zoomRef.current,
      toPhi: fromPhi + deltaPhi,
      toTheta: fromTheta + deltaTheta,
      toZoom: zoomToSplit(cluster, MIN_GLOBE_ZOOM, MAX_GLOBE_ZOOM),
    };
  };

  const handleMarkerEnter = (
    protocol?: Protocol,
    event?: React.PointerEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
  ) => {
    markerHoverRef.current = true;

    if (protocol && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const pointerX = "clientX" in event && event.clientX > 0 ? event.clientX : rect.left + rect.width / 2;
      const pointerY = "clientY" in event && event.clientY > 0 ? event.clientY : rect.top;
      onProtocolPreviewChange?.(protocol, {
        x: pointerX,
        y: pointerY,
      });
    }
  };

  const handleMarkerLeave = (protocol?: Protocol) => {
    markerHoverRef.current = false;
    if (protocol) onProtocolPreviewChange?.(null);
  };

  const markerLayer = (
    <div className="cobe-marker-layer" aria-label="Protocol markers">
          {clusters.map((cluster) => {
            if (cluster.protocols.length === 1) {
              const protocol = cluster.protocols[0]!;
              return (
                <button
                  key={cluster.id}
                  type="button"
                  className="protocol-marker cobe-marker"
                  style={markerAnchorStyle(cluster.id)}
                  onPointerEnter={(event) => handleMarkerEnter(protocol, event)}
                  onPointerLeave={() => handleMarkerLeave(protocol)}
                  onFocus={(event) => handleMarkerEnter(protocol, event)}
                  onBlur={() => handleMarkerLeave(protocol)}
                  onClick={() => selectProtocol(protocol)}
                  aria-label={`${protocol.name} protocol marker`}
                >
                  <span className="protocol-marker-logo">
                    {protocol.logo ? <img src={protocol.logo} alt="" /> : protocolInitials(protocol, 3)}
                  </span>
                  <span className="protocol-marker-copy">
                    <span className="protocol-marker-label">{protocol.name}</span>
                    {protocol.activeUsers != null && protocol.activeUsers > 0 ? (
                      <span className="protocol-marker-meta">{formatActiveUsers(protocol.activeUsers)} users</span>
                    ) : null}
                  </span>
                </button>
              );
            }

            const isExpanded = cluster.collocated && expandedClusterId === cluster.id;
            const showFan = cluster.collocated && (isExpanded || cluster.protocols.length === 2);
            const showBadge = !(cluster.collocated && cluster.protocols.length === 2);
            const visible = cluster.protocols.slice(0, 3);
            const count = cluster.protocols.length;
            const fanRadius = Math.min(92, MAX_FAN_RADIUS + Math.max(0, count - 3) * 8);
            const badge = (
              <button
                key={`badge-${cluster.id}`}
                type="button"
                className="protocol-cluster-marker cobe-marker"
                data-cluster-expanded={isExpanded ? "true" : undefined}
                style={markerAnchorStyle(cluster.id)}
                onPointerEnter={() => handleMarkerEnter()}
                onPointerLeave={() => handleMarkerLeave()}
                onClick={() => expandCluster(cluster)}
                aria-label={`Cluster of ${count} protocols`}
                title={cluster.protocols.map((p) => p.name).join(", ")}
              >
                <span className="protocol-cluster-stack">
                  {visible.map((p) => (
                    <span key={p.id} className="protocol-cluster-logo">
                      {p.logo ? <img src={p.logo} alt="" /> : protocolInitials(p, 2)}
                    </span>
                  ))}
                </span>
                <span className="protocol-cluster-count">{count}</span>
              </button>
            );

            return (
              <Fragment key={cluster.id}>
                {showBadge ? badge : null}
                {cluster.protocols.map((protocol, i) => {
                  const fanOffset = getFanOffset(cluster.id, protocol.id, i, fanRadius);
                  return (
                    <button
                      key={protocol.id}
                      type="button"
                      className="protocol-marker protocol-marker-fan cobe-marker"
                      data-cluster-expanded={showFan ? "true" : undefined}
                      style={
                        {
                          ...markerAnchorStyle(cluster.id),
                          "--fan-radius-x": `${fanOffset.x}px`,
                          "--fan-radius-y": `${fanOffset.y}px`,
                          ...(showFan ? { "--fan-progress": "1" } : null),
                        } as MarkerStyle
                      }
                      onPointerEnter={(event) => handleMarkerEnter(protocol, event)}
                      onPointerLeave={() => handleMarkerLeave(protocol)}
                      onFocus={(event) => handleMarkerEnter(protocol, event)}
                      onBlur={() => handleMarkerLeave(protocol)}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectProtocol(protocol);
                      }}
                      aria-label={`${protocol.name} protocol marker`}
                    >
                      <span className="protocol-marker-logo">
                        {protocol.logo ? <img src={protocol.logo} alt="" /> : protocolInitials(protocol, 3)}
                      </span>
                      <span className="protocol-marker-copy">
                        <span className="protocol-marker-label">{protocol.name}</span>
                        {protocol.activeUsers != null && protocol.activeUsers > 0 ? (
                          <span className="protocol-marker-meta">{formatActiveUsers(protocol.activeUsers)} users</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </Fragment>
            );
          })}

          {pins.map((pin) => {
            const id = markerId("pin", pin.id);
            return (
              <span
                key={pin.id}
                className="wallet-pin-marker"
                style={markerAnchorStyle(id)}
                onPointerEnter={() => handleMarkerEnter()}
                onPointerLeave={() => handleMarkerLeave()}
                title={pin.country}
              />
            );
          })}

          {pinMode
            ? PIN_COUNTRY_TARGETS.map((target) => {
                const id = markerId("target", target.country);
                return (
                  <button
                    key={target.country}
                    type="button"
                    className="country-target-marker"
                    style={markerAnchorStyle(id)}
                    onClick={() => selectCountry(target.country)}
                    onPointerEnter={() => {
                      handleMarkerEnter();
                      setHoveredCountry(target.label);
                    }}
                    onPointerLeave={() => {
                      handleMarkerLeave();
                      setHoveredCountry(null);
                    }}
                  >
                    {target.label}
                  </button>
              );
            })
            : null}
    </div>
  );

  return (
    <section
      className="globe-stage cobe-stage"
      aria-hidden={active ? undefined : "true"}
      aria-label={active ? "Interactive DeFi globe" : undefined}
    >
      <div ref={containerRef} className="globe-canvas cobe-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="cobe-canvas"
          style={{
            width: size.width,
            height: size.height,
          }}
          width={size.width * getCanvasDpr()}
          height={size.height * getCanvasDpr()}
        />
        <canvas
          ref={arcsCanvasRef}
          className="cobe-arcs-canvas"
          aria-hidden="true"
          style={{
            width: size.width,
            height: size.height,
          }}
          width={size.width * getCanvasDpr()}
          height={size.height * getCanvasDpr()}
        />
      </div>

      {active && anchorRoot ? createPortal(markerLayer, anchorRoot) : null}

      {hoveredCountry && (
        <div className="country-chip">
          <span>Pin target</span>
          <strong>{hoveredCountry}</strong>
          <small>Cobe marker</small>
        </div>
      )}
    </section>
  );
}
