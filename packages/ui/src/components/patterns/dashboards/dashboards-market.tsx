import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";

export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  series: number[];
  vol: string;
}

const FEATURED: Ticker = {
  symbol: "ACME",
  name: "Acme Holdings",
  price: 184.62,
  changePct: 2.41,
  series: [
    178, 178.4, 179.1, 178.6, 179.5, 180.2, 181.0, 180.4, 181.2, 181.8, 181.4,
    182.0, 182.6, 182.2, 182.9, 183.4, 183.0, 183.7, 183.9, 184.0, 184.4, 184.1,
    184.6, 184.62,
  ],
  vol: "2.4M",
};

const WATCHLIST: Ticker[] = [
  { symbol: "LNRX", name: "Linear Inc", price: 412.18, changePct: 1.42, vol: "812k", series: gen(412, 0.005) },
  { symbol: "VCRL", name: "Vercel Co", price: 248.42, changePct: 4.12, vol: "1.2M", series: gen(238, 0.012) },
  { symbol: "SUPA", name: "Supabase", price: 84.61, changePct: -0.84, vol: "964k", series: gen(85, -0.004) },
  { symbol: "RSND", name: "Resend", price: 52.18, changePct: 8.61, vol: "2.1M", series: gen(48, 0.024) },
  { symbol: "PSCL", name: "PlanetScale", price: 38.42, changePct: -2.18, vol: "612k", series: gen(39, -0.011) },
  { symbol: "CALC", name: "Cal.com", price: 76.94, changePct: 0.62, vol: "428k", series: gen(76, 0.002) },
  { symbol: "MNTL", name: "Mintlify", price: 24.18, changePct: -1.42, vol: "284k", series: gen(24.5, -0.008) },
  { symbol: "ORBT", name: "Orbit", price: 92.41, changePct: 3.12, vol: "1.4M", series: gen(89, 0.014) },
];

function gen(base: number, drift: number) {
  const out: number[] = [base];
  for (let i = 1; i < 24; i++) {
    const noise = (Math.sin(i * 1.7 + base) * 0.5 + Math.cos(i * 0.6) * 0.3) * 0.6;
    out.push(out[i - 1] * (1 + drift / 6 + noise / 100));
  }
  return out;
}

const ALLOCATION = [
  { name: "Tech", pct: 42, color: "rgb(99 102 241)" },
  { name: "Fintech", pct: 23, color: "rgb(56 189 248)" },
  { name: "Devtools", pct: 18, color: "rgb(16 185 129)" },
  { name: "Crypto", pct: 9, color: "rgb(245 158 11)" },
  { name: "Cash", pct: 8, color: "rgb(127 127 127)" },
];

const NEWS = [
  { time: "10:42", source: "WSJ", headline: "Acme cleared by FTC for Linear acquisition" },
  { time: "10:18", source: "Bloomberg", headline: "Resend doubles MRR after enterprise launch" },
  { time: "09:51", source: "Reuters", headline: "Fed signals one more rate cut before EOY" },
  { time: "09:14", source: "FT", headline: "PlanetScale loses Slack as flagship customer" },
];

export function DashboardsMarketShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Portfolio · sean's index
            </div>
            <h1 className="mt-1 font-heading text-2xl">Markets</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              1D
              <ChevronDownIcon className="size-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <PlusIcon className="size-3.5" />
              Add ticker
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 lg:grid-cols-[1fr_300px]">
          <FeaturedPane />
          <PortfolioPane />
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 lg:grid-cols-[1.6fr_1fr]">
          <WatchlistTable />
          <NewsPane />
        </div>
      </div>
    </div>
  );
}

