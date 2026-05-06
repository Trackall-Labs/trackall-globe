import { chartColor } from "@orbit/ui/patterns/charts/chart";
import { NETWORKS, type Network } from "./networks";
import { PROTOCOLS } from "./protocols";
import type { TrackallPositionLeg, TrackallSolanaPosition, TrackallSolanaToken } from "./trackall-api";
import type { Protocol } from "./types";

export const RECENT_WALLETS_STORAGE_KEY = "globe-ai:recent-wallets";
export const MAX_RECENT_WALLETS = 5;

export type AllocationKind = "tokens" | "defi";
export type DefiGroupKind = "Lending" | "Liquidity" | "Staking";

export type TokenHolding = {
  tokenId?: string;
  symbol: string;
  name: string;
  balanceLabel: string;
  usdValue: number;
  usdValueChange24h: number;
  usdValueChangePct24h: number;
  price: number;
  priceChangePct24h: number;
  color: string;
  logoUrl?: string;
};

export type DefiPositionRow = {
  asset: string;
  balance: string;
  altBalance?: string;
  usd: number;
  usdChange24h: number;
  usdChangePct24h: number;
  yieldLabel: string | null;
};

export type DefiPositionGroup = {
  kind: DefiGroupKind;
  walletShort: string;
  value: number;
  rows: DefiPositionRow[];
};

export type DefiProtocolBlock = {
  protocolId: string;
  protocolName: string;
  protocolHref: string;
  protocolLogo?: string;
  totalValue: number;
  groups: DefiPositionGroup[];
};

export type DefiAllocationSlice = {
  protocolId: string;
  name: string;
  usdValue: number;
  color: string;
  logoUrl?: string;
};

export type PortfolioMock = {
  netWorth: number;
  netWorthChange24h: number;
  netWorthChangePct24h: number;
  holdingsTotal: number;
  tokens: TokenHolding[];
  defiPositions: DefiProtocolBlock[];
  defiAllocation: DefiAllocationSlice[];
};

const TOKENS: TokenHolding[] = [
  {
    symbol: "SOL",
    name: "Wrapped SOL",
    balanceLabel: "1.37 SOL",
    usdValue: 115.44,
    usdValueChange24h: 0.37,
    usdValueChangePct24h: 0.32,
    price: 84.01,
    priceChangePct24h: 0.32,
    color: chartColor(0),
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balanceLabel: "52.77 USDC",
    usdValue: 52.65,
    usdValueChange24h: -0.04,
    usdValueChangePct24h: -0.09,
    price: 1.0,
    priceChangePct24h: -0.09,
    color: chartColor(1),
  },
  {
    symbol: "pbUSDC",
    name: "PiggyBank USDC",
    balanceLabel: "4.24 pbUSDC",
    usdValue: 4.63,
    usdValueChange24h: 0,
    usdValueChangePct24h: 0,
    price: 1.09,
    priceChangePct24h: 0,
    color: chartColor(2),
  },
  {
    symbol: "jlWSOL",
    name: "Jupiter Lend WSOL",
    balanceLabel: "0.05 jlWSOL",
    usdValue: 4.24,
    usdValueChange24h: 0,
    usdValueChangePct24h: 0,
    price: 86.33,
    priceChangePct24h: 0,
    color: chartColor(3),
  },
  {
    symbol: "jlEURC",
    name: "Jupiter Lend EURC",
    balanceLabel: "2.91 jlEURC",
    usdValue: 3.51,
    usdValueChange24h: 0,
    usdValueChangePct24h: 3.06,
    price: 1.21,
    priceChangePct24h: 3.06,
    color: chartColor(4),
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    balanceLabel: "12.5 JUP",
    usdValue: 8.91,
    usdValueChange24h: 0.12,
    usdValueChangePct24h: 1.36,
    price: 0.71,
    priceChangePct24h: 1.36,
    color: chartColor(5 % 5),
  },
];

