import type { Protocol } from "./types";

export type ProtocolMetricKey = "tvl" | "volume" | "users";
export type ProtocolChangeWindow = "h24" | "d7" | "d30";
export type ProtocolUserType = "Liquidity" | "Borrower" | "Trader" | "Staker";
export type ProtocolRiskTier = "Low" | "Medium" | "High";
export type ProtocolActivityWindow = "24h" | "7d" | "30d" | "Dormant";
export type ProtocolMetricCardKey = ProtocolMetricKey | "deposits" | "fees" | "revenue" | "txs";

export type ProtocolChanges = Record<ProtocolChangeWindow, number>;

export type ProtocolChartPoint = {
  label: string;
  tvl: number;
  volume: number;
  users: number;
};

export type ProtocolDetailMetric = {
  key: ProtocolMetricCardKey;
  label: string;
  value: number;
  format: "usd" | "number";
  changes: ProtocolChanges;
};

export type ProtocolUserRow = {
  wallet: string;
  network: string;
  type: ProtocolUserType;
  risk: ProtocolRiskTier;
  activity: ProtocolActivityWindow;
  depositedTvl: number;
  volume30d: number;
  netFlow: number;
  pnl: number;
  protocolShare: number;
  activePositions: number;
  lastActiveHours: number;
};

export type ProtocolDetailMock = {
  metrics: ProtocolDetailMetric[];
  chart: ProtocolChartPoint[];
  users: ProtocolUserRow[];
};

export const USER_TYPES = ["Liquidity", "Borrower", "Trader", "Staker"] as const;
export const RISK_TIERS = ["Low", "Medium", "High"] as const;
export const ACTIVITY_WINDOWS = ["24h", "7d", "30d", "Dormant"] as const;
export const PAGE_SIZE_OPTIONS = [8, 12, 24] as const;

function hashString(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function unit(seed: string) {
  return hashString(seed) / 4294967295;
}

function range(seed: string, min: number, max: number) {
  return min + (max - min) * unit(seed);
}

function pick<T>(items: readonly T[], seed: string) {
  return items[Math.floor(unit(seed) * items.length) % items.length] ?? items[0]!;
}

function changeSet(seed: string, bias = 0): ProtocolChanges {
  return {
    h24: Number(range(`${seed}:24h`, -4.8 + bias, 5.6 + bias).toFixed(2)),
    d7: Number(range(`${seed}:7d`, -10.5 + bias, 13.8 + bias).toFixed(2)),
    d30: Number(range(`${seed}:30d`, -22 + bias, 31 + bias).toFixed(2)),
  };
}

function makeWallet(seed: string) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let wallet = "";
  for (let index = 0; index < 44; index += 1) {
    wallet += alphabet[Math.floor(unit(`${seed}:wallet:${index}`) * alphabet.length)] ?? alphabet[0];
  }
  return wallet;
}

function activityFromHours(hours: number): ProtocolActivityWindow {
  if (hours <= 24) return "24h";
  if (hours <= 168) return "7d";
  if (hours <= 720) return "30d";
  return "Dormant";
}

function buildChart(seed: string, tvl: number, volume24h: number, users: number) {
  return Array.from({ length: 30 }, (_, index): ProtocolChartPoint => {
    const progress = index / 29;
    const wave = Math.sin(progress * Math.PI * 3 + range(`${seed}:phase`, 0, 4));
    const drift = range(`${seed}:drift`, -0.1, 0.18) * progress;
    const noise = range(`${seed}:chart:${index}`, -0.055, 0.055);
    const multiplier = 0.86 + drift + wave * 0.045 + noise;

    return {
      label: `D-${29 - index}`,
      tvl: Math.max(tvl * 0.62, tvl * multiplier),
      volume: Math.max(volume24h * 0.48, volume24h * (0.72 + wave * 0.12 + noise)),
      users: Math.max(1, Math.round(users * (0.78 + wave * 0.07 + noise))),
    };
  });
}

