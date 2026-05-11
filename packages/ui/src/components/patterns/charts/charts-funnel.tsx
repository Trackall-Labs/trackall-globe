import { ArrowDownRightIcon } from "lucide-react";

const STAGES = [
  { name: "Visited landing", count: 48214, kind: "Page view" },
  { name: "Started signup", count: 12480, kind: "Click" },
  { name: "Verified email", count: 9842, kind: "Confirmation" },
  { name: "Completed onboarding", count: 7321, kind: "Step 4" },
  { name: "Activated workspace", count: 4209, kind: "First action" },
  { name: "Invited a teammate", count: 1864, kind: "Conversion" },
];

export function ChartsFunnelShowcasePage() {
  const max = STAGES[0].count;
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Onboarding funnel · last 30 days
        </div>
        <h1 className="mt-1 font-heading text-2xl">Activation</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          End-to-end conversion: <span className="text-foreground">3.87%</span>
          {" "}of visitors activate.
        </p>

        <div className="mt-8 flex flex-col">
          {STAGES.map((s, i) => {
            const widthPct = (s.count / max) * 100;
            const drop = i > 0 ? ((STAGES[i - 1].count - s.count) / STAGES[i - 1].count) * 100 : 0;
            const carry = i > 0 ? (s.count / STAGES[i - 1].count) * 100 : 100;
            return (
              <div key={s.name} className="relative">
                <div className="grid grid-cols-[200px_1fr_120px] items-center gap-4 py-3">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                      {s.kind}
                    </div>
                    <div className="text-sm">{s.name}</div>
                  </div>
                  <div className="relative h-12">
                    <div className="absolute inset-0 rounded-md bg-background" />
                    <div
                      className="absolute inset-y-0 left-0 rounded-md transition-all"
                      style={{
                        width: `${widthPct}%`,
                        background:
                          "linear-gradient(90deg, color-mix(in srgb, var(--chart-1) 95%, transparent), color-mix(in srgb, var(--chart-1) 55%, transparent))",
                      }}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {widthPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-lg tabular-nums">
                      {s.count.toLocaleString()}
                    </div>
                    {i > 0 ? (
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {carry.toFixed(1)}% carry
                      </div>
                    ) : (
                      <div className="font-mono text-[10px] text-muted-foreground">
                        baseline
                      </div>
                    )}
                  </div>
                </div>
                {i > 0 ? (
                  <div className="absolute -top-3 left-[208px] inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 font-mono text-[10px] text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400">
                    <ArrowDownRightIcon className="size-3" />
                    -{drop.toFixed(1)}%{" "}
                    <span className="text-muted-foreground">
                      ({(STAGES[i - 1].count - s.count).toLocaleString()})
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Visit → signup" value="25.9%" tone="emerald" />
          <Stat label="Signup → activate" value="33.7%" tone="amber" />
          <Stat label="Activate → invite" value="44.3%" tone="emerald" />
        </div>
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "rose";
}) {
  const tones: Record<typeof tone, string> = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  };
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {label}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-heading text-2xl tracking-tight">{value}</span>
        <span
          className={"rounded px-1.5 py-0.5 font-mono text-[10px] " + tones[tone]}
        >
          {tone === "emerald" ? "good" : tone === "amber" ? "watch" : "low"}
        </span>
      </div>
    </div>
  );
}