const DEFI_POSITIONS: DefiProtocolBlock[] = [
  {
    protocolId: "loopscale",
    protocolName: "LOOPSCALE",
    protocolHref: "https://loopscale.app",
    totalValue: 16.03,
    groups: [
      {
        kind: "Lending",
        walletShort: "tEsT1...j51nd",
        value: 16.03,
        rows: [
          {
            asset: "SOL",
            balance: "0.1088 SOL",
            usd: 9.1401,
            usdChange24h: 0.03,
            usdChangePct24h: 0.32,
            yieldLabel: null,
          },
          {
            asset: "USDC",
            balance: "4.923 USDC",
            usd: 4.9117,
            usdChange24h: 0,
            usdChangePct24h: -0.09,
            yieldLabel: null,
          },
          {
            asset: "USDC",
            balance: "1.0273 USDC",
            usd: 1.025,
            usdChange24h: 0,
            usdChangePct24h: -0.09,
            yieldLabel: null,
          },
          {
            asset: "JupSOL",
            balance: "0.0071 JupSOL",
            usd: 0.7032,
            usdChange24h: 0,
            usdChangePct24h: -0.07,
            yieldLabel: null,
          },
          {
            asset: "CbKQ — USDC",
            balance: "1 CbKQ…",
            altBalance: "0.1861 USDC",
            usd: 0.1856,
            usdChange24h: 0,
            usdChangePct24h: -0.09,
            yieldLabel: null,
          },
          {
            asset: "zBTC",
            balance: "<0.0001 zBTC",
            usd: 0.0642,
            usdChange24h: 0,
            usdChangePct24h: 0.47,
            yieldLabel: null,
          },
          {
            asset: "MLP",
            balance: "0.0002 MLP",
            usd: 0,
            usdChange24h: 0,
            usdChangePct24h: 0,
            yieldLabel: null,
          },
        ],
      },
    ],
  },
  {
    protocolId: "omnipair",
    protocolName: "OMNIPAIR",
    protocolHref: "https://omnipair.io",
    totalValue: 14.28,
    groups: [
      {
        kind: "Lending",
        walletShort: "tEsT1...j51nd",
        value: 1.2,
        rows: [
          {
            asset: "USDC — JupUSD",
            balance: "1 USDC",
            altBalance: "0.2039 JupUSD",
            usd: 1.2016,
            usdChange24h: 0,
            usdChangePct24h: -0.1,
            yieldLabel: null,
          },
        ],
      },
      {
        kind: "Liquidity",
        walletShort: "tEsT1...j51nd",
        value: 13.08,
        rows: [
          {
            asset: "JupSOL — USDC",
            balance: "0.0512 JupSOL",
            altBalance: "8.42 USDC",
            usd: 13.08,
            usdChange24h: 0.04,
            usdChangePct24h: 0.31,
            yieldLabel: "12.4% APR",
          },
        ],
      },
    ],
  },
  {
    protocolId: "kamino",
    protocolName: "KAMINO FINANCE",
    protocolHref: "https://app.kamino.finance",
    totalValue: 6281.39,
    groups: [
      {
        kind: "Lending",
        walletShort: "tEsT1...j51nd",
        value: 4521.0,
        rows: [
          {
            asset: "USDC",
            balance: "4521 USDC",
            usd: 4521.0,
            usdChange24h: -0.41,
            usdChangePct24h: -0.09,
            yieldLabel: "5.8% APY",
          },
        ],
      },
      {
        kind: "Liquidity",
        walletShort: "tEsT1...j51nd",
        value: 1760.39,
        rows: [
          {
            asset: "SOL — USDC",
            balance: "12.4 SOL",
            altBalance: "1041 USDC",
            usd: 1760.39,
            usdChange24h: 4.21,
            usdChangePct24h: 0.24,
            yieldLabel: "18.9% APR",
          },
        ],
      },
    ],
  },
  {
    protocolId: "meteora",
    protocolName: "METEORA",
    protocolHref: "https://meteora.ag",
    totalValue: 6281.39,
    groups: [
      {
        kind: "Liquidity",
        walletShort: "tEsT1...j51nd",
        value: 6281.39,
        rows: [
          {
            asset: "JupSOL — USDC",
            balance: "29.8 JupSOL",
            altBalance: "2509 USDC",
            usd: 6281.39,
            usdChange24h: 12.04,
            usdChangePct24h: 0.19,
            yieldLabel: "22.1% APR",
          },
        ],
      },
    ],
  },
  {
    protocolId: "metapool",
    protocolName: "META POOL",
    protocolHref: "https://metapool.app",
    totalValue: 6281.39,
    groups: [
      {
        kind: "Staking",
        walletShort: "tEsT1...j51nd",
        value: 6281.39,
        rows: [
          {
            asset: "stSOL",
            balance: "57.21 stSOL",
            usd: 6281.39,
            usdChange24h: 9.12,
            usdChangePct24h: 0.15,
            yieldLabel: "7.2% APY",
          },
        ],
      },
    ],
  },
];

