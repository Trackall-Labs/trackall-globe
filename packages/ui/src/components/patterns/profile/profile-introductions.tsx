import {
  CheckIcon,
  GitBranchIcon,
  MapPinIcon,
  MessageCircleIcon,
  PlusIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";

export interface Suggestion {
  name: string;
  initials: string;
  role: string;
  city: string;
  followers: string;
  contextType: "shared" | "team" | "topic" | "repo";
  context: string;
  mutuals: string[];
  bio: string;
  followed?: boolean;
  dismissed?: boolean;
}

const SUGGESTIONS: Suggestion[] = [
  {
    name: "Helena Marsh",
    initials: "HM",
    role: "VP Engineering · Acme",
    city: "London, UK",
    followers: "8,402",
    contextType: "team",
    context: "Same team",
    mutuals: ["MO", "JL", "RP", "DK"],
    bio: "Building the engineering org that ships boring software people love.",
  },
  {
    name: "Naomi Park",
    initials: "NP",
    role: "Staff Engineer · Linear",
    city: "Seoul, KR",
    followers: "12.1k",
    contextType: "topic",
    context: "Writes about distributed systems",
    mutuals: ["MO", "OB"],
    bio: "Realtime sync, conflict-free CRDTs, very tired graphs.",
  },
  {
    name: "Oliver Bates",
    initials: "OB",
    role: "Founder · Stitchstack",
    city: "Brooklyn, NY",
    followers: "4,210",
    contextType: "shared",
    context: "Followed by Maya Okafor",
    mutuals: ["MO"],
    bio: "Indie tools for product teams. Newsletter Mondays.",
    followed: true,
  },
  {
    name: "Priya Shah",
    initials: "PS",
    role: "Engineer · Vercel",
    city: "London, UK",
    followers: "21.4k",
    contextType: "repo",
    context: "Contributes to @acme/orbit-ui",
    mutuals: ["DK", "JL"],
    bio: "Edge runtimes. Pretending to like vegetables.",
  },
];

const CONTEXT_TONE: Record<Suggestion["contextType"], string> = {
  shared: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-400",
  team: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  topic: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  repo: "bg-violet-500/12 text-violet-700 dark:text-violet-400",
};

const CONTEXT_GLYPH: Record<Suggestion["contextType"], typeof MessageCircleIcon> = {
  shared: UserPlusIcon,
  team: PlusIcon,
  topic: MessageCircleIcon,
  repo: GitBranchIcon,
};

export function ProfileIntroductionsShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          People you may know
        </div>
        <h1 className="mt-1 font-heading text-2xl">Suggested intros</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Based on your team, the topics you read, and people followed by
          folks you trust.
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => {
            const Glyph = CONTEXT_GLYPH[s.contextType];
            return (
              <li
                key={s.name}
                className="rounded-xl border border-border/60 bg-background/40 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="text-base">
                        {s.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm">{s.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {s.role}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>

                <div
                  className={
                    "mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] " +
                    CONTEXT_TONE[s.contextType]
                  }
                >
                  <Glyph className="size-3" />
                  {s.context}
                </div>

                <p className="mt-3 text-foreground/85 text-sm leading-snug">
                  {s.bio}
                </p>

                <div className="mt-3 flex items-center gap-3 text-muted-foreground text-xs">
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon className="size-3" />
                    {s.city}
                  </span>
                  <span>·</span>
                  <span className="font-mono">{s.followers} followers</span>
                </div>

                <div className="mt-3 flex items-center justify-between border-border/60 border-t pt-3">
                  <div className="flex items-center -space-x-1.5">
                    {s.mutuals.slice(0, 3).map((m) => (
                      <Avatar
                        key={m}
                        className="size-5 border-2 border-background"
                      >
                        <AvatarFallback className="text-[9px]">
                          {m}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <span className="ml-3 font-mono text-[10px] text-muted-foreground">
                      {s.mutuals.length} mutual
                    </span>
                  </div>
                  {s.followed ? (
                    <Button size="sm" variant="outline" type="button">
                      <CheckIcon />
                      Following
                    </Button>
                  ) : (
                    <Button size="sm" type="button">
                      <UserPlusIcon />
                      Follow
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
          >
            See all suggestions →
          </button>
        </div>
      </div>
    </div>
  );
}
