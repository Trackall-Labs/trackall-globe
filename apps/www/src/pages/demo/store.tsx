import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type View = "home" | "projects" | "members" | "inbox" | "settings";
export type SettingsTab = "general" | "appearance" | "members" | "danger";

export interface Project {
  id: string;
  name: string;
  color: string;
  visibility: "private" | "team" | "public";
  members: number;
  updatedAt: string;
  starred?: boolean;
  description?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "online" | "away" | "offline";
  initials: string;
  tone: string;
  lastActive: string;
  invited?: boolean;
}

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}

export interface Workspace {
  id: string;
  name: string;
  letter: string;
  tone: string;
  members: number;
  plan: "free" | "pro" | "team" | "enterprise";
}

export interface ThreadMessage {
  id: number;
  authorId: string;
  body: string;
  time: string;
  reactions?: { emoji: string; count: number; mine?: boolean }[];
}

export interface Thread {
  id: string;
  subject: string;
  participantIds: string[];
  unread: boolean;
  pinned?: boolean;
  preview: string;
  time: string;
  messages: ThreadMessage[];
}

export interface Notification {
  id: string;
  Icon: "deploy" | "comment" | "mention" | "invite" | "billing";
  title: string;
  body: string;
  time: string;
  read: boolean;
  bucket: "Today" | "Earlier";
}

export interface Issue {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "med" | "high";
  assigneeId: string;
  projectId: string;
  updatedAt: string;
}

export type Overlay =
  | "palette"
  | "new-project"
  | "invite"
  | "notifications"
  | "shortcuts"
  | "confirm-archive"
  | "workspace-switch"
  | null;

interface PendingArchive {
  projectId: string;
  name: string;
}

interface DemoStore {
  view: View;
  setView: (v: View) => void;

  selectedProjectId: string | null;
  openProject: (id: string) => void;
  closeProject: () => void;

  selectedThreadId: string | null;
  selectThread: (id: string) => void;

  settingsTab: SettingsTab;
  setSettingsTab: (t: SettingsTab) => void;

  workspaces: Workspace[];
  currentWorkspaceId: string;
  switchWorkspace: (id: string) => void;

  projects: Project[];
  addProject: (p: Omit<Project, "id" | "updatedAt" | "members">) => void;
  toggleStar: (id: string) => void;
  archiveProject: (id: string) => void;
  requestArchive: (id: string) => void;
  pendingArchive: PendingArchive | null;
  cancelArchive: () => void;

  members: Member[];
  addMembers: (rows: { email: string; role: Member["role"] }[]) => void;
  setMemberRole: (id: string, role: Member["role"]) => void;
  removeMember: (id: string) => void;

  threads: Thread[];
  sendReply: (threadId: string, body: string) => void;
  toggleReaction: (threadId: string, messageId: number, emoji: string) => void;
  markThreadRead: (id: string) => void;

  issues: Issue[];

  notifications: Notification[];
  unreadNotifications: number;
  markAllRead: () => void;
  toggleNotificationRead: (id: string) => void;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;

  overlay: Overlay;
  setOverlay: (o: Overlay) => void;

  checklistOpen: boolean;
  closeChecklist: () => void;
}

const TONES = [
  "bg-emerald-500/85 text-white",
  "bg-amber-500/85 text-white",
  "bg-violet-500/85 text-white",
  "bg-sky-500/85 text-white",
  "bg-rose-500/85 text-white",
  "bg-orange-500/85 text-white",
  "bg-cyan-500/85 text-white",
  "bg-pink-500/85 text-white",
];

const PROJECT_COLORS = [
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-cyan-500",
];

function tone(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return TONES[Math.abs(h) % TONES.length]!;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const SEED_WORKSPACES: Workspace[] = [
  {
    id: "ws_acme",
    name: "Acme inc.",
    letter: "A",
    tone: "bg-gradient-to-br from-primary/70 to-primary/30",
    members: 24,
    plan: "pro",
  },
  {
    id: "ws_blue",
    name: "Blueprint Co.",
    letter: "B",
    tone: "bg-gradient-to-br from-sky-500/70 to-sky-500/30",
    members: 6,
    plan: "free",
  },
  {
    id: "ws_meridian",
    name: "Meridian Studio",
    letter: "M",
    tone: "bg-gradient-to-br from-amber-500/70 to-amber-500/30",
    members: 14,
    plan: "team",
  },
];

const SEED_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Q3 planning",
    color: "bg-amber-500",
    visibility: "team",
    members: 4,
    updatedAt: "2h ago",
    starred: true,
    description: "Goals, headcount, and bets for July through September.",
  },
  {
    id: "p2",
    name: "Onboarding redesign",
    color: "bg-emerald-500",
    visibility: "team",
    members: 6,
    updatedAt: "yesterday",
    description: "Multi-step welcome flow and the first-run experience.",
  },
  {
    id: "p3",
    name: "Marketing site",
    color: "bg-violet-500",
    visibility: "public",
    members: 3,
    updatedAt: "Apr 22",
    description: "Public landing, pricing, and changelog refresh.",
  },
  {
    id: "p4",
    name: "API audit log",
    color: "bg-sky-500",
    visibility: "private",
    members: 2,
    updatedAt: "Apr 21",
    description: "Append-only ledger with workspace + admin scopes.",
  },
  {
    id: "p5",
    name: "Dust storm",
    color: "bg-rose-500",
    visibility: "private",
    members: 1,
    updatedAt: "Apr 18",
    description: "Spike: particle field rendering for dashboards.",
  },
];

