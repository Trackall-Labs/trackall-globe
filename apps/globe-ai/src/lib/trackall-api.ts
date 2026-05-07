import type {
  ConcentratedRangeLiquidityDefiPosition,
  ConstantProductLiquidityDefiPosition,
  LendingBorrowedAsset,
  LendingDefiPosition,
  LendingSuppliedAsset,
  LiquidityDefiPosition,
  LiquidityModel,
  PlatformTag,
  PositionKind,
  PositionMetadata,
  PositionValue,
  RewardDefiPosition,
  SolanaPlatformWithActiveUsers,
  StakedAsset,
  StakingDefiPosition,
  TokenAmount,
  TokenData,
  TradingAccountMetrics,
  TradingDefiPosition,
  TradingMarketPosition,
  TradingMarketType,
  TradingOrder,
  TradingPositionStatus,
  TradingSide,
  TradingTrigger,
  UserDefiPosition,
  VestingAsset,
  VestingDefiPosition,
} from "@nightlylabs/trackall-sdk";
import { NETWORKS } from "./networks";
import type { Protocol, ProtocolCategory } from "./types";

export type {
  LendingBorrowedAsset,
  LendingDefiPosition,
  LendingSuppliedAsset,
  LiquidityDefiPosition,
  PositionValue,
  RewardDefiPosition,
  StakedAsset,
  StakingDefiPosition,
  TokenAmount,
  UserDefiPosition,
  VestingDefiPosition,
} from "@nightlylabs/trackall-sdk";

export type TrackallPlatform = SolanaPlatformWithActiveUsers & {
  programIds: string[];
};

export type TrackallApiConfig = {
  apiKey?: string;
  baseUrl?: string;
};

export type TrackallSolanaPosition = UserDefiPosition;

export type TrackallSolanaPositionCache = {
  address: string | null;
  cachedAt: number | null;
  positions: TrackallSolanaPosition[];
};

export type TrackallSolanaToken = Pick<TokenData, "mintAddress"> &
  Partial<Omit<TokenData, "mintAddress">> & {
    tokenAccount?: string;
    amount?: string;
    uiAmount?: number | string;
    usdValue?: number | string;
  };

export type TrackallSolanaPortfolioPlotBucket = "1h" | "4h" | "1d";

export type TrackallSolanaPortfolioPlotRange = {
  from: string | null;
  to: string | null;
  timezone: string | null;
};

export type TrackallSolanaPortfolioPlotPoint = {
  hour: string | null;
  capturedAt: string | null;
  timestamp: string;
  totalUsd: number;
  positionCount: number;
  positions: unknown[];
};

export type TrackallSolanaPortfolioPlot = {
  address: string | null;
  bucket: string | null;
  range: TrackallSolanaPortfolioPlotRange;
  points: TrackallSolanaPortfolioPlotPoint[];
};

export type TrackallTopWallet = {
  rank: number;
  address: string;
  totalUsd: number;
  positionCount: number;
  capturedAt: string;
};

export type TrackallAggregateTopWalletProtocol = {
  platformId: string;
  totalUsd: number;
  positionCount: number;
  capturedAt: string;
};

export type TrackallAggregateTopWallet = TrackallTopWallet & {
  protocolCount: number;
  protocols: TrackallAggregateTopWalletProtocol[];
};

export type TrackallTopWalletsPlatform = {
  platformId: string;
  wallets: TrackallTopWallet[];
};

export type TrackallTopWalletsResponse = {
  asOfRunId: number | null;
  limit: number;
  platforms: TrackallTopWalletsPlatform[];
};

export type TrackallAggregateTopWalletsResponse = {
  asOfRunId: number | null;
  limit: number;
  wallets: TrackallAggregateTopWallet[];
};

export type TrackallSolanaPlatformMetricPlotPoint = {
  timestamp: string;
  tvlUsd: number | null;
  volume24hUsd: number | null;
};

export type TrackallSolanaPlatformTransactionsPlotPoint = {
  timestamp: string;
  transactionCount: number | null;
};

export type TrackallSolanaPlatformUsersPlotPoint = {
  timestamp: string;
  activeUsers: number | null;
};

