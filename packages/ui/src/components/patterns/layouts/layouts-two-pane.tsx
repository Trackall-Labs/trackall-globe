import { Button } from "@orbit/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@orbit/ui/input-group";
import {
  ArchiveIcon,
  ForwardIcon,
  MoreHorizontalIcon,
  ReplyIcon,
  SearchIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

export interface InboxItem {
  id: string;
  sender: string;
  initials: string;
  time: string;
  subject: string;
  preview: string;
  unread: boolean;
}

const INBOX: InboxItem[] = [
  {
    id: "1",
    sender: "Maya Okafor",
    initials: "MO",
    time: "2m",
    subject: "Audit log query rewrite — ready for review",
    preview: "I rewrote the audit log query so the timeline page no longer hits the slow path. Can we land it tonight?",
    unread: true,
  },
  {
    id: "2",
    sender: "James Lin",
    initials: "JL",
    time: "14m",
    subject: "Migration wrapped",
    preview: "All shards are caught up and the dual-write is off. Feel free to merge the cleanup PR whenever.",
    unread: true,
  },
  {
    id: "3",
    sender: "Riya Patel",
    initials: "RP",
    time: "1h",
    subject: "Heads up — invite emails bouncing",
    preview: "Postmark is rejecting any address on big-corp.com. Looks like a DMARC change on their end.",
    unread: true,
  },
  {
    id: "4",
    sender: "Dani Kim",
    initials: "DK",
    time: "3h",
    subject: "Loved the sidebar from yesterday",
    preview: "Bookmarked it for the next nav refresh. The pinned section in particular is a very nice touch.",
    unread: false,
  },
  {
    id: "5",
    sender: "Alex Tran",
    initials: "AT",
    time: "Yesterday",
    subject: "Pricing page copy is ready",
    preview: "Final draft is in the doc. I tightened the enterprise tier and pulled out the annual discount line.",
    unread: false,
  },
  {
    id: "6",
    sender: "Ben Flores",
    initials: "BF",
    time: "Mon",
    subject: "Permission scopes approved",
    preview: "Approved the new permission scopes for the API. See you on standup to walk through the rollout.",
    unread: false,
  },
  {
    id: "7",
    sender: "Sara Quinn",
    initials: "SQ",
    time: "Mon",
    subject: "Empty-state copy direction",
    preview: "We should chat about whether to keep the playful tone or shift to something more direct.",
    unread: true,
  },
  {
    id: "8",
    sender: "Theo Hart",
    initials: "TH",
    time: "Sun",
    subject: "Onboarding metrics — week 3",
    preview: "Activation is up 6 points week-over-week. The new checklist is doing more work than I expected.",
    unread: false,
  },
  {
    id: "9",
    sender: "Nina Brooks",
    initials: "NB",
    time: "Sat",
    subject: "Design review notes",
    preview: "A few comments on the workspace switcher — mostly small, but one structural question about the org row.",
    unread: false,
  },
  {
    id: "10",
    sender: "Owen Park",
    initials: "OP",
    time: "Fri",
    subject: "Dust storm — bug bash on Thursday",
    preview: "Putting an hour on the calendar Thursday afternoon. Bring anything weird you've spotted in the new editor.",
    unread: true,
  },
];

const TABS = ["All", "Unread", "Mentions"] as const;
export type Tab = (typeof TABS)[number];

const AVATAR_COLORS: Record<string, string> = {
  MO: "bg-emerald-500/80",
  JL: "bg-amber-500/80",
  RP: "bg-violet-500/80",
  DK: "bg-sky-500/80",
  AT: "bg-rose-500/80",
  BF: "bg-orange-500/80",
  SQ: "bg-cyan-500/80",
  TH: "bg-teal-500/80",
  NB: "bg-fuchsia-500/80",
  OP: "bg-indigo-500/80",
};

export function LayoutsTwoPaneShowcasePage() {
  const [selectedId, setSelectedId] = useState<string>("3");
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = INBOX.filter((m) => {
    if (activeTab === "Unread") return m.unread;
    return true;
  });

  const selected = INBOX.find((m) => m.id === selectedId) ?? INBOX[0];
  const unreadCount = INBOX.filter((m) => m.unread).length;

  return (
    <div className="grid min-h-svh grid-cols-[360px_1fr] bg-background text-foreground">
      <aside className="flex h-svh flex-col border-r border-border/60">
        <div className="sticky top-0 z-10 border-b border-border/60 bg-background px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-base">Inbox</h2>
            <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-muted-foreground text-xs">
              {unreadCount} unread
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {TABS.map((tab) => {
              const active = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-2 py-1 text-xs transition-colors ${
                    active
                      ? "bg-foreground/[0.08] font-medium text-foreground"
                      : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <div className="mt-2">
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon className="size-3.5 opacity-60" />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search threads…" />
            </InputGroup>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {filtered.map((m) => {
            const isSelected = m.id === selectedId;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={`flex w-full cursor-pointer items-start gap-3 border-border/40 border-b px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "bg-foreground/[0.06]"
                      : "hover:bg-foreground/[0.03]"
                  }`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full font-medium text-[11px] text-background ${AVATAR_COLORS[m.initials] ?? "bg-foreground/60"}`}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        {m.unread ? (
                          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                        ) : null}
                        <span
                          className={`truncate text-sm ${m.unread ? "font-semibold" : "font-medium"}`}
                        >
                          {m.sender}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {m.time}
                      </span>
                    </div>
                    <div className="truncate text-sm">{m.subject}</div>
                    <p className="line-clamp-1 text-muted-foreground text-xs">
                      {m.preview}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="flex h-svh flex-col overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full font-medium text-[12px] text-background ${AVATAR_COLORS[selected.initials] ?? "bg-foreground/60"}`}
          >
            {selected.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-sm">{selected.sender}</div>
            <div className="truncate text-muted-foreground text-xs">
              {selected.subject}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Reply">
              <ReplyIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Forward">
              <ForwardIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Archive">
              <ArchiveIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Delete">
              <Trash2Icon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="More">
              <MoreHorizontalIcon />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-border/60 px-6 py-2">
          <Button variant="outline" size="sm">
            <ReplyIcon />
            Reply
          </Button>
          <Button variant="outline" size="sm">
            <ReplyIcon />
            Reply all
          </Button>
          <Button variant="outline" size="sm">
            <ForwardIcon />
            Forward
          </Button>
        </div>

        <div className="flex-1 px-6 py-6">
          <div className="max-w-3xl space-y-4 text-foreground/85 text-sm leading-relaxed">
            <p>Hey team,</p>
            <p>
              Quick update on the {selected.subject.toLowerCase()} workstream. We
              shipped the second pass of the timeline view this morning, and
              early numbers from the staged rollout suggest the slow query path
              is fully avoided for accounts under ten thousand events. A small
              follow-up is needed for the export endpoint, but it's scoped and
              already on the board.
            </p>
            <p>For visibility, here's where things stand:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Backend cutover is complete and the old code path is dark.</li>
              <li>Frontend is using the new pagination contract end-to-end.</li>
              <li>
                Docs and changelog drafts are in review — should be public by
                Friday.
              </li>
            </ul>
            <p>
              Let me know if anything looks off on your end. Happy to jump on a
              call this afternoon if it's easier to walk through together.
            </p>
            <p>
              Thanks,
              <br />
              {selected.sender}
            </p>
          </div>
        </div>

        <div className="border-t border-border/60 px-6 py-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-muted-foreground text-sm">Reply…</div>
            <div className="mt-8 flex items-center justify-end">
              <Button size="sm">
                <SendIcon />
                Send
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
