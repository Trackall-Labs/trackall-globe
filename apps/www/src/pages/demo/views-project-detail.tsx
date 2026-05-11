import { useState } from "react";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  EyeIcon,
  GitPullRequestIcon,
  MessageCircleIcon,
  RocketIcon,
  ShareIcon,
  StarIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { useDemo, type Issue } from "./store";

type DetailTab = "overview" | "issues" | "activity";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "issues", label: "Issues" },
  { id: "activity", label: "Activity" },
];

export function ProjectDetailView() {
  const {
    selectedProjectId,
    closeProject,
    projects,
    issues,
    members,
    toggleStar,
    requestArchive,
    pushToast,
  } = useDemo();

  const [tab, setTab] = useState<DetailTab>("overview");
  const project = projects.find((p) => p.id === selectedProjectId);
  if (!project) return null;

  const projectIssues = issues.filter((i) => i.projectId === project.id);

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={closeProject}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3" />
        All projects
      </button>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-1 size-8 rounded-md ${project.color}`} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-3xl tracking-tight">{project.name}</h1>
              <button
                type="button"
                onClick={() => toggleStar(project.id)}
                aria-label="Star"
                className="rounded-md p-1 text-muted-foreground/40 transition-colors hover:text-amber-500"
              >
                <StarIcon
                  className={`size-4 ${project.starred ? "fill-amber-500 text-amber-500" : ""}`}
                />
              </button>
            </div>
            {project.description ? (
              <p className="mt-1 max-w-2xl text-muted-foreground text-sm">
                {project.description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() =>
              pushToast({
                kind: "success",
                title: "Link copied",
                body: `Sharing "${project.name}".`,
              })
            }
          >
            <ShareIcon />
            Share
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => requestArchive(project.id)}
          >
            <ArchiveIcon />
            Archive
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1 border-b border-border/60">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative px-3 py-2.5 text-sm transition-colors ${
              tab === t.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {tab === t.id ? (
              <span className="absolute right-0 bottom-0 left-0 h-px bg-foreground" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === "overview" ? <Overview project={project} issues={projectIssues} /> : null}
        {tab === "issues" ? <Issues issues={projectIssues} /> : null}
        {tab === "activity" ? <Activity /> : null}
      </div>
    </div>
  );
}

function Overview({
  project,
  issues,
}: {
  project: NonNullable<ReturnType<typeof useDemo>["projects"][number]>;
  issues: Issue[];
}) {
  const open = issues.filter((i) => i.status !== "done").length;
  const done = issues.filter((i) => i.status === "done").length;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Open issues" value={String(open)} hint={`${done} closed this week`} />
        <Stat label="Members" value={String(project.members)} hint="3 online" />
        <Stat label="Visibility" value={project.visibility} hint="Workspace-wide" />
        <Stat label="Last update" value={project.updatedAt} hint="auto" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[3fr_2fr]">
        <Card title="Recent issues">
          <ul className="mt-3 flex flex-col">
            {issues.slice(0, 5).map((i) => (
              <IssueRow key={i.id} issue={i} />
            ))}
            {issues.length === 0 ? (
              <li className="px-2 py-6 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                No issues yet.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card title="Members">
          <ul className="mt-3 flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <MemberRowMini key={i} index={i} />
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Issues({ issues }: { issues: Issue[] }) {
  const groups: { id: Issue["status"]; label: string; tone: string }[] = [
    { id: "todo", label: "Todo", tone: "text-muted-foreground" },
    { id: "in-progress", label: "In progress", tone: "text-amber-600 dark:text-amber-400" },
    { id: "review", label: "In review", tone: "text-violet-600 dark:text-violet-400" },
    { id: "done", label: "Done", tone: "text-emerald-600 dark:text-emerald-400" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
      {groups.map((g) => {
        const items = issues.filter((i) => i.status === g.id);
        return (
          <div
            key={g.id}
            className="flex flex-col rounded-xl border border-border/60 bg-background/40"
          >
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
              <div className={`font-mono text-[10px] uppercase tracking-[0.25em] ${g.tone}`}>
                {g.label}
              </div>
              <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                {items.length}
              </span>
            </div>
            <ul className="flex flex-1 flex-col gap-2 p-2">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="rounded-md border border-border/40 bg-background p-2.5 text-xs leading-snug"
                >
                  <div className="flex items-center gap-1.5">
                    <PriorityDot priority={i.priority} />
                    <span className="truncate font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                      {i.id}
                    </span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-foreground/85 text-sm">
                    {i.title}
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                    <span>{i.updatedAt}</span>
                    <Avatar id={i.assigneeId} />
                  </div>
                </li>
              ))}
              {items.length === 0 ? (
                <li className="px-2 py-4 text-center font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em]">
                  Empty
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Activity() {
  const events = [
    { Icon: RocketIcon, who: "Maya", what: "deployed", target: "main → production", time: "2m" },
    { Icon: GitPullRequestIcon, who: "James", what: "opened", target: "PR #128 — audit log", time: "8m" },
    { Icon: MessageCircleIcon, who: "Riya", what: "commented", target: "audit log thread", time: "21m" },
    { Icon: CheckCircle2Icon, who: "Dani", what: "closed", target: "ENG-114 — empty inbox icon", time: "1h" },
    { Icon: EyeIcon, who: "Alex", what: "approved", target: "release 0.4.2", time: "2h" },
    { Icon: CalendarIcon, who: "Sean", what: "scheduled", target: "Q3 budget review · Friday", time: "yesterday" },
  ];
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-5">
      <ol className="relative ml-3 border-l border-border/60">
        {events.map((e, i) => (
          <li key={i} className="relative pl-6 pb-5 last:pb-0">
            <span className="-left-3 absolute top-0 flex size-6 items-center justify-center rounded-full bg-background ring-1 ring-border/60">
              <e.Icon className="size-3 opacity-70" />
            </span>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{e.who}</span>
              <span className="text-muted-foreground">{e.what}</span>
              <span className="text-foreground/85">{e.target}</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                {e.time} ago
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
  const status = {
    todo: { Icon: CircleIcon, label: "Todo", className: "text-muted-foreground" },
    "in-progress": { Icon: ClockIcon, label: "In progress", className: "text-amber-600 dark:text-amber-400" },
    review: { Icon: EyeIcon, label: "In review", className: "text-violet-600 dark:text-violet-400" },
    done: { Icon: CheckCircle2Icon, label: "Done", className: "text-emerald-600 dark:text-emerald-400" },
  }[issue.status];

  return (
    <li className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-foreground/[0.03]">
      <span className={`flex size-5 items-center justify-center ${status.className}`}>
        <status.Icon className="size-3.5" />
      </span>
      <span className="truncate font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
        {issue.id}
      </span>
      <span className={`flex-1 truncate text-sm ${issue.status === "done" ? "text-muted-foreground line-through" : ""}`}>
        {issue.title}
      </span>
      <PriorityDot priority={issue.priority} />
      <Avatar id={issue.assigneeId} />
      <span className="hidden w-16 text-right font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em] sm:inline">
        {issue.updatedAt}
      </span>
    </li>
  );
}

function MemberRowMini({ index }: { index: number }) {
  const { members } = useDemo();
  const m = members[index];
  if (!m) return null;
  return (
    <li className="flex items-center gap-2.5">
      <div className={`flex size-7 items-center justify-center rounded-full font-medium text-[11px] ${m.tone}`}>
        {m.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{m.name}</div>
        <div className="truncate font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
          {m.role}
        </div>
      </div>
      <span
        className={`size-1.5 rounded-full ${
          m.status === "online" ? "bg-emerald-500" : m.status === "away" ? "bg-amber-500" : "bg-muted-foreground/40"
        }`}
      />
    </li>
  );
}

function PriorityDot({ priority }: { priority: Issue["priority"] }) {
  const cfg =
    priority === "high"
      ? { tone: "bg-rose-500", label: "High" }
      : priority === "med"
        ? { tone: "bg-amber-500", label: "Med" }
        : { tone: "bg-foreground/40", label: "Low" };
  return (
    <span className="inline-flex items-center gap-1" title={cfg.label}>
      <span className={`size-1.5 rounded-full ${cfg.tone}`} />
    </span>
  );
}

function Avatar({ id }: { id: string }) {
  const { members } = useDemo();
  const m = members.find((x) => x.id === id);
  if (!m) return null;
  return (
    <div className={`flex size-5 items-center justify-center rounded-full font-medium text-[9px] ${m.tone}`}>
      {m.initials}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {title}
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {label}
      </div>
      <div className="mt-1 font-heading text-2xl capitalize">{value}</div>
      <div className="mt-1 text-muted-foreground text-xs">{hint}</div>
    </div>
  );
}