export type TrackallSolanaChainMetrics = {
  capturedAt: string | null;
  chain: "Solana";
  errorMessage: string | null;
  plot: TrackallSolanaPlatformMetricPlotPoint[];
  usersPlot: TrackallSolanaPlatformUsersPlotPoint[];
  tvlChange24hPct: number | null;
  tvlPrevious24hUsd: number | null;
  tvlUsd: number | null;
  updatedAt: string | null;
  volume24hUsd: number | null;
  volumeChange24hPct: number | null;
  volumePrevious24hUsd: number | null;
};

export type TrackallSolanaPlatformMetrics = {
  capturedAt: string | null;
  errorMessage: string | null;
  platformId: string;
  platformName: string;
  plot: TrackallSolanaPlatformMetricPlotPoint[];
  transactionCount: number | null;
  transactionsPlot: TrackallSolanaPlatformTransactionsPlotPoint[];
  tvlChange24hPct: number | null;
  tvlMatchStatus: "matched" | "missing";
  tvlPrevious24hUsd: number | null;
  tvlSlug: string | null;
  tvlUsd: number | null;
  updatedAt: string | null;
  usersPlot: TrackallSolanaPlatformUsersPlotPoint[];
  volume24hUsd: number | null;
  volumeChange24hPct: number | null;
  volumeMatchStatus: "matched" | "missing";
  volumePrevious24hUsd: number | null;
  volumeSlug: string | null;
};

export type TrackallSolanaPlatformMetricsResponse = {
  chain: TrackallSolanaChainMetrics;
  network: "solana";
  platforms: TrackallSolanaPlatformMetrics[];
};

const DEFAULT_TRACKALL_API_URL = "https://trackall.nightly.app/";
const SOLANA_HUB = NETWORKS.find((network) => network.id === "solana") ?? NETWORKS[0]!;
const API_REFRESH_MS = 60_000;

const PLATFORM_TAGS = new Set<PlatformTag>([
  "dex",
  "lending",
  "stablecoin",
  "cefi",
  "defi",
  "nft",
  "cex",
  "wallet",
  "bridge",
  "staking",
  "governance",
]);

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

function readFiniteDecimalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readDecimalString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function parseAmount(value: unknown): TokenAmount | undefined {
  if (!isRecord(value)) return undefined;
  const token = readString(value.token);
  const amount = readString(value.amount);
  const decimals = readDecimalString(value.decimals);
  if (!token || !amount || decimals === undefined) return undefined;
  return { amount, decimals, token };
}

function parsePositionValue(value: unknown): PositionValue | null {
  if (!isRecord(value)) return null;
  const amount = parseAmount(value.amount);
  if (!amount) return null;
  return {
    amount,
    pctUsdValueChange24: readDecimalString(value.pctUsdValueChange24),
    priceUsd: readDecimalString(value.priceUsd),
    usdValue: readDecimalString(value.usdValue),
  };
}

function parsePositionValues(value: unknown): PositionValue[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value
    .map(parsePositionValue)
    .filter((item): item is PositionValue => item !== null);
  return result.length > 0 ? result : undefined;
}

function parseLendingSuppliedAsset(value: unknown): LendingSuppliedAsset | null {
  const base = parsePositionValue(value);
  if (!base || !isRecord(value)) return null;
  return {
    ...base,
    collateralFactor: readDecimalString(value.collateralFactor),
    supplyRate: readDecimalString(value.supplyRate),
  };
}

function parseLendingSuppliedAssets(value: unknown): LendingSuppliedAsset[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value
    .map(parseLendingSuppliedAsset)
    .filter((item): item is LendingSuppliedAsset => item !== null);
  return result.length > 0 ? result : undefined;
}

function parseLendingBorrowedAsset(value: unknown): LendingBorrowedAsset | null {
  const base = parsePositionValue(value);
  if (!base || !isRecord(value)) return null;
  return {
    ...base,
    borrowRate: readDecimalString(value.borrowRate),
    maintenanceRatio: readDecimalString(value.maintenanceRatio),
  };
}

function parseLendingBorrowedAssets(value: unknown): LendingBorrowedAsset[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value
    .map(parseLendingBorrowedAsset)
    .filter((item): item is LendingBorrowedAsset => item !== null);
  return result.length > 0 ? result : undefined;
}

