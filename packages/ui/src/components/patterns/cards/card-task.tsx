import {
  CalendarDaysIcon,
  MessageCircleIcon,
  PaperclipIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Badge } from "@orbit/ui/badge";
import { Card, CardPanel } from "@orbit/ui/card";

export type Priority = "low" | "med" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  labels: { name: string; color: string }[];
  assignees: string[];
  priority: Priority;
  due: string;
  comments: number;
  files: number;
  progress?: { done: number; total: number };
}

const COLUMNS: { name: string; tone: string; tasks: Task[] }[] = [
  {
    name: "In progress",
    tone: "bg-amber-500",
    tasks: [
      {
        id: "ENG-204",
        title: "Migrate billing webhooks to v3",
        labels: [{ name: "infra", color: "bg-violet-500" }],
        assignees: ["LR", "MK"],
        priority: "high",
        due: "Apr 28",
        comments: 6,
        files: 2,
        progress: { done: 4, total: 7 },
      },
      {
        id: "DSN-91",
        title: "Onboarding particle field micro-anim",
        labels: [
          { name: "design", color: "bg-pink-500" },
          { name: "polish", color: "bg-sky-500" },
        ],
        assignees: ["PJ"],
        priority: "med",
        due: "Apr 30",
        comments: 2,
        files: 5,
      },
    ],
  },
  {
    name: "Review",
    tone: "bg-sky-500",
    tasks: [
      {
        id: "ENG-198",
        title: "Audit log retention policy",
        labels: [
          { name: "infra", color: "bg-violet-500" },
          { name: "security", color: "bg-red-500" },
        ],
        assignees: ["SC"],
        priority: "urgent",
        due: "Tomorrow",
        comments: 11,
        files: 1,
      },
    ],
  },
];

const PRIORITY_STYLE: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  med: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  high: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  urgent: "bg-destructive/15 text-destructive",
};

export function CardTaskShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="font-heading text-xl">Sprint 24 board</h1>
          <p className="text-muted-foreground text-sm">
            Apr 22 – May 5 · 12 issues, 4 in flight
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.name} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className={"size-2 rounded-full " + col.tone} />
                <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                  {col.name}
                </span>
                <span className="font-mono text-muted-foreground/70 text-xs">
                  {col.tasks.length}
                </span>
              </div>
              {col.tasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="cursor-grab transition-shadow hover:shadow-md">
      <CardPanel className="p-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            {task.id}
          </span>
          <span
            className={
              "ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider " +
              PRIORITY_STYLE[task.priority]
            }
          >
            {task.priority}
          </span>
        </div>
        <h3 className="mt-2 text-foreground text-sm leading-snug">
          {task.title}
        </h3>
        {task.labels.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {task.labels.map((l) => (
              <span
                key={l.name}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px]"
              >
                <span className={"size-1.5 rounded-full " + l.color} />
                {l.name}
              </span>
            ))}
          </div>
        ) : null}
        {task.progress ? (
          <div className="mt-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-foreground/70"
                style={{
                  width: `${(task.progress.done / task.progress.total) * 100}%`,
                }}
              />
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              {task.progress.done} / {task.progress.total} subtasks
            </div>
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center -space-x-1.5">
            {task.assignees.map((a) => (
              <Avatar
                key={a}
                className="size-5 border-2 border-background bg-foreground"
              >
                <AvatarFallback className="bg-foreground text-[9px] text-background">
                  {a}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-1">
              <CalendarDaysIcon className="size-3" />
              {task.due}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircleIcon className="size-3" />
              {task.comments}
            </span>
            <span className="inline-flex items-center gap-1">
              <PaperclipIcon className="size-3" />
              {task.files}
            </span>
          </div>
        </div>
      </CardPanel>
    </Card>
  );
}