const SEED_MEMBERS: Member[] = [
  { id: "m0", name: "Sean Brydon", email: "sean@cal.com", role: "owner", status: "online", initials: "SB", tone: "bg-foreground text-background", lastActive: "now" },
  { id: "m1", name: "Maya Okafor", email: "maya@acme.com", role: "admin", status: "online", initials: "MO", tone: TONES[0]!, lastActive: "2m ago" },
  { id: "m2", name: "James Lin", email: "james@acme.com", role: "member", status: "online", initials: "JL", tone: TONES[1]!, lastActive: "12m ago" },
  { id: "m3", name: "Riya Patel", email: "riya@acme.com", role: "member", status: "away", initials: "RP", tone: TONES[2]!, lastActive: "1h ago" },
  { id: "m4", name: "Dani Kim", email: "dani@acme.com", role: "member", status: "offline", initials: "DK", tone: TONES[3]!, lastActive: "yesterday" },
  { id: "m5", name: "Alex Tran", email: "alex@acme.com", role: "viewer", status: "offline", initials: "AT", tone: TONES[4]!, lastActive: "Apr 22" },
];

const SEED_THREADS: Thread[] = [
  {
    id: "t1",
    subject: "Audit log query rewrite",
    participantIds: ["m1", "m2", "m0"],
    unread: true,
    pinned: true,
    preview: "Pushed the new query — the 30d aggregate runs in ~120ms now.",
    time: "2m",
    messages: [
      { id: 1, authorId: "m1", time: "2h", body: "Pushed the new audit log query. The aggregate over the last 30 days comes back in ~120ms on the prod replica — I think we can ship.", reactions: [{ emoji: "🚀", count: 3, mine: true }, { emoji: "👀", count: 1 }] },
      { id: 2, authorId: "m2", time: "1h", body: "Nice. Can you paste the query plan? Want to make sure it's still using the (workspace_id, created_at) index.", reactions: [{ emoji: "👍", count: 1 }] },
      { id: 3, authorId: "m1", time: "44m", body: "Plan attached — index in use. Idempotent re-runs too, tested against staging this morning." },
      { id: 4, authorId: "m0", time: "2m", body: "+1 from me. Land it tonight after CI passes." },
    ],
  },
  {
    id: "t2",
    subject: "Bouncing invite emails",
    participantIds: ["m3", "m1"],
    unread: true,
    preview: "Sender domain mismatch — needs SPF realignment.",
    time: "1h",
    messages: [
      { id: 1, authorId: "m3", time: "1h", body: "Heads up — invite emails are bouncing for big-corp.com. Looks like SPF realignment on our end." },
      { id: 2, authorId: "m1", time: "55m", body: "On it — opening a ticket with Resend." },
    ],
  },
  {
    id: "t3",
    subject: "Pricing page copy",
    participantIds: ["m4", "m0"],
    unread: false,
    preview: "Tightened the hero — your eyes welcome.",
    time: "yesterday",
    messages: [
      { id: 1, authorId: "m4", time: "yesterday", body: "Pricing page copy is ready for your eyes — tightened the hero, simpler comparison table." },
    ],
  },
  {
    id: "t4",
    subject: "Q3 budget request",
    participantIds: ["m5"],
    unread: false,
    preview: "Submitted — needs approval before Friday.",
    time: "Mon",
    messages: [
      { id: 1, authorId: "m5", time: "Mon", body: "Submitted the Q3 budget — needs approval before Friday for procurement timing." },
    ],
  },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", Icon: "mention", title: "Maya mentioned you", body: "Audit log thread · 2m ago", time: "2m", read: false, bucket: "Today" },
  { id: "n2", Icon: "deploy", title: "Deploy succeeded", body: "main → production · 8m ago", time: "8m", read: false, bucket: "Today" },
  { id: "n3", Icon: "invite", title: "Riya invited 5 people", body: "21m ago", time: "21m", read: false, bucket: "Today" },
  { id: "n4", Icon: "comment", title: "James replied to a thread", body: "Bouncing invite emails · 55m ago", time: "55m", read: true, bucket: "Today" },
  { id: "n5", Icon: "deploy", title: "Deploy rolled back", body: "release 0.4.1 · 2h ago", time: "2h", read: true, bucket: "Today" },
  { id: "n6", Icon: "billing", title: "Invoice paid", body: "INV-2026-04 · yesterday", time: "1d", read: true, bucket: "Earlier" },
  { id: "n7", Icon: "mention", title: "Dani mentioned you", body: "Pricing page copy · yesterday", time: "1d", read: true, bucket: "Earlier" },
];

