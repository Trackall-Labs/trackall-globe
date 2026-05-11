import { ArchiveIcon, FilterIcon, InboxIcon, SearchIcon } from "lucide-react";

export interface Thread {
  id: string;
  initials: string;
  color: string;
  name: string;
  preview: string;
  time: string;
  unread?: boolean;
  active?: boolean;
  pinned?: boolean;
}

const THREADS: Thread[] = [
  {
    id: "1",
    initials: "MO",
    color: "bg-emerald-500/80",
    name: "Maya Okafor",
    preview: "I rewrote the audit log query — should we land it tonight or…",
    time: "2m",
    unread: true,
    pinned: true,
  },
  {
    id: "2",
    initials: "JL",
    color: "bg-amber-500/80",
    name: "James Lin",
    preview: "Wrapped the migration. Feel free to merge whenever.",
    time: "14m",
    unread: true,
  },
  {
    id: "3",
    initials: "RP",
    color: "bg-violet-500/80",
    name: "Riya Patel",
    preview: "Heads up — invite emails are bouncing for big-corp.com",
    time: "1h",
    unread: true,
    active: true,
  },
  {
    id: "4",
    initials: "DK",
    color: "bg-sky-500/80",
    name: "Dani Kim",
    preview: "Bookmarked your sidebar design from yesterday, super clean.",
    time: "3h",
  },
  {
    id: "5",
    initials: "AT",
    color: "bg-rose-500/80",
    name: "Alex Tran",
    preview: "Pricing page copy is ready for your eyes.",
    time: "Yesterday",
  },
  {
    id: "6",
    initials: "BF",
    color: "bg-orange-500/80",
    name: "Ben Flores",
    preview: "Approved the new permission scopes — see you on standup.",
    time: "Mon",
  },
  {
    id: "7",
    initials: "SQ",
    color: "bg-cyan-500/80",
    name: "Sara Quinn",
    preview: "We should chat about the empty-state copy direction.",
    time: "Mon",
  },
];

export function SidebarsInboxRailShowcasePage() {
  return (
    <div className="grid min-h-svh grid-cols-[340px_1fr] bg-background text-foreground">
      <aside className="flex h-svh flex-col border-r border-border/60 bg-foreground/[0.02]">
        <div className="border-b border-border/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <InboxIcon className="size-4 opacity-70" />
              <div className="font-medium text-sm">Inbox</div>
              <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 font-mono text-[9px] text-foreground">
                3
              </span>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              aria-label="Filter"
            >
              <FilterIcon className="size-3.5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
            <SearchIcon className="size-3.5 opacity-50" />
            <span className="flex-1 truncate text-muted-foreground text-xs">
              Search…
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em]">
          <Tab active>Unread · 3</Tab>
          <Tab>All</Tab>
          <Tab>Mentions</Tab>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {THREADS.map((t) => (
            <li
              key={t.id}
              className={`relative cursor-pointer border-b border-border/40 px-4 py-3 transition-colors ${
                t.active
                  ? "bg-foreground/[0.06]"
                  : "hover:bg-foreground/[0.03]"
              }`}
            >
              {t.unread ? (
                <span className="-translate-y-1/2 absolute top-1/2 left-1.5 size-1.5 rounded-full bg-primary" />
              ) : null}
              <div className="flex items-start gap-3">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full font-medium text-[11px] text-background ${t.color}`}
                >
                  {t.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-sm ${t.unread ? "font-semibold" : "font-medium"}`}
                    >
                      {t.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      {t.time}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 line-clamp-2 text-xs leading-snug ${t.unread ? "text-foreground/80" : "text-muted-foreground"}`}
                  >
                    {t.preview}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          <span>{THREADS.length} threads</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ArchiveIcon className="size-3" />
            Archive read
          </button>
        </div>
      </aside>

      <main className="flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em]">
            Conversation pane
          </div>
          <p className="mt-1.5 text-sm">Pick a thread to read.</p>
        </div>
      </main>
    </div>
  );
}

export function Tab({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`rounded px-2 py-1 transition-colors ${
        active
          ? "bg-foreground/[0.08] text-foreground"
          : "text-muted-foreground/70 hover:bg-foreground/[0.03] hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