function buildUsers(protocol: Protocol, tvl: number, volume24h: number) {
  return Array.from({ length: 42 }, (_, index): ProtocolUserRow => {
    const seed = `${protocol.id}:user:${index}`;
    const rankWeight = 1 / (index + 2) ** 0.72;
    const depositedTvl = tvl * range(`${seed}:deposit`, 0.006, 0.042) * rankWeight;
    const lastActiveHours = Math.round(range(`${seed}:active`, 1, 1080));
    const netFlowSign = unit(`${seed}:flow-sign`) > 0.42 ? 1 : -1;
    const netFlow = depositedTvl * range(`${seed}:flow`, 0.018, 0.28) * netFlowSign;

    return {
      wallet: makeWallet(seed),
      network: pick(protocol.networks.length > 0 ? protocol.networks : ["Solana"], seed),
      type: pick(USER_TYPES, `${seed}:type`),
      risk: pick(RISK_TIERS, `${seed}:risk`),
      activity: activityFromHours(lastActiveHours),
      depositedTvl,
      volume30d: volume24h * range(`${seed}:volume`, 0.08, 2.8) * rankWeight,
      netFlow,
      pnl: depositedTvl * range(`${seed}:pnl`, -0.19, 0.27),
      protocolShare: (depositedTvl / tvl) * 100,
      activePositions: Math.max(1, Math.round(range(`${seed}:positions`, 1, 9))),
      lastActiveHours,
    };
  }).sort((a, b) => b.depositedTvl - a.depositedTvl);
}

export function buildProtocolDetailMock(protocol: Protocol): ProtocolDetailMock {
  const seed = protocol.id || protocol.name;
  const tvl = range(`${seed}:tvl`, 180_000_000, 7_800_000_000);
  const volume24h = tvl * range(`${seed}:volume24h`, 0.035, 0.36);
  const users = protocol.activeUsers ?? Math.round(range(`${seed}:users`, 18_000, 860_000));
  const deposits = tvl * range(`${seed}:deposits`, 0.84, 1.28);
  const fees = volume24h * range(`${seed}:fees`, 0.0008, 0.0032);
  const revenue = fees * range(`${seed}:revenue`, 0.32, 0.72);
  const txs = Math.round(range(`${seed}:txs`, 42_000, 1_950_000));

  return {
    metrics: [
      { key: "tvl", label: "TVL", value: tvl, format: "usd", changes: changeSet(`${seed}:tvl`, 0.3) },
      {
        key: "volume",
        label: "24h Volume",
        value: volume24h,
        format: "usd",
        changes: changeSet(`${seed}:volume`, 0.1),
      },
      {
        key: "users",
        label: "Active Users",
        value: users,
        format: "number",
        changes: changeSet(`${seed}:users`, 0.2),
      },
      {
        key: "deposits",
        label: "Deposits",
        value: deposits,
        format: "usd",
        changes: changeSet(`${seed}:deposits`, 0.15),
      },
      { key: "fees", label: "Fees", value: fees, format: "usd", changes: changeSet(`${seed}:fees`, -0.1) },
      {
        key: "revenue",
        label: "Revenue",
        value: revenue,
        format: "usd",
        changes: changeSet(`${seed}:revenue`, -0.05),
      },
      {
        key: "txs",
        label: "Tx Count",
        value: txs,
        format: "number",
        changes: changeSet(`${seed}:txs`, 0.05),
      },
    ],
    chart: buildChart(seed, tvl, volume24h, users),
    users: buildUsers(protocol, tvl, volume24h),
  };
}

export function formatNumber(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

export function formatUsd(value: number) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absolute >= 1e9) return `${sign}$${(absolute / 1e9).toFixed(2)}B`;
  if (absolute >= 1e6) return `${sign}$${(absolute / 1e6).toFixed(2)}M`;
  if (absolute >= 1e3) return `${sign}$${(absolute / 1e3).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

export function formatSignedUsd(value: number) {
  return `${value >= 0 ? "+" : ""}${formatUsd(value)}`;
}

export function formatDelta(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function shortWallet(wallet: string) {
  return `${wallet.slice(0, 5)}...${wallet.slice(-5)}`;
}

export function formatLastActive(hours: number) {
  if (hours <= 1) return "Now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