const SEED_ISSUES: Issue[] = [
  { id: "i1", title: "Validate the rollback path with a dry run", status: "in-progress", priority: "high", assigneeId: "m1", projectId: "p4", updatedAt: "2h ago" },
  { id: "i2", title: "Move audit log retention into env", status: "todo", priority: "med", assigneeId: "m2", projectId: "p4", updatedAt: "yesterday" },
  { id: "i3", title: "Add E2E for invite redemption", status: "review", priority: "med", assigneeId: "m3", projectId: "p4", updatedAt: "Apr 22" },
  { id: "i4", title: "Refactor scope-set parser", status: "done", priority: "low", assigneeId: "m1", projectId: "p4", updatedAt: "Apr 21" },
  { id: "i5", title: "Welcome carousel — copy pass 2", status: "in-progress", priority: "med", assigneeId: "m4", projectId: "p2", updatedAt: "12m ago" },
  { id: "i6", title: "Empty inbox illustration", status: "review", priority: "low", assigneeId: "m4", projectId: "p2", updatedAt: "1h ago" },
  { id: "i7", title: "Q3 budget review meeting", status: "todo", priority: "high", assigneeId: "m0", projectId: "p1", updatedAt: "yesterday" },
  { id: "i8", title: "Hire designer (sourcing)", status: "in-progress", priority: "med", assigneeId: "m0", projectId: "p1", updatedAt: "Mon" },
  { id: "i9", title: "Particle field perf on Safari", status: "todo", priority: "high", assigneeId: "m1", projectId: "p5", updatedAt: "Apr 18" },
];

