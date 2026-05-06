import { NETWORKS } from "./networks";
import type { Protocol, ProtocolCategory } from "./types";

export type TrackallPlatform = {
  activeUsers: number;
  defiLlamaId?: string;
  description: string;
  id: string;
  image: string;
  links?: {
    website?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  name: string;
  networks: string[];
  programIds: string[];
  tags: string[];
};

export type TrackallApiConfig = {
  apiKey?: string;
  baseUrl?: string;
};

const DEFAULT_TRACKALL_API_URL = "https://trackall.nightly.app/";
const SOLANA_HUB = NETWORKS.find((network) => network.id === "solana") ?? NETWORKS[0]!;
const API_REFRESH_MS = 60_000;

function normalizeBaseUrl(value: string | undefined) {
  const raw = value?.trim() || DEFAULT_TRACKALL_API_URL;
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parsePlatform(value: unknown): TrackallPlatform | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") return null;
  if (typeof value.description !== "string" || typeof value.image !== "string") return null;

  const location = isRecord(value.location)
    ? {
        latitude: readNumber(value.location.latitude),
        longitude: readNumber(value.location.longitude),
      }
    : null;
  const links = isRecord(value.links) && typeof value.links.website === "string"
    ? { website: value.links.website }
    : undefined;

  return {
    activeUsers: readNumber(value.activeUsers) ?? 0,
    defiLlamaId: typeof value.defiLlamaId === "string" ? value.defiLlamaId : undefined,
    description: value.description,
    id: value.id,
    image: value.image,
    links,
    location:
      location?.latitude != null && location.longitude != null
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        : undefined,
    name: value.name,
    networks: readStringArray(value.networks),
    programIds: readStringArray(value.programIds),
    tags: readStringArray(value.tags),
  };
}

function hashUnit(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

function fallbackLocation(platformId: string) {
  const radius = 7.2;
  const angle = hashUnit(`${platformId}:angle`) * Math.PI * 2;
  const distance = 1.2 + hashUnit(`${platformId}:distance`) * radius;
  return {
    lat: SOLANA_HUB.hubLat + Math.sin(angle) * distance,
    lng: SOLANA_HUB.hubLng + Math.cos(angle) * distance,
  };
}

function networkName(value: string) {
  const match = NETWORKS.find((network) => network.id === value.toLowerCase());
  if (match) return match.name;
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function categoryFromTags(tags: string[]): ProtocolCategory {
  const normalized = tags.map((tag) => tag.toLowerCase());
  if (normalized.some((tag) => tag.includes("dex") || tag.includes("swap") || tag.includes("trading"))) return "DEX";
  if (normalized.some((tag) => tag.includes("lend") || tag.includes("borrow"))) return "Lending";
  if (normalized.some((tag) => tag.includes("stake"))) return "Staking";
  if (normalized.some((tag) => tag.includes("bridge"))) return "Bridge";
  if (normalized.some((tag) => tag.includes("stable"))) return "Stablecoin";
  if (normalized.some((tag) => tag.includes("govern"))) return "Governance";
  return "DeFi";
}

function protocolSymbol(platform: TrackallPlatform) {
  const source = platform.defiLlamaId ?? platform.id ?? platform.name;
  return source
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 5)
    .toUpperCase() || platform.name.slice(0, 5).toUpperCase();
}

export function mapTrackallPlatformToProtocol(platform: TrackallPlatform): Protocol {
  const fallback = fallbackLocation(platform.id);
  const lat = platform.location?.latitude ?? fallback.lat;
  const lng = platform.location?.longitude ?? fallback.lng;

  return {
    activeUsers: platform.activeUsers,
    category: categoryFromTags(platform.tags),
    country: "Solana ecosystem",
    description: platform.description,
    id: platform.id,
    lat,
    lng,
    logo: platform.image,
    name: platform.name,
    networks: platform.networks.length > 0 ? platform.networks.map(networkName) : ["Solana"],
    programIds: platform.programIds,
    source: "trackall-api",
    symbol: protocolSymbol(platform),
    tags: platform.tags,
    website: platform.links?.website,
  };
}

export function sortTrackallProtocols(protocols: Protocol[]) {
  return [...protocols].sort((a, b) => {
    const activeDelta = (b.activeUsers ?? 0) - (a.activeUsers ?? 0);
    if (activeDelta !== 0) return activeDelta;
    return a.name.localeCompare(b.name);
  });
}

export async function fetchSolanaPlatforms(
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallPlatform[]> {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) {
    throw new Error("Missing VITE_TRACKALL_API_KEY");
  }

  const url = new URL("api/solana/platforms", normalizeBaseUrl(config.baseUrl));
  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Trackall API returned ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Trackall API returned an invalid platforms payload");
  }

  return data.map(parsePlatform).filter((platform): platform is TrackallPlatform => platform !== null);
}

export function trackallRefreshMs() {
  return API_REFRESH_MS;
}
