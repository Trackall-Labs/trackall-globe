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

export type TrackallAmount = {
  amount: string;
  decimals: number;
  token: string;
};

export type TrackallPositionLeg = {
  amount?: TrackallAmount;
  priceUsd?: number | string;
  supplyRate?: number | string;
  usdValue?: number | string;
};

export type TrackallSolanaPosition = {
  apy?: number | string;
  borrowed?: TrackallPositionLeg[];
  currentPriceUsd?: number | string;
  feeBps?: number | string;
  fees?: TrackallPositionLeg[];
  isActive?: boolean;
  liquidityModel?: string;
  lowerPriceUsd?: number | string;
  meta?: Record<string, unknown>;
  platformId: string;
  poolAddress?: string;
  poolTokens?: TrackallPositionLeg[];
  positionKind: string;
  rewards?: TrackallPositionLeg[];
  staked?: TrackallPositionLeg[];
  supplied?: TrackallPositionLeg[];
  totalStakedUsd?: number | string;
  upperPriceUsd?: number | string;
  usdValue?: number | string;
  pctUsdValueChange24?: number | string;
};

export type TrackallSolanaPositionCache = {
  address: string | null;
  cachedAt: number | null;
  positions: TrackallSolanaPosition[];
};

export type TrackallSolanaToken = {
  amount?: string;
  decimals?: number;
  image?: string;
  mint: string;
  name?: string;
  pctPriceChange24h?: number | string;
  priceUsd?: number | string;
  symbol?: string;
  tokenAccount?: string;
  uiAmount?: number | string;
  usdValue?: number | string;
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

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readNumberLike(value: unknown): number | string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value;
  return undefined;
}

function parseAmount(value: unknown): TrackallAmount | undefined {
  if (!isRecord(value)) return undefined;
  const token = readString(value.token);
  const amount = readString(value.amount);
  const decimals =
    typeof value.decimals === "number"
      ? value.decimals
      : typeof value.decimals === "string"
        ? Number(value.decimals)
        : NaN;
  if (!token || !amount || !Number.isFinite(decimals)) return undefined;
  return { amount, decimals, token };
}

function parsePositionLeg(value: unknown): TrackallPositionLeg | null {
  if (!isRecord(value)) return null;
  return {
    amount: parseAmount(value.amount),
    priceUsd: readNumberLike(value.priceUsd),
    supplyRate: readNumberLike(value.supplyRate),
    usdValue: readNumberLike(value.usdValue),
  };
}

function readPositionLegs(value: unknown) {
  return Array.isArray(value)
    ? value.map(parsePositionLeg).filter((item): item is TrackallPositionLeg => item !== null)
    : undefined;
}

function parseSolanaPosition(value: unknown): TrackallSolanaPosition | null {
  if (!isRecord(value)) return null;
  const platformId = readString(value.platformId);
  const positionKind = readString(value.positionKind);
  if (!platformId || !positionKind) return null;

  return {
    apy: readNumberLike(value.apy),
    borrowed: readPositionLegs(value.borrowed),
    currentPriceUsd: readNumberLike(value.currentPriceUsd),
    feeBps: readNumberLike(value.feeBps),
    fees: readPositionLegs(value.fees),
    isActive: typeof value.isActive === "boolean" ? value.isActive : undefined,
    liquidityModel: readString(value.liquidityModel) ?? undefined,
    lowerPriceUsd: readNumberLike(value.lowerPriceUsd),
    meta: isRecord(value.meta) ? value.meta : undefined,
    platformId,
    poolAddress: readString(value.poolAddress) ?? undefined,
    poolTokens: readPositionLegs(value.poolTokens),
    positionKind,
    rewards: readPositionLegs(value.rewards),
    staked: readPositionLegs(value.staked),
    supplied: readPositionLegs(value.supplied),
    totalStakedUsd: readNumberLike(value.totalStakedUsd),
    upperPriceUsd: readNumberLike(value.upperPriceUsd),
    usdValue: readNumberLike(value.usdValue),
    pctUsdValueChange24: readNumberLike(value.pctUsdValueChange24),
  };
}

