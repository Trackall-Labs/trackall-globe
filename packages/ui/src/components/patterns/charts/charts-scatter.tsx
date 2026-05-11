import {
  Cell,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import {
  ChartAxis,
  ChartContainer,
  ChartGrid,
  ChartTooltip,
  chartColor,
} from "@orbit/ui/patterns/charts/chart";

export interface Point {
  name: string;
  x: number;
  y: number;
  size: number;
  highlight?: boolean;
}

const POINTS: Point[] = [
  { name: "Acme", x: 9.1, y: 92, size: 124, highlight: true },
  { name: "Initech", x: 7.4, y: 68, size: 88 },
  { name: "Stark", x: 8.6, y: 84, size: 104 },
  { name: "Wayne", x: 6.9, y: 78, size: 72 },
  { name: "Hooli", x: 8.1, y: 74, size: 91 },
  { name: "Pied Piper", x: 5.4, y: 41, size: 32, highlight: true },
  { name: "Aperture", x: 7.0, y: 62, size: 47 },
  { name: "Globex", x: 4.2, y: 48, size: 28 },
  { name: "Cyberdyne", x: 8.9, y: 88, size: 116 },
  { name: "Soylent", x: 3.6, y: 35, size: 22, highlight: true },
  { name: "Tyrell", x: 9.4, y: 95, size: 142 },
  { name: "Massive Dyn.", x: 6.2, y: 56, size: 41 },
  { name: "Vandelay", x: 7.8, y: 80, size: 68 },
  { name: "Bluth", x: 5.0, y: 52, size: 36 },
  { name: "Rekall", x: 4.8, y: 30, size: 24 },
];

export function ChartsScatterShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Account health · top 15 customers
        </div>
        <h1 className="mt-1 font-heading text-2xl">
          Satisfaction × retention
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Bubble size = MRR. Bottom-left quadrant flags churn risk.
        </p>

        <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-6">
          <ChartContainer className="h-96">
            <ScatterChart margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <ChartGrid vertical />
              <ChartAxis
                axis="x"
                dataKey="x"
                type="number"
                domain={[1, 10]}
                ticks={[1, 3, 5, 7, 9, 10]}
              />
              <ChartAxis
                axis="y"
                dataKey="y"
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                width={36}
                tickFormatter={(v) => `${v}%`}
              />
              <ZAxis dataKey="size" range={[80, 720]} />
              <ChartTooltip cursor={{ strokeDasharray: "2 4" }} />

              <ReferenceArea
                x1={1}
                x2={5.5}
                y1={0}
                y2={50}
                fill="rgb(244 63 94)"
                fillOpacity={0.06}
                stroke="none"
              />
              <ReferenceLine
                x={5.5}
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeOpacity={0.3}
              />
              <ReferenceLine
                y={50}
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeOpacity={0.3}
              />

              <Scatter data={POINTS} fillOpacity={0.2}>
                {POINTS.map((p, i) => {
                  const isRisk = p.x < 5.5 && p.y < 50;
                  const color = isRisk ? "rgb(244 63 94)" : chartColor(0);
                  return (
                    <Cell
                      key={i}
                      fill={color}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                  );
                })}
                <LabelList
                  dataKey="name"
                  position="right"
                  offset={10}
                  fontSize={10}
                  fill="currentColor"
                  className="font-mono"
                  formatter={(value) => {
                    const p = POINTS.find((q) => q.name === value);
                    return p?.highlight ? String(value) : "";
                  }}
                />
              </Scatter>
            </ScatterChart>
          </ChartContainer>

          <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            <span>← satisfaction (NPS proxy) →</span>
            <span>3 outliers flagged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
