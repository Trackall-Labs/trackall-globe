import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleDotIcon,
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MinusIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  ShieldIcon,
  TerminalIcon,
  TriangleIcon,
  XIcon,
} from "lucide-react";

export type Status = "failed" | "skipped" | "passed";

export interface Check {
  app: "github" | "vercel" | "mintlify" | "linear" | "snyk";
  name: string;
  detail: string;
  status: Status;
  required?: boolean;
}

const FAILING: Check[] = [
  {
    app: "github",
    name: "CI / required (push)",
    detail: "Failing after 3s",
    status: "failed",
    required: true,
  },
];

const SKIPPED: Check[] = [
  { app: "vercel", name: "Vercel Preview", detail: "Skipped 17 minutes ago — no app changes", status: "skipped", required: true },
  { app: "github", name: "CI / Build Web (acme/web)", detail: "Skipped 16 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Build API (acme/api)", detail: "Skipped 16 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Build Workers (acme/workers)", detail: "Skipped 16 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Type-check (monorepo)", detail: "Skipped 16 minutes ago", status: "skipped" },
  { app: "github", name: "CI / E2E (chromium)", detail: "Skipped 15 minutes ago", status: "skipped" },
  { app: "github", name: "CI / E2E (webkit)", detail: "Skipped 15 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Visual regression", detail: "Skipped 14 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Bundle size", detail: "Skipped 14 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Coverage", detail: "Skipped 14 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Migration check", detail: "Skipped 14 minutes ago", status: "skipped" },
  { app: "github", name: "CI / OpenAPI diff", detail: "Skipped 14 minutes ago", status: "skipped" },
  { app: "github", name: "CI / i18n keys", detail: "Skipped 13 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Storybook", detail: "Skipped 13 minutes ago", status: "skipped" },
  { app: "github", name: "CI / Lighthouse", detail: "Skipped 13 minutes ago", status: "skipped" },
  { app: "snyk", name: "Snyk / open source", detail: "Skipped 13 minutes ago", status: "skipped" },
  { app: "mintlify", name: "Mintlify Deployment", detail: "Skipped 12 minutes ago — no docs changes", status: "skipped", required: true },
];

const PASSED: Check[] = [
  { app: "github", name: "CI / Lint (acme/web)", detail: "Successful in 14s", status: "passed" },
  { app: "github", name: "CI / Lint (acme/api)", detail: "Successful in 11s", status: "passed" },
  { app: "github", name: "CI / Lint (acme/workers)", detail: "Successful in 9s", status: "passed" },
  { app: "github", name: "CI / Format", detail: "Successful in 6s", status: "passed" },
  { app: "github", name: "CI / Commitlint", detail: "Successful in 4s", status: "passed" },
  { app: "github", name: "CI / License check", detail: "Successful in 7s", status: "passed" },
  { app: "github", name: "CI / Dep audit", detail: "Successful in 22s", status: "passed" },
  { app: "github", name: "CI / Build packages", detail: "Successful in 1m 04s", status: "passed" },
  { app: "github", name: "CI / Spell check", detail: "Successful in 5s", status: "passed" },
  { app: "github", name: "CI / Dead code", detail: "Successful in 18s", status: "passed" },
  { app: "github", name: "CI / Unused exports", detail: "Successful in 12s", status: "passed" },
  { app: "github", name: "CI / Schema validate", detail: "Successful in 3s", status: "passed" },
  { app: "github", name: "CI / SBOM", detail: "Successful in 28s", status: "passed" },
  { app: "github", name: "CI / Image scan", detail: "Successful in 41s", status: "passed" },
  { app: "github", name: "CI / Terraform plan", detail: "Successful in 38s", status: "passed" },
  { app: "github", name: "CI / Helm lint", detail: "Successful in 6s", status: "passed" },
  { app: "github", name: "CI / OpenAPI lint", detail: "Successful in 9s", status: "passed" },
  { app: "github", name: "CI / Markdown lint", detail: "Successful in 7s", status: "passed" },
  { app: "linear", name: "Linear / link issue", detail: "Linked ENG-4821", status: "passed" },
];

