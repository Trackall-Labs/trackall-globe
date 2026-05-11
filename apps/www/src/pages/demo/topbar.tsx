import { ArrowLeftIcon, BellIcon, KeyboardIcon, SearchIcon } from "lucide-react";
import { ThemeToggle } from "@orbit/ui/theme-toggle";
import { useDemo } from "./store";

const TITLES: Record<string, { eyebrow: string; title: string }> = {
  home: { eyebrow: "Workspace · Acme inc.", title: "Home" },
  projects: { eyebrow: "Workspace · Acme inc.", title: "Projects" },
  members: { eyebrow: "Workspace · Acme inc.", title: "Members" },
  inbox: { eyebrow: "Workspace · Acme inc.", title: "Inbox" },
  settings: { eyebrow: "Workspace · Acme inc.", title: "Settings" },
};

export function DemoTopbar() {
  const {
    view,
    selectedProjectId,
    closeProject,
    projects,
    setOverlay,
    unreadNotifications,
  } = useDemo();
  const meta = TITLES[view]!;
  const project =
    view === "projects" && selectedProjectId
      ? projects.find((p) => p.id === selectedProjectId)
      : null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        {project ? (
          <button
            type="button"
            onClick={closeProject}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3" />
            Projects
          </button>
        ) : null}
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            {project ? `Project · ${project.visibility}` : meta.eyebrow}
          </div>
          <div className="flex items-center gap-2 font-medium text-sm">
            {project ? (
              <>
                <span className={`size-2 rounded-sm ${project.color}`} />
                {project.name}
              </>
            ) : (
              meta.title
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOverlay("palette")}
          className="hidden items-center gap-2 rounded-md border border-border/70 bg-background/40 px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground sm:flex"
        >
          <SearchIcon className="size-3.5" />
          <span>Search…</span>
          <kbd className="rounded border border-border/60 bg-background/80 px-1 py-0.5 font-mono text-[9px]">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setOverlay("shortcuts")}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts"
          className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <KeyboardIcon className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setOverlay("notifications")}
          aria-label="Notifications"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <BellIcon className="size-4" />
          {unreadNotifications > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex size-3.5 items-center justify-center rounded-full bg-destructive font-medium text-[8px] text-destructive-foreground ring-2 ring-background">
              {unreadNotifications}
            </span>
          ) : null}
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
