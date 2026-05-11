import { findNetworkByName, type Network } from "./networks";

function normalizeNetworkName(network?: string) {
  return network?.toLowerCase().replace(/\s+/g, "-") ?? "solana";
}

export function walletExplorerUrl(address: string, network?: string) {
  const normalized = normalizeNetworkName(network);
  const baseUrl =
    normalized === "solana"
      ? "https://solscan.io/account/"
      : "https://etherscan.io/address/";
  return `${baseUrl}${encodeURIComponent(address)}`;
}

function resolveNetwork(network?: Network | string) {
  if (!network) return null;
  return typeof network === "string" ? findNetworkByName(network) : network;
}

export function transactionExplorerUrl(txHash: string, network?: Network | string) {
  const resolvedNetwork = resolveNetwork(network);
  if (!resolvedNetwork) return null;
  const baseUrl =
    resolvedNetwork.id === "solana"
      ? "https://solscan.io/tx/"
      : resolvedNetwork.evmCompatible
        ? "https://etherscan.io/tx/"
        : null;
  return baseUrl ? `${baseUrl}${encodeURIComponent(txHash)}` : null;
}
