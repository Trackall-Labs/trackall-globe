import { getNetworkById, type Network } from "./networks";

const NETWORK_PREFIX = "/network/";
const NETWORK_INDEX = "/network";
const NETWORKS_INDEX = "/networks";

export function getNetworkIdFromPath(pathname: string) {
  if (!pathname.startsWith(NETWORK_PREFIX)) return null;
  return decodeURIComponent(pathname.slice(NETWORK_PREFIX.length)).split("/")[0] || null;
}

export function isNetworkPath(pathname: string) {
  return getNetworkIdFromPath(pathname) !== null;
}

export function isNetworkIndexPath(pathname: string) {
  return pathname === NETWORK_INDEX || pathname === NETWORKS_INDEX;
}

export function isAnyNetworkPath(pathname: string) {
  return isNetworkIndexPath(pathname) || isNetworkPath(pathname);
}

export function getNetworkFromPath(pathname: string): Network | null {
  const networkId = getNetworkIdFromPath(pathname);
  if (!networkId) return null;
  return getNetworkById(networkId);
}

export function navigateToNetwork(networkId: string) {
  window.history.pushState(null, "", `/network/${encodeURIComponent(networkId)}`);
}

export function navigateToNetworkIndex() {
  window.history.pushState(null, "", NETWORKS_INDEX);
}