function parseStakedAsset(value: unknown): StakedAsset | null {
  const base = parsePositionValue(value);
  if (!base || !isRecord(value)) return null;
  const claimableRaw = parsePositionValue(value.claimableReward);
  return {
    ...base,
    claimableReward: claimableRaw ?? undefined,
    cooldownPeriod: readDecimalString(value.cooldownPeriod),
    rewardRate: readDecimalString(value.rewardRate),
  };
}

function parseStakedAssets(value: unknown): StakedAsset[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value
    .map(parseStakedAsset)
    .filter((item): item is StakedAsset => item !== null);
  return result.length > 0 ? result : undefined;
}

function parseVestingAsset(value: unknown): VestingAsset | null {
  const base = parsePositionValue(value);
  if (!base || !isRecord(value)) return null;
  return {
    ...base,
    claimable: parsePositionValue(value.claimable) ?? undefined,
    claimed: parsePositionValue(value.claimed) ?? undefined,
  };
}

function parseVestingAssets(value: unknown): VestingAsset[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value
    .map(parseVestingAsset)
    .filter((item): item is VestingAsset => item !== null);
  return result.length > 0 ? result : undefined;
}

function parseTradingTrigger(value: unknown): TradingTrigger | null {
  if (!isRecord(value)) return null;
  const price = readDecimalString(value.price);
  const condition = value.condition === "above" || value.condition === "below" ? value.condition : null;
  if (!price || !condition) return null;
  return { condition, price };
}

function parseTradingOrder(value: unknown): TradingOrder | null {
  if (!isRecord(value)) return null;
  const side = value.side === "buy" || value.side === "sell" ? (value.side as TradingSide) : null;
  const selling = parsePositionValue(value.selling);
  const buying = parsePositionValue(value.buying);
  if (!side || !selling || !buying) return null;
  const status = (() => {
    const candidates: TradingPositionStatus[] = ["open", "partially-filled", "filled", "cancelled"];
    return candidates.includes(value.status as TradingPositionStatus)
      ? (value.status as TradingPositionStatus)
      : undefined;
  })();
  const triggers = Array.isArray(value.triggers)
    ? value.triggers.map(parseTradingTrigger).filter((trigger): trigger is TradingTrigger => trigger !== null)
    : undefined;
  return {
    buying,
    filledFraction: readDecimalString(value.filledFraction),
    limitPrice: readDecimalString(value.limitPrice),
    selling,
    side,
    status,
    triggers: triggers && triggers.length > 0 ? triggers : undefined,
  };
}

function parseTradingMarketPosition(value: unknown): TradingMarketPosition | null {
  if (!isRecord(value)) return null;
  const side = value.side === "long" || value.side === "short" ? value.side : undefined;
  return {
    collateral: parsePositionValues(value.collateral),
    entryPrice: readDecimalString(value.entryPrice),
    fundingPnl: readDecimalString(value.fundingPnl),
    leverage: readDecimalString(value.leverage),
    liquidationPrice: readDecimalString(value.liquidationPrice),
    markPrice: readDecimalString(value.markPrice),
    notionalUsd: readDecimalString(value.notionalUsd),
    realizedPnl: readDecimalString(value.realizedPnl),
    side,
    size: parsePositionValue(value.size) ?? undefined,
    unrealizedPnl: readDecimalString(value.unrealizedPnl),
  };
}

function parseTradingAccountMetrics(value: unknown): TradingAccountMetrics | undefined {
  if (!isRecord(value)) return undefined;
  return {
    healthFactor: readDecimalString(value.healthFactor),
    initialMarginRatio: readDecimalString(value.initialMarginRatio),
    leverage: readDecimalString(value.leverage),
    maintenanceMarginRatio: readDecimalString(value.maintenanceMarginRatio),
  };
}

function parsePositionMetadata(value: unknown): PositionMetadata | undefined {
  if (!isRecord(value)) return undefined;
  const result: PositionMetadata = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isRecord(entry)) result[key] = entry;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function parseBaseFields(value: Record<string, unknown>) {
  return {
    meta: parsePositionMetadata(value.meta),
    pctUsdValueChange24: readDecimalString(value.pctUsdValueChange24),
    rewards: parsePositionValues(value.rewards),
    usdValue: readDecimalString(value.usdValue),
  };
}

