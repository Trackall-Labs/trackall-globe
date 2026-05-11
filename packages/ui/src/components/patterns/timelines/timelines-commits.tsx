import { CopyIcon, GitBranchIcon, TagIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";

export interface Commit {
  hash: string;
  parents: string[];
  lane: number;
  author: string;
  initials: string;
  message: string;
  scope: string;
  time: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  merge?: boolean;
  tag?: string;
}

const COMMITS: Commit[] = [
  { hash: "f3b9a21", parents: ["12cae71"], lane: 0, author: "Maya", initials: "MO", message: "feat(audit): persist 1y retention on Business plan", scope: "billing/audit", time: "2h ago", filesChanged: 8, additions: 142, deletions: 18, tag: "v3.4" },
  { hash: "12cae71", parents: ["4d99a0c", "8a204d3"], lane: 0, author: "Maya", initials: "MO", message: "Merge branch 'feat/audit-log'", scope: "merge", time: "2h ago", filesChanged: 0, additions: 0, deletions: 0, merge: true },
  { hash: "8a204d3", parents: ["7f10b5e"], lane: 1, author: "James", initials: "JL", message: "fix(table): respect filter in CSV export", scope: "tables", time: "4h ago", filesChanged: 3, additions: 24, deletions: 6 },
  { hash: "7f10b5e", parents: ["4d99a0c"], lane: 1, author: "James", initials: "JL", message: "wip(table): wire export action menu", scope: "tables", time: "5h ago", filesChanged: 4, additions: 78, deletions: 22 },
  { hash: "4d99a0c", parents: ["2b10f7c"], lane: 0, author: "Riya", initials: "RP", message: "chore: bump @orbit/ui to 0.8.2", scope: "deps", time: "8h ago", filesChanged: 2, additions: 1, deletions: 1 },
  { hash: "9c8e3f1", parents: ["2b10f7c"], lane: 2, author: "Dani", initials: "DK", message: "design(palette): tighter ⌘K row spacing", scope: "command", time: "yesterday", filesChanged: 1, additions: 12, deletions: 8 },
  { hash: "2b10f7c", parents: [], lane: 0, author: "Sean", initials: "SB", message: "release v3.4", scope: "release", time: "yesterday", filesChanged: 1, additions: 2, deletions: 2, tag: "v3.4" },
];

const LANE_COLORS = ["#6366f1", "#14b8a6", "#f472b6"];
const ROW_H = 60;
const LANE_X_BASE = 18;
const LANE_GAP = 20;
const DOT_R = 5;

function laneX(l: number) {
  return LANE_X_BASE + l * LANE_GAP;
}

function rowY(r: number) {
  return r * ROW_H + ROW_H / 2;
}

export type Edge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  sameLane: boolean;
};

function pathFor(e: Edge) {
  if (e.sameLane) {
    return `M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`;
  }
  // S-curve: vertical exit, lateral curve, vertical entry
  const dy = e.y2 - e.y1;
  const corner = Math.min(dy / 2, ROW_H * 0.45);
  return [
    `M ${e.x1} ${e.y1}`,
    `L ${e.x1} ${e.y1 + dy / 2 - corner / 2}`,
    `C ${e.x1} ${e.y1 + dy / 2 + corner / 2}, ${e.x2} ${e.y2 - dy / 2 - corner / 2}, ${e.x2} ${e.y2 - dy / 2 + corner / 2}`,
    `L ${e.x2} ${e.y2}`,
  ].join(" ");
}

export function TimelinesCommitsShowcasePage() {
  const numLanes = Math.max(...COMMITS.map((c) => c.lane)) + 1;
  const graphWidth = LANE_X_BASE * 2 + (numLanes - 1) * LANE_GAP;
  const totalHeight = COMMITS.length * ROW_H;
  const hashToRow = new Map(COMMITS.map((c, i) => [c.hash, i]));

  const edges: Edge[] = COMMITS.flatMap((c, ci) =>
    c.parents.flatMap((p) => {
      const pi = hashToRow.get(p);
      if (pi == null) return [];
      const parent = COMMITS[pi];
      return [
        {
          x1: laneX(c.lane),
          y1: rowY(ci),
          x2: laneX(parent.lane),
          y2: rowY(pi),
          color: LANE_COLORS[Math.max(c.lane, parent.lane)],
          sameLane: c.lane === parent.lane,
        },
      ];
    }),
  );

  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Repository · acme/web
            </div>
            <h1 className="mt-1 font-heading text-2xl">Commits on main</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-1.5 font-mono text-xs">
            <GitBranchIcon className="size-3.5 opacity-60" />
            main
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-background/40">
          <div className="relative" style={{ height: totalHeight }}>
            <svg
              aria-hidden
              className="pointer-events-none absolute top-0 left-4"
              width={graphWidth}
              height={totalHeight}
              viewBox={`0 0 ${graphWidth} ${totalHeight}`}
            >
              {edges.map((e, i) => (
                <path
                  key={i}
                  d={pathFor(e)}
                  fill="none"
                  stroke={e.color}
                  strokeOpacity={0.75}
                  strokeWidth={1.75}
                  strokeLinecap="round"
                />
              ))}
              {COMMITS.map((c, i) => (
                <g key={c.hash}>
                  <circle
                    cx={laneX(c.lane)}
                    cy={rowY(i)}
                    r={DOT_R + 2}
                    className="fill-background"
                  />
                  <circle
                    cx={laneX(c.lane)}
                    cy={rowY(i)}
                    r={c.merge ? DOT_R - 1 : DOT_R}
                    fill={c.merge ? "transparent" : LANE_COLORS[c.lane]}
                    stroke={LANE_COLORS[c.lane]}
                    strokeWidth={c.merge ? 1.75 : 0}
                  />
                </g>
              ))}
            </svg>

            <ul className="divide-y divide-border/40">
              {COMMITS.map((c) => (
                <li
                  key={c.hash}
                  className="flex items-center gap-4 pr-4"
                  style={{
                    height: ROW_H,
                    paddingLeft: 16 + graphWidth + 16,
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[9px]">
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={
                          c.merge
                            ? "truncate text-muted-foreground text-sm italic"
                            : "truncate text-sm"
                        }
                      >
                        {c.message}
                      </span>
                      {c.tag ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]">
                          <TagIcon className="size-2.5" />
                          {c.tag}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                      <span>{c.author}</span>
                      <span>·</span>
                      <span>{c.scope}</span>
                      <span>·</span>
                      <span>{c.time}</span>
                      {!c.merge ? (
                        <>
                          <span>·</span>
                          <span>
                            {c.filesChanged}{" "}
                            {c.filesChanged === 1 ? "file" : "files"}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{c.additions}
                          </span>
                          <span className="text-rose-600 dark:text-rose-400">
                            -{c.deletions}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <CopyIcon className="size-3" />
                    {c.hash}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
