export function percentChange(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function seriesChange(
  points: Array<{ timestamp: string; value: number | null }>,
  days: number,
) {
  const latest = points.at(-1);
  if (!latest || latest.value == null) return null;
  const cutoff = Date.parse(latest.timestamp) - days * 24 * 60 * 60 * 1000;
  const previous =
    [...points].reverse().find((point) => point.value != null && Date.parse(point.timestamp) <= cutoff) ??
    points.find((point) => point.value != null);
  return percentChange(latest.value, previous?.value ?? null);
}
