import type { Protocol } from "./types";

const MAX_THRESHOLD_DEG = 8;
const MIN_GROUP_SIZE = 3;
const COLLOCATED_DEG = 0.5;
const COLLOCATED_EPSILON_DEG = 0.05;

export type Cluster = {
  id: string;
  lat: number;
  lng: number;
  protocols: Protocol[];
  minPairwiseDeg: number;
  collocated: boolean;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function thresholdForZoom(normalizedZoom: number) {
  return MAX_THRESHOLD_DEG * (1 - clamp01(normalizedZoom));
}

function angularDistanceDeg(a: Protocol, b: Protocol) {
  const dLat = a.lat - b.lat;
  const dLng = a.lng - b.lng;
  const cos = Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  return Math.hypot(dLat, dLng * cos);
}

function clusterFingerprint(protocols: Protocol[]) {
  return protocols
    .map((p) => p.id)
    .sort()
    .join("-");
}

function collectLinkedProtocols(
  seed: Protocol,
  protocols: Protocol[],
  taken: Set<string>,
  threshold: number,
) {
  const members: Protocol[] = [seed];
  const memberIds = new Set([seed.id]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const candidate of protocols) {
      if (taken.has(candidate.id) || memberIds.has(candidate.id)) continue;
      const close = members.some(
        (member) => angularDistanceDeg(member, candidate) < threshold,
      );
      if (close) {
        members.push(candidate);
        memberIds.add(candidate.id);
        changed = true;
      }
    }
  }

  return members;
}

function clusterCenter(protocols: Protocol[]) {
  let lat = 0;
  let lng = 0;
  for (const protocol of protocols) {
    lat += protocol.lat;
    lng += protocol.lng;
  }
  return {
    lat: lat / protocols.length,
    lng: lng / protocols.length,
  };
}

function pairwiseStats(protocols: Protocol[]) {
  if (protocols.length < 2) {
    return { minPairwiseDeg: 0, maxPairwiseDeg: 0 };
  }

  let minPairwiseDeg = Infinity;
  let maxPairwiseDeg = 0;
  for (let i = 0; i < protocols.length; i++) {
    for (let j = i + 1; j < protocols.length; j++) {
      const d = angularDistanceDeg(protocols[i]!, protocols[j]!);
      if (d < minPairwiseDeg) minPairwiseDeg = d;
      if (d > maxPairwiseDeg) maxPairwiseDeg = d;
    }
  }
  return { minPairwiseDeg, maxPairwiseDeg };
}

function makeCluster(protocols: Protocol[]): Cluster {
  const center = clusterCenter(protocols);
  const stats = pairwiseStats(protocols);
  return {
    id: protocols.length === 1 ? `p-${protocols[0]!.id}` : `c-${clusterFingerprint(protocols)}`,
    lat: center.lat,
    lng: center.lng,
    protocols,
    minPairwiseDeg: stats.minPairwiseDeg,
    collocated: protocols.length > 1 && stats.maxPairwiseDeg < COLLOCATED_DEG,
  };
}

export function clusterProtocols(protocols: Protocol[], normalizedZoom: number): Cluster[] {
  const threshold = thresholdForZoom(normalizedZoom);
  const ordered = [...protocols].sort((a, b) => a.id.localeCompare(b.id));
  const taken = new Set<string>();
  const clusters: Cluster[] = [];

  for (const seed of ordered) {
    if (taken.has(seed.id)) continue;
    const effectiveThreshold = Math.max(threshold, COLLOCATED_EPSILON_DEG);
    const members = collectLinkedProtocols(seed, ordered, taken, effectiveThreshold);
    const cluster = makeCluster(members);
    const shouldGroup = cluster.collocated || members.length >= MIN_GROUP_SIZE;
    const acceptedMembers = shouldGroup ? members : [seed];

    for (const member of acceptedMembers) taken.add(member.id);
    clusters.push(shouldGroup ? cluster : makeCluster(acceptedMembers));
  }

  return clusters;
}

export function zoomToSplit(
  cluster: Cluster,
  minZoom: number,
  maxZoom: number,
): number {
  if (cluster.collocated || cluster.minPairwiseDeg <= 0) return maxZoom;
  // need threshold(z) < minPairwiseDeg
  // threshold = MAX_THRESHOLD_DEG * (1 - normalizedZoom)
  // normalizedZoom > 1 - minPairwiseDeg / MAX_THRESHOLD_DEG
  const normalizedTarget = clamp01(1 - cluster.minPairwiseDeg / MAX_THRESHOLD_DEG) + 0.05;
  return clamp01(normalizedTarget) * (maxZoom - minZoom) + minZoom;
}
