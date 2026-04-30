import { getNetworkById, type Network } from "./networks";

const NETWORK_FILTER_PARAM = "network";

export function routePathname(route: string) {
  return route.split("?")[0] || "/";
}

export function routeSearch(route: string) {
  const queryStart = route.indexOf("?");
  return queryStart >= 0 ? route.slice(queryStart) : "";
}

export function getCurrentRoute() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function getNetworkFilterFromSearch(search: string): Network | null {
  const id = new URLSearchParams(search).get(NETWORK_FILTER_PARAM);
  return id ? getNetworkById(id) : null;
}

export function getNetworkFilterFromRoute(route: string): Network | null {
  return getNetworkFilterFromSearch(routeSearch(route));
}

export function pathWithNetworkFilter(pathname: string, networkId: string | null) {
  const url = new URL(pathname, "https://local.invalid");
  if (networkId) {
    url.searchParams.set(NETWORK_FILTER_PARAM, networkId);
  } else {
    url.searchParams.delete(NETWORK_FILTER_PARAM);
  }
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}`;
}
