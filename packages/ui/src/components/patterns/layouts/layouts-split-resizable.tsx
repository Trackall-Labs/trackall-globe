import { useEffect, useRef, useState } from "react";
import { GripVerticalIcon, PlayIcon, RotateCcwIcon, Share2Icon, WandSparklesIcon } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Separator } from "@orbit/ui/separator";
import { useTheme } from "@orbit/ui/theme-provider";

const CODE = `import { useState } from "react";
import { Button } from "@orbit/ui/button";

// A tiny counter widget
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-xl">
        Live preview
      </h2>
      <p>You clicked {count} times.</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
`;

export function LayoutsSplitResizableShowcasePage() {
  const [leftPct, setLeftPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(85, Math.max(15, raw));
      setLeftPct(clamped);
    };
    const onUp = () => setDragging(false);

    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging]);

  const leftLabel = Math.round(leftPct);
  const rightLabel = 100 - leftLabel;

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-12 items-center gap-3 border-border/60 border-b px-4">
        <span className="font-mono text-muted-foreground text-xs">
          scratchpad / playground.tsx
        </span>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-1">
          <Button size="xs" variant="ghost">
            <WandSparklesIcon />
            Format
          </Button>
          <Button size="xs" variant="ghost">
            <PlayIcon />
            Run
          </Button>
          <Button size="xs" variant="ghost">
            <Share2Icon />
            Share
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] tracking-wider">
            {leftLabel}% / {rightLabel}%
          </Badge>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setLeftPct(50)}
            disabled={leftLabel === 50}
          >
            <RotateCcwIcon />
            Reset
          </Button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative flex flex-1 overflow-hidden"
      >
        <div
          className="flex shrink-0 flex-col overflow-hidden border-border/60 border-r bg-foreground/[0.02]"
          style={{ width: `${leftPct}%` }}
        >
          <EditorPane />
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={leftLabel}
          aria-valuemin={15}
          aria-valuemax={85}
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDoubleClick={() => setLeftPct(50)}
          className={`group relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center transition-colors hover:bg-foreground/10 ${
            dragging ? "bg-foreground/15" : ""
          }`}
        >
          <span className="pointer-events-none flex h-10 w-3 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
            <GripVerticalIcon className="size-3 text-muted-foreground" />
          </span>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          <PreviewPane count={3} dragging={dragging} />
        </div>
      </div>
    </div>
  );
}

export function EditorPane() {
  const { resolved } = useTheme();
  const theme = resolved === "dark" ? themes.vsDark : themes.vsLight;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 border-border/60 border-b px-2">
        <EditorTab label="playground.tsx" active />
        <EditorTab label="config.json" />
      </div>
      <div className="flex-1 overflow-auto">
        <Highlight code={CODE.trimEnd()} language="tsx" theme={theme}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`m-0 px-3 py-3 font-mono text-[12.5px] leading-[1.65] ${className}`}
              style={{ ...style, background: "transparent" }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  <span className="table-cell select-none pr-4 text-right font-mono text-muted-foreground/40 text-xs tabular-nums">
                    {i + 1}
                  </span>
                  <span className="table-cell whitespace-pre">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

export function EditorTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
        active
          ? "bg-foreground/[0.06] text-foreground"
          : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function PreviewPane({ count, dragging }: { count: number; dragging: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 border-border/60 border-b px-2">
        <EditorTab label="Preview" active />
        <EditorTab label="Console" />
      </div>
      <div
        className={`flex flex-1 items-center justify-center overflow-auto p-8 ${
          dragging ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading font-semibold text-xl">Live preview</h2>
          <p className="text-muted-foreground text-sm">
            You clicked {count} times.
          </p>
          <Button size="sm" className="self-start">
            Increment
          </Button>
        </div>
      </div>
      <div className="flex h-7 shrink-0 items-center justify-between border-border/60 border-t px-3">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
          Ready · 42ms
        </span>
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
          v1.0.0
        </span>
      </div>
    </div>
  );
}