export function TimelinesPrOpsConsoleShowcasePage() {
  const total = FAILING.length + SKIPPED.length + PASSED.length;
  const passedPct = (PASSED.length / total) * 100;
  const failedPct = (FAILING.length / total) * 100;

  return (
    <div className="min-h-svh bg-muted/30 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <PrTitle />

        <Card>
          <Header
            failing={FAILING.length}
            skipped={SKIPPED.length}
            passed={PASSED.length}
            passedPct={passedPct}
            failedPct={failedPct}
          />

          <CheckGroup
            label={`${FAILING.length} failing check`}
            checks={FAILING}
            defaultOpen
            tone="fail"
          />
          <CheckGroup
            label={`${SKIPPED.length} skipped checks`}
            checks={SKIPPED}
            tone="muted"
          />
          <CheckGroup
            label={`${PASSED.length} successful checks`}
            checks={PASSED}
            tone="ok"
          />
        </Card>

        <Card>
          <Notice
            tone="warn"
            icon={<GitMergeIcon className="size-4" />}
            title="This branch is out-of-date with the base branch"
            body="Merge the latest changes from main into this branch. The merge commit will be associated with sean@cal.com."
            action={
              <SplitButton primary="Update branch" />
            }
          />
          <Notice
            tone="info"
            icon={<GitPullRequestIcon className="size-4" />}
            title="This pull request is still a work in progress"
            body="Draft pull requests cannot be merged."
            action={<Button>Ready for review</Button>}
          />
          <div className="flex items-center gap-3 px-5 py-4">
            <button
              type="button"
              disabled
              className="rounded-md border border-border bg-muted/50 px-3 py-1.5 font-medium text-[13px] text-muted-foreground"
            >
              Squash and merge
            </button>
            <span className="text-[13px] text-muted-foreground">
              You can also merge this with the command line.{" "}
              <a
                href="#"
                className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-400"
              >
                <TerminalIcon className="size-3" />
                View command line instructions
              </a>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PrTitle() {
  return (
    <div className="flex items-start gap-3 px-1">
      <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <GitPullRequestIcon className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="font-heading text-xl leading-tight">
          Persist 1y audit-log retention on Business plan
          <span className="ml-2 font-mono text-base text-muted-foreground tabular-nums">
            #3284
          </span>
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] text-amber-700 uppercase tracking-wider dark:text-amber-400">
            Draft
          </span>
          <span>
            <strong className="text-foreground">sean</strong> wants to merge{" "}
            <strong className="text-foreground">14 commits</strong> into
          </span>
          <BranchPill>main</BranchPill>
          <ArrowRightIcon className="size-3" />
          <span>from</span>
          <BranchPill>feat/audit-log-retention</BranchPill>
        </div>
      </div>
    </div>
  );
}

export function BranchPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-foreground">
      <GitBranchIcon className="size-2.5 opacity-60" />
      {children}
    </span>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      {children}
    </div>
  );
}

export function Header({
  failing,
  skipped,
  passed,
  passedPct,
  failedPct,
}: {
  failing: number;
  skipped: number;
  passed: number;
  passedPct: number;
  failedPct: number;
}) {
  return (
    <div className="flex items-start gap-4 border-border/70 border-b px-5 py-4">
      <StatusRing passedPct={passedPct} failedPct={failedPct} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[15px]">
            Some checks were not successful
          </h2>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-[13px] text-muted-foreground">
          <span>
            <span className="font-medium text-rose-600 dark:text-rose-400">
              {failing} failing
            </span>
            ,{" "}
            <span className="font-medium text-foreground">{skipped} skipped</span>
            ,{" "}
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {passed} successful
            </span>{" "}
            checks
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconButton aria-label="Settings">
          <SettingsIcon className="size-4" />
        </IconButton>
        <IconButton aria-label="Collapse">
          <ChevronUpIcon className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}

export function StatusRing({
  passedPct,
  failedPct,
}: {
  passedPct: number;
  failedPct: number;
}) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const passLen = (passedPct / 100) * c;
  const failLen = (failedPct / 100) * c;
  const skipLen = c - passLen - failLen;

  return (
    <div className="relative size-9 shrink-0">
      <svg viewBox="0 0 36 36" className="-rotate-90 size-9">
        <circle
          cx="18"
          cy="18"
          r={r}
          className="fill-none stroke-muted"
          strokeWidth="4"
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          className="fill-none stroke-emerald-500"
          strokeWidth="4"
          strokeDasharray={`${passLen} ${c}`}
          strokeDashoffset={0}
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          className="fill-none stroke-rose-500"
          strokeWidth="4"
          strokeDasharray={`${failLen} ${c}`}
          strokeDashoffset={-passLen}
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          className="fill-none stroke-foreground/30"
          strokeWidth="4"
          strokeDasharray={`${skipLen} ${c}`}
          strokeDashoffset={-(passLen + failLen)}
        />
      </svg>
    </div>
  );
}

