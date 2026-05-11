import { SearchIcon, XIcon } from "lucide-react";
import { Kbd, KbdGroup } from "@orbit/ui/kbd";

const GROUPS: { name: string; items: { keys: string[]; label: string }[] }[] = [
  {
    name: "General",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["⌘", "/"], label: "Show keyboard shortcuts" },
      { keys: ["G", "H"], label: "Go home" },
      { keys: ["G", "P"], label: "Go to projects" },
      { keys: ["G", "I"], label: "Go to inbox" },
    ],
  },
  {
    name: "Navigation",
    items: [
      { keys: ["J"], label: "Next item" },
      { keys: ["K"], label: "Previous item" },
      { keys: ["⌘", "↵"], label: "Open selected" },
      { keys: ["Esc"], label: "Close overlay" },
    ],
  },
  {
    name: "Editing",
    items: [
      { keys: ["⌘", "S"], label: "Save changes" },
      { keys: ["⌘", "Z"], label: "Undo" },
      { keys: ["⌘", "⇧", "Z"], label: "Redo" },
      { keys: ["⌘", "B"], label: "Bold" },
      { keys: ["⌘", "I"], label: "Italic" },
    ],
  },
  {
    name: "Issues",
    items: [
      { keys: ["C"], label: "New issue" },
      { keys: ["A"], label: "Assign to…" },
      { keys: ["L"], label: "Add label" },
      { keys: ["P"], label: "Set priority" },
      { keys: ["⌘", "⇧", "M"], label: "Mark as done" },
    ],
  },
];

export function ModalsShortcutsShowcasePage() {
  return (
    <div className="relative min-h-svh bg-background">
      <div aria-hidden className="px-10 py-10 opacity-25">
        <div className="font-heading text-2xl">Project board</div>
      </div>

      <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
        <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5">
            <div className="font-heading text-sm">Keyboard shortcuts</div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="border-border/60 border-b px-5 py-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5">
              <SearchIcon className="size-3.5 opacity-60" />
              <input
                placeholder="Search shortcuts…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {GROUPS.reduce((sum, g) => sum + g.items.length, 0)} total
              </span>
            </div>
          </div>

          <div className="grid max-h-[60vh] grid-cols-2 gap-x-8 overflow-y-auto px-5 py-4">
            {GROUPS.map((g) => (
              <div key={g.name} className="mb-6">
                <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  {g.name}
                </div>
                <ul className="flex flex-col">
                  {g.items.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-foreground/[0.03]"
                    >
                      <span className="text-sm">{s.label}</span>
                      <KbdGroup>
                        {s.keys.map((k, i) => (
                          <Kbd key={i}>{k}</Kbd>
                        ))}
                      </KbdGroup>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-border/60 border-t bg-background px-5 py-3 text-muted-foreground text-xs">
            <span>
              Press <Kbd>⌘</Kbd>
              <Kbd>/</Kbd> any time to reopen this list.
            </span>
            <span>v3.4 · 47 shortcuts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
