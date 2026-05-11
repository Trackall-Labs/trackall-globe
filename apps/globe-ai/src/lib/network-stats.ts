import { PROTOCOLS } from "./protocols";
import {
  RISK_TIERS,
  USER_TYPES,
  type ProtocolActivityWindow,
  type ProtocolRiskTier,
  type ProtocolUserRow,
  type ProtocolUserType,
} from "./protocol-stats";
import type { Network } from "./networks";
import type { Protocol } from "./types";

export type NetworkMetricKey =
  | "tvl"
  | "volume"
  | "users"
  | "tps"
  | "blockTime"
  | "gas"
  | "validators"
  | "stakeRatio";

export type NetworkChangeWindow = "h24" | "d7" | "d30";
export type NetworkChanges = Record<NetworkChangeWindow, number>;

export type NetworkMetricFormat = "usd" | "number" | "tps" | "ms" | "gwei" | "percent";

export type NetworkDetailMetric = {
  key: NetworkMetricKey;
  label: string;
  value: number;
  format: NetworkMetricFormat;
  changes: NetworkChanges;
};

export type NetworkChartPoint = {
  label: string;
  tvl: number;
  volume: number;
  users: number;
  tps: number;
};

export type NetworkProtocolRow = {
  protocol: Protocol;
  tvl: number;
  volume30d: number;
  netFlow: number;
  share: number;
  change24h: number;
};

export type NetworkBlockRow = {
  id: number;
  blockNum: number;
  validator: string;
  region: string;
  finalityMs: number;
  loadPct: number;
  proposalResult: "success" | "failed" | "pending";
};

export type NetworkDetailMock = {
  metrics: NetworkDetailMetric[];
  chart: NetworkChartPoint[];
  topProtocols: NetworkProtocolRow[];
  wallets: ProtocolUserRow[];
  recentBlocks: NetworkBlockRow[];
};

const NETWORK_VALIDATORS = [
  "Coinbase Cloud",
  "Figment",
  "Chorus One",
  "Everstake",
  "P2P Validator",
  "Stakely",
  "HashKey Cloud",
  "Luganodes",
  "Blockdaemon",
  "Allnodes",
];

const NETWORK_REGIONS = [
  "Frankfurt",
  "Warsaw",
  "Tokyo",
  "Singapore",
  "New York",
  "Sao Paulo",
  "Seoul",
  "London",
  "Sydney",
];

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

