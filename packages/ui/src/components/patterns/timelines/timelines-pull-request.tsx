import {
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  FileDiffIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MessageSquareIcon,
  PlayIcon,
  PlusIcon,
  RocketIcon,
  ShieldCheckIcon,
  TagIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";

export type ReviewState = "approved" | "changes" | "pending";

export interface Reviewer {
  name: string;
  initials: string;
  avatar?: string;
  state: ReviewState;
  lastSeen: string;
}

const REVIEWERS: Reviewer[] = [
  { name: "Maya Okafor", initials: "MO", state: "approved", lastSeen: "active now" },
  { name: "James Lin", initials: "JL", state: "approved", lastSeen: "1h ago" },
  { name: "Riya Patel", initials: "RP", state: "pending", lastSeen: "in NYC, asleep" },
];

export interface Check {
  name: string;
  context: string;
  status: "passed" | "failed" | "running" | "skipped";
  duration?: string;
}

const CHECKS: Check[] = [
  { name: "build", context: "web", status: "passed", duration: "2m 14s" },
  { name: "build", context: "api", status: "passed", duration: "1m 48s" },
  { name: "test", context: "unit", status: "passed", duration: "3m 02s" },
  { name: "test", context: "e2e", status: "passed", duration: "9m 14s" },
  { name: "lint", context: "tsc", status: "passed", duration: "21s" },
  { name: "preview", context: "vercel", status: "passed", duration: "1m 06s" },
  { name: "security", context: "snyk", status: "passed", duration: "32s" },
  { name: "perf", context: "lighthouse", status: "running" },
];

export interface DiffSnippet {
  file: string;
  line: number;
  lines: { kind: "context" | "add" | "del"; n: number; text: string }[];
}

export type TimelineItem =
  | {
      kind: "commit";
      who: string;
      initials: string;
      time: string;
      commits: { sha: string; message: string }[];
    }
  | {
      kind: "comment";
      who: string;
      initials: string;
      time: string;
      body: string;
      diff?: DiffSnippet;
    }
  | {
      kind: "review";
      who: string;
      initials: string;
      time: string;
      state: ReviewState;
      summary?: string;
    }
  | {
      kind: "ci";
      time: string;
      passed: number;
      total: number;
      duration: string;
    }
  | {
      kind: "deploy";
      time: string;
      env: "preview" | "staging";
      url: string;
      duration: string;
    }
  | {
      kind: "status";
      time: string;
      label: string;
      who: string;
    };

const TIMELINE: TimelineItem[] = [
  {
    kind: "commit",
    who: "Maya Okafor",
    initials: "MO",
    time: "12m ago",
    commits: [
      { sha: "f3b9a21", message: "feat(audit): persist 1y retention on Business plan" },
      { sha: "12cae71", message: "Merge branch 'feat/audit-log'" },
      { sha: "8a204d3", message: "fix(table): respect filter in CSV export" },
    ],
  },
  {
    kind: "ci",
    time: "10m ago",
    passed: 7,
    total: 8,
    duration: "9m 14s",
  },
  {
    kind: "comment",
    who: "James Lin",
    initials: "JL",
    time: "8m ago",
    body: "Could we extract the retention map so the api route doesn't need to know about plan tiers? Otherwise this LGTM.",
    diff: {
      file: "apps/api/src/audit/retention.ts",
      line: 42,
      lines: [
        { kind: "context", n: 41, text: "export function retentionFor(plan: Plan): number {" },
        { kind: "del", n: 42, text: "  if (plan === 'business') return 365" },
        { kind: "add", n: 42, text: "  return RETENTION_BY_PLAN[plan] ?? DEFAULT_RETENTION" },
        { kind: "context", n: 43, text: "}" },
      ],
    },
  },
  {
    kind: "review",
    who: "James Lin",
    initials: "JL",
    time: "6m ago",
    state: "approved",
    summary: "Resolved with the inline suggestion. Thanks!",
  },
  {
    kind: "deploy",
    time: "5m ago",
    env: "preview",
    url: "audit-log-feat.preview.acme.dev",
    duration: "1m 06s",
  },
  {
    kind: "review",
    who: "Maya Okafor",
    initials: "MO",
    time: "3m ago",
    state: "approved",
  },
  {
    kind: "status",
    time: "2m ago",
    label: "marked ready for review",
    who: "Sean Brydon",
  },
];

export function TimelinesPullRequestShowcasePage() {
  const approvals = REVIEWERS.filter((r) => r.state === "approved").length;
  const totalChecks = CHECKS.length;
  const passedChecks = CHECKS.filter((c) => c.status === "passed").length;
  const runningChecks = CHECKS.filter((c) => c.status === "running").length;
  const blockingChecks = CHECKS.filter((c) => c.status === "failed").length;
  const requiredReviewers = 2;
  const ready =
    approvals >= requiredReviewers && blockingChecks === 0 && runningChecks === 0;
  const linesAdded = 142;
  const linesRemoved = 18;

  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          <span>acme/web</span>
          <span>›</span>
          <span>pulls</span>
          <span>›</span>
          <span className="text-foreground">#3284</span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl">
              Persist 1y audit-log retention on Business plan
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-700 text-xs dark:text-emerald-400">
                <GitPullRequestIcon className="size-3" />
                Open
              </span>
              <Avatar className="size-5">
                <AvatarFallback className="text-[9px]">SB</AvatarFallback>
              </Avatar>
              <span className="text-foreground">Sean Brydon</span>
              <span>wants to merge 3 commits into</span>
              <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                main
              </span>
              <span>from</span>
              <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                feat/audit-log
              </span>
            </div>
          </div>
        </div>

        <MergeReadiness
          ready={ready}
          approvals={approvals}
          requiredReviewers={requiredReviewers}
          passedChecks={passedChecks}
          totalChecks={totalChecks}
          runningChecks={runningChecks}
          blockingChecks={blockingChecks}
        />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-4">
            <Description linesAdded={linesAdded} linesRemoved={linesRemoved} />
            <ChecksPanel />
            <div className="space-y-0">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                Activity
              </div>
              <div className="relative mt-3">
                <div className="absolute top-2 bottom-2 left-3.5 w-px bg-border/60" />
                <ul className="space-y-3">
                  {TIMELINE.map((item, i) => (
                    <TimelineRow key={i} item={item} />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <SidebarSection
              title="Reviewers"
              actionIcon={<UserPlusIcon className="size-3.5" />}
            >
              <ul className="space-y-2">
                {REVIEWERS.map((r) => (
                  <ReviewerCard key={r.name} reviewer={r} />
                ))}
              </ul>
            </SidebarSection>

            <SidebarSection
              title="Labels"
              actionIcon={<PlusIcon className="size-3.5" />}
            >
              <div className="flex flex-wrap gap-1.5">
                <Label tone="violet">audit</Label>
                <Label tone="amber">billing</Label>
                <Label tone="sky">needs-design-review</Label>
              </div>
            </SidebarSection>

            <SidebarSection title="Linked issues">
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <CircleIcon className="size-3.5 text-emerald-500" />
                  <span className="font-mono text-muted-foreground text-xs">
                    #3211
                  </span>
                  <span className="truncate">
                    Business plan compliance gaps
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleIcon className="size-3.5 text-emerald-500" />
                  <span className="font-mono text-muted-foreground text-xs">
                    #3198
                  </span>
                  <span className="truncate">
                    Audit log retention story
                  </span>
                </li>
              </ul>
            </SidebarSection>

            <SidebarSection title="Milestone">
              <div className="text-sm">
                <div className="flex items-center justify-between">
                  <span>v3.4 release</span>
                  <span className="font-mono text-muted-foreground text-xs">
                    9/12
                  </span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                  <div
                    className="h-full bg-foreground/40"
                    style={{ width: "75%" }}
                  />
                </div>
                <div className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  <ClockIcon className="size-3" />
                  ships in 2 days
                </div>
              </div>
            </SidebarSection>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function MergeReadiness({
  ready,
  approvals,
  requiredReviewers,
  passedChecks,
  totalChecks,
  runningChecks,
  blockingChecks,
}: {
  ready: boolean;
  approvals: number;
  requiredReviewers: number;
  passedChecks: number;
  totalChecks: number;
  runningChecks: number;
  blockingChecks: number;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background/40 to-background/20">
      <div className="grid grid-cols-1 items-center gap-6 p-6 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-9 items-center justify-center rounded-full ${
                ready
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {ready ? (
                <CheckIcon className="size-5" />
              ) : (
                <ClockIcon className="size-5" />
              )}
            </div>
            <div>
              <div className="font-heading text-xl">
                {ready
                  ? "Ready to merge"
                  : runningChecks > 0
                    ? `Running ${runningChecks} ${runningChecks === 1 ? "check" : "checks"}`
                    : "Waiting on reviews"}
              </div>
              <div className="text-muted-foreground text-sm">
                {ready
                  ? "All approvals in, all checks green, branch up to date with main."
                  : "Almost there — see what's left below."}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill
              tone={approvals >= requiredReviewers ? "ok" : "wait"}
              icon={<CheckIcon className="size-3" />}
            >
              {approvals}/{requiredReviewers} approvals
            </Pill>
            <Pill
              tone={
                blockingChecks > 0 ? "fail" : runningChecks > 0 ? "wait" : "ok"
              }
              icon={
                runningChecks > 0 ? (
                  <PlayIcon className="size-3" />
                ) : (
                  <CheckIcon className="size-3" />
                )
              }
            >
              {passedChecks}/{totalChecks} checks
            </Pill>
            <Pill tone="ok" icon={<GitMergeIcon className="size-3" />}>
              No conflicts
            </Pill>
            <Pill tone="ok" icon={<ShieldCheckIcon className="size-3" />}>
              Branch up to date
            </Pill>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            disabled={!ready}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-foreground/10 disabled:text-muted-foreground"
          >
            <GitMergeIcon className="size-4" />
            Squash & merge
          </Button>
          <button
            type="button"
            disabled={!ready}
            className="inline-flex h-9 items-center rounded-md border border-border/60 bg-background px-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <ChevronDownIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Pill({
  children,
  tone,
  icon,
}: {
  children: React.ReactNode;
  tone: "ok" | "wait" | "fail";
  icon?: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : tone === "fail"
        ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
        : "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] ${cls}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function Description({
  linesAdded,
  linesRemoved,
}: {
  linesAdded: number;
  linesRemoved: number;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-5">
      <div className="flex items-start gap-3">
        <Avatar className="size-7">
          <AvatarFallback className="text-[10px]">SB</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-sm">
          <p>
            Adds 1-year retention for audit log entries on the Business plan.
            Closes the compliance gap flagged in #3211 — the read-side already
            supports per-plan retention, this PR only persists it on writes.
          </p>
          <ul className="mt-3 ml-4 list-disc space-y-1 text-muted-foreground">
            <li>New <code>retentionFor(plan)</code> helper</li>
            <li>Migration adds <code>retention_days</code> with sensible defaults</li>
            <li>Backfill script in <code>scripts/backfill-retention.ts</code></li>
          </ul>
          <div className="mt-4 flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            <span className="inline-flex items-center gap-1">
              <FileDiffIcon className="size-3" />8 files
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              +{linesAdded}
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              −{linesRemoved}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChecksPanel() {
  const passed = CHECKS.filter((c) => c.status === "passed").length;
  const running = CHECKS.filter((c) => c.status === "running").length;
  return (
    <details className="group rounded-xl border border-border/60 bg-background/40">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckIcon className="size-4" />
          </div>
          <div>
            <div className="text-sm">
              {passed} of {CHECKS.length} checks passed
            </div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              {running > 0 ? `${running} running · 9m 14s elapsed` : "9m 14s"}
            </div>
          </div>
        </div>
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <ul className="divide-y divide-border/40 border-border/40 border-t">
        {CHECKS.map((c) => (
          <li
            key={`${c.name}/${c.context}`}
            className="flex items-center justify-between px-4 py-2 font-mono text-xs"
          >
            <div className="flex items-center gap-2">
              {c.status === "passed" && (
                <CheckIcon className="size-3.5 text-emerald-500" />
              )}
              {c.status === "failed" && (
                <XIcon className="size-3.5 text-rose-500" />
              )}
              {c.status === "running" && (
                <span className="size-2 animate-pulse rounded-full bg-amber-500" />
              )}
              <span>{c.name}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{c.context}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              {c.duration ?? "running"}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function TimelineRow({ item }: { item: TimelineItem }) {
  return (
    <li className="relative pl-10">
      <div className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-full border border-border/60 bg-background">
        <TimelineIcon item={item} />
      </div>
      <TimelineBody item={item} />
    </li>
  );
}

export function TimelineIcon({ item }: { item: TimelineItem }) {
  switch (item.kind) {
    case "commit":
      return <GitCommitIcon className="size-3 text-foreground/70" />;
    case "comment":
      return <MessageSquareIcon className="size-3 text-foreground/70" />;
    case "review":
      return item.state === "approved" ? (
        <CheckIcon className="size-3 text-emerald-500" />
      ) : item.state === "changes" ? (
        <XIcon className="size-3 text-rose-500" />
      ) : (
        <CircleIcon className="size-3 text-amber-500" />
      );
    case "ci":
      return <PlayIcon className="size-3 text-foreground/70" />;
    case "deploy":
      return <RocketIcon className="size-3 text-sky-500" />;
    case "status":
      return <TagIcon className="size-3 text-foreground/70" />;
  }
}

export function TimelineBody({ item }: { item: TimelineItem }) {
  switch (item.kind) {
    case "commit":
      return (
        <div>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-foreground">{item.who}</span>
            <span className="text-muted-foreground">
              pushed {item.commits.length} commits ·
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {item.time}
            </span>
          </div>
          <ul className="mt-1 space-y-0.5">
            {item.commits.map((c) => (
              <li
                key={c.sha}
                className="flex items-center gap-2 font-mono text-[11px]"
              >
                <span className="text-muted-foreground">{c.sha}</span>
                <span className="truncate">{c.message}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "comment":
      return (
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="flex items-baseline gap-2 text-sm">
            <Avatar className="size-5">
              <AvatarFallback className="text-[9px]">
                {item.initials}
              </AvatarFallback>
            </Avatar>
            <span>{item.who}</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {item.time}
            </span>
          </div>
          {item.diff && (
            <div className="mt-2 overflow-hidden rounded-md border border-border/60 bg-foreground/[0.02]">
              <div className="flex items-center justify-between border-border/40 border-b px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
                <span>{item.diff.file}</span>
                <span>line {item.diff.line}</span>
              </div>
              <pre className="overflow-x-auto px-3 py-2 font-mono text-[11px]">
                {item.diff.lines.map((l, i) => (
                  <div
                    key={i}
                    className={
                      l.kind === "add"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : l.kind === "del"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                          : "text-muted-foreground"
                    }
                  >
                    <span className="mr-3 inline-block w-4 select-none text-muted-foreground/60">
                      {l.kind === "add" ? "+" : l.kind === "del" ? "−" : " "}
                    </span>
                    {l.text}
                  </div>
                ))}
              </pre>
            </div>
          )}
          <p className="mt-2 text-foreground/85 text-sm">{item.body}</p>
        </div>
      );
    case "review":
      return (
        <div className="text-sm">
          <div className="flex items-baseline gap-2">
            <span>{item.who}</span>
            <span className="text-muted-foreground">
              {item.state === "approved"
                ? "approved this"
                : item.state === "changes"
                  ? "requested changes"
                  : "left a review"}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {item.time}
            </span>
          </div>
          {item.summary && (
            <p className="mt-1 text-muted-foreground text-sm">{item.summary}</p>
          )}
        </div>
      );
    case "ci":
      return (
        <div className="text-sm">
          <span className="text-foreground">CI</span>{" "}
          <span className="text-muted-foreground">
            {item.passed}/{item.total} checks passed in {item.duration} ·
          </span>{" "}
          <span className="font-mono text-[11px] text-muted-foreground">
            {item.time}
          </span>
        </div>
      );
    case "deploy":
      return (
        <div className="text-sm">
          <span className="text-foreground">Preview deploy ready</span>{" "}
          <span className="text-muted-foreground">in {item.duration} ·</span>{" "}
          <a
            href={`https://${item.url}`}
            className="font-mono text-[11px] text-sky-600 hover:underline dark:text-sky-400"
          >
            {item.url}
          </a>
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">
            {item.time}
          </span>
        </div>
      );
    case "status":
      return (
        <div className="text-sm">
          <span>{item.who}</span>{" "}
          <span className="text-muted-foreground">{item.label} ·</span>{" "}
          <span className="font-mono text-[11px] text-muted-foreground">
            {item.time}
          </span>
        </div>
      );
  }
}

export function SidebarSection({
  title,
  children,
  actionIcon,
}: {
  title: string;
  children: React.ReactNode;
  actionIcon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          {title}
        </span>
        {actionIcon && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
          >
            {actionIcon}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function ReviewerCard({ reviewer }: { reviewer: Reviewer }) {
  const tone =
    reviewer.state === "approved"
      ? "text-emerald-600 dark:text-emerald-400"
      : reviewer.state === "changes"
        ? "text-rose-600 dark:text-rose-400"
        : "text-amber-600 dark:text-amber-400";
  const Icon =
    reviewer.state === "approved"
      ? CheckIcon
      : reviewer.state === "changes"
        ? XIcon
        : CircleIcon;
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/40 p-2.5">
      <Avatar className="size-8">
        {reviewer.avatar && (
          <AvatarImage src={reviewer.avatar} alt={reviewer.name} />
        )}
        <AvatarFallback className="text-[10px]">
          {reviewer.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{reviewer.name}</div>
        <div className="truncate font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          {reviewer.lastSeen}
        </div>
      </div>
      <Icon className={`size-4 ${tone}`} />
    </li>
  );
}

export function Label({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "violet" | "amber" | "sky";
}) {
  const cls =
    tone === "violet"
      ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
      : tone === "amber"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${cls}`}
    >
      {children}
    </span>
  );
}
