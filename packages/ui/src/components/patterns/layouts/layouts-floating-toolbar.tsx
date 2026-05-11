import { useEffect, useRef, useState } from "react";
import {
  BoldIcon,
  HighlighterIcon,
  ItalicIcon,
  LinkIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  Share2Icon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Separator } from "@orbit/ui/separator";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@orbit/ui/tooltip";

export type ToolbarPos = { top: number; left: number };

export function LayoutsFloatingToolbarShowcasePage() {
  const docRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<ToolbarPos | null>(null);
  const [visible, setVisible] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        if (!manualOpen) {
          setVisible(false);
          setPos(null);
        }
        return;
      }
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const docEl = docRef.current;
      if (!docEl) return;
      const node =
        container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : (container as Element);
      if (!node || !docEl.contains(node)) return;
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      setPos({ top: rect.top + window.scrollY, left: rect.left + rect.width / 2 });
      setVisible(true);
    };

    const handleMouseUp = () => {
      window.setTimeout(handleSelectionChange, 0);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        docRef.current?.contains(target) ||
        toolbarRef.current?.contains(target)
      ) {
        return;
      }
      if (!manualOpen) {
        setVisible(false);
        setPos(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("selectionchange", () => {
      const sel = window.getSelection();
      if ((!sel || sel.isCollapsed) && !manualOpen) {
        setVisible(false);
      }
    });
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [manualOpen]);

  const toggleManual = () => {
    if (manualOpen) {
      setManualOpen(false);
      setVisible(false);
      setPos(null);
      return;
    }
    setManualOpen(true);
    const docEl = docRef.current;
    if (docEl) {
      const rect = docEl.getBoundingClientRect();
      setPos({
        top: rect.top + window.scrollY + 120,
        left: rect.left + rect.width / 2,
      });
      setVisible(true);
    }
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-3">
        <div className="font-mono text-muted-foreground text-xs">
          Untitled · sean's pad
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share2Icon />
            Share
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More">
            <MoreHorizontalIcon />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            Highlight any text to see the toolbar.
          </p>
          <Button variant="outline" size="sm" onClick={toggleManual}>
            {manualOpen ? "Hide toolbar" : "Show toolbar"}
          </Button>
        </div>

        <article ref={docRef} className="flex flex-col gap-5">
          <h1 className="font-heading text-4xl tracking-tight">
            Floating toolbars
          </h1>

          <p className="text-foreground/90 leading-relaxed">
            Contextual editing surfaces have quietly become the default way
            people format text on the modern web. Instead of crowding the
            chrome with every possible action, the editor waits — and only
            when you make a selection does the relevant set of tools surface,
            anchored to the words you actually care about.
          </p>

          <p className="text-foreground/90 leading-relaxed">
            The pattern goes by many names: bubble menu, hover toolbar,
            floating toolbar, selection menu. The mechanics are the same.
            Listen for selection changes, measure the bounding rectangle of
            the active range, and render a small pill of buttons just above
            it. When the user clicks elsewhere or the selection collapses,
            the toolbar dismisses itself.
          </p>

          <p className="text-foreground/90 leading-relaxed">
            Notion popularized the approach for documents, but it shows up
            anywhere users compose rich text — comment fields, knowledge
            bases, the address bar of a code editor. Each implementation is
            a small variation on the same trick: keep the canvas calm and
            let the toolbar appear only when it has something to do.
          </p>

          <h2 className="mt-4 font-heading text-2xl tracking-tight">
            What makes one feel right
          </h2>

          <p className="text-foreground/90 leading-relaxed">
            A good floating toolbar is fast, predictable, and never blocks
            the text you're working with. It appears above the selection by
            default, flips below when there isn't enough room, and stays put
            while you reach for it. Crucially, clicking a button must not
            collapse the underlying selection — otherwise every action
            becomes a two-step dance.
          </p>

          <h3 className="mt-2 font-heading text-lg tracking-tight">
            Mechanics worth getting right
          </h3>

          <ol className="ml-5 flex list-decimal flex-col gap-2 text-foreground/90 leading-relaxed">
            <li>
              Anchor the toolbar to the live selection rectangle, not the
              caret. The rectangle moves naturally as the selection grows.
            </li>
            <li>
              Use{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                onMouseDown
              </code>{" "}
              with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                preventDefault
              </code>{" "}
              on the toolbar so clicks don't move focus or kill the range.
            </li>
            <li>
              Fade the toolbar in over ~150ms. Anything longer feels heavy;
              anything snappier looks broken.
            </li>
          </ol>

          <blockquote className="border-border border-l-4 pl-4 text-foreground/90 italic leading-relaxed">
            The best UI is the UI you don't notice. Floating toolbars work
            because they vanish the moment you stop needing them — leaving
            the page exactly as you found it.
          </blockquote>

          <p className="text-foreground/90 leading-relaxed">
            There's a deeper lesson here about progressive disclosure.
            Affordances don't have to live on the page forever. They can
            arrive when the user's intent becomes clear, do their job, and
            slip away. Done well, the canvas feels lighter and the controls
            feel more capable, both at the same time.
          </p>

          <p className="text-foreground/90 leading-relaxed">
            Try selecting a sentence anywhere in this document. The toolbar
            above will track your range and offer the formatting actions
            you'd expect — bold, italic, link, highlight, and a slot for
            leaving a comment. None of it ships data anywhere; it's a
            sketch, not a product.
          </p>
        </article>
      </main>

      {pos ? (
        <div
          ref={toolbarRef}
          onMouseDown={(e) => e.preventDefault()}
          style={{ top: pos.top, left: pos.left }}
          className={`-translate-x-1/2 -translate-y-full mt-[-8px] fixed z-50 inline-flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1 shadow-lg transition-opacity duration-150 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <ToolbarButton label="Bold">
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton label="Italic">
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton label="Underline">
            <UnderlineIcon />
          </ToolbarButton>
          <ToolbarButton label="Strikethrough">
            <StrikethroughIcon />
          </ToolbarButton>
          <Separator orientation="vertical" className="h-4" />
          <ToolbarButton label="Link">
            <LinkIcon />
          </ToolbarButton>
          <ToolbarButton label="Highlight">
            <span className="relative inline-flex">
              <HighlighterIcon className="size-4" />
              <span className="-bottom-0.5 absolute right-0 size-1.5 rounded-full bg-yellow-400" />
            </span>
          </ToolbarButton>
          <Separator orientation="vertical" className="h-4" />
          <ToolbarButton label="Add comment">
            <MessageCircleIcon />
          </ToolbarButton>
          <ToolbarButton label="More">
            <MoreHorizontalIcon />
          </ToolbarButton>
        </div>
      ) : null}
    </div>
  );
}

export function ToolbarButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            className="inline-flex size-7 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&_svg]:size-4"
          >
            {children}
          </button>
        }
      />
      <TooltipPopup>{label}</TooltipPopup>
    </Tooltip>
  );
}