function changeSet(seed: string, bias = 0): NetworkChanges {
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

function buildChart(
  seed: string,
  tvl: number,
  volume24h: number,
  users: number,
  tps: number,
): NetworkChartPoint[] {
  return Array.from({ length: 30 }, (_, index): NetworkChartPoint => {
    const progress = index / 29;
    const wave = Math.sin(progress * Math.PI * 3 + range(`${seed}:phase`, 0, 4));
    const drift = range(`${seed}:drift`, -0.1, 0.18) * progress;
    const noise = range(`${seed}:chart:${index}`, -0.055, 0.055);
    const tvlMul = 0.86 + drift + wave * 0.045 + noise;
    const volMul = 0.72 + wave * 0.12 + noise;
    const userMul = 0.78 + wave * 0.07 + noise;
    const tpsMul = 0.7 + wave * 0.18 + noise;
    return {
      label: `D-${29 - index}`,
      tvl: Math.max(tvl * 0.62, tvl * tvlMul),
      volume: Math.max(volume24h * 0.48, volume24h * volMul),
      users: Math.max(1, Math.round(users * userMul)),
      tps: Math.max(1, Number((tps * tpsMul).toFixed(2))),
    };
  });
}

function buildTopProtocols(
  network: Network,
  seed: string,
  networkTvl: number,
  volume24h: number,
  protocols: Protocol[],
) {
  const matches = protocols.filter((protocol) =>
    protocol.networks.some((name) => name.toLowerCase() === network.name.toLowerCase()),
  );

  if (matches.length === 0) return [] as NetworkProtocolRow[];

  const rows = matches.map((protocol, index): NetworkProtocolRow => {
    const rowSeed = `${seed}:protocol:${protocol.id}`;
    const rankWeight = 1 / (index + 1.4) ** 0.5;
    const tvl = networkTvl * range(`${rowSeed}:tvl`, 0.04, 0.32) * rankWeight;
    const volume30d = volume24h * range(`${rowSeed}:vol`, 1.4, 9.6) * rankWeight;
    const netFlowSign = unit(`${rowSeed}:flow-sign`) > 0.45 ? 1 : -1;
    const netFlow = tvl * range(`${rowSeed}:flow`, 0.018, 0.18) * netFlowSign;
    const change24h = Number(range(`${rowSeed}:change`, -6, 8.5).toFixed(2));
    return {
      protocol,
      tvl,
      volume30d,
      netFlow,
      share: 0,
      change24h,
    };
  });

  rows.sort((a, b) => b.tvl - a.tvl);
  const total = rows.reduce((sum, row) => sum + row.tvl, 0);
  for (const row of rows) {
    row.share = total === 0 ? 0 : (row.tvl / total) * 100;
  }
  return rows;
}

function buildWallets(network: Network, seed: string, networkTvl: number, volume24h: number) {
  return Array.from({ length: 42 }, (_, index): ProtocolUserRow => {
    const rowSeed = `${seed}:wallet:${index}`;
    const rankWeight = 1 / (index + 2) ** 0.72;
    const depositedTvl = networkTvl * range(`${rowSeed}:deposit`, 0.0008, 0.012) * rankWeight;
    const lastActiveHours = Math.round(range(`${rowSeed}:active`, 1, 1080));
    const netFlowSign = unit(`${rowSeed}:flow-sign`) > 0.42 ? 1 : -1;
    const netFlow = depositedTvl * range(`${rowSeed}:flow`, 0.018, 0.28) * netFlowSign;
    return {
      wallet: makeWallet(rowSeed),
      network: network.name,
      type: pick(USER_TYPES, `${rowSeed}:type`) as ProtocolUserType,
      risk: pick(RISK_TIERS, `${rowSeed}:risk`) as ProtocolRiskTier,
      activity: activityFromHours(lastActiveHours),
      depositedTvl,
      volume30d: volume24h * range(`${rowSeed}:volume`, 0.04, 1.6) * rankWeight,
      netFlow,
      pnl: depositedTvl * range(`${rowSeed}:pnl`, -0.19, 0.27),
      protocolShare: (depositedTvl / networkTvl) * 100,
      activePositions: Math.max(1, Math.round(range(`${rowSeed}:positions`, 1, 9))),
      lastActiveHours,
    };
  }).sort((a, b) => b.depositedTvl - a.depositedTvl);
}

function buildRecentBlocks(seed: string, baseFinalityMs: number): NetworkBlockRow[] {
  const startBlock = Math.round(range(`${seed}:start-block`, 18_400_000, 268_900_000));
  return Array.from({ length: 24 }, (_, index): NetworkBlockRow => {
    const rowSeed = `${seed}:block:${index}`;
    const finality = Math.round(baseFinalityMs * range(`${rowSeed}:fin`, 0.7, 1.5));
    const success = unit(`${rowSeed}:result`);
    const result: NetworkBlockRow["proposalResult"] =
      success > 0.16 ? "success" : success > 0.08 ? "pending" : "failed";
    return {
      id: index,
      blockNum: startBlock + index,
      validator: pick(NETWORK_VALIDATORS, `${rowSeed}:validator`),
      region: pick(NETWORK_REGIONS, `${rowSeed}:region`),
      finalityMs: finality,
      loadPct: Math.round(range(`${rowSeed}:load`, 24, 96)),
      proposalResult: result,
    };
  });
}

export function buildNetworkDetailMock(
  network: Network,
  protocols: Protocol[] = PROTOCOLS,
): NetworkDetailMock {
  const seed = network.id;
  const tvl = range(`${seed}:tvl`, 380_000_000, 28_400_000_000);
  const volume24h = tvl * range(`${seed}:volume24h`, 0.04, 0.42);
  const users = Math.round(range(`${seed}:users`, 64_000, 2_400_000));
  const tps = Number(range(`${seed}:tps`, 14, 4_200).toFixed(1));
  const blockTimeMs = Math.round(network.finalitySec * 1000 * range(`${seed}:bt`, 0.85, 1.18));
  const gasGwei = Number(range(`${seed}:gas`, 0.5, 38).toFixed(2));
  const validators = Math.round(range(`${seed}:val`, 96, 18_400));
  const stakeRatio = Number(range(`${seed}:stake`, 18, 78).toFixed(1));

  return {
    metrics: [
      {
        key: "tvl",
        label: "TVL",
        value: tvl,
        format: "usd",
        changes: changeSet(`${seed}:tvl`, 0.3),
      },
      {
        key: "volume",
        label: "24h Volume",
        value: volume24h,
        format: "usd",
        changes: changeSet(`${seed}:volume`, 0.1),
      },
      {
        key: "users",
        label: "Active Addresses",
        value: users,
        format: "number",
        changes: changeSet(`${seed}:users`, 0.2),
      },
      {
        key: "tps",
        label: "Live TPS",
        value: tps,
        format: "tps",
        changes: changeSet(`${seed}:tps`, 0.05),
      },
      {
        key: "blockTime",
        label: "Avg Block Time",
        value: blockTimeMs,
        format: "ms",
        changes: changeSet(`${seed}:bt`, -0.08),
      },
      {
        key: "gas",
        label: "Avg Gas",
        value: gasGwei,
        format: "gwei",
        changes: changeSet(`${seed}:gas`, -0.05),
      },
      {
        key: "validators",
        label: "Validators",
        value: validators,
        format: "number",
        changes: changeSet(`${seed}:val`, 0.04),
      },
      {
        key: "stakeRatio",
        label: "Stake Ratio",
        value: stakeRatio,
        format: "percent",
        changes: changeSet(`${seed}:stake`, 0.02),
      },
    ],
    chart: buildChart(seed, tvl, volume24h, users, tps),
    topProtocols: buildTopProtocols(network, seed, tvl, volume24h, protocols),
    wallets: buildWallets(network, seed, tvl, volume24h),
    recentBlocks: buildRecentBlocks(seed, blockTimeMs),
  };
}

export function formatTps(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(1);
}

export function formatBlockTime(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms} ms`;
}

export function formatGas(gwei: number) {
  return `${gwei.toFixed(2)} gwei`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
