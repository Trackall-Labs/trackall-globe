import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  CircleIcon,
  CommandIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";

const TASKS = [
  { id: 1, title: "Review Maya's audit log PR", project: "API", due: "Today", done: false },
  { id: 2, title: "Sketch onboarding step 2", project: "Onboarding", due: "Today", done: false },
  { id: 3, title: "Reply to Riya about the bouncing invites", project: "Inbox", due: "Today", done: false },
  { id: 4, title: "Approve Q3 budget request", project: "Ops", due: "Tomorrow", done: false },
  { id: 5, title: "Push Tuesday's release notes", project: "Marketing", due: "Tomorrow", done: true },
];

const SCHEDULE = [
  { time: "10:00", title: "Eng standup", subtitle: "Daily · 15m", color: "bg-emerald-500/80" },
  { time: "11:30", title: "1:1 with Maya", subtitle: "Weekly · 30m", color: "bg-amber-500/80" },
  { time: "14:00", title: "Design crit", subtitle: "Squad · 45m", color: "bg-violet-500/80" },
  { time: "16:00", title: "Customer call: BigCorp", subtitle: "Sales · 30m", color: "bg-sky-500/80" },
];

const SHORTCUTS = [
  { label: "New project" },
  { label: "Invite teammate" },
  { label: "Open API key" },
  { label: "Recent activity" },
];

export function DashboardsHomeShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="px-10 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Saturday, Apr 26
          </div>
          <h1 className="mt-1 font-heading text-4xl tracking-tight">
            Good morning, Sean.
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground text-sm">
            5 things on your plate today. The first one is small — start there.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SHORTCUTS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="group flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3.5 py-2.5 text-left transition-colors hover:border-foreground/40 hover:bg-background/60"
              >
                <span className="text-sm">{s.label}</span>
                <ArrowRightIcon className="size-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-90" />
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-[3fr_2fr]">
            <Card title="Today's tasks" trailing={
              <Button variant="ghost" size="sm">
                <PlusIcon />
                New
              </Button>
            }>
              <ul className="mt-3 flex flex-col">
                {TASKS.map((t) => (
                  <li
                    key={t.id}
                    className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-foreground/[0.03]"
                  >
                    <button
                      type="button"
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        t.done
                          ? "border-foreground/30 bg-foreground/10 text-foreground"
                          : "border-foreground/30 text-transparent hover:bg-foreground/[0.06]"
                      }`}
                      aria-label="Toggle"
                    >
                      {t.done ? (
                        <CheckIcon className="size-3" />
                      ) : (
                        <CircleIcon className="size-3" />
                      )}
                    </button>
                    <span
                      className={`flex-1 truncate text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}
                    >
                      {t.title}
                    </span>
                    <span className="rounded bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                      {t.project}
                    </span>
                    <span className="w-16 text-right font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                      {t.due}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Today's schedule" trailing={
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                4 events
              </span>
            }>
              <ul className="mt-3 flex flex-col gap-2">
                {SCHEDULE.map((e) => (
                  <li
                    key={e.time}
                    className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-foreground/[0.03]"
                  >
                    <div className="flex w-12 flex-col items-center font-mono text-[11px]">
                      <span className="text-foreground">{e.time}</span>
                    </div>
                    <span className={`size-1.5 rounded-full ${e.color}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{e.title}</div>
                      <div className="truncate text-muted-foreground text-xs">
                        {e.subtitle}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FactCard label="Streak" value="14 days" sub="without dropping a ball" />
            <FactCard label="Focus" value="3h 12m" sub="deep work · this week" />
            <FactCard label="Inbox" value="3 unread" sub="last cleared 2h ago" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur">
        <CommandIcon className="size-3" />
        <span className="uppercase tracking-[0.25em]">⌘K to jump anywhere</span>
      </div>
    </div>
  );
}

export function Card({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {title}
        </div>
        {trailing}
      </div>
      {children}
    </section>
  );
}

export function FactCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {label}
        </div>
        <CalendarIcon className="size-3.5 opacity-40" />
      </div>
      <div className="mt-2 font-heading text-2xl">{value}</div>
      <div className="mt-1 text-muted-foreground text-xs">{sub}</div>
    </div>
  );
}
