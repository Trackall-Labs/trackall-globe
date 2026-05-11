import {
  ArrowRightIcon,
  CornerDownLeftIcon,
  FileTextIcon,
  FolderIcon,
  GitBranchIcon,
  HashIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UserPlusIcon,
  ZapIcon,
} from "lucide-react";
import type { ComponentType } from "react";

export interface Cmd {
  label: string;
  hint?: string;
  Icon: ComponentType<{ className?: string }>;
  shortcut?: string;
  active?: boolean;
}

const GROUPS: { name: string; items: Cmd[] }[] = [
  {
    name: "Suggestions",
    items: [
      { label: "Create new project", Icon: PlusIcon, shortcut: "C P", active: true },
      { label: "Invite teammate", hint: "via email", Icon: UserPlusIcon, shortcut: "I" },
      { label: "Switch workspace", hint: "Acme inc.", Icon: ZapIcon, shortcut: "⌘⇧W" },
    ],
  },
  {
    name: "Jump to",
    items: [
      { label: "Onboarding handbook v3", hint: "Document", Icon: FileTextIcon },
      { label: "design-system", hint: "Project", Icon: FolderIcon },
      { label: "#design-crit", hint: "Channel", Icon: HashIcon },
      { label: "feat/audit-log", hint: "Branch", Icon: GitBranchIcon },
    ],
  },
  {
    name: "Settings",
    items: [
      { label: "Open profile settings", Icon: SettingsIcon, shortcut: "G P" },
      { label: "Manage API keys", Icon: SettingsIcon },
    ],
  },
];

export function ModalsCommandPaletteShowcasePage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div aria-hidden className="px-10 py-10 opacity-20">
        <div className="font-heading text-2xl">Workspace</div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-border/60 bg-background"
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 grid place-items-start bg-background/70 px-4 pt-24 backdrop-blur-md">
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-border bg-background/95 shadow-2xl">
          <div className="flex items-center gap-3 border-border/60 border-b px-4 py-3">
            <SearchIcon className="size-4 opacity-50" />
            <input
              defaultValue="cre"
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto py-1">
            {GROUPS.map((g) => (
              <div key={g.name} className="px-1.5 pb-1">
                <div className="px-3 py-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  {g.name}
                </div>
                <ul>
                  {g.items.map((c) => (
                    <li
                      key={c.label}
                      className={
                        "flex items-center gap-3 rounded-md px-3 py-2 " +
                        (c.active
                          ? "bg-foreground/[0.06] text-foreground"
                          : "text-foreground/85 hover:bg-foreground/[0.03]")
                      }
                    >
                      <c.Icon className="size-4 shrink-0 opacity-70" />
                      <span className="flex-1 truncate text-sm">
                        {c.label}
                        {c.hint ? (
                          <span className="ml-2 text-muted-foreground text-xs">
                            {c.hint}
                          </span>
                        ) : null}
                      </span>
                      {c.active ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                          <CornerDownLeftIcon className="size-3" />
                          go
                        </span>
                      ) : c.shortcut ? (
                        <span className="font-mono text-[10px] text-muted-foreground tracking-wide">
                          {c.shortcut}
                        </span>
                      ) : (
                        <ArrowRightIcon className="size-3.5 opacity-30" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-border/60 border-t px-4 py-2 text-muted-foreground text-xs">
            <span>Cmd-K</span>
            <span className="flex items-center gap-3 font-mono text-[10px]">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-border/60 px-1">↑</kbd>
                <kbd className="rounded border border-border/60 px-1">↓</kbd>
                navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-border/60 px-1">↵</kbd>
                select
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
