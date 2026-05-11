import {
  CheckCircle2Icon,
  CircleIcon,
  GitBranchIcon,
  GitMergeIcon,
  MessageSquareIcon,
  XCircleIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";

export type State = "approved" | "changes" | "pending";

const REVIEWERS: { name: string; initials: string; state: State; time?: string }[] = [
  { name: "Maya Okafor", initials: "MO", state: "approved", time: "1h ago" },
  { name: "James Lin", initials: "JL", state: "changes", time: "3h ago" },
  { name: "Riya Patel", initials: "RP", state: "approved", time: "20m ago" },
  { name: "Dani Kim", initials: "DK", state: "pending" },
];

const CHECKS = [
  { name: "build / web", status: "passed", time: "2m 14s" },
  { name: "build / api", status: "passed", time: "1m 48s" },
  { name: "test / unit", status: "passed", time: "3m 02s" },
  { name: "test / e2e", status: "passed", time: "9m 14s" },
  { name: "lint", status: "failing", time: "21s" },
];

const EVENTS: {
  type: "commit" | "review" | "comment" | "ci";
  label: string;
  detail?: string;
  who?: string;
  initials?: string;
  state?: State | "passed" | "failing";
  time: string;
}[] = [
  {
    type: "commit",
    label: "James pushed 3 commits",
    detail: "feat(audit): wire retention setting",
    who: "James Lin",
    initials: "JL",
    time: "12m",
  },
  {
    type: "review",
    label: "Riya approved",
    detail: "Looks great, thanks for splitting the migration.",
    who: "Riya Patel",
    initials: "RP",
    state: "approved",
    time: "20m",
  },
  {
    type: "comment",
    label: "James left a comment",
    detail: "On line 42: any reason this isn't memoised?",
    who: "James Lin",
    initials: "JL",
    time: "1h",
  },
  {
    type: "ci",
    label: "lint failed",
    detail: "1 error in src/components/audit-log/row.tsx",
    state: "failing",
    time: "2h",
  },
  {
    type: "review",
    label: "Maya approved",
    who: "Maya Okafor",
    initials: "MO",
    state: "approved",
    time: "3h",
  },
  {
    type: "commit",
    label: "James opened pull request",
    detail: "feat(audit): persist 1y retention on Business plan",
    who: "James Lin",
    initials: "JL",
    time: "5h",
  },
];

export function TimelinesApprovalsShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          acme/web · Pull request #128
        </div>
        <h1 className="mt-1 font-heading text-2xl">
          Persist 1y audit log retention on Business plan
        </h1>
        <div className="mt-2 flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Open
          </span>
          <span className="inline-flex items-center gap-1">
            <GitBranchIcon className="size-3" /> feat/audit-log → main
          </span>
          <span>· 14 commits · 8 files</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
          <div className="rounded-xl border border-border/60 bg-background/40 p-5">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Activity
            </div>
            <ol className="relative mt-4">
              <span
                aria-hidden
                className="absolute top-1 bottom-1 left-[15px] w-px bg-border/50"
              />
              {EVENTS.map((e, i) => (
                <li
                  key={i}
                  className="relative grid grid-cols-[32px_1fr_auto] items-start gap-3 py-2.5"
                >
                  <span
                    className={
                      "z-10 grid size-[32px] place-items-center rounded-full ring-4 ring-background " +
                      (e.state === "approved"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : e.state === "changes"
                          ? "bg-rose-500/15 text-rose-600"
                          : e.state === "failing"
                            ? "bg-rose-500/15 text-rose-600"
                            : e.state === "passed"
                              ? "bg-emerald-500/15 text-emerald-600"
                              : "bg-foreground/[0.06] text-foreground")
                    }
                  >
                    {e.type === "review" && e.state === "approved" ? (
                      <CheckCircle2Icon className="size-4" />
                    ) : e.type === "review" && e.state === "changes" ? (
                      <XCircleIcon className="size-4" />
                    ) : e.type === "ci" ? (
                      <XCircleIcon className="size-4" />
                    ) : e.type === "comment" ? (
                      <MessageSquareIcon className="size-4" />
                    ) : (
                      <GitMergeIcon className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      {e.initials ? (
                        <Avatar className="size-5">
                          <AvatarFallback className="text-[9px]">
                            {e.initials}
                          </AvatarFallback>
                        </Avatar>
                      ) : null}
                      <span className="truncate">{e.label}</span>
                    </div>
                    {e.detail ? (
                      <div className="mt-1 truncate text-muted-foreground text-xs">
                        {e.detail}
                      </div>
                    ) : null}
                  </div>
                  <span className="self-center font-mono text-[10px] text-muted-foreground">
                    {e.time} ago
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Reviewers · 3 / 4 approved
              </div>
              <ul className="mt-3 flex flex-col gap-2.5">
                {REVIEWERS.map((r) => (
                  <li key={r.name} className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px]">
                        {r.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{r.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {r.state === "approved"
                          ? `approved · ${r.time}`
                          : r.state === "changes"
                            ? `changes · ${r.time}`
                            : "pending"}
                      </div>
                    </div>
                    <StateGlyph state={r.state} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Checks · 4 / 5 passed
              </div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {CHECKS.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className={
                        "size-1.5 rounded-full " +
                        (c.status === "passed"
                          ? "bg-emerald-500"
                          : "bg-rose-500")
                      }
                    />
                    <span className="flex-1 font-mono">{c.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {c.time}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                disabled
                className="mt-4 w-full"
                size="sm"
                type="button"
              >
                <GitMergeIcon />
                Squash and merge
              </Button>
              <div className="mt-1.5 text-center text-muted-foreground text-xs">
                Blocked by 1 failing check
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StateGlyph({ state }: { state: State }) {
  if (state === "approved")
    return <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />;
  if (state === "changes")
    return <XCircleIcon className="size-4 text-rose-600 dark:text-rose-400" />;
  return <CircleIcon className="size-4 opacity-30" />;
}
