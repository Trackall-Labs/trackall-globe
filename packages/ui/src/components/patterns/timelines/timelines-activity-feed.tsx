import {
  CheckCircle2Icon,
  GitCommitIcon,
  HeartIcon,
  MessageCircleIcon,
  PaletteIcon,
  RocketIcon,
  UserPlusIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";

export interface Event {
  who: string;
  initials: string;
  what: string;
  context?: string;
  Icon: ComponentType<{ className?: string }>;
  tone: string;
  time: string;
  meta?: string;
}

const TODAY: Event[] = [
  {
    who: "Maya Okafor",
    initials: "MO",
    what: "shipped",
    context: "feat: 1y audit log retention",
    Icon: RocketIcon,
    tone: "emerald",
    time: "12 min ago",
    meta: "v3.4.0 → production",
  },
  {
    who: "Riya Patel",
    initials: "RP",
    what: "completed",
    context: "All onboarding tasks for Q2 prep",
    Icon: CheckCircle2Icon,
    tone: "indigo",
    time: "1h ago",
  },
  {
    who: "James Lin",
    initials: "JL",
    what: "commented on",
    context: '"Consider memoising the row renderer"',
    Icon: MessageCircleIcon,
    tone: "sky",
    time: "2h ago",
  },
];

const YESTERDAY: Event[] = [
  {
    who: "Dani Kim",
    initials: "DK",
    what: "updated the design tokens",
    context: "tighter focus rings, +1 weight on heading",
    Icon: PaletteIcon,
    tone: "pink",
    time: "Yesterday",
  },
  {
    who: "Sean Brydon",
    initials: "SB",
    what: "invited 8 members to",
    context: "Marketing workspace",
    Icon: UserPlusIcon,
    tone: "violet",
    time: "Yesterday",
  },
  {
    who: "Alex Tran",
    initials: "AT",
    what: "pushed",
    context: "12 commits to feat/billing-v3",
    Icon: GitCommitIcon,
    tone: "indigo",
    time: "Yesterday",
  },
];

const EARLIER: Event[] = [
  {
    who: "Maya Okafor",
    initials: "MO",
    what: "reacted ❤️ to",
    context: "Riya's Q2 plan recap",
    Icon: HeartIcon,
    tone: "rose",
    time: "Apr 22",
  },
  {
    who: "Riya Patel",
    initials: "RP",
    what: "merged",
    context: "PR #122 — workspace billing migration",
    Icon: GitCommitIcon,
    tone: "emerald",
    time: "Apr 21",
  },
];

const TONE: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  indigo: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  pink: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export function TimelinesActivityFeedShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Workspace activity
        </div>
        <h1 className="mt-1 font-heading text-2xl">What's been happening</h1>

        <DaySection label="Today" count={TODAY.length} events={TODAY} />
        <DaySection label="Yesterday" count={YESTERDAY.length} events={YESTERDAY} />
        <DaySection label="Earlier this week" count={EARLIER.length} events={EARLIER} />

        <div className="mt-8 text-center">
          <button
            type="button"
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
          >
            Load older activity
          </button>
        </div>
      </div>
    </div>
  );
}

export function DaySection({
  label,
  count,
  events,
}: {
  label: string;
  count: number;
  events: Event[];
}) {
  return (
    <section className="mt-8">
      <div className="sticky top-2 z-10 mb-3 flex items-center gap-3 bg-background/90 py-2 backdrop-blur">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {label}
        </span>
        <span className="h-px flex-1 bg-border/40" />
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>

      <ol className="relative pl-7">
        <span
          aria-hidden
          className="absolute top-2 bottom-2 left-[15px] w-px bg-border/40"
        />
        {events.map((e, i) => (
          <li key={i} className="relative grid grid-cols-1 gap-3 py-2.5">
            <span
              className={
                "absolute -left-7 top-3 z-10 grid size-[30px] place-items-center rounded-full ring-4 ring-background " +
                TONE[e.tone]
              }
            >
              <e.Icon className="size-3.5" />
            </span>
            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">
                  {e.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-medium">{e.who}</span>{" "}
                  <span className="text-muted-foreground">{e.what}</span>
                  {e.context ? (
                    <>
                      {" "}
                      <span className="text-foreground/85">{e.context}</span>
                    </>
                  ) : null}
                </div>
                <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <span>{e.time}</span>
                  {e.meta ? (
                    <>
                      <span>·</span>
                      <span>{e.meta}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