const DEFI_ALLOCATION: DefiAllocationSlice[] = DEFI_POSITIONS.map((p, i) => ({
  protocolId: p.protocolId,
  name: p.protocolName,
  usdValue: p.totalValue,
  color: chartColor(i),
}));

const HOLDINGS_TOTAL = 14_420;

export const PORTFOLIO_MOCK: PortfolioMock = {
  netWorth: 678.96,
  netWorthChange24h: -4.93,
  netWorthChangePct24h: -0.7,
  holdingsTotal: HOLDINGS_TOTAL,
  tokens: TOKENS,
  defiPositions: DEFI_POSITIONS,
  defiAllocation: DEFI_ALLOCATION,
};

function networkProtocolMatches(network: Network) {
  return PROTOCOLS.filter((protocol) =>
    protocol.networks.some((name) => name.toLowerCase() === network.name.toLowerCase()),
  );
}

function categoryToDefiKind(category: string): DefiGroupKind {
  if (category === "Lending") return "Lending";
  if (category === "Staking") return "Staking";
  return "Liquidity";
}

function buildNetworkPortfolio(network: Network, index: number): PortfolioMock {
  if (network.id === "solana") return PORTFOLIO_MOCK;

  const protocols = networkProtocolMatches(network).slice(0, 3);
  const nativeValue = 860 + index * 420;
  const stableValue = 520 + index * 210;
  const protocolValue = 240 + protocols.length * 175 + index * 60;
  const tokens: TokenHolding[] = [
    {
      symbol: network.symbol,
      name: `${network.name} ${network.symbol}`,
      balanceLabel: `${(nativeValue / Math.max(1, 30 + index * 4)).toFixed(3)} ${network.symbol}`,
      usdValue: nativeValue,
      usdValueChange24h: 3.2 - index * 0.22,
      usdValueChangePct24h: 0.24 + index * 0.03,
      price: Math.max(1, 30 + index * 4),
      priceChangePct24h: 0.24 + index * 0.03,
      color: chartColor(0),
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balanceLabel: `${stableValue.toFixed(2)} USDC`,
      usdValue: stableValue,
      usdValueChange24h: -0.08,
      usdValueChangePct24h: -0.01,
      price: 1,
      priceChangePct24h: -0.01,
      color: chartColor(1),
    },
    {
      symbol: protocols[0]?.symbol ?? network.symbol,
      name: protocols[0]?.name ?? `${network.name} ecosystem`,
      balanceLabel: `${(protocolValue / Math.max(0.5, 4 + index)).toFixed(2)} ${protocols[0]?.symbol ?? network.symbol}`,
      usdValue: protocolValue,
      usdValueChange24h: 1.4 + index * 0.18,
      usdValueChangePct24h: 0.52 + index * 0.05,
      price: Math.max(0.5, 4 + index),
      priceChangePct24h: 0.52 + index * 0.05,
      color: chartColor(2),
    },
  ];

  const defiPositions: DefiProtocolBlock[] = protocols.map((protocol, protocolIndex) => {
    const totalValue = 980 + index * 260 + protocolIndex * 430;
    const kind = categoryToDefiKind(protocol.category);
    return {
      protocolId: protocol.id,
      protocolName: protocol.name.toUpperCase(),
      protocolHref: protocol.website ?? "#",
      totalValue,
      groups: [
        {
          kind,
          walletShort: `${network.symbol.slice(0, 3)}${index}...${protocol.id.slice(0, 4)}`,
          value: totalValue,
          rows: [
            {
              asset: `${network.symbol} — USDC`,
              balance: `${(totalValue / Math.max(1, 25 + index)).toFixed(4)} ${network.symbol}`,
              altBalance: `${(totalValue * 0.36).toFixed(2)} USDC`,
              usd: totalValue,
              usdChange24h: 2.1 + protocolIndex * 0.34,
              usdChangePct24h: 0.18 + protocolIndex * 0.07,
              yieldLabel: kind === "Staking" ? "6.8% APY" : "14.2% APR",
            },
          ],
        },
      ],
    };
  });

  const defiAllocation = defiPositions.map((position, allocationIndex) => ({
    protocolId: position.protocolId,
    name: position.protocolName,
    usdValue: position.totalValue,
    color: chartColor(allocationIndex),
  }));
  const holdingsTotal = tokens.reduce((total, token) => total + token.usdValue, 0);
  const defiTotal = defiAllocation.reduce((total, allocation) => total + allocation.usdValue, 0);
  const netWorth = holdingsTotal + defiTotal;

  return {
    netWorth,
    netWorthChange24h: 8.4 + index,
    netWorthChangePct24h: 0.42 + index * 0.03,
    holdingsTotal,
    tokens,
    defiPositions,
    defiAllocation,
  };
}

