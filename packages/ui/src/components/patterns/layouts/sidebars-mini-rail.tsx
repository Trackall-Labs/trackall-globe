import {
  BellIcon,
  CompassIcon,
  HomeIcon,
  InboxIcon,
  LayersIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

const ITEMS = [
  { icon: HomeIcon, label: "Home" },
  { icon: InboxIcon, label: "Inbox", badge: 4 },
  { icon: BellIcon, label: "Activity" },
  { icon: LayersIcon, label: "Projects", active: true },
  { icon: UsersIcon, label: "People" },
  { icon: CompassIcon, label: "Discover" },
];

const WORKSPACES = [
  { letter: "A", color: "bg-gradient-to-br from-primary/70 to-primary/30", active: true },
  { letter: "B", color: "bg-gradient-to-br from-emerald-500/70 to-emerald-500/30" },
  { letter: "M", color: "bg-gradient-to-br from-amber-500/70 to-amber-500/30" },
];

export function SidebarsMiniRailShowcasePage() {
  return (
    <div className="grid min-h-svh grid-cols-[60px_1fr] bg-background text-foreground">
      <aside className="flex h-svh flex-col items-center border-r border-border/60 bg-foreground/[0.02] py-3">
        <ul className="flex flex-col items-center gap-1.5">
          {WORKSPACES.map((w, i) => (
            <li key={i} className="relative">
              <button
                type="button"
                className={`flex size-9 items-center justify-center rounded-lg font-medium text-[12px] text-foreground/85 transition-transform hover:scale-105 ${w.color}`}
                title="Workspace"
              >
                {w.letter}
              </button>
              {w.active ? (
                <span className="-translate-y-1/2 absolute top-1/2 -left-3 h-5 w-1 rounded-r-full bg-foreground" />
              ) : null}
            </li>
          ))}
          <li>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg border border-dashed border-border/70 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              aria-label="Add workspace"
            >
              <PlusIcon className="size-4" />
            </button>
          </li>
        </ul>

        <div className="my-4 h-px w-7 bg-border/60" />

        <ul className="flex flex-1 flex-col items-center gap-1">
          {ITEMS.map((item) => (
            <li key={item.label} className="relative">
              <button
                type="button"
                title={item.label}
                className={`group flex size-9 items-center justify-center rounded-lg transition-colors ${
                  item.active
                    ? "bg-foreground/[0.08] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
              </button>
              {item.active ? (
                <span className="-translate-y-1/2 absolute top-1/2 -left-3 h-5 w-1 rounded-r-full bg-foreground" />
              ) : null}
              {item.badge ? (
                <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-destructive font-medium text-[8px] text-destructive-foreground ring-2 ring-background">
                  {item.badge}
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            aria-label="Settings"
          >
            <SettingsIcon className="size-4" />
          </button>
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground font-medium text-[11px] text-background ring-2 ring-background">
            S
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em]">
            Main pane
          </div>
          <p className="mt-1.5 text-sm">Mini rail — hover for tooltips.</p>
        </div>
      </main>
    </div>
  );
}