function parseSolanaToken(value: unknown, fallbackMint?: string): TrackallSolanaToken | null {
  if (!isRecord(value)) return null;
  const mint = readString(value.mint) ?? readString(value.mintAddress) ?? fallbackMint;
  if (!mint) return null;

  return {
    amount: readString(value.amount) ?? undefined,
    decimals: readNumber(value.decimals) ?? undefined,
    image: readString(value.image) ?? undefined,
    mint,
    name: readString(value.name) ?? undefined,
    pctPriceChange24h: readNumberLike(value.pctPriceChange24h),
    priceUsd: readNumberLike(value.priceUsd),
    symbol: readString(value.symbol) ?? undefined,
    tokenAccount: readString(value.tokenAccount) ?? undefined,
    uiAmount: readNumberLike(value.uiAmount),
    usdValue: readNumberLike(value.usdValue),
  };
}

function requireApiKey(config: TrackallApiConfig) {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) {
    throw new Error("Missing VITE_TRACKALL_API_KEY");
  }
  return apiKey;
}

async function fetchTrackallJson(path: string, config: TrackallApiConfig, signal?: AbortSignal): Promise<unknown> {
  const url = new URL(path, normalizeBaseUrl(config.baseUrl));
  const response = await fetch(url, {
    headers: {
      "x-api-key": requireApiKey(config),
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Trackall API returned ${response.status}`);
  }

  return response.json();
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
  const data = await fetchTrackallJson("api/solana/platforms", config, signal);
  if (!Array.isArray(data)) {
    throw new Error("Trackall API returned an invalid platforms payload");
  }

  return data.map(parsePlatform).filter((platform): platform is TrackallPlatform => platform !== null);
}

export async function fetchSolanaPositions(
  address: string,
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallSolanaPosition[]> {
  const data = await fetchTrackallJson(`api/solana/positions/${encodeURIComponent(address)}`, config, signal);
  if (!Array.isArray(data)) {
    throw new Error("Trackall API returned an invalid positions payload");
  }

  return data.map(parseSolanaPosition).filter((position): position is TrackallSolanaPosition => position !== null);
}

export async function fetchSolanaPositionCache(
  address: string,
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallSolanaPositionCache> {
  const data = await fetchTrackallJson(`api/solana/positions/${encodeURIComponent(address)}/cache`, config, signal);
  if (!isRecord(data) || !Array.isArray(data.positions)) {
    throw new Error("Trackall API returned an invalid cached positions payload");
  }

  return {
    address: readString(data.address),
    cachedAt: readNumber(data.cachedAt),
    positions: data.positions
      .map(parseSolanaPosition)
      .filter((position): position is TrackallSolanaPosition => position !== null),
  };
}

export async function fetchSolanaTokens(
  address: string,
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallSolanaToken[]> {
  const data = await fetchTrackallJson(`api/solana/tokens/${encodeURIComponent(address)}`, config, signal);
  if (!Array.isArray(data)) {
    throw new Error("Trackall API returned an invalid tokens payload");
  }

  return data.map((item) => parseSolanaToken(item)).filter((token): token is TrackallSolanaToken => token !== null);
}

const TOKEN_METADATA_BATCH_SIZE = 20;

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function fetchSolanaTokenMetadataBatch(
  mints: string[],
  config: TrackallApiConfig,
  signal?: AbortSignal,
): Promise<TrackallSolanaToken[]> {
  const params = new URLSearchParams({ addresses: mints.join(",") });
  const data = await fetchTrackallJson(`api/solana/tokens?${params.toString()}`, config, signal);
  if (!isRecord(data)) {
    throw new Error("Trackall API returned an invalid token metadata payload");
  }

  return Object.entries(data)
    .map(([mint, token]) => parseSolanaToken(token, mint))
    .filter((token): token is TrackallSolanaToken => token !== null);
}

export async function fetchSolanaTokenMetadata(
  mints: string[],
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallSolanaToken[]> {
  const dedupedMints = [...new Set(mints.map((mint) => mint.trim()).filter(Boolean))];
  if (dedupedMints.length === 0) return [];

  const batches = chunkArray(dedupedMints, TOKEN_METADATA_BATCH_SIZE);
  const results = await Promise.all(
    batches.map((batch) => fetchSolanaTokenMetadataBatch(batch, config, signal)),
  );
  return results.flat();
}

export function trackallRefreshMs() {
  return API_REFRESH_MS;
}
