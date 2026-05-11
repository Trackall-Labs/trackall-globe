import { useState } from "react";
import { CornerDownLeftIcon } from "lucide-react";

export interface Member {
  initials: string;
  tone: string;
  name: string;
  handle: string;
  team: string;
  active?: boolean;
}

const MEMBERS: Member[] = [
  { initials: "MO", tone: "bg-emerald-500/85 text-white", name: "Maya Okafor", handle: "maya", team: "Engineering" },
  { initials: "JL", tone: "bg-amber-500/85 text-white", name: "James Lin", handle: "james", team: "Engineering", active: true },
  { initials: "RP", tone: "bg-violet-500/85 text-white", name: "Riya Patel", handle: "riya", team: "Product" },
  { initials: "DK", tone: "bg-sky-500/85 text-white", name: "Dani Kim", handle: "dani", team: "Design" },
  { initials: "AT", tone: "bg-rose-500/85 text-white", name: "Alex Tran", handle: "alex", team: "Marketing" },
];

const GROUPS = [
  { handle: "engineering", description: "5 people · Engineering team" },
  { handle: "design", description: "3 people · Design team" },
];

export function ThreadsMentionPopoverShowcasePage() {
  const [active, setActive] = useState("james");

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Composer
        </div>
        <h1 className="mt-1 font-heading text-3xl">Mention popover</h1>

        <div className="relative mt-10 rounded-lg border border-border/60 bg-background/40 p-4">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            Reply to thread
          </div>
          <div className="mt-2 flex min-h-[80px] flex-wrap items-baseline gap-1 rounded-md border border-input bg-background px-3 py-2.5 text-sm">
            <span>Hey,</span>
            <span className="rounded bg-primary/15 px-1.5 py-0.5 font-medium text-primary">
              @james
            </span>
            <span>— what do you think? Also</span>
            <span className="relative">
              <span className="text-primary">@</span>
              <span className="font-mono text-primary">jam</span>
              <span
                aria-hidden
                className="ml-px inline-block h-4 w-0.5 animate-pulse bg-foreground align-middle"
              />
            </span>
          </div>

          <div className="absolute left-[100px] top-[100px] z-30 w-80 overflow-hidden rounded-xl border border-border/70 bg-background shadow-2xl">
            <div className="px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              People
            </div>
            <ul>
              {MEMBERS.map((m) => (
                <li key={m.handle}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(m.handle)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                      active === m.handle ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.03]"
                    }`}
                  >
                    <div
                      className={`flex size-7 items-center justify-center rounded-full font-medium text-[11px] ${m.tone}`}
                    >
                      {m.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-medium text-sm">{m.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          @{m.handle}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                        {m.team}
                      </div>
                    </div>
                    {active === m.handle ? (
                      <CornerDownLeftIcon className="size-3.5 opacity-60" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-border/60 px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Groups
            </div>
            <ul>
              {GROUPS.map((g) => (
                <li key={g.handle}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-foreground/[0.03]"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-foreground/[0.08] font-mono text-[11px]">
                      #
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">@{g.handle}</div>
                      <div className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                        {g.description}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-foreground/[0.02] px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/60 bg-background/80 px-1 normal-case">↑</kbd>
                <kbd className="rounded border border-border/60 bg-background/80 px-1 normal-case">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/60 bg-background/80 px-1 normal-case">↵</kbd>
                insert
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
