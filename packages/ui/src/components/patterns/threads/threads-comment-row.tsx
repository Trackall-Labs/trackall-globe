import { MoreHorizontalIcon, SmileIcon } from "lucide-react";

export interface Comment {
  initials: string;
  tone: string;
  name: string;
  time: string;
  body: React.ReactNode;
  reactions: { emoji: string; count: number; mine?: boolean }[];
  replyCount: number;
  edited?: boolean;
}

const COMMENTS: Comment[] = [
  {
    initials: "MO",
    tone: "bg-emerald-500/85 text-white",
    name: "Maya Okafor",
    time: "2h ago",
    body: (
      <>
        Pushed the new audit log query. The aggregate over the last 30 days
        comes back in <code>~120ms</code> on the prod replica — I think we can
        ship.
      </>
    ),
    reactions: [
      { emoji: "🚀", count: 4, mine: true },
      { emoji: "👀", count: 2 },
      { emoji: "💯", count: 1 },
    ],
    replyCount: 3,
  },
  {
    initials: "JL",
    tone: "bg-amber-500/85 text-white",
    name: "James Lin",
    time: "1h ago",
    body: (
      <>
        Nice. Can you also paste the query plan? Want to make sure it's still
        using the <code>(workspace_id, created_at)</code> index.
      </>
    ),
    reactions: [{ emoji: "👍", count: 1, mine: true }],
    replyCount: 1,
    edited: true,
  },
  {
    initials: "RP",
    tone: "bg-violet-500/85 text-white",
    name: "Riya Patel",
    time: "47m ago",
    body: (
      <>
        Tagging <Mention>@sean</Mention> — heads up, this rolls in tonight if
        we get a thumbs up from review.
      </>
    ),
    reactions: [],
    replyCount: 0,
  },
];

export function ThreadsCommentRowShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Comment patterns
        </div>
        <h1 className="mt-1 font-heading text-3xl">Single comment row</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          The atomic unit — same shape used inline, in side panels, and in
          activity feeds.
        </p>

        <ul className="mt-10 flex flex-col gap-6">
          {COMMENTS.map((c, i) => (
            <li
              key={i}
              className="group rounded-lg border border-border/60 bg-background/40 p-4 transition-colors hover:border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full font-medium text-[12px] ${c.tone}`}
                  >
                    {c.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{c.name}</span>
                      {c.edited ? (
                        <span className="font-mono text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em]">
                          edited
                        </span>
                      ) : null}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                      {c.time}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="More"
                  className="rounded-md p-1 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-foreground/[0.05] hover:text-foreground"
                >
                  <MoreHorizontalIcon className="size-4" />
                </button>
              </div>

              <p className="mt-2.5 text-foreground/90 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-foreground/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px]">
                {c.body}
              </p>

              <div className="mt-3 flex items-center gap-1.5">
                {c.reactions.map((r, j) => (
                  <button
                    key={j}
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                      r.mine
                        ? "border-foreground/30 bg-foreground/[0.06]"
                        : "border-border/60 bg-background/40 hover:border-border"
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span className="font-mono text-[10px]">{r.count}</span>
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Add reaction"
                  className="inline-flex items-center justify-center rounded-full border border-border/60 bg-background/40 p-1 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  <SmileIcon className="size-3" />
                </button>
                <span className="ml-auto inline-flex items-center gap-3 font-mono text-[10px] text-muted-foreground/80 uppercase tracking-[0.2em]">
                  {c.replyCount > 0 ? (
                    <button
                      type="button"
                      className="transition-colors hover:text-foreground"
                    >
                      {c.replyCount}{" "}
                      {c.replyCount === 1 ? "reply" : "replies"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="transition-colors hover:text-foreground"
                  >
                    Reply
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Mention({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-primary/15 px-1.5 py-0.5 font-medium text-primary text-xs">
      {children}
    </span>
  );
}
