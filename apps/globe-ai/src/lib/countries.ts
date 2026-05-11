import type { Feature, GeoJsonProperties, MultiPolygon, Polygon } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";

export type CountryFeature = Feature<Polygon | MultiPolygon, GeoJsonProperties>;

let cachedFeatures: CountryFeature[] | null = null;

export async function loadCountryFeatures(): Promise<CountryFeature[]> {
  if (cachedFeatures) return cachedFeatures;
  const topo = (await import("world-atlas/countries-110m.json")) as unknown as Topology;
  const geo = feature(
    topo,
    topo.objects.countries as Parameters<typeof feature>[1],
  );
  cachedFeatures = (geo as { features: CountryFeature[] }).features;
  return cachedFeatures;
}

export function getCountryName(feature: CountryFeature | null | undefined) {
  const properties = feature?.properties as { name?: string } | undefined;
  return properties?.name?.trim() || null;
}

type PolygonCoordinates = number[][][];

function getFeaturePolygons(feature: CountryFeature): PolygonCoordinates[] {
  if (feature.geometry.type === "Polygon") {
    return [feature.geometry.coordinates as PolygonCoordinates];
  }
  return feature.geometry.coordinates as PolygonCoordinates[];
}

function getPolygonBounds(polygon: PolygonCoordinates) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const ring of polygon) {
    for (const [lng, lat] of ring) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
  }

  return { minLat, maxLat, minLng, maxLng };
}

function isPointInRing(lat: number, lng: number, ring: number[][]) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [lngI, latI] = ring[i]!;
    const [lngJ, latJ] = ring[j]!;
    const intersects =
      latI > lat !== latJ > lat &&
      lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI;
    if (intersects) inside = !inside;
  }

  return inside;
}

function isPointInPolygon(lat: number, lng: number, polygon: PolygonCoordinates) {
  const [outerRing, ...holes] = polygon;
  if (!outerRing || !isPointInRing(lat, lng, outerRing)) return false;
  return !holes.some((hole) => isPointInRing(lat, lng, hole));
}

function hashToUnit(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function getFeatureBounds(feature: CountryFeature) {
  const polygons = getFeaturePolygons(feature);
  return polygons.reduce(
    (bounds, polygon) => {
      const next = getPolygonBounds(polygon);
      return {
        minLat: Math.min(bounds.minLat, next.minLat),
        maxLat: Math.max(bounds.maxLat, next.maxLat),
        minLng: Math.min(bounds.minLng, next.minLng),
        maxLng: Math.max(bounds.maxLng, next.maxLng),
      };
    },
    { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity },
  );
}

export function getBoundsCenter(bounds: ReturnType<typeof getFeatureBounds>) {
  return {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2,
  };
}

export function randomPointInFeature(feature: CountryFeature, seed: string) {
  const polygons = getFeaturePolygons(feature);
  const polygon = polygons[Math.floor(hashToUnit(`${seed}:poly`) * polygons.length)] ?? polygons[0];
  if (!polygon) return getBoundsCenter(getFeatureBounds(feature));

  const bounds = getPolygonBounds(polygon);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const lng =
      bounds.minLng +
      (bounds.maxLng - bounds.minLng) * hashToUnit(`${seed}:lng:${attempt}`);
    const lat =
      bounds.minLat +
      (bounds.maxLat - bounds.minLat) * hashToUnit(`${seed}:lat:${attempt}`);
    if (isPointInPolygon(lat, lng, polygon)) return { lat, lng };
  }

  return getBoundsCenter(bounds);
}

export const COUNTRY_TIMEZONES: Record<string, string> = {
  "United States of America": "America/New_York",
  "United Kingdom": "Europe/London",
  Germany: "Europe/Berlin",
  France: "Europe/Paris",
  Spain: "Europe/Madrid",
  Italy: "Europe/Rome",
  Switzerland: "Europe/Zurich",
  Denmark: "Europe/Copenhagen",
  Singapore: "Asia/Singapore",
  Thailand: "Asia/Bangkok",
  Japan: "Asia/Tokyo",
  "South Korea": "Asia/Seoul",
  China: "Asia/Shanghai",
  India: "Asia/Kolkata",
  "United Arab Emirates": "Asia/Dubai",
  Brazil: "America/Sao_Paulo",
  Canada: "America/Toronto",
  Australia: "Australia/Sydney",
};