function parseLendingPosition(value: Record<string, unknown>, platformId: string): LendingDefiPosition {
  return {
    ...parseBaseFields(value),
    apy: readDecimalString(value.apy),
    borrowed: parseLendingBorrowedAssets(value.borrowed),
    healthFactor: readDecimalString(value.healthFactor),
    platformId,
    positionKind: "lending",
    supplied: parseLendingSuppliedAssets(value.supplied),
  };
}

function parseStakingPosition(value: Record<string, unknown>, platformId: string): StakingDefiPosition {
  return {
    ...parseBaseFields(value),
    apy: readDecimalString(value.apy),
    lockDuration: readDecimalString(value.lockDuration),
    lockedUntil: readString(value.lockedUntil) ?? undefined,
    platformId,
    positionKind: "staking",
    staked: parseStakedAssets(value.staked),
    totalStakedUsd: readDecimalString(value.totalStakedUsd),
    unbonding: parsePositionValues(value.unbonding),
  };
}

function parseLiquidityPosition(
  value: Record<string, unknown>,
  platformId: string,
): LiquidityDefiPosition | null {
  const liquidityModel = (() => {
    const candidates: LiquidityModel[] = ["constant-product", "concentrated-range"];
    return candidates.includes(value.liquidityModel as LiquidityModel)
      ? (value.liquidityModel as LiquidityModel)
      : null;
  })();
  if (!liquidityModel) return null;

  const poolTokens = parsePositionValues(value.poolTokens) ?? [];
  const base = {
    ...parseBaseFields(value),
    fees: parsePositionValues(value.fees),
    feeBps: readDecimalString(value.feeBps),
    liquidityApy: readDecimalString(value.liquidityApy),
    platformId,
    poolAddress: readString(value.poolAddress) ?? undefined,
    poolTokens,
  };

  if (liquidityModel === "constant-product") {
    const result: ConstantProductLiquidityDefiPosition = {
      ...base,
      liquidityModel,
      lpTokenAmount: readDecimalString(value.lpTokenAmount),
      positionKind: "liquidity",
    };
    return result;
  }

  const lower = readDecimalString(value.lowerPriceUsd);
  const upper = readDecimalString(value.upperPriceUsd);
  const current = readDecimalString(value.currentPriceUsd);
  if (lower === undefined || upper === undefined || current === undefined) return null;
  const result: ConcentratedRangeLiquidityDefiPosition = {
    ...base,
    currentPriceUsd: current,
    isActive: readBoolean(value.isActive) ?? true,
    liquidityModel,
    lowerPriceUsd: lower,
    positionKind: "liquidity",
    upperPriceUsd: upper,
  };
  return result;
}

function parseRewardPosition(value: Record<string, unknown>, platformId: string): RewardDefiPosition {
  return {
    ...parseBaseFields(value),
    claimable: parsePositionValues(value.claimable),
    claimableFrom: readString(value.claimableFrom) ?? undefined,
    claimed: parsePositionValues(value.claimed),
    expiresAt: readString(value.expiresAt) ?? undefined,
    platformId,
    positionKind: "reward",
    sourceId: readString(value.sourceId) ?? undefined,
  };
}

function parseVestingPosition(value: Record<string, unknown>, platformId: string): VestingDefiPosition {
  return {
    ...parseBaseFields(value),
    cliffTime: readString(value.cliffTime) ?? undefined,
    claimable: parsePositionValues(value.claimable),
    claimed: parsePositionValues(value.claimed),
    endTime: readString(value.endTime) ?? undefined,
    platformId,
    positionKind: "vesting",
    startTime: readString(value.startTime) ?? undefined,
    unlockFrequencySeconds: readDecimalString(value.unlockFrequencySeconds),
    vesting: parseVestingAssets(value.vesting),
  };
}