export function CheckGroup({
  label,
  checks,
  defaultOpen,
  tone,
}: {
  label: string;
  checks: Check[];
  defaultOpen?: boolean;
  tone: "fail" | "ok" | "muted";
}) {
  const labelTone =
    tone === "fail"
      ? "text-rose-600 dark:text-rose-400"
      : tone === "ok"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-foreground";

  return (
    <details open={defaultOpen} className="group border-border/70 border-b last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-5 py-2 text-[13px] hover:bg-muted/40">
        <ChevronDownIcon className="size-3.5 text-muted-foreground transition-transform group-open:rotate-0 -rotate-90" />
        <span className={labelTone}>{label}</span>
      </summary>
      <ul className="divide-y divide-border/50">
        {checks.map((c, i) => (
          <CheckRow key={`${c.name}-${i}`} check={c} />
        ))}
      </ul>
    </details>
  );
}

export function CheckRow({ check }: { check: Check }) {
  return (
    <li className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30">
      <StatusIcon status={check.status} />
      <AppIcon app={check.app} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate font-medium text-[13px]">{check.name}</span>
          <span className="truncate text-[12px] text-muted-foreground">
            {check.detail}
          </span>
        </div>
      </div>
      <a
        href="#"
        className="hidden text-[12px] text-sky-600 hover:underline group-hover:inline dark:text-sky-400 sm:inline"
      >
        Details
      </a>
      {check.required && (
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
          Required
        </span>
      )}
      <IconButton aria-label="More">
        <MoreHorizontalIcon className="size-4" />
      </IconButton>
    </li>
  );
}

export function StatusIcon({ status }: { status: Status }) {
  if (status === "failed") {
    return (
      <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
        <XIcon className="size-3 stroke-[3]" />
      </span>
    );
  }
  if (status === "passed") {
    return (
      <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <CheckIcon className="size-3 stroke-[3]" />
      </span>
    );
  }
  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50 text-muted-foreground">
      <MinusIcon className="size-3 stroke-[2.5]" />
    </span>
  );
}

export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

export function AppIcon({ app }: { app: Check["app"] }) {
  const base = "inline-flex size-5 shrink-0 items-center justify-center rounded";
  if (app === "github")
    return (
      <span className={`${base} bg-foreground text-background`}>
        <GithubMark className="size-3.5" />
      </span>
    );
  if (app === "vercel")
    return (
      <span className={`${base} bg-foreground text-background`}>
        <TriangleIcon className="size-2.5 fill-current" />
      </span>
    );
  if (app === "mintlify")
    return (
      <span className={`${base} bg-emerald-600 text-white`}>
        <BookOpenIcon className="size-3" />
      </span>
    );
  if (app === "linear")
    return (
      <span className={`${base} bg-indigo-500 text-white`}>
        <CircleDotIcon className="size-3" />
      </span>
    );
  return (
    <span className={`${base} bg-violet-600 text-white`}>
      <ShieldIcon className="size-3" />
    </span>
  );
}

export function IconButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function Notice({
  tone,
  icon,
  title,
  body,
  action,
}: {
  tone: "warn" | "info";
  icon: React.ReactNode;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  const ring =
    tone === "warn"
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
      : "bg-foreground/10 text-foreground";

  return (
    <div className="flex items-start gap-4 border-border/70 border-b px-5 py-4">
      <span
        className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full ${ring}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[14px]">{title}</div>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{body}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-md border border-border bg-background px-3 py-1.5 font-medium text-[13px] hover:bg-muted"
    >
      {children}
    </button>
  );
}

export function SplitButton({ primary }: { primary: string }) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-border">
      <button
        type="button"
        className="bg-background px-3 py-1.5 font-medium text-[13px] hover:bg-muted"
      >
        {primary}
      </button>
      <button
        type="button"
        aria-label="More options"
        className="border-border border-l bg-background px-1.5 hover:bg-muted"
      >
        <ChevronDownIcon className="size-3.5" />
      </button>
    </div>
  );
}