export function FeaturedPane() {
  const positive = FEATURED.changePct >= 0;
  return (
    <div className="bg-background p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl">{FEATURED.symbol}</span>
            <span className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
              {FEATURED.name}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-5xl tabular-nums">
              ${FEATURED.price.toFixed(2)}
            </span>
            <span
              className={`inline-flex items-baseline gap-0.5 font-mono tabular-nums ${
                positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {positive ? (
                <ArrowUpRightIcon className="size-4" />
              ) : (
                <ArrowDownRightIcon className="size-4" />
              )}
              {Math.abs(FEATURED.changePct).toFixed(2)}%
            </span>
          </div>
          <div className="mt-1 font-mono text-muted-foreground text-xs">
            +$4.34 today · vol {FEATURED.vol}
          </div>
        </div>
        <div className="flex gap-1">
          {["1D", "1W", "1M", "1Y", "ALL"].map((r) => (
            <button
              key={r}
              type="button"
              className={`rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] ${
                r === "1D"
                  ? "bg-foreground/[0.06] text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <PriceChart values={FEATURED.series} positive={positive} />
      </div>
    </div>
  );
}

export function PortfolioPane() {
  const total = 184_620;
  const change = 4_182;
  const changePct = (change / (total - change)) * 100;
  return (
    <div className="bg-background p-6">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        Portfolio value
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-heading text-3xl tabular-nums">
          ${total.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 inline-flex items-baseline gap-1 font-mono text-emerald-600 text-sm tabular-nums dark:text-emerald-400">
        <ArrowUpRightIcon className="size-3.5" />+${change.toLocaleString()} ·{" "}
        {changePct.toFixed(2)}%
      </div>

      <div className="mt-5">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Allocation
        </div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full">
          {ALLOCATION.map((a) => (
            <div
              key={a.name}
              style={{ width: `${a.pct}%`, background: a.color }}
              className="h-full"
            />
          ))}
        </div>
        <ul className="mt-3 space-y-1.5 font-mono text-[11px]">
          {ALLOCATION.map((a) => (
            <li key={a.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: a.color }}
                />
                {a.name}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {a.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function WatchlistTable() {
  return (
    <div className="bg-background">
      <div className="flex items-baseline justify-between border-border/40 border-b px-5 py-3">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Watchlist
        </span>
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          {WATCHLIST.length} tickers · last 24h
        </span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-border/40 border-b text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            <th className="px-5 py-2 font-normal">Symbol</th>
            <th className="px-5 py-2 text-right font-normal">Price</th>
            <th className="px-5 py-2 text-right font-normal">Change</th>
            <th className="px-5 py-2 font-normal">24h</th>
            <th className="px-5 py-2 text-right font-normal">Vol</th>
          </tr>
        </thead>
        <tbody>
          {WATCHLIST.map((t) => {
            const positive = t.changePct >= 0;
            const color = positive ? "rgb(16 185 129)" : "rgb(244 63 94)";
            return (
              <tr
                key={t.symbol}
                className="border-border/30 border-b hover:bg-foreground/[0.02]"
              >
                <td className="px-5 py-2.5">
                  <div className="font-mono text-sm">{t.symbol}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {t.name}
                  </div>
                </td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums">
                  ${t.price.toFixed(2)}
                </td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums">
                  <span
                    className={
                      positive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }
                  >
                    {positive ? "+" : ""}
                    {t.changePct.toFixed(2)}%
                  </span>
                </td>
                <td className="px-5 py-2.5">
                  <div className="h-7 w-32">
                    <Spark values={t.series} color={color} />
                  </div>
                </td>
                <td className="px-5 py-2.5 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                  {t.vol}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function NewsPane() {
  return (
    <div className="bg-background">
      <div className="flex items-baseline justify-between border-border/40 border-b px-5 py-3">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Headlines
        </span>
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          live
        </span>
      </div>
      <ul className="divide-y divide-border/40">
        {NEWS.map((n, i) => (
          <li key={i} className="px-5 py-3">
            <div className="flex items-baseline gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              <span className="tabular-nums">{n.time}</span>
              <span>·</span>
              <span>{n.source}</span>
            </div>
            <div className="mt-1 text-sm leading-snug">{n.headline}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PriceChart({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  const w = 700;
  const h = 200;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(0.001, max - min);
  const stepX = w / (values.length - 1);
  const pts = values
    .map((v, i) => `${i * stepX},${h - ((v - min) / range) * (h - 20) - 10}`)
    .join(" L ");
  const color = positive ? "rgb(16 185 129)" : "rgb(244 63 94)";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-48 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mkt-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line
          key={y}
          x1="0"
          x2={w}
          y1={h * y}
          y2={h * y}
          stroke="rgb(127 127 127 / 0.1)"
          strokeDasharray="2 4"
        />
      ))}
      <path d={`M 0,${h} L ${pts} L ${w},${h} Z`} fill="url(#mkt-grad)" />
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="1.75" />
    </svg>
  );
}

export function Spark({ values, color }: { values: number[]; color: string }) {
  const w = 120;
  const h = 28;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(0.001, max - min);
  const stepX = w / (values.length - 1);
  const pts = values
    .map((v, i) => `${i * stepX},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(" L ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