function parseTradingPosition(value: Record<string, unknown>, platformId: string): TradingDefiPosition | null {
  const marketType = (() => {
    const candidates: TradingMarketType[] = ["spot", "perp"];
    return candidates.includes(value.marketType as TradingMarketType)
      ? (value.marketType as TradingMarketType)
      : null;
  })();
  if (!marketType) return null;
  const buyOrders = Array.isArray(value.buyOrders)
    ? value.buyOrders.map(parseTradingOrder).filter((order): order is TradingOrder => order !== null)
    : undefined;
  const sellOrders = Array.isArray(value.sellOrders)
    ? value.sellOrders.map(parseTradingOrder).filter((order): order is TradingOrder => order !== null)
    : undefined;
  const positions = Array.isArray(value.positions)
    ? value.positions
        .map(parseTradingMarketPosition)
        .filter((position): position is TradingMarketPosition => position !== null)
    : undefined;
  return {
    ...parseBaseFields(value),
    account: parseTradingAccountMetrics(value.account),
    buyOrders: buyOrders && buyOrders.length > 0 ? buyOrders : undefined,
    deposited: parsePositionValues(value.deposited),
    marginEnabled: readBoolean(value.marginEnabled) ?? false,
    marketType,
    platformId,
    positionKind: "trading",
    positions: positions && positions.length > 0 ? positions : undefined,
    sellOrders: sellOrders && sellOrders.length > 0 ? sellOrders : undefined,
  };
}

const KNOWN_POSITION_KINDS = new Set<PositionKind>([
  "lending",
  "staking",
  "liquidity",
  "trading",
  "vesting",
  "reward",
]);

function parseSolanaPosition(value: unknown): TrackallSolanaPosition | null {
  if (!isRecord(value)) return null;
  const platformId = readString(value.platformId);
  const positionKindRaw = readString(value.positionKind);
  if (!platformId || !positionKindRaw) return null;
  if (!KNOWN_POSITION_KINDS.has(positionKindRaw as PositionKind)) return null;
  const positionKind = positionKindRaw as PositionKind;

  switch (positionKind) {
    case "lending":
      return parseLendingPosition(value, platformId);
    case "staking":
      return parseStakingPosition(value, platformId);
    case "liquidity":
      return parseLiquidityPosition(value, platformId);
    case "reward":
      return parseRewardPosition(value, platformId);
    case "vesting":
      return parseVestingPosition(value, platformId);
    case "trading":
      return parseTradingPosition(value, platformId);
  }
}

function parseSolanaToken(value: unknown, fallbackMint?: string): TrackallSolanaToken | null {
  if (!isRecord(value)) return null;
  const mintAddress = readString(value.mintAddress) ?? readString(value.mint) ?? fallbackMint;
  if (!mintAddress) return null;

  return {
    amount: readString(value.amount) ?? undefined,
    decimals: readNumber(value.decimals) ?? undefined,
    image: readString(value.image) ?? undefined,
    mintAddress,
    name: readString(value.name) ?? undefined,
    pctPriceChange24h: readNumber(value.pctPriceChange24h) ?? undefined,
    priceUsd: readNumber(value.priceUsd) ?? undefined,
    symbol: readString(value.symbol) ?? undefined,
    tokenAccount: readString(value.tokenAccount) ?? undefined,
    uiAmount:
      typeof value.uiAmount === "number" && Number.isFinite(value.uiAmount)
        ? value.uiAmount
        : typeof value.uiAmount === "string"
          ? value.uiAmount
          : undefined,
    usdValue:
      typeof value.usdValue === "number" && Number.isFinite(value.usdValue)
        ? value.usdValue
        : typeof value.usdValue === "string"
          ? value.usdValue
          : undefined,
  };
}

function parsePortfolioPlotRange(value: unknown): TrackallSolanaPortfolioPlotRange {
  if (!isRecord(value)) {
    return { from: null, to: null, timezone: null };
  }

  return {
    from: readString(value.from),
    to: readString(value.to),
    timezone: readString(value.timezone),
  };
}

function parsePortfolioPlotPoint(value: unknown): TrackallSolanaPortfolioPlotPoint | null {
  if (!isRecord(value)) return null;
  const hour = readString(value.hour);
  const capturedAt = readString(value.capturedAt);
  const timestamp = hour ?? capturedAt;
  const totalUsd = readFiniteDecimalNumber(value.totalUsd);
  if (!timestamp || totalUsd === null || !Number.isFinite(Date.parse(timestamp))) return null;

  const positions = Array.isArray(value.positions) ? value.positions : [];

  return {
    hour,
    capturedAt,
    timestamp: new Date(timestamp).toISOString(),
    totalUsd,
    positionCount: readNumber(value.positionCount) ?? positions.length,
    positions,
  };
}

