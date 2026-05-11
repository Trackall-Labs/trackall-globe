import { PROTOCOLS } from "./protocols";
import type { Protocol } from "./types";

const PROTOCOL_PREFIX = "/protocol/";
const PROJECT_INDEX_PATH = "/projects";
const PORTFOLIO_PATH = "/portfolio";
const PORTFOLIO_PREFIX = "/portfolio/";

export function isProjectIndexPath(pathname: string) {
  return pathname === PROJECT_INDEX_PATH;
}

export function navigateToProjectIndex() {
  window.history.pushState(null, "", PROJECT_INDEX_PATH);
}

export function isPortfolioPath(pathname: string) {
  return pathname === PORTFOLIO_PATH || pathname.startsWith(PORTFOLIO_PREFIX);
}

export function navigateToPortfolio() {
  window.history.pushState(null, "", PORTFOLIO_PATH);
}

export function getPortfolioAddressFromPath(pathname: string) {
  if (!pathname.startsWith(PORTFOLIO_PREFIX)) return null;
  return decodeURIComponent(pathname.slice(PORTFOLIO_PREFIX.length)).split("/")[0] || null;
}

export function getPortfolioAddressPath(address: string) {
  return `${PORTFOLIO_PATH}/${encodeURIComponent(address)}`;
}

export function navigateToPortfolioAddress(address: string) {
  window.history.pushState(null, "", getPortfolioAddressPath(address));
}

export function getProtocolIdFromPath(pathname: string) {
  if (!pathname.startsWith(PROTOCOL_PREFIX)) return null;
  return decodeURIComponent(pathname.slice(PROTOCOL_PREFIX.length)).split("/")[0] || null;
}

export function isProtocolPath(pathname: string) {
  return getProtocolIdFromPath(pathname) !== null;
}

export function getProtocolFromPath(pathname: string): Protocol | null {
  const protocolId = getProtocolIdFromPath(pathname);
  if (!protocolId) return null;
  return PROTOCOLS.find((protocol) => protocol.id === protocolId) ?? null;
}

export function navigateToProtocol(protocolId: string) {
  window.history.pushState(null, "", `/protocol/${encodeURIComponent(protocolId)}`);
}

export function navigateToGlobe() {
  window.history.pushState(null, "", "/");
}
