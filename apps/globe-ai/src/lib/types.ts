export type ProtocolCategory =
  | "DEX"
  | "Lending"
  | "Bridge"
  | "Staking"
  | "Stablecoin"
  | "Governance"
  | "DeFi";

export type Protocol = {
  id: string;
  name: string;
  symbol: string;
  category: ProtocolCategory;
  networks: string[];
  tags: string[];
  lat: number;
  lng: number;
  country: string;
  description: string;
  website?: string;
  logo?: string;
  activeUsers?: number;
  programIds?: string[];
  source?: "local" | "trackall-api";
};

export type WalletPin = {
  id: string;
  walletAddress: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  checkedCount: number;
  matchedCount: number;
  matchRatio: number;
  createdAt: number;
};
