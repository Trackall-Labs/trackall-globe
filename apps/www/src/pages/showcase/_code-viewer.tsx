import { useEffect, useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { CheckIcon, ChevronDownIcon, CopyIcon } from "lucide-react";
import {
  Dialog,
  DialogBackdrop,
  DialogPortal,
  DialogPrimitive,
  DialogViewport,
} from "@orbit/ui/dialog";
import { Button } from "@orbit/ui/button";
import { ScrollArea } from "@orbit/ui/scroll-area";
import { cn } from "@orbit/ui/lib/utils";
import type { CategorySlug } from "@/lib/designs";
import { getSourceFile } from "./source-files";

const RAW_SOURCES = import.meta.glob("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function getSource(
  category: CategorySlug,
  design: string,
): { filename: string; code: string } | null {
  const filename = getSourceFile(category, design);
  if (!filename) return null;
  const code = RAW_SOURCES[`./${filename}.tsx`];
  if (!code) return null;
  return { filename, code };
}

interface CodeViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategorySlug;
  design: string;
  title: string;
}

const SETUP_COMMANDS: { label: string; value: string }[] = [
  { label: "Init shadcn", value: "npx shadcn@latest init" },
  { label: "Register @coss", value: "npx shadcn@latest registry add @coss" },
];

export function CodeViewer({
  open,
  onOpenChange,
  category,
  design,
  title,
}: CodeViewerProps) {
  const source = getSource(category, design);
  const [setupOpen, setSetupOpen] = useState(false);
  const registryUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${category}/${design}.json`
      : `/r/${category}/${design}.json`;
  const installCommand = `npx shadcn@latest add ${registryUrl}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport className="grid-rows-[1fr_auto_1fr] p-4 sm:p-8">
          <DialogPrimitive.Popup
            data-slot="dialog-popup"
            className="relative row-start-2 flex max-h-full min-h-0 w-full min-w-0 max-w-3xl origin-center flex-col overflow-hidden rounded-2xl bg-popover not-dark:bg-clip-padding text-popover-foreground opacity-[calc(1-var(--nested-dialogs))] outline-none will-change-transform [transition-property:scale,opacity,translate] duration-200 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[inset_0_1px_--theme(--color-white/64%)] shadow-[0_0_0_1px_--theme(--color-black/8%),0_1px_2px_--theme(--color-black/6%),0_12px_32px_-8px_--theme(--color-black/18%),0_32px_64px_-16px_--theme(--color-black/24%)] data-ending-style:opacity-0 data-starting-style:opacity-0 sm:scale-[calc(1-0.1*var(--nested-dialogs))] sm:data-ending-style:scale-96 sm:data-starting-style:scale-96 dark:before:shadow-[inset_0_1px_--theme(--color-white/6%)] dark:shadow-[0_0_0_1px_--theme(--color-white/10%),0_1px_2px_--theme(--color-black/60%),0_12px_32px_-8px_--theme(--color-black/70%),0_32px_64px_-16px_--theme(--color-black/80%)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
              <div className="flex min-w-0 flex-col">
                <DialogPrimitive.Title className="truncate font-heading font-semibold text-[15px] leading-tight">
                  {title}
                </DialogPrimitive.Title>
                {source ? (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {source.filename}.tsx
                  </span>
                ) : null}
              </div>
              <CopyButton
                value={source?.code ?? ""}
                disabled={!source}
                label="Copy code"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden bg-background">
              {source ? (
                <ScrollArea className="h-full">
                  <CodeBlock code={source.code} />
                </ScrollArea>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-muted-foreground text-sm">
                  Source file not found.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border/60 bg-background px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Install with shadcn
                </div>
                <button
                  type="button"
                  onClick={() => setSetupOpen((v) => !v)}
                  aria-expanded={setupOpen}
                  className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
                >
                  First time? Setup
                  <ChevronDownIcon
                    className={cn(
                      "size-3.5 transition-transform",
                      setupOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>

              {setupOpen ? (
                <div className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-background/40 p-2.5">
                  <div className="text-[11px] text-muted-foreground">
                    Run these once in your project, then any showcase install
                    works:
                  </div>
                  {SETUP_COMMANDS.map((cmd) => (
                    <div key={cmd.value} className="flex items-center gap-2">
                      <code className="min-w-0 flex-1 truncate rounded-md border border-border/60 bg-background px-2.5 py-1.5 font-mono text-[12px]">
                        {cmd.value}
                      </code>
                      <CopyButton value={cmd.value} label="Copy" />
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md border border-border/60 bg-background px-2.5 py-1.5 font-mono text-[12px]">
                  {installCommand}
                </code>
                <CopyButton value={installCommand} label="Copy command" />
              </div>
            </div>
          </DialogPrimitive.Popup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <Highlight code={code.trimEnd()} language="tsx" theme={themes.vsDark}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cn(
            "m-0 px-4 py-4 font-mono text-[12px] leading-[1.55]",
            className,
          )}
          style={{ ...style, background: "transparent" }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="table-row">
              <span className="table-cell select-none pr-4 text-right text-muted-foreground/40 tabular-nums">
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
  );
}

function CopyButton({
  value,
  label,
  disabled,
}: {
  value: string;
  label: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  const onCopy = () => {
    if (disabled || !value) return;
    void navigator.clipboard.writeText(value).then(() => setCopied(true));
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={onCopy}
      disabled={disabled}
      aria-label={label}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : label}
    </Button>
  );
}
