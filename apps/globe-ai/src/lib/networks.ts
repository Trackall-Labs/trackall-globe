export type NetworkCategory = "L1" | "L2" | "Appchain";

export type Network = {
  id: string;
  name: string;
  symbol: string;
  category: NetworkCategory;
  consensus: string;
  evmCompatible: boolean;
  hubLat: number;
  hubLng: number;
  hubLocation: string;
  description: string;
  website?: string;
  logo?: string;
  /** Approx finality target in seconds, used as a hint for mock generation */
  finalitySec: number;
};

export const NETWORKS: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    category: "L1",
    consensus: "Proof of Stake",
    evmCompatible: true,
    hubLat: 50.1109,
    hubLng: 8.6821,
    hubLocation: "Frankfurt",
    description:
      "Settlement layer for the largest pool of on-chain liquidity, programmable smart contracts, and rollups.",
    website: "https://ethereum.org",
    logo: "/network-logos/ethereum.svg",
    finalitySec: 12,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    category: "L1",
    consensus: "Proof of Stake",
    evmCompatible: false,
    hubLat: 1.3521,
    hubLng: 103.8198,
    hubLocation: "Singapore",
    description:
      "High-throughput L1 with sub-second slot times, parallel execution, and a deep on-chain liquidity book.",
    website: "https://solana.com",
    logo: "/network-logos/solana.svg",
    finalitySec: 1,
  },
  {
    id: "sui",
    name: "Sui",
    symbol: "SUI",
    category: "L1",
    consensus: "Delegated Proof of Stake",
    evmCompatible: false,
    hubLat: 1.3521,
    hubLng: 103.8198,
    hubLocation: "Singapore",
    description:
      "Object-centric Move L1 with parallel execution, fast finality, and a growing native DeFi ecosystem.",
    website: "https://sui.io",
    logo: "https://icons.llama.fi/sui.jpg",
    finalitySec: 1,
  },
  {
    id: "base",
    name: "Base",
    symbol: "ETH",
    category: "L2",
    consensus: "Optimistic Rollup",
    evmCompatible: true,
    hubLat: 37.7749,
    hubLng: -122.4194,
    hubLocation: "San Francisco",
    description:
      "Coinbase-incubated optimistic rollup focused on consumer onboarding and stable, low-fee execution.",
    website: "https://base.org",
    logo: "/network-logos/base.svg",
    finalitySec: 2,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    category: "L2",
    consensus: "Optimistic Rollup",
    evmCompatible: true,
    hubLat: 51.5072,
    hubLng: -0.1276,
    hubLocation: "London",
    description:
      "Optimistic rollup with the deepest L2 DeFi ecosystem and Stylus-powered Wasm contracts.",
    website: "https://arbitrum.io",
    logo: "/network-logos/arbitrum.svg",
    finalitySec: 2,
  },
  {
    id: "optimism",
    name: "Optimism",
    symbol: "OP",
    category: "L2",
    consensus: "Optimistic Rollup",
    evmCompatible: true,
    hubLat: 47.6062,
    hubLng: -122.3321,
    hubLocation: "Seattle",
    description:
      "OP Stack rollup powering the Superchain, with shared sequencing across an interoperable cluster of L2s.",
    website: "https://optimism.io",
    logo: "/network-logos/optimism.svg",
    finalitySec: 2,
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "POL",
    category: "L2",
    consensus: "PoS Sidechain",
    evmCompatible: true,
    hubLat: 19.076,
    hubLng: 72.8777,
    hubLocation: "Mumbai",
    description:
      "EVM-equivalent scaling family combining a PoS chain with zkEVM rollups and a shared liquidity layer.",
    website: "https://polygon.technology",
    logo: "/network-logos/polygon.svg",
    finalitySec: 2,
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    category: "L1",
    consensus: "Snowman PoS",
    evmCompatible: true,
    hubLat: 43.6532,
    hubLng: -79.3832,
    hubLocation: "Toronto",
    description:
      "Subnet-driven L1 with sub-2-second finality, EVM tooling, and isolated execution per app chain.",
    website: "https://avax.network",
    logo: "/network-logos/avalanche.svg",
    finalitySec: 1,
  },
  {
    id: "fantom",
    name: "Fantom",
    symbol: "FTM",
    category: "L1",
    consensus: "Lachesis aBFT",
    evmCompatible: true,
    hubLat: 35.6762,
    hubLng: 139.6503,
    hubLocation: "Tokyo",
    description:
      "Asynchronous BFT L1 tuned for low-latency DeFi execution and stable-swap liquidity venues.",
    website: "https://fantom.foundation",
    logo: "/network-logos/fantom.svg",
    finalitySec: 1,
  },
  {
    id: "dydx-chain",
    name: "dYdX Chain",
    symbol: "DYDX",
    category: "Appchain",
    consensus: "CometBFT",
    evmCompatible: false,
    hubLat: 35.6762,
    hubLng: 139.6503,
    hubLocation: "Tokyo",
    description:
      "Cosmos-SDK appchain dedicated to a fully on-chain perpetuals orderbook and matching engine.",
    website: "https://dydx.exchange",
    logo: "/network-logos/dydx-chain.svg",
    finalitySec: 1,
  },
];

const NETWORK_BY_ID = new Map(NETWORKS.map((network) => [network.id, network]));

const NETWORK_BY_NAME = new Map<string, Network>();
for (const network of NETWORKS) {
  NETWORK_BY_NAME.set(network.name.toLowerCase(), network);
}

export function nameToNetworkId(name: string): string | null {
  const direct = NETWORK_BY_NAME.get(name.toLowerCase());
  if (direct) return direct.id;
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (NETWORK_BY_ID.has(slug)) return slug;
  return null;
}

export function getNetworkById(id: string): Network | null {
  return NETWORK_BY_ID.get(id) ?? null;
}

export function findNetworkByName(name: string): Network | null {
  const id = nameToNetworkId(name);
  return id ? getNetworkById(id) : null;
}

export function formatNetworkLocation(network: Network) {
  const lat = `${Math.abs(network.hubLat).toFixed(2)}°${network.hubLat >= 0 ? "N" : "S"}`;
  const lng = `${Math.abs(network.hubLng).toFixed(2)}°${network.hubLng >= 0 ? "E" : "W"}`;
  return `${network.hubLocation} · ${lat} ${lng}`;
}

export function networkInitials(network: Network) {
  const trimmed = network.name.replace(/\s+chain$/i, "");
  return trimmed.slice(0, 3).toUpperCase();
}