function parsePortfolioPlot(value: unknown): TrackallSolanaPortfolioPlot | null {
  if (!isRecord(value) || !Array.isArray(value.points)) return null;

  const points = value.points
    .map(parsePortfolioPlotPoint)
    .filter((point): point is TrackallSolanaPortfolioPlotPoint => point !== null)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

  return {
    address: readString(value.address),
    bucket: readString(value.bucket),
    range: parsePortfolioPlotRange(value.range),
    points,
  };
}

function parseTopWallet(value: unknown): TrackallTopWallet | null {
  if (!isRecord(value)) return null;
  const rank = readNumber(value.rank);
  const address = readString(value.address);
  const totalUsd = readFiniteDecimalNumber(value.totalUsd);
  const positionCount = readNumber(value.positionCount);
  const capturedAt = readString(value.capturedAt);

  if (
    rank === null ||
    !address ||
    totalUsd === null ||
    positionCount === null ||
    !capturedAt ||
    !Number.isFinite(Date.parse(capturedAt))
  ) {
    return null;
  }

  return {
    address,
    capturedAt: new Date(capturedAt).toISOString(),
    positionCount,
    rank,
    totalUsd,
  };
}

function parseTopWalletsPlatform(value: unknown): TrackallTopWalletsPlatform | null {
  if (!isRecord(value)) return null;
  const platformId = readString(value.platformId);
  if (!platformId || !Array.isArray(value.wallets)) return null;

  return {
    platformId,
    wallets: value.wallets
      .map(parseTopWallet)
      .filter((wallet): wallet is TrackallTopWallet => wallet !== null),
  };
}

function parseTopWalletsResponse(value: unknown): TrackallTopWalletsResponse | null {
  if (!isRecord(value) || !Array.isArray(value.platforms)) return null;
  const limit = readNumber(value.limit);
  if (limit === null) return null;

  return {
    asOfRunId: readNumber(value.asOfRunId),
    limit,
    platforms: value.platforms
      .map(parseTopWalletsPlatform)
      .filter((platform): platform is TrackallTopWalletsPlatform => platform !== null),
  };
}

function parseAggregateTopWalletProtocol(value: unknown): TrackallAggregateTopWalletProtocol | null {
  if (!isRecord(value)) return null;
  const platformId = readString(value.platformId);
  const totalUsd = readFiniteDecimalNumber(value.totalUsd);
  const positionCount = readNumber(value.positionCount);
  const capturedAt = readString(value.capturedAt);

  if (
    !platformId ||
    totalUsd === null ||
    positionCount === null ||
    !capturedAt ||
    !Number.isFinite(Date.parse(capturedAt))
  ) {
    return null;
  }

  return {
    capturedAt: new Date(capturedAt).toISOString(),
    platformId,
    positionCount,
    totalUsd,
  };
}

function parseAggregateTopWallet(value: unknown): TrackallAggregateTopWallet | null {
  const base = parseTopWallet(value);
  if (!base || !isRecord(value)) return null;
  const protocolCount = readNumber(value.protocolCount);
  if (protocolCount === null || !Array.isArray(value.protocols)) return null;

  return {
    ...base,
    protocolCount,
    protocols: value.protocols
      .map(parseAggregateTopWalletProtocol)
      .filter((protocol): protocol is TrackallAggregateTopWalletProtocol => protocol !== null),
  };
}

function parseAggregateTopWalletsResponse(value: unknown): TrackallAggregateTopWalletsResponse | null {
  if (!isRecord(value) || !Array.isArray(value.wallets)) return null;
  const limit = readNumber(value.limit);
  if (limit === null) return null;

  return {
    asOfRunId: readNumber(value.asOfRunId),
    limit,
    wallets: value.wallets
      .map(parseAggregateTopWallet)
      .filter((wallet): wallet is TrackallAggregateTopWallet => wallet !== null),
  };
}

function readNullableIsoString(value: unknown) {
  if (value === null) return null;
  const raw = readString(value);
  if (!raw || !Number.isFinite(Date.parse(raw))) return null;
  return new Date(raw).toISOString();
}

