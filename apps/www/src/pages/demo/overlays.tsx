import { type FormEvent, useEffect, useState } from "react";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCheckIcon,
  CheckIcon,
  CommandIcon,
  CornerDownLeftIcon,
  GlobeIcon,
  HomeIcon,
  InboxIcon,
  InfoIcon,
  KeyboardIcon,
  LayersIcon,
  LockIcon,
  PlusIcon,
  SettingsIcon,
  SunMoonIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@orbit/ui/dialog";
import { Input } from "@orbit/ui/input";
import { Label } from "@orbit/ui/label";
import { Textarea } from "@orbit/ui/textarea";
import { useTheme } from "@orbit/ui/theme-provider";
import {
  ConfirmArchiveAlert,
  NotificationsSheet,
  ShortcutsDialog,
} from "./overlays-extra";
import { PROJECT_COLORS, useDemo, type Member } from "./store";

export function DemoOverlays() {
  return (
    <>
      <ToastHost />
      <Checklist />
      <CommandPalette />
      <NewProjectDialog />
      <InviteDialog />
      <NotificationsSheet />
      <ShortcutsDialog />
      <ConfirmArchiveAlert />
    </>
  );
}

function ToastHost() {
  const { toasts, dismissToast } = useDemo();
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[80] flex w-[360px] flex-col gap-2">
      {toasts.map((t) => {
        const Icon =
          t.kind === "success"
            ? CheckCheckIcon
            : t.kind === "error"
              ? AlertCircleIcon
              : InfoIcon;
        const tone =
          t.kind === "success"
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15"
            : t.kind === "error"
              ? "text-rose-600 dark:text-rose-400 bg-rose-500/15"
              : "text-foreground bg-foreground/[0.08]";
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border/70 bg-background px-3.5 py-3 shadow-lg"
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full ${tone}`}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">{t.title}</div>
              {t.body ? (
                <p className="mt-0.5 truncate text-muted-foreground text-xs">
                  {t.body}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(t.id)}
              className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Checklist() {
  const { checklistOpen, closeChecklist, projects, members } = useDemo();
  if (!checklistOpen) return null;

  const items = [
    { label: "Create a project", done: projects.length > 5, hint: "Press N" },
    { label: "Invite a teammate", done: members.some((m) => m.invited), hint: "Press I" },
    { label: "Try the command palette", done: false, hint: "⌘K" },
    { label: "Switch the theme", done: false, hint: "Press T" },
  ];
  const done = items.filter((i) => i.done).length;
  const pct = (done / items.length) * 100;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 overflow-hidden rounded-xl border border-border/70 bg-background shadow-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <div className="font-medium text-sm">Try a few things</div>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            {done} of {items.length}
          </p>
        </div>
        <div className="relative size-8">
          <svg viewBox="0 0 36 36" className="size-8 -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" className="stroke-foreground/10" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              className="stroke-foreground transition-[stroke-dashoffset]"
              strokeWidth="3"
              strokeDasharray={`${(pct / 100) * 88} 88`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px]">
            {Math.round(pct)}%
          </span>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={closeChecklist}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>
      <ul className="divide-y divide-border/40 border-t border-border/60">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-3 px-4 py-2.5">
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                it.done
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "border border-foreground/30"
              }`}
            >
              {it.done ? <CheckIcon className="size-3" /> : null}
            </span>
            <span className={`flex-1 text-sm ${it.done ? "text-muted-foreground line-through" : ""}`}>
              {it.label}
            </span>
            <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              {it.hint}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommandPalette() {
  const {
    overlay,
    setOverlay,
    setView,
    projects,
    members,
    pushToast,
  } = useDemo();
  const { toggleLightDark } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const open = overlay === "palette";

  type Cmd = {
    id: string;
    label: string;
    hint?: string;
    kbd?: string[];
    Icon: React.ComponentType<{ className?: string }>;
    section: string;
    run: () => void;
  };

  const commands: Cmd[] = [
    { id: "go-home", label: "Go to home", Icon: HomeIcon, section: "Navigate", kbd: ["G", "H"], run: () => { setView("home"); setOverlay(null); } },
    { id: "go-projects", label: "Go to projects", Icon: LayersIcon, section: "Navigate", kbd: ["G", "P"], run: () => { setView("projects"); setOverlay(null); } },
    { id: "go-members", label: "Go to members", Icon: UsersIcon, section: "Navigate", kbd: ["G", "M"], run: () => { setView("members"); setOverlay(null); } },
    { id: "go-inbox", label: "Go to inbox", Icon: InboxIcon, section: "Navigate", kbd: ["G", "I"], run: () => { setView("inbox"); setOverlay(null); } },
    { id: "go-settings", label: "Go to settings", Icon: SettingsIcon, section: "Navigate", kbd: ["G", "S"], run: () => { setView("settings"); setOverlay(null); } },
    { id: "shortcuts", label: "Show keyboard shortcuts", Icon: KeyboardIcon, section: "Actions", kbd: ["?"], run: () => setOverlay("shortcuts") },
    { id: "new-project", label: "New project…", Icon: PlusIcon, section: "Actions", kbd: ["N"], run: () => setOverlay("new-project") },
    { id: "invite", label: "Invite teammates…", Icon: UsersIcon, section: "Actions", kbd: ["I"], run: () => setOverlay("invite") },
    { id: "theme", label: "Toggle theme", Icon: SunMoonIcon, section: "Actions", kbd: ["T"], run: () => { toggleLightDark(); setOverlay(null); } },
    { id: "settings-action", label: "Open settings", Icon: SettingsIcon, section: "Actions", run: () => { setOverlay(null); pushToast({ kind: "info", title: "Settings would open here." }); } },
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      label: p.name,
      hint: "Project",
      Icon: LayersIcon,
      section: "Projects",
      run: () => { setView("projects"); setOverlay(null); },
    })),
    ...members.slice(0, 8).map((m) => ({
      id: `mem-${m.id}`,
      label: m.name,
      hint: m.email,
      Icon: UsersIcon,
      section: "Members",
      run: () => { setView("members"); setOverlay(null); },
    })),
  ];

  const filtered = commands.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.label.toLowerCase().includes(q) || (c.hint?.toLowerCase().includes(q) ?? false);
  });

  useEffect(() => {
    if (active >= filtered.length) setActive(Math.max(0, filtered.length - 1));
  }, [filtered.length, active]);

  // Reset query whenever the palette closes.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const sections: { name: string; items: Cmd[] }[] = [];
  for (const c of filtered) {
    let s = sections.find((s) => s.name === c.section);
    if (!s) {
      s = { name: c.section, items: [] };
      sections.push(s);
    }
    s.items.push(c);
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => setOverlay(o ? "palette" : null)}>
      <DialogPopup
        showCloseButton={false}
        className="!max-w-xl !p-0 !rounded-2xl"
      >
        {/* Hidden title for a11y; coss requires the title element exist. */}
        <DialogHeader className="sr-only !p-0">
          <DialogTitle>Command palette</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <CommandIcon className="size-4 opacity-60" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search projects, members, actions…"
            className="h-7 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            esc
          </kbd>
        </div>

        <div className="max-h-[420px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-muted-foreground text-sm">No matches for "{query}".</p>
            </div>
          ) : (
            sections.map((s) => (
              <div key={s.name}>
                <div className="px-4 pt-3 pb-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  {s.name}
                </div>
                <ul>
                  {s.items.map((c) => {
                    const idx = filtered.indexOf(c);
                    const isActive = idx === active;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => c.run()}
                          className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                            isActive ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.03]"
                          }`}
                        >
                          <c.Icon className="size-4 shrink-0 opacity-70" />
                          <span className="flex-1 truncate text-sm">{c.label}</span>
                          {c.hint ? (
                            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
                              {c.hint}
                            </span>
                          ) : null}
                          {c.kbd ? (
                            <span className="flex items-center gap-1">
                              {c.kbd.map((k, i) => (
                                <kbd key={i} className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                  {k}
                                </kbd>
                              ))}
                            </span>
                          ) : null}
                          {isActive && !c.kbd ? (
                            <CornerDownLeftIcon className="size-3.5 opacity-60" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-foreground/[0.02] px-4 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border/60 bg-background/80 px-1 py-0.5 normal-case">↑</kbd>
              <kbd className="rounded border border-border/60 bg-background/80 px-1 py-0.5 normal-case">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border/60 bg-background/80 px-1 py-0.5 normal-case">↵</kbd>
              run
            </span>
          </div>
          <span>{filtered.length} results</span>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

function NewProjectDialog() {
  const { overlay, setOverlay, addProject, pushToast } = useDemo();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]!);
  const [visibility, setVisibility] = useState<"private" | "team" | "public">("team");
  const open = overlay === "new-project";

  // Reset form on close.
  useEffect(() => {
    if (!open) {
      setName("");
      setColor(PROJECT_COLORS[0]!);
      setVisibility("team");
    }
  }, [open]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProject({ name: name.trim(), color, visibility });
    pushToast({
      kind: "success",
      title: "Project created",
      body: `"${name.trim()}" is ready.`,
    });
    setOverlay(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => setOverlay(o ? "new-project" : null)}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="contents">
          <DialogPanel className="space-y-5 px-6 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="np-name">Name</Label>
              <Input
                id="np-name"
                placeholder="e.g. Q4 launch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                nativeInput
              />
            </div>

            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em]">
                Color
              </Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={c}
                    className={`relative flex size-8 items-center justify-center rounded-md ${c} transition-transform ${
                      color === c
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                  >
                    {color === c ? <CheckIcon className="size-4 text-white" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em]">
                Visibility
              </Label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <VisibilityCard id="private" label="Private" description="Just you." Icon={LockIcon} active={visibility === "private"} onSelect={setVisibility} />
                <VisibilityCard id="team" label="Team" description="Workspace members." Icon={UsersIcon} active={visibility === "team"} onSelect={setVisibility} />
                <VisibilityCard id="public" label="Public" description="Anyone with link." Icon={GlobeIcon} active={visibility === "public"} onSelect={setVisibility} />
              </div>
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOverlay(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
              <ArrowRightIcon />
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

function VisibilityCard({
  id,
  label,
  description,
  Icon,
  active,
  onSelect,
}: {
  id: "private" | "team" | "public";
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onSelect: (v: "private" | "team" | "public") => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors ${
        active
          ? "border-foreground/60 bg-foreground/[0.04]"
          : "border-border/60 bg-background/40 hover:border-border"
      }`}
    >
      <Icon className="size-4 opacity-80" />
      <div>
        <div className="font-medium text-xs">{label}</div>
        <p className="mt-0.5 text-muted-foreground text-[10px] leading-snug">{description}</p>
      </div>
    </button>
  );
}

function InviteDialog() {
  const { overlay, setOverlay, addMembers, pushToast } = useDemo();
  const [rows, setRows] = useState<{ id: number; email: string; role: Member["role"] }[]>([
    { id: 1, email: "", role: "member" },
    { id: 2, email: "", role: "member" },
  ]);
  const [message, setMessage] = useState("");
  const open = overlay === "invite";

  useEffect(() => {
    if (!open) {
      setRows([
        { id: 1, email: "", role: "member" },
        { id: 2, email: "", role: "member" },
      ]);
      setMessage("");
    }
  }, [open]);

  const filled = rows.filter((r) => r.email.trim()).length;
  const addRow = () => setRows((rs) => [...rs, { id: Date.now(), email: "", role: "member" }]);
  const removeRow = (id: number) => setRows((rs) => (rs.length === 1 ? rs : rs.filter((r) => r.id !== id)));
  const change = (id: number, patch: Partial<{ email: string; role: Member["role"] }>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valid = rows.filter((r) => r.email.trim());
    if (valid.length === 0) return;
    addMembers(valid.map((r) => ({ email: r.email.trim(), role: r.role })));
    pushToast({
      kind: "success",
      title: `Sent ${valid.length} invite${valid.length === 1 ? "" : "s"}`,
      body: "They'll show up in members once accepted.",
    });
    setOverlay(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => setOverlay(o ? "invite" : null)}>
      <DialogPopup className="!max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite teammates</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="contents">
          <DialogPanel className="px-6 py-2">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em]">
                Invitees
              </Label>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                {filled}/{rows.length} ready
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {rows.map((r) => (
                <li key={r.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={r.email}
                    onChange={(e) => change(r.id, { email: e.target.value })}
                    nativeInput
                  />
                  <div className="relative">
                    <select
                      value={r.role}
                      onChange={(e) => change(r.id, { role: e.target.value as Member["role"] })}
                      className="h-9 appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 opacity-60">
                      <polyline points="4 6 8 10 12 6" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(r.id)}
                    disabled={rows.length === 1}
                    aria-label="Remove"
                    className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    <XIcon className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="ghost" type="button" onClick={addRow} className="mt-3">
              <PlusIcon />
              Add another
            </Button>

            <div className="mt-5 flex flex-col gap-1.5">
              <Label htmlFor="invite-msg">
                Message <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="invite-msg"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey — joining us in the workspace."
              />
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOverlay(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={filled === 0}>
              Send {filled || ""} invite{filled === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
