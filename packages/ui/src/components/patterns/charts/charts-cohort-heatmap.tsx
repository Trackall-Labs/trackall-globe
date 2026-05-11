const COHORTS = [
  { label: "Apr 2025", size: 412 },
  { label: "May 2025", size: 538 },
  { label: "Jun 2025", size: 612 },
  { label: "Jul 2025", size: 489 },
  { label: "Aug 2025", size: 681 },
  { label: "Sep 2025", size: 822 },
  { label: "Oct 2025", size: 754 },
  { label: "Nov 2025", size: 901 },
  { label: "Dec 2025", size: 1024 },
  { label: "Jan 2026", size: 1180 },
  { label: "Feb 2026", size: 994 },
  { label: "Mar 2026", size: 1342 },
];

function decay(month: number) {
  // Synthetic retention curve, jittered per cohort
  const base = [100, 84, 72, 64, 58, 53, 50, 47, 44, 42, 40, 38];
  return base[month] ?? null;
}

export function ChartsCohortHeatmapShowcasePage() {
  const months = 12;
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Retention · weekly product use
        </div>
        <h1 className="mt-1 font-heading text-2xl">Cohort retention</h1>
        <p className="mt-1 max-w-prose text-muted-foreground text-sm">
          Percent of users from each signup month who returned in subsequent
          months.
        </p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border/60 bg-background/40 p-5">
          <table className="w-full border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Cohort
                </th>
                <th className="px-2 py-1 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Size
                </th>
                {Array.from({ length: months }).map((_, i) => (
                  <th
                    key={i}
                    className="w-12 px-1 py-1 text-center font-mono text-[10px] text-muted-foreground"
                  >
                    M{i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COHORTS.map((c, ci) => {
                const available = months - ci;
                return (
                  <tr key={c.label}>
                    <td className="whitespace-nowrap px-2 py-1 text-muted-foreground">
                      {c.label}
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-muted-foreground">
                      {c.size}
                    </td>
                    {Array.from({ length: months }).map((_, mi) => {
                      const past = mi >= available;
                      const value = past ? null : decay(mi);
                      const variance = ((ci * 7 + mi * 3) % 9) - 4;
                      const v = value === null ? null : Math.max(0, Math.min(100, value + variance));
                      return (
                        <td key={mi} className="p-0.5">
                          {past ? (
                            <div className="h-7 w-full rounded bg-background" />
                          ) : (
                            <Cell value={v ?? 0} highlight={mi === 0} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div className="mt-5 flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            <span>Less</span>
            <div className="flex h-3 overflow-hidden rounded">
              {[10, 30, 50, 70, 90].map((v) => (
                <Swatch key={v} value={v} />
              ))}
            </div>
            <span>More</span>
            <span className="ml-auto">
              Average M3: <span className="text-foreground">64.2%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Cell({ value, highlight }: { value: number; highlight?: boolean }) {
  const intensity = value / 100;
  return (
    <div
      className={
        "grid h-7 place-items-center rounded font-mono text-[10px] transition-transform hover:scale-[1.04] " +
        (highlight ? "ring-1 ring-foreground/20" : "")
      }
      style={{
        backgroundColor: `rgba(99, 102, 241, ${0.12 + intensity * 0.78})`,
        color: intensity > 0.55 ? "white" : "rgb(67 56 202)",
      }}
    >
      {value.toFixed(0)}
    </div>
  );
}

export function Swatch({ value }: { value: number }) {
  return (
    <span
      className="h-3 w-6"
      style={{
        backgroundColor: `rgba(99, 102, 241, ${0.12 + (value / 100) * 0.78})`,
      }}
    />
  );
}