function readNullableMetric(value: unknown) {
  if (value === null) return null;
  return readFiniteDecimalNumber(value);
}

function parseMetricMatchStatus(value: unknown): "matched" | "missing" {
  return value === "matched" ? "matched" : "missing";
}

function parsePlatformMetricPlotPoint(value: unknown): TrackallSolanaPlatformMetricPlotPoint | null {
  if (!isRecord(value)) return null;
  const timestamp = readString(value.timestamp);
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return null;

  return {
    timestamp: new Date(timestamp).toISOString(),
    tvlUsd: readNullableMetric(value.tvlUsd),
    volume24hUsd: readNullableMetric(value.volume24hUsd),
  };
}

function parsePlatformMetricPlot(value: unknown): TrackallSolanaPlatformMetricPlotPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parsePlatformMetricPlotPoint)
    .filter((point): point is TrackallSolanaPlatformMetricPlotPoint => point !== null)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

function parsePlatformTransactionsPlotPoint(value: unknown): TrackallSolanaPlatformTransactionsPlotPoint | null {
  if (!isRecord(value)) return null;
  const timestamp = readString(value.timestamp);
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return null;

  return {
    timestamp: new Date(timestamp).toISOString(),
    transactionCount: readNullableMetric(value.transactionCount),
  };
}

function parsePlatformTransactionsPlot(value: unknown): TrackallSolanaPlatformTransactionsPlotPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parsePlatformTransactionsPlotPoint)
    .filter((point): point is TrackallSolanaPlatformTransactionsPlotPoint => point !== null)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

function parsePlatformUsersPlotPoint(value: unknown): TrackallSolanaPlatformUsersPlotPoint | null {
  if (!isRecord(value)) return null;
  const timestamp = readString(value.timestamp);
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return null;

  return {
    timestamp: new Date(timestamp).toISOString(),
    activeUsers: readNullableMetric(value.activeUsers),
  };
}

function parsePlatformUsersPlot(value: unknown): TrackallSolanaPlatformUsersPlotPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parsePlatformUsersPlotPoint)
    .filter((point): point is TrackallSolanaPlatformUsersPlotPoint => point !== null)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

function parseChainMetrics(value: unknown): TrackallSolanaChainMetrics | null {
  if (!isRecord(value) || value.chain !== "Solana") return null;

  return {
    capturedAt: readNullableIsoString(value.capturedAt),
    chain: "Solana",
    errorMessage: readString(value.errorMessage),
    plot: parsePlatformMetricPlot(value.plot),
    usersPlot: parsePlatformUsersPlot(value.usersPlot),
    tvlChange24hPct: readNullableMetric(value.tvlChange24hPct),
    tvlPrevious24hUsd: readNullableMetric(value.tvlPrevious24hUsd),
    tvlUsd: readNullableMetric(value.tvlUsd),
    updatedAt: readNullableIsoString(value.updatedAt),
    volume24hUsd: readNullableMetric(value.volume24hUsd),
    volumeChange24hPct: readNullableMetric(value.volumeChange24hPct),
    volumePrevious24hUsd: readNullableMetric(value.volumePrevious24hUsd),
  };
}

function parsePlatformMetrics(value: unknown): TrackallSolanaPlatformMetrics | null {
  if (!isRecord(value)) return null;
  const platformId = readString(value.platformId);
  const platformName = readString(value.platformName);
  if (!platformId || !platformName) return null;

  return {
    capturedAt: readNullableIsoString(value.capturedAt),
    errorMessage: readString(value.errorMessage),
    platformId,
    platformName,
    plot: parsePlatformMetricPlot(value.plot),
    transactionCount: readNullableMetric(value.transactionCount),
    transactionsPlot: parsePlatformTransactionsPlot(value.transactionsPlot),
    tvlChange24hPct: readNullableMetric(value.tvlChange24hPct),
    tvlMatchStatus: parseMetricMatchStatus(value.tvlMatchStatus),
    tvlPrevious24hUsd: readNullableMetric(value.tvlPrevious24hUsd),
    tvlSlug: readString(value.tvlSlug),
    tvlUsd: readNullableMetric(value.tvlUsd),
    updatedAt: readNullableIsoString(value.updatedAt),
    usersPlot: parsePlatformUsersPlot(value.usersPlot),
    volume24hUsd: readNullableMetric(value.volume24hUsd),
    volumeChange24hPct: readNullableMetric(value.volumeChange24hPct),
    volumeMatchStatus: parseMetricMatchStatus(value.volumeMatchStatus),
    volumePrevious24hUsd: readNullableMetric(value.volumePrevious24hUsd),
    volumeSlug: readString(value.volumeSlug),
  };
}

