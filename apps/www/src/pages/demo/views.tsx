import { useState } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckCheckIcon,
  CheckIcon,
  CircleIcon,
  CopyIcon,
  ExternalLinkIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@orbit/ui/menu";
import { useDemo, type Member, type Project } from "./store";
import { InboxView } from "./views-inbox";
import { SettingsView } from "./views-settings";
import { ProjectDetailView } from "./views-project-detail";

export function DemoView() {
  const { view, selectedProjectId } = useDemo();
  if (view === "inbox") {
    return (
      <div className="flex-1 overflow-hidden">
        <InboxView />
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {view === "home" ? <HomeView /> : null}
      {view === "projects" ? (
        selectedProjectId ? <ProjectDetailView /> : <ProjectsView />
      ) : null}
      {view === "members" ? <MembersView /> : null}
      {view === "settings" ? <SettingsView /> : null}
    </div>
  );
}

function HomeView() {
  const { projects, members, setView, setOverlay, pushToast } = useDemo();
  const me = members[0]!;
  const greeting = greetForHour();
  return (
    <div className="mx-auto max-w-5xl">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        {todayLabel()}
      </div>
      <h1 className="mt-1 font-heading text-4xl tracking-tight">
        {greeting}, {me.name.split(" ")[0]}.
      </h1>
      <p className="mt-2 max-w-xl text-muted-foreground text-sm">
        {projects.length} projects, {members.length} teammates. ⌘K jumps
        anywhere.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="Active projects"
          value={String(projects.length)}
          sub="+1 this week"
          spark={[12, 14, 13, 16, 18, 22, 21, 24, 26, 28, 30, projects.length]}
        />
        <Stat
          label="Team members"
          value={String(members.length)}
          sub={`${members.filter((m) => m.status === "online").length} online`}
          spark={[8, 9, 11, 12, 12, 14, 15, 18, 19, 22, 24, members.length]}
        />
        <Stat
          label="Open threads"
          value="12"
          sub="3 mention you"
          spark={[20, 17, 15, 14, 16, 13, 14, 11, 13, 10, 12, 12]}
        />
        <Stat
          label="API requests"
          value="48k"
          sub="of 1M"
          spark={[24, 28, 30, 32, 34, 36, 38, 41, 43, 45, 47, 48]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[3fr_2fr]">
        <Card title="Today's tasks" trailing={
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => pushToast({ kind: "info", title: "Task added — soon™" })}
          >
            <PlusIcon />
            New
          </Button>
        }>
          <ul className="mt-3 flex flex-col">
            {[
              "Review Maya's audit log PR",
              "Sketch onboarding step 2",
              "Reply to Riya about bouncing invites",
              "Approve Q3 budget request",
              "Push Tuesday's release notes",
            ].map((t, i) => (
              <li
                key={t}
                className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-foreground/[0.03]"
              >
                <button
                  type="button"
                  className="flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground/30 text-transparent transition-colors hover:bg-foreground/[0.06]"
                  aria-label="Toggle"
                >
                  <CircleIcon className="size-3" />
                </button>
                <span className={`flex-1 truncate text-sm ${i === 4 ? "text-muted-foreground line-through" : ""}`}>
                  {t}
                </span>
                <span className="rounded bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                  {["API", "Onboarding", "Inbox", "Ops", "Marketing"][i]}
                </span>
                <span className="w-16 text-right font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                  {i < 3 ? "Today" : i === 3 ? "Tomorrow" : "Tomorrow"}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recent activity">
          <ul className="mt-3 flex flex-col gap-3.5">
            {[
              { who: "Maya", what: "deployed", target: "main → production", time: "2m" },
              { who: "James", what: "opened", target: "PR #128 — audit log", time: "8m" },
              { who: "Riya", what: "invited", target: "5 new members", time: "21m" },
              { who: "Dani", what: "archived", target: "marketing-v1 project", time: "1h" },
              { who: "Alex", what: "rolled back", target: "release 0.4.1", time: "2h" },
            ].map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-foreground/[0.06] font-medium text-[10px]">
                  {a.who[0]}
                </span>
                <div className="min-w-0 flex-1 leading-snug">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span>{" "}
                  <span className="text-foreground/85">{a.target}</span>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                    {a.time} ago
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ShortcutCard
          label="New project"
          onClick={() => setOverlay("new-project")}
        />
        <ShortcutCard
          label="Invite teammate"
          onClick={() => setOverlay("invite")}
        />
        <ShortcutCard
          label="Browse projects"
          onClick={() => setView("projects")}
        />
        <ShortcutCard
          label="Open palette"
          onClick={() => setOverlay("palette")}
          kbd="⌘K"
        />
      </div>
    </div>
  );
}

function ProjectsView() {
  const { projects, setOverlay, toggleStar, requestArchive, openProject, pushToast } = useDemo();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "starred" | Project["visibility"]>("all");

  const visible = projects.filter((p) => {
    if (query.trim() && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "all") return true;
    if (filter === "starred") return !!p.starred;
    return p.visibility === filter;
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Projects · {projects.length}
          </div>
          <h1 className="mt-1 font-heading text-3xl">Projects</h1>
        </div>
        <Button size="sm" type="button" onClick={() => setOverlay("new-project")}>
          <PlusIcon />
          New project
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex h-9 flex-1 min-w-[220px] items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3">
          <SearchIcon className="size-3.5 opacity-50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a project"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {(["all", "starred", "team", "private", "public"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border/70 bg-background/30 px-6 py-16 text-center">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            No matches
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            Try clearing your filters.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-foreground/[0.02]">
                <th className="w-10 px-3 py-2.5" />
                <th className="px-3 py-2.5 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Project
                </th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Visibility
                </th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Members
                </th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Updated
                </th>
                <th className="w-12 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr
                  key={p.id}
                  className="group border-b border-border/40 last:border-b-0 cursor-pointer transition-colors hover:bg-foreground/[0.02]"
                  onClick={() => openProject(p.id)}
                >
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(p.id);
                      }}
                      aria-label="Toggle star"
                      className="text-muted-foreground/40 transition-colors hover:text-amber-500"
                    >
                      <StarIcon
                        className={`size-3.5 ${p.starred ? "fill-amber-500 text-amber-500" : ""}`}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`size-2.5 rounded-sm ${p.color}`} />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <VisibilityPill v={p.visibility} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <UsersIcon className="size-3 opacity-60" />
                      {p.members}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">
                    {p.updatedAt}
                  </td>
                  <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Menu>
                      <MenuTrigger
                        render={
                          <button
                            type="button"
                            aria-label="More"
                            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-foreground/[0.05] hover:text-foreground data-[popup-open]:opacity-100"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </MenuTrigger>
                      <MenuPopup align="end" className="w-44">
                        <MenuItem onClick={() => openProject(p.id)}>
                          <ExternalLinkIcon />
                          Open
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            pushToast({
                              kind: "success",
                              title: "Link copied",
                              body: `Sharing "${p.name}".`,
                            })
                          }
                        >
                          <ShareIcon />
                          Share
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            pushToast({ kind: "info", title: "Duplicated (demo only)" })
                          }
                        >
                          <CopyIcon />
                          Duplicate
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem
                          variant="destructive"
                          onClick={() => requestArchive(p.id)}
                        >
                          <TrashIcon />
                          Archive
                        </MenuItem>
                      </MenuPopup>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MembersView() {
  const { members, setOverlay, setMemberRole, removeMember, pushToast } = useDemo();
  const [query, setQuery] = useState("");
  const visible = members.filter((m) =>
    !query.trim() || m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Members · {members.length}
          </div>
          <h1 className="mt-1 font-heading text-3xl">Team</h1>
        </div>
        <Button size="sm" type="button" onClick={() => setOverlay("invite")}>
          <PlusIcon />
          Invite
        </Button>
      </div>

      <div className="mt-6 flex h-9 max-w-md items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3">
        <SearchIcon className="size-3.5 opacity-50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find by name or email"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/60">
        <ul className="divide-y divide-border/40">
          {visible.map((m, i) => (
            <li key={m.id} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-foreground/[0.02]">
              <div className="relative">
                <div className={`flex size-9 items-center justify-center rounded-full font-medium text-xs ${m.tone}`}>
                  {m.initials}
                </div>
                <span
                  className={`absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-background ${
                    m.status === "online" ? "bg-emerald-500" : m.status === "away" ? "bg-amber-500" : "bg-muted-foreground/40"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-sm">{m.name}</span>
                  {i === 0 ? (
                    <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]">
                      You
                    </span>
                  ) : null}
                  {m.invited ? (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] text-amber-700 uppercase tracking-[0.2em] dark:text-amber-400">
                      Invited
                    </span>
                  ) : null}
                </div>
                <div className="truncate text-muted-foreground text-xs">{m.email}</div>
              </div>
              <div className="hidden font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] sm:block">
                {m.lastActive}
              </div>
              <RoleSelect
                value={m.role}
                disabled={i === 0}
                onChange={(role) => {
                  setMemberRole(m.id, role);
                  pushToast({ kind: "success", title: `${m.name} → ${role}` });
                }}
              />
              {i === 0 ? null : (
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => {
                    removeMember(m.id);
                    pushToast({ kind: "info", title: "Removed", body: `${m.name} no longer has access.` });
                  }}
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-foreground/[0.05] hover:text-destructive"
                >
                  <TrashIcon className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: Member["role"];
  onChange: (role: Member["role"]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as Member["role"])}
        className="h-8 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 font-mono text-[11px] uppercase tracking-[0.2em] outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24 disabled:opacity-40"
      >
        <option value="owner">Owner</option>
        <option value="admin">Admin</option>
        <option value="member">Member</option>
        <option value="viewer">Viewer</option>
      </select>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 opacity-60"
      >
        <polyline points="4 6 8 10 12 6" />
      </svg>
    </div>
  );
}

function VisibilityPill({ v }: { v: Project["visibility"] }) {
  const cfg =
    v === "public"
      ? { Icon: GlobeIcon, label: "Public", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" }
      : v === "team"
        ? { Icon: UsersIcon, label: "Team", className: "bg-foreground/[0.06] text-foreground" }
        : { Icon: LockIcon, label: "Private", className: "bg-foreground/[0.04] text-muted-foreground" };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] ${cfg.className}`}
    >
      <cfg.Icon className="size-2.5" />
      {cfg.label}
    </span>
  );
}

function Card({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          {title}
        </div>
        {trailing}
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  spark,
}: {
  label: string;
  value: string;
  sub: string;
  spark?: number[];
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {label}
      </div>
      <div className="mt-1.5 font-heading text-2xl">{value}</div>
      <div className="mt-1 inline-flex items-center gap-1 text-emerald-600 text-xs dark:text-emerald-400">
        <ArrowUpRightIcon className="size-3" />
        {sub}
      </div>
      {spark ? <Sparkline values={spark} /> : null}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const W = 120;
  const H = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = W / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = (1 - (v - min) / range) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1]!;
  const lastX = (values.length - 1) * stepX;
  const lastY = (1 - (last - min) / range) * H;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="-bottom-1 -right-1 absolute h-9 w-32 text-primary opacity-60"
    >
      <defs>
        <linearGradient id="spark-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0 ${H} L ${points.split(" ").join(" L ")} L ${W} ${H} Z`}
        fill="url(#spark-fade)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="1.6" fill="currentColor" />
    </svg>
  );
}

function ShortcutCard({
  label,
  onClick,
  kbd,
}: {
  label: string;
  onClick: () => void;
  kbd?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3.5 py-2.5 text-left transition-colors hover:border-foreground/40 hover:bg-background/60"
    >
      <span className="text-sm">{label}</span>
      {kbd ? (
        <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {kbd}
        </kbd>
      ) : (
        <ArrowRightIcon className="size-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-90" />
      )}
    </button>
  );
}

function todayLabel(): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(new Date());
  } catch {
    return "Today";
  }
}

function greetForHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Unused but useful: keep CheckCheckIcon import for downstream additions.
void CheckCheckIcon;
void CheckIcon;
