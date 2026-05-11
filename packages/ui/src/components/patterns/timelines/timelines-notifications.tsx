import {
  AtSignIcon,
  BellIcon,
  GitPullRequestIcon,
  HeartIcon,
  MessageCircleIcon,
  SettingsIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";

export interface Notif {
  who: string;
  initials: string;
  what: string;
  context?: string;
  time: string;
  Icon: ComponentType<{ className?: string }>;
  unread?: boolean;
}

const TODAY: Notif[] = [
  {
    who: "Maya Okafor",
    initials: "MO",
    what: "mentioned you in",
    context: "Onboarding handbook v3",
    time: "2m",
    Icon: AtSignIcon,
    unread: true,
  },
  {
    who: "James Lin",
    initials: "JL",
    what: "requested your review on",
    context: "PR #128 — audit log",
    time: "18m",
    Icon: GitPullRequestIcon,
    unread: true,
  },
  {
    who: "Riya Patel",
    initials: "RP",
    what: "replied to your comment on",
    context: '"Should we keep the rounded variant?"',
    time: "1h",
    Icon: MessageCircleIcon,
  },
];

const EARLIER: Notif[] = [
  {
    who: "Dani Kim",
    initials: "DK",
    what: "reacted ❤️ to your post in",
    context: "#design-crit",
    time: "Yesterday",
    Icon: HeartIcon,
  },
  {
    who: "Workspace",
    initials: "WS",
    what: "billing settings were updated by",
    context: "Sean Brydon",
    time: "2d",
    Icon: SettingsIcon,
  },
  {
    who: "Alex Tran",
    initials: "AT",
    what: "deployed",
    context: "main → production",
    time: "3d",
    Icon: GitPullRequestIcon,
  },
];

export function TimelinesNotificationsShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="flex items-center justify-between border-border/60 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <BellIcon className="size-4 opacity-70" />
              <span className="font-heading text-sm">Notifications</span>
              <span className="rounded-full bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">
                2
              </span>
            </div>
            <button
              type="button"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
            >
              Mark all read
            </button>
          </div>

          <div className="flex items-center gap-1 border-border/60 border-b px-3 py-2">
            <button
              type="button"
              className="rounded-md bg-foreground/[0.06] px-2.5 py-1 text-xs"
            >
              All
            </button>
            <button
              type="button"
              className="rounded-md px-2.5 py-1 text-muted-foreground text-xs hover:bg-foreground/[0.03] hover:text-foreground"
            >
              Unread
            </button>
            <button
              type="button"
              className="rounded-md px-2.5 py-1 text-muted-foreground text-xs hover:bg-foreground/[0.03] hover:text-foreground"
            >
              Mentions
            </button>
          </div>

          <Section label="Today">
            {TODAY.map((n, i) => (
              <Item key={i} n={n} />
            ))}
          </Section>

          <Section label="Earlier">
            {EARLIER.map((n, i) => (
              <Item key={i} n={n} />
            ))}
          </Section>

          <div className="border-border/60 border-t px-4 py-2 text-center">
            <button
              type="button"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
            >
              See all activity →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="bg-background px-4 py-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {label}
      </div>
      <ul className="divide-y divide-border/40">{children}</ul>
    </div>
  );
}

export function Item({ n }: { n: Notif }) {
  return (
    <li
      className={
        "relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.02] " +
        (n.unread ? "bg-foreground/[0.015]" : "")
      }
    >
      {n.unread ? (
        <span className="absolute top-4 left-1.5 size-1.5 rounded-full bg-blue-500" />
      ) : null}
      <div className="relative">
        <Avatar className="size-9">
          <AvatarFallback className="text-[11px]">
            {n.initials}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-background">
          <span className="grid size-3.5 place-items-center rounded-full bg-foreground text-background">
            <n.Icon className="size-2" />
          </span>
        </span>
      </div>
      <div className="min-w-0 flex-1 leading-snug">
        <div className="text-sm">
          <span className="font-medium">{n.who}</span>{" "}
          <span className="text-muted-foreground">{n.what}</span>{" "}
          {n.context ? (
            <span className="text-foreground/85">{n.context}</span>
          ) : null}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/80 uppercase tracking-[0.2em]">
          {n.time}
        </div>
      </div>
    </li>
  );
}