export const PORTFOLIO_MOCK_BY_NETWORK: Record<string, PortfolioMock> =
  Object.fromEntries(NETWORKS.map((network, index) => [network.id, buildNetworkPortfolio(network, index)]));

export function getPortfolioMockForNetwork(networkId: string | null | undefined) {
  return networkId ? (PORTFOLIO_MOCK_BY_NETWORK[networkId] ?? PORTFOLIO_MOCK) : PORTFOLIO_MOCK;
}

function numberFromApi(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function titleFromId(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function displayAmount(raw: string | undefined, decimals: number | undefined) {
  if (!raw || decimals == null) return "0";
  const value = Number(raw) / 10 ** decimals;
  if (!Number.isFinite(value)) return "0";
  if (value === 0) return "0";
  if (Math.abs(value) < 0.0001) return "<0.0001";
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  }
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
}

function tokenSymbol(token: TrackallSolanaToken | undefined, mint: string) {
  return token?.symbol?.trim() || shortenAddress(mint);
}

function positionKindToDefiKind(value: string): DefiGroupKind {
  const normalized = value.toLowerCase();
  if (normalized.includes("lend") || normalized.includes("borrow")) return "Lending";
  if (normalized.includes("stake")) return "Staking";
  return "Liquidity";
}

function yieldLabel(position: TrackallSolanaPosition, legs: TrackallPositionLeg[]) {
  const apy = numberFromApi(position.apy);
  if (apy) return `${apy.toFixed(2)}% APY`;

  const bestRate = legs
    .map((leg) => numberFromApi(leg.supplyRate))
    .filter((value) => value > 0)
    .sort((a, b) => b - a)[0];
  return bestRate ? `${bestRate.toFixed(2)}% APY` : null;
}

function positionLegRows(
  position: TrackallSolanaPosition,
  tokenByMint: Map<string, TrackallSolanaToken>,
): DefiPositionRow[] {
  const directLegs = [
    ...(position.supplied ?? []),
    ...(position.borrowed ?? []),
    ...(position.staked ?? []),
    ...(position.rewards ?? []),
  ];
  if (directLegs.length > 0) {
    return directLegs.map((leg) => {
      const mint = leg.amount?.token ?? "";
      const token = mint ? tokenByMint.get(mint) : undefined;
      const symbol = mint ? tokenSymbol(token, mint) : "Asset";
      const usd = numberFromApi(leg.usdValue);
      return {
        asset: symbol,
        balance: `${displayAmount(leg.amount?.amount, leg.amount?.decimals)} ${symbol}`,
        usd,
        usdChange24h: usd * (numberFromApi(position.pctUsdValueChange24) / 100),
        usdChangePct24h: numberFromApi(position.pctUsdValueChange24),
        yieldLabel: yieldLabel(position, directLegs),
      };
    });
  }

  const poolTokens = position.poolTokens ?? [];
  if (poolTokens.length > 0) {
    const labels = poolTokens.map((leg) => {
      const mint = leg.amount?.token ?? "";
      const symbol = mint ? tokenSymbol(tokenByMint.get(mint), mint) : "Asset";
      return {
        balance: `${displayAmount(leg.amount?.amount, leg.amount?.decimals)} ${symbol}`,
        symbol,
      };
    });
    const feeUsd = (position.fees ?? []).reduce((total, leg) => total + numberFromApi(leg.usdValue), 0);
    const feeLabel = feeUsd > 0 ? `fees ${formatUsd(feeUsd)}` : null;
    return [
      {
        asset: labels.map((item) => item.symbol).join(" — "),
        balance: labels[0]?.balance ?? "0",
        altBalance: [labels[1]?.balance, feeLabel].filter(Boolean).join(" · ") || undefined,
        usd: numberFromApi(position.usdValue),
        usdChange24h: numberFromApi(position.usdValue) * (numberFromApi(position.pctUsdValueChange24) / 100),
        usdChangePct24h: numberFromApi(position.pctUsdValueChange24),
        yieldLabel: position.feeBps ? `${numberFromApi(position.feeBps).toFixed(0)} bps fee` : null,
      },
    ];
  }

  return [
    {
      asset: titleFromId(position.positionKind),
      balance: position.poolAddress ? shortenAddress(position.poolAddress) : "Position",
      usd: numberFromApi(position.usdValue),
      usdChange24h: numberFromApi(position.usdValue) * (numberFromApi(position.pctUsdValueChange24) / 100),
      usdChangePct24h: numberFromApi(position.pctUsdValueChange24),
      yieldLabel: yieldLabel(position, []),
    },
  ];
}

function protocolMetadata(platformId: string, protocols: Protocol[]) {
  return protocols.find((protocol) => protocol.id === platformId || protocol.id === platformId.replace(/-dao$/, ""));
}

export function mapTrackallPortfolioToViewModel({
  positions,
  protocols,
  tokens,
  walletAddress,
}: {
  positions: TrackallSolanaPosition[];
  protocols: Protocol[];
  tokens: TrackallSolanaToken[];
  walletAddress: string;
}): PortfolioMock {
  const tokenByMint = new Map(tokens.map((token) => [token.mint, token]));
  const mappedTokens = tokens
    .map<TokenHolding>((token, index) => {
      const symbol = token.symbol?.trim() || shortenAddress(token.mint);
      const usdValue = numberFromApi(token.usdValue);
      const priceChangePct24h = numberFromApi(token.pctPriceChange24h);
      return {
        balanceLabel: `${token.uiAmount ?? displayAmount(token.amount, token.decimals)} ${symbol}`,
        color: chartColor(index % 5),
        logoUrl: token.image,
        name: token.name?.trim() || symbol,
        price: numberFromApi(token.priceUsd),
        priceChangePct24h,
        symbol,
        tokenId: `${token.mint}:${token.tokenAccount ?? ""}`,
        usdValue,
        usdValueChange24h: usdValue * (priceChangePct24h / 100),
        usdValueChangePct24h: priceChangePct24h,
      };
    })
    .filter((token) => token.usdValue > 0)
    .sort((a, b) => b.usdValue - a.usdValue);

  const groupsByProtocol = new Map<string, DefiPositionGroup[]>();
  for (const position of positions) {
    const rows = positionLegRows(position, tokenByMint);
    const value = numberFromApi(position.usdValue) || rows.reduce((total, row) => total + row.usd, 0);
    const group: DefiPositionGroup = {
      kind: positionKindToDefiKind(position.positionKind),
      rows,
      value,
      walletShort: walletAddress,
    };

    const groups = groupsByProtocol.get(position.platformId) ?? [];
    groups.push(group);
    groupsByProtocol.set(position.platformId, groups);
  }

  const defiPositions = Array.from(groupsByProtocol.entries())
    .map<DefiProtocolBlock>(([platformId, groups]) => {
      const metadata = protocolMetadata(platformId, protocols);
      const totalValue = groups.reduce((total, group) => total + group.value, 0);
      return {
        groups,
        protocolHref: metadata?.website ?? "#",
        protocolId: platformId,
        protocolLogo: metadata?.logo,
        protocolName: (metadata?.name ?? titleFromId(platformId)).toUpperCase(),
        totalValue,
      };
    })
    .filter((protocol) => protocol.totalValue > 0)
    .sort((a, b) => b.totalValue - a.totalValue);

  const defiAllocation = defiPositions.map((position, index) => ({
    color: chartColor(index % 5),
    logoUrl: position.protocolLogo,
    name: position.protocolName,
    protocolId: position.protocolId,
    usdValue: position.totalValue,
  }));
  const holdingsTotal = mappedTokens.reduce((total, token) => total + token.usdValue, 0);
  const defiTotal = defiAllocation.reduce((total, allocation) => total + allocation.usdValue, 0);
  const netWorth = holdingsTotal + defiTotal;
  const netWorthChange24h =
    mappedTokens.reduce((total, token) => total + token.usdValueChange24h, 0) +
    defiPositions.reduce(
      (total, protocol) =>
        total +
        protocol.groups.reduce(
          (groupTotal, group) => groupTotal + group.rows.reduce((rowTotal, row) => rowTotal + row.usdChange24h, 0),
          0,
        ),
      0,
    );

  return {
    defiAllocation,
    defiPositions,
    holdingsTotal,
    netWorth,
    netWorthChange24h,
    netWorthChangePct24h: netWorth > 0 ? (netWorthChange24h / netWorth) * 100 : 0,
    tokens: mappedTokens,
  };
}

export function shortenAddress(addr: string): string {
  const trimmed = addr.trim();
  if (trimmed.length <= 13) return trimmed;
  return `${trimmed.slice(0, 5)}...${trimmed.slice(-5)}`;
}

export function formatUsdCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatUsdDelta(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}