function parsePlatformMetricsResponse(value: unknown): TrackallSolanaPlatformMetricsResponse | null {
  if (!isRecord(value) || value.network !== "solana" || !Array.isArray(value.platforms)) return null;
  const chain = parseChainMetrics(value.chain);
  if (!chain) return null;

  return {
    chain,
    network: "solana",
    platforms: value.platforms
      .map(parsePlatformMetrics)
      .filter((platform): platform is TrackallSolanaPlatformMetrics => platform !== null),
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

function parsePlatformTags(value: unknown): PlatformTag[] {
  return readStringArray(value).filter((tag): tag is PlatformTag => PLATFORM_TAGS.has(tag as PlatformTag));
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
    tags: parsePlatformTags(value.tags),
    ticker: readString(value.ticker)?.trim() || undefined,
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

function categoryFromTags(tags: PlatformTag[]): ProtocolCategory {
  const normalized = tags.map((tag) => tag.toLowerCase());
  if (normalized.some((tag) => tag.includes("dex") || tag.includes("swap") || tag.includes("trading"))) return "DEX";
  if (normalized.some((tag) => tag.includes("lend") || tag.includes("borrow"))) return "Lending";
  if (normalized.some((tag) => tag.includes("stake"))) return "Staking";
  if (normalized.some((tag) => tag.includes("bridge"))) return "Bridge";
  if (normalized.some((tag) => tag.includes("stable"))) return "Stablecoin";
  if (normalized.some((tag) => tag.includes("govern"))) return "Governance";
  return "DeFi";
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
    symbol: platform.ticker?.trim() || undefined,
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

export async function fetchSolanaPlatformMetrics(
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallSolanaPlatformMetricsResponse> {
  const data = await fetchTrackallJson("api/solana/platform-metrics", config, signal);
  const result = parsePlatformMetricsResponse(data);
  if (!result) {
    throw new Error("Trackall API returned an invalid platform metrics payload");
  }

  return result;
}

export async function fetchSolanaPlatformMetricsById(
  platformId: string,
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallSolanaPlatformMetrics> {
  const data = await fetchTrackallJson(`api/solana/platform-metrics/${encodeURIComponent(platformId)}`, config, signal);
  const result = parsePlatformMetrics(data);
  if (!result) {
    throw new Error("Trackall API returned an invalid platform metrics payload");
  }

  return result;
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

export async function fetchSolanaPortfolioPlot(
  address: string,
  bucket: TrackallSolanaPortfolioPlotBucket,
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallSolanaPortfolioPlot> {
  const params = new URLSearchParams({ bucket });
  const data = await fetchTrackallJson(
    `api/solana/portfolio/${encodeURIComponent(address)}/plot?${params.toString()}`,
    config,
    signal,
  );
  const plot = parsePortfolioPlot(data);
  if (!plot) {
    throw new Error("Trackall API returned an invalid portfolio plot payload");
  }

  return plot;
}

export async function fetchSolanaTopPortfolioWallets(
  platformId: string,
  limit = 100,
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallTopWalletsResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    platformId,
  });
  const data = await fetchTrackallJson(`api/solana/portfolio/top-wallets?${params.toString()}`, config, signal);
  const result = parseTopWalletsResponse(data);
  if (!result) {
    throw new Error("Trackall API returned an invalid top wallets payload");
  }

  return result;
}

export async function fetchSolanaTopAggregatePortfolioWallets(
  limit = 100,
  config: TrackallApiConfig = {},
  signal?: AbortSignal,
): Promise<TrackallAggregateTopWalletsResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  const data = await fetchTrackallJson(`api/solana/portfolio/top-wallets/global?${params.toString()}`, config, signal);
  const result = parseAggregateTopWalletsResponse(data);
  if (!result) {
    throw new Error("Trackall API returned an invalid top wallets payload");
  }

  return result;
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
