import {
  CheckIcon,
  ChevronDownIcon,
  HomeIcon,
  InboxIcon,
  KeyboardIcon,
  LayersIcon,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
} from "@orbit/ui/menu";
import { useDemo, type View } from "./store";

const NAV: { id: View; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "inbox", label: "Inbox", Icon: InboxIcon },
  { id: "projects", label: "Projects", Icon: LayersIcon },
  { id: "members", label: "Members", Icon: UsersIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

export function DemoSidebar() {
  const {
    view,
    setView,
    projects,
    threads,
    workspaces,
    currentWorkspaceId,
    switchWorkspace,
    members,
    setOverlay,
    pushToast,
    openProject,
  } = useDemo();
  const me = members[0]!;
  const ws = workspaces.find((w) => w.id === currentWorkspaceId)!;
  const unread = threads.filter((t) => t.unread).length;

  const stars = projects.filter((p) => p.starred);
  const rest = projects.filter((p) => !p.starred);

  return (
    <aside className="relative flex h-svh flex-col border-r border-border/60 bg-foreground/[0.02]">
      <Menu>
        <MenuTrigger
          render={
            <button
              type="button"
              className="flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3.5 text-left transition-colors hover:bg-foreground/[0.03]"
            />
          }
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className={`size-7 shrink-0 rounded-md ring-1 ring-border/60 ${ws.tone}`} />
            <div className="min-w-0">
              <div className="truncate font-medium text-sm leading-tight">{ws.name}</div>
              <div className="truncate font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-tight">
                {ws.plan} · {ws.members} members
              </div>
            </div>
          </div>
          <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
        </MenuTrigger>
        <MenuPopup align="start" className="w-60">
          <MenuGroup>
            <MenuGroupLabel>Workspaces</MenuGroupLabel>
            {workspaces.map((w) => (
              <MenuItem
                key={w.id}
                onClick={() => switchWorkspace(w.id)}
                className="gap-2.5"
              >
                <div className={`size-6 shrink-0 rounded-md ring-1 ring-border/60 ${w.tone}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{w.name}</div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    {w.plan} · {w.members}
                  </div>
                </div>
                {w.id === currentWorkspaceId ? (
                  <CheckIcon className="size-3.5 opacity-80" />
                ) : null}
              </MenuItem>
            ))}
          </MenuGroup>
          <MenuSeparator />
          <MenuItem
            onClick={() =>
              pushToast({ kind: "info", title: "New workspace flow — soon™" })
            }
          >
            <PlusIcon />
            New workspace
          </MenuItem>
        </MenuPopup>
      </Menu>

      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={() => setOverlay("palette")}
          className="flex w-full items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 text-left transition-colors hover:bg-background/80"
        >
          <SearchIcon className="size-3.5 opacity-50" />
          <span className="flex-1 truncate text-muted-foreground text-xs">
            Quick find…
          </span>
          <kbd className="rounded border border-border/60 bg-background/80 px-1 font-mono text-[9px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="mt-3 flex-1 overflow-y-auto px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setView(item.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  view === item.id
                    ? "bg-foreground/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <item.Icon className="size-4 opacity-70" />
                  {item.label}
                </span>
                {item.id === "inbox" && unread > 0 ? (
                  <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 font-mono text-[9px] text-foreground">
                    {unread}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        {stars.length > 0 ? (
          <>
            <SectionLabel>Starred</SectionLabel>
            <ul className="flex flex-col gap-0.5">
              {stars.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => openProject(p.id)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
                  >
                    <span className={`size-2 shrink-0 rounded-sm ${p.color}`} />
                    <span className="truncate">{p.name}</span>
                    <StarIcon className="ml-auto size-3 fill-amber-500 text-amber-500" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <SectionLabel>
          Projects
          <button
            type="button"
            onClick={() => setOverlay("new-project")}
            aria-label="New project"
            className="ml-auto rounded p-0.5 transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <PlusIcon className="size-3" />
          </button>
        </SectionLabel>
        <ul className="flex flex-col gap-0.5">
          {rest.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => openProject(p.id)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
              >
                <span className={`size-2 shrink-0 rounded-sm ${p.color}`} />
                <span className="truncate">{p.name}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setOverlay("new-project")}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground/70 text-xs transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
            >
              <PlusIcon className="size-3.5" />
              New project
            </button>
          </li>
        </ul>
      </nav>

      <Menu>
        <MenuTrigger
          render={
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-border/60 px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.03]"
            />
          }
        >
          <div className={`flex size-7 items-center justify-center rounded-full font-medium text-[11px] ${me.tone}`}>
            {me.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-sm">{me.name}</div>
            <div className="flex items-center gap-1.5 truncate text-muted-foreground text-xs">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Online
            </div>
          </div>
          <SettingsIcon className="size-4 opacity-40" />
        </MenuTrigger>
        <MenuPopup align="start" side="top" className="w-56">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className={`flex size-7 shrink-0 items-center justify-center rounded-full font-medium text-[11px] ${me.tone}`}>
              {me.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-sm">{me.name}</div>
              <div className="truncate font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                {me.email}
              </div>
            </div>
          </div>
          <MenuSeparator />
          <MenuItem onClick={() => setView("settings")}>
            <SettingsIcon />
            Settings
            <MenuShortcut>g s</MenuShortcut>
          </MenuItem>
          <MenuItem onClick={() => setOverlay("shortcuts")}>
            <KeyboardIcon />
            Keyboard shortcuts
            <MenuShortcut>?</MenuShortcut>
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            variant="destructive"
            onClick={() =>
              pushToast({ kind: "info", title: "Signed out (just kidding)." })
            }
          >
            <LogOutIcon />
            Sign out
          </MenuItem>
        </MenuPopup>
      </Menu>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 mb-1 flex items-center justify-between gap-2 px-2 font-mono text-[9px] text-muted-foreground/70 uppercase tracking-[0.25em]">
      {children}
    </div>
  );
}
