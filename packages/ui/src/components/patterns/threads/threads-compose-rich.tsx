import { useState } from "react";
import {
  AtSignIcon,
  BoldIcon,
  CodeIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  PaperclipIcon,
  SmileIcon,
  StrikethroughIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Kbd } from "@orbit/ui/kbd";

const TOOLS = [
  { Icon: BoldIcon, label: "Bold", shortcut: "⌘B" },
  { Icon: ItalicIcon, label: "Italic", shortcut: "⌘I" },
  { Icon: StrikethroughIcon, label: "Strike" },
  { Icon: CodeIcon, label: "Code", shortcut: "⌘E" },
  { Icon: LinkIcon, label: "Link", shortcut: "⌘K" },
  { Icon: ListIcon, label: "List" },
];

export function ThreadsComposeRichShowcasePage() {
  const [draft, setDraft] = useState(
    "Sounds good. I'll land it tonight after CI passes — should be a clean migration.",
  );

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Composer
        </div>
        <h1 className="mt-1 font-heading text-3xl">Rich reply box</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Markdown shortcuts in the toolbar, mention popover behind{" "}
          <Kbd>@</Kbd>, attachments and emoji within reach.
        </p>

        <div className="mt-10 rounded-xl border border-border/60 bg-background/40 p-3 shadow-sm focus-within:border-foreground/40">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-0.5">
              {TOOLS.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  title={t.shortcut ? `${t.label} (${t.shortcut})` : t.label}
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
                >
                  <t.Icon className="size-3.5" />
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-border/60" />
              <button
                type="button"
                title="Attach"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <PaperclipIcon className="size-3.5" />
              </button>
              <button
                type="button"
                title="Image"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <ImageIcon className="size-3.5" />
              </button>
              <button
                type="button"
                title="Mention"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <AtSignIcon className="size-3.5" />
              </button>
              <button
                type="button"
                title="Emoji"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <SmileIcon className="size-3.5" />
              </button>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em]">
              Markdown
            </span>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            placeholder="Reply to the thread…"
            className="mt-2 w-full resize-none bg-transparent px-1 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/40 px-2 py-1 text-xs">
              <PaperclipIcon className="size-3 opacity-60" />
              <span className="font-mono text-[11px]">migration-plan.md</span>
              <button
                type="button"
                className="rounded text-muted-foreground/60 transition-colors hover:text-foreground"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/40 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em]">
                Replying to
              </span>
              <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-foreground/85">
                Maya · 2h ago
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em] sm:flex sm:items-center sm:gap-1.5">
                <Kbd>⌘</Kbd>
                <Kbd>↵</Kbd>
                send
              </span>
              <Button variant="ghost" size="sm" type="button">
                Cancel
              </Button>
              <Button size="sm" type="button" disabled={!draft.trim()}>
                Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
