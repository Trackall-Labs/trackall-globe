import { type FormEvent, useState } from "react";
import {
  ArchiveIcon,
  AtSignIcon,
  CornerDownLeftIcon,
  PaperclipIcon,
  PinIcon,
  SearchIcon,
  SmileIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Kbd } from "@orbit/ui/kbd";
import { useDemo, type Thread } from "./store";

export function InboxView() {
  const { threads, selectedThreadId, selectThread } = useDemo();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"unread" | "all" | "mentions">("unread");

  const visible = threads.filter((t) => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!t.subject.toLowerCase().includes(q) && !t.preview.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (tab === "unread") return t.unread;
    if (tab === "mentions") return t.preview.includes("@") || t.subject.includes("@");
    return true;
  });

  const selected = threads.find((t) => t.id === selectedThreadId) ?? threads[0];

  return (
    <div className="grid h-full grid-cols-[340px_1fr]">
      <aside className="flex flex-col border-r border-border/60 bg-foreground/[0.015]">
        <div className="border-b border-border/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Inbox</span>
              <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 font-mono text-[9px] text-foreground">
                {threads.filter((t) => t.unread).length}
              </span>
            </div>
            <Kbd>⌥ I</Kbd>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
            <SearchIcon className="size-3.5 opacity-50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads…"
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em]">
          <Tab active={tab === "unread"} onClick={() => setTab("unread")}>
            Unread
          </Tab>
          <Tab active={tab === "all"} onClick={() => setTab("all")}>
            All
          </Tab>
          <Tab active={tab === "mentions"} onClick={() => setTab("mentions")}>
            Mentions
          </Tab>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {visible.map((t) => (
            <ThreadRow
              key={t.id}
              thread={t}
              active={t.id === selected?.id}
              onClick={() => selectThread(t.id)}
            />
          ))}
          {visible.length === 0 ? (
            <li className="px-6 py-12 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Nothing here.
            </li>
          ) : null}
        </ul>
      </aside>

      <section className="flex min-w-0 flex-col">
        {selected ? <ThreadDetail thread={selected} /> : null}
      </section>
    </div>
  );
}

function ThreadRow({
  thread,
  active,
  onClick,
}: {
  thread: Thread;
  active: boolean;
  onClick: () => void;
}) {
  const { members } = useDemo();
  const participants = thread.participantIds
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);
  const author = participants[0];

  return (
    <li
      className={`relative cursor-pointer border-b border-border/40 px-4 py-3 transition-colors ${
        active ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.03]"
      }`}
      onClick={onClick}
    >
      {thread.unread ? (
        <span className="-translate-y-1/2 absolute top-1/2 left-1.5 size-1.5 rounded-full bg-primary" />
      ) : null}
      <div className="flex items-start gap-3">
        {author ? (
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full font-medium text-[11px] ${author.tone}`}
          >
            {author.initials}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate text-sm ${thread.unread ? "font-semibold" : "font-medium"}`}>
              {author?.name ?? "Someone"}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {thread.time}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {thread.pinned ? (
              <PinIcon className="size-3 shrink-0 text-amber-500" />
            ) : null}
            <span className="truncate text-foreground/85 text-xs">
              {thread.subject}
            </span>
          </div>
          <p className={`mt-0.5 line-clamp-2 text-xs leading-snug ${thread.unread ? "text-foreground/80" : "text-muted-foreground"}`}>
            {thread.preview}
          </p>
        </div>
      </div>
    </li>
  );
}

function ThreadDetail({ thread }: { thread: Thread }) {
  const { members, sendReply, toggleReaction } = useDemo();
  const [draft, setDraft] = useState("");

  const participants = thread.participantIds
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendReply(thread.id, draft.trim());
    setDraft("");
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {thread.pinned ? <PinIcon className="size-3.5 text-amber-500" /> : null}
            <h2 className="truncate font-heading text-base">{thread.subject}</h2>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex items-center -space-x-1.5">
              {participants.map((p) => (
                <span
                  key={p.id}
                  className={`flex size-5 items-center justify-center rounded-full ring-2 ring-background font-medium text-[9px] ${p.tone}`}
                >
                  {p.initials}
                </span>
              ))}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              {participants.length} participant{participants.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" type="button">
            <ArchiveIcon />
            Archive
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {thread.messages.map((m) => {
          const author = members.find((x) => x.id === m.authorId);
          if (!author) return null;
          return (
            <article key={m.id} className="flex items-start gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full font-medium text-[12px] ${author.tone}`}
              >
                {author.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{author.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                    {m.time}
                  </span>
                </div>
                <p className="mt-1 text-foreground/90 text-sm leading-relaxed">
                  {m.body}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  {(m.reactions ?? []).map((r) => (
                    <button
                      key={r.emoji}
                      type="button"
                      onClick={() => toggleReaction(thread.id, m.id, r.emoji)}
                      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors ${
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
                    onClick={() => toggleReaction(thread.id, m.id, "👍")}
                    aria-label="React"
                    className="inline-flex size-5 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  >
                    <SmileIcon className="size-3" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-border/60 px-6 py-4"
      >
        <div className="rounded-xl border border-border/60 bg-background/40 p-2 focus-within:border-foreground/40">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Reply, or @mention someone…"
            className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onSubmit(e as unknown as FormEvent);
              }
            }}
          />
          <div className="flex items-center justify-between border-t border-border/40 pt-2">
            <div className="flex items-center gap-0.5">
              <button type="button" className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground">
                <PaperclipIcon className="size-3.5" />
              </button>
              <button type="button" className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground">
                <AtSignIcon className="size-3.5" />
              </button>
              <button type="button" className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground">
                <SmileIcon className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em] sm:inline">
                ⌘ ↵ to send
              </span>
              <Button size="sm" type="submit" disabled={!draft.trim()}>
                Reply
                <CornerDownLeftIcon />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

function Tab({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
