import {
  CalendarDaysIcon,
  GitBranchIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  StarIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";

const TABS = ["Overview", "Activity", "Projects", "Posts"];
const STATS = [
  { label: "Following", value: "284" },
  { label: "Followers", value: "12.4k" },
  { label: "Posts", value: "412" },
  { label: "Stars", value: "8,294" },
];

const PROJECTS = [
  { name: "@acme/orbit-ui", lang: "TypeScript", stars: 4218, forks: 142, blurb: "Headless UI primitives built on Base UI." },
  { name: "particle-field", lang: "TypeScript", stars: 1804, forks: 64, blurb: "Mouse-aware particle text rendering." },
  { name: "rrule-mini", lang: "Rust", stars: 612, forks: 18, blurb: "Tiny RRULE parser, panic-free." },
];

const ACTIVITY = [
  { what: "merged", target: "PR #128 in @acme/web", time: "2h" },
  { what: "starred", target: "vercel/next.js", time: "1d" },
  { what: "released", target: "v3.4 in @acme/orbit-ui", time: "3d" },
];

export function ProfileHeroShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Cover banner */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-indigo-500/30 via-foreground/[0.04] to-teal-500/30">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-8">
        <div className="-mt-12 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="size-24 shrink-0 border-4 border-background bg-foreground">
              <AvatarFallback className="bg-foreground text-2xl text-background">
                MO
              </AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <h1 className="font-heading text-2xl tracking-tight">
                Maya Okafor
              </h1>
              <div className="text-muted-foreground text-sm">
                @maya · Engineering at Acme
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Button variant="outline" type="button">
              <MessageCircleIcon />
              Message
            </Button>
            <Button type="button">Follow</Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="max-w-prose text-foreground/85 text-sm leading-relaxed">
            Building the audit log so security teams can sleep. Long-form on
            distributed systems, short-form on JS quirks. Coffee snob.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground text-xs">
            <Meta Icon={MapPinIcon}>Brooklyn, NY</Meta>
            <Meta Icon={MailIcon}>maya@acme.dev</Meta>
            <Meta Icon={GlobeIcon}>maya.dev</Meta>
            <Meta Icon={CalendarDaysIcon}>Joined Apr 2021</Meta>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Tag color="indigo">react</Tag>
          <Tag color="teal">distributed-systems</Tag>
          <Tag color="amber">security</Tag>
          <Tag color="rose">design-systems</Tag>
        </div>

        <div className="mt-5 flex items-center gap-5 border-border/60 border-b">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              className={
                "border-b-2 px-1 py-3 text-sm transition-colors " +
                (i === 0
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground")
              }
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-4 text-muted-foreground text-xs">
            {STATS.map((s) => (
              <span key={s.label}>
                <span className="font-mono text-foreground">{s.value}</span>{" "}
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <section>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Pinned projects
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PROJECTS.map((p) => (
                <article
                  key={p.name}
                  className="rounded-xl border border-border/60 bg-background/40 p-4"
                >
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <GitBranchIcon className="size-3.5 opacity-60" />
                    {p.name}
                  </div>
                  <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
                    {p.blurb}
                  </p>
                  <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-500" />
                      {p.lang}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <StarIcon className="size-3" />
                      {p.stars.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitBranchIcon className="size-3" />
                      {p.forks}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Recent activity
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {ACTIVITY.map((a, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-2 text-foreground/85 text-sm"
                >
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  <span className="text-muted-foreground">{a.what}</span>
                  <span className="truncate">{a.target}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground/80">
                    {a.time}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function Meta({
  Icon,
  children,
}: {
  Icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}

export function Tag({
  color,
  children,
}: {
  color: "indigo" | "teal" | "amber" | "rose";
  children: React.ReactNode;
}) {
  const map: Record<typeof color, string> = {
    indigo: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-400",
    teal: "bg-teal-500/12 text-teal-700 dark:text-teal-400",
    amber: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
    rose: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
  };
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] " +
        map[color]
      }
    >
      {children}
    </span>
  );
}