const Ctx = createContext<DemoStore | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("home");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>("t1");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("general");
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState("ws_acme");

  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [issues] = useState<Issue[]>(SEED_ISSUES);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [pendingArchive, setPendingArchive] = useState<PendingArchive | null>(null);

  const pushToast: DemoStore["pushToast"] = useCallback((t) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((ts) => [...ts, { ...t, id }]);
    window.setTimeout(() => {
      setToasts((ts) => ts.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  const dismissToast: DemoStore["dismissToast"] = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const addProject: DemoStore["addProject"] = useCallback((p) => {
    const id = `p_${Date.now()}`;
    setProjects((ps) => [
      { ...p, id, members: 1, updatedAt: "just now" },
      ...ps,
    ]);
  }, []);

  const toggleStar: DemoStore["toggleStar"] = useCallback((id) => {
    setProjects((ps) =>
      ps.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)),
    );
  }, []);

  const archiveProject: DemoStore["archiveProject"] = useCallback((id) => {
    setProjects((ps) => ps.filter((p) => p.id !== id));
  }, []);

  const requestArchive: DemoStore["requestArchive"] = useCallback(
    (id) => {
      const p = projects.find((p) => p.id === id);
      if (!p) return;
      setPendingArchive({ projectId: id, name: p.name });
      setOverlay("confirm-archive");
    },
    [projects],
  );

  const cancelArchive: DemoStore["cancelArchive"] = useCallback(() => {
    setPendingArchive(null);
  }, []);

  const addMembers: DemoStore["addMembers"] = useCallback((rows) => {
    setMembers((ms) => [
      ...ms,
      ...rows.map((r, i) => {
        const name = r.email.split("@")[0]!.replace(/[._-]/g, " ");
        const niceName = name
          .split(" ")
          .map((p) => p[0]!.toUpperCase() + p.slice(1))
          .join(" ");
        return {
          id: `m_${Date.now()}_${i}`,
          name: niceName,
          email: r.email,
          role: r.role,
          status: "offline" as const,
          initials: initials(niceName),
          tone: tone(r.email),
          lastActive: "—",
          invited: true,
        };
      }),
    ]);
  }, []);

  const setMemberRole: DemoStore["setMemberRole"] = useCallback((id, role) => {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, role } : m)));
  }, []);

  const removeMember: DemoStore["removeMember"] = useCallback((id) => {
    setMembers((ms) => ms.filter((m) => m.id !== id));
  }, []);

  const sendReply: DemoStore["sendReply"] = useCallback((threadId, body) => {
    setThreads((ts) =>
      ts.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id: t.messages.length + 1,
                  authorId: "m0",
                  body,
                  time: "now",
                },
              ],
              preview: body,
              time: "now",
              unread: false,
            }
          : t,
      ),
    );
  }, []);

  const toggleReaction: DemoStore["toggleReaction"] = useCallback(
    (threadId, messageId, emoji) => {
      setThreads((ts) =>
        ts.map((t) => {
          if (t.id !== threadId) return t;
          return {
            ...t,
            messages: t.messages.map((m) => {
              if (m.id !== messageId) return m;
              const existing = m.reactions ?? [];
              const idx = existing.findIndex((r) => r.emoji === emoji);
              if (idx === -1) {
                return {
                  ...m,
                  reactions: [...existing, { emoji, count: 1, mine: true }],
                };
              }
              const r = existing[idx]!;
              const next = r.mine
                ? r.count <= 1
                  ? null
                  : { ...r, count: r.count - 1, mine: false }
                : { ...r, count: r.count + 1, mine: true };
              const updated = next
                ? existing.map((x, i) => (i === idx ? next : x))
                : existing.filter((_, i) => i !== idx);
              return { ...m, reactions: updated };
            }),
          };
        }),
      );
    },
    [],
  );

  const markThreadRead: DemoStore["markThreadRead"] = useCallback((id) => {
    setThreads((ts) =>
      ts.map((t) => (t.id === id ? { ...t, unread: false } : t)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }, []);

  const toggleNotificationRead = useCallback((id: string) => {
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  }, []);

  const switchWorkspace: DemoStore["switchWorkspace"] = useCallback(
    (id) => {
      setCurrentWorkspaceId(id);
      pushToast({
        kind: "info",
        title: "Switched workspace",
        body: SEED_WORKSPACES.find((w) => w.id === id)?.name ?? "",
      });
    },
    [pushToast],
  );

  const openProject: DemoStore["openProject"] = useCallback((id) => {
    setView("projects");
    setSelectedProjectId(id);
  }, []);

  const closeProject = useCallback(() => setSelectedProjectId(null), []);

  const selectThread: DemoStore["selectThread"] = useCallback(
    (id) => {
      setSelectedThreadId(id);
      setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, unread: false } : t)));
    },
    [],
  );

  const value = useMemo<DemoStore>(
    () => ({
      view,
      setView: (v) => {
        setView(v);
        if (v !== "projects") setSelectedProjectId(null);
      },
      selectedProjectId,
      openProject,
      closeProject,
      selectedThreadId,
      selectThread,
      settingsTab,
      setSettingsTab,
      workspaces: SEED_WORKSPACES,
      currentWorkspaceId,
      switchWorkspace,
      projects,
      addProject,
      toggleStar,
      archiveProject,
      requestArchive,
      pendingArchive,
      cancelArchive,
      members,
      addMembers,
      setMemberRole,
      removeMember,
      threads,
      sendReply,
      toggleReaction,
      markThreadRead,
      issues,
      notifications,
      unreadNotifications: notifications.filter((n) => !n.read).length,
      markAllRead,
      toggleNotificationRead,
      toasts,
      pushToast,
      dismissToast,
      overlay,
      setOverlay,
      checklistOpen,
      closeChecklist: () => setChecklistOpen(false),
    }),
    [
      view,
      selectedProjectId,
      openProject,
      closeProject,
      selectedThreadId,
      selectThread,
      settingsTab,
      currentWorkspaceId,
      switchWorkspace,
      projects,
      addProject,
      toggleStar,
      archiveProject,
      requestArchive,
      pendingArchive,
      cancelArchive,
      members,
      addMembers,
      setMemberRole,
      removeMember,
      threads,
      sendReply,
      toggleReaction,
      markThreadRead,
      issues,
      notifications,
      markAllRead,
      toggleNotificationRead,
      toasts,
      pushToast,
      dismissToast,
      overlay,
      checklistOpen,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo(): DemoStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemo must be used within <DemoProvider>");
  return ctx;
}

export { PROJECT_COLORS };
