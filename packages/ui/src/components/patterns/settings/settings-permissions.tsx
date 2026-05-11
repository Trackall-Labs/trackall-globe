import { useMemo, useState } from "react";
import {
  CheckIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Separator } from "@orbit/ui/separator";
import { Switch } from "@orbit/ui/switch";

export type RoleId = "owner" | "admin" | "editor" | "viewer" | "guest";
export type CellState = "yes" | "no" | "na";

export interface RoleDef {
  id: RoleId;
  name: string;
  members: number;
  description: string;
  tone: string;
}

const ROLES: RoleDef[] = [
  {
    id: "owner",
    name: "Owner",
    members: 2,
    description: "Full control, including billing and deletion.",
    tone: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  },
  {
    id: "admin",
    name: "Admin",
    members: 6,
    description: "Manage members, settings, and integrations.",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  },
  {
    id: "editor",
    name: "Editor",
    members: 24,
    description: "Create and edit content. No member or billing access.",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  },
  {
    id: "viewer",
    name: "Viewer",
    members: 41,
    description: "Read-only access to documents and dashboards.",
    tone: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  },
  {
    id: "guest",
    name: "Guest",
    members: 13,
    description: "Limited, time-bound access to specific resources.",
    tone: "bg-foreground/[0.08] text-muted-foreground",
  },
];

export interface Capability {
  id: string;
  label: string;
  hint?: string;
  perms: Record<RoleId, CellState>;
}

export interface CapabilityGroup {
  id: string;
  label: string;
  capabilities: Capability[];
}

const GROUPS: CapabilityGroup[] = [
  {
    id: "documents",
    label: "Documents",
    capabilities: [
      {
        id: "doc.view",
        label: "View documents",
        hint: "Read pages, comments, and attachments.",
        perms: { owner: "yes", admin: "yes", editor: "yes", viewer: "yes", guest: "yes" },
      },
      {
        id: "doc.create",
        label: "Create documents",
        perms: { owner: "yes", admin: "yes", editor: "yes", viewer: "no", guest: "no" },
      },
      {
        id: "doc.edit",
        label: "Edit documents",
        perms: { owner: "yes", admin: "yes", editor: "yes", viewer: "no", guest: "no" },
      },
      {
        id: "doc.delete",
        label: "Delete documents",
        hint: "Soft-delete with 30-day recovery.",
        perms: { owner: "yes", admin: "yes", editor: "no", viewer: "no", guest: "no" },
      },
      {
        id: "doc.share",
        label: "Share externally",
        perms: { owner: "yes", admin: "yes", editor: "yes", viewer: "no", guest: "no" },
      },
    ],
  },
  {
    id: "members",
    label: "Members",
    capabilities: [
      {
        id: "mem.invite",
        label: "Invite members",
        perms: { owner: "yes", admin: "yes", editor: "no", viewer: "no", guest: "na" },
      },
      {
        id: "mem.remove",
        label: "Remove members",
        perms: { owner: "yes", admin: "yes", editor: "no", viewer: "no", guest: "na" },
      },
      {
        id: "mem.role",
        label: "Change member role",
        hint: "Cannot promote above own role.",
        perms: { owner: "yes", admin: "yes", editor: "no", viewer: "no", guest: "na" },
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    capabilities: [
      {
        id: "bill.view",
        label: "View invoices",
        perms: { owner: "yes", admin: "yes", editor: "no", viewer: "no", guest: "na" },
      },
      {
        id: "bill.plan",
        label: "Change plan",
        perms: { owner: "yes", admin: "no", editor: "no", viewer: "no", guest: "na" },
      },
      {
        id: "bill.pay",
        label: "Manage payment methods",
        perms: { owner: "yes", admin: "no", editor: "no", viewer: "no", guest: "na" },
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    capabilities: [
      {
        id: "adm.audit",
        label: "Audit log access",
        hint: "Read-only access to workspace events.",
        perms: { owner: "yes", admin: "yes", editor: "no", viewer: "no", guest: "na" },
      },
      {
        id: "adm.sso",
        label: "SSO configuration",
        perms: { owner: "yes", admin: "no", editor: "no", viewer: "no", guest: "na" },
      },
      {
        id: "adm.delete",
        label: "Workspace deletion",
        hint: "Permanent. Requires 2FA.",
        perms: { owner: "yes", admin: "no", editor: "no", viewer: "no", guest: "na" },
      },
    ],
  },
];

export function SettingsPermissionsShowcasePage() {
  const [activeRole, setActiveRole] = useState<RoleId>("admin");
  const [query, setQuery] = useState("");
  const [diffOnly, setDiffOnly] = useState(false);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      capabilities: g.capabilities.filter((cap) => {
        if (q && !cap.label.toLowerCase().includes(q)) return false;
        if (diffOnly) {
          const states = ROLES.map((r) => cap.perms[r.id]);
          if (states.every((s) => s === states[0])) return false;
        }
        return true;
      }),
    })).filter((g) => g.capabilities.length > 0);
  }, [query, diffOnly]);

  const totalCapabilities = GROUPS.reduce((acc, g) => acc + g.capabilities.length, 0);
  const visibleCount = filteredGroups.reduce((acc, g) => acc + g.capabilities.length, 0);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Settings · Permissions
        </div>
        <h1 className="mt-1 font-heading text-3xl">Roles & permissions</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          {ROLES.length} roles · {totalCapabilities} capabilities across{" "}
          {GROUPS.length} groups
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="flex flex-col gap-2">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Roles
            </div>
            <ul className="flex flex-col gap-1">
              {ROLES.map((role) => {
                const isActive = role.id === activeRole;
                return (
                  <li key={role.id}>
                    <button
                      type="button"
                      onClick={() => setActiveRole(role.id)}
                      className={`group w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "border-foreground/30 bg-foreground/[0.04]"
                          : "border-border/60 bg-background/40 hover:border-foreground/20 hover:bg-foreground/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex size-5 items-center justify-center rounded ${role.tone}`}
                          >
                            <ShieldIcon className="size-3" />
                          </span>
                          <span className="font-medium text-sm">{role.name}</span>
                        </div>
                        <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] tabular-nums text-muted-foreground">
                          {role.members}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-muted-foreground text-xs">
                        {role.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>

            <Separator className="my-3" />

            <Button variant="outline" size="sm" className="justify-start">
              <PlusIcon />
              Create custom role
            </Button>
          </aside>

          {/* Matrix */}
          <section className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3">
                <SearchIcon className="size-3.5 opacity-50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter capabilities…"
                  className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {query ? (
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                    {visibleCount}/{totalCapabilities}
                  </span>
                ) : null}
              </div>
              <label className="flex items-center gap-2.5 rounded-md border border-border/60 bg-background/40 px-3 py-1.5">
                <Switch
                  checked={diffOnly}
                  onCheckedChange={setDiffOnly}
                  className="!h-4 !w-7 [--thumb-size:--spacing(3)]"
                />
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Show only differences
                </span>
              </label>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-background/40">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                    <tr className="border-b border-border/60">
                      <th
                        scope="col"
                        className="sticky left-0 z-20 min-w-[240px] bg-background/95 px-4 py-3 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
                      >
                        Capability
                      </th>
                      {ROLES.map((role) => {
                        const isActive = role.id === activeRole;
                        return (
                          <th
                            key={role.id}
                            scope="col"
                            className={`w-[88px] border-l border-border/40 px-2 py-3 text-center transition-colors ${
                              isActive ? "bg-foreground/[0.04]" : ""
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setActiveRole(role.id)}
                              className="flex w-full flex-col items-center gap-1"
                            >
                              <span
                                className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
                                  isActive ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {role.name}
                              </span>
                              <span className="font-mono text-[9px] tabular-nums text-muted-foreground/70">
                                {role.members}
                              </span>
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.map((group, gi) => (
                      <GroupRows
                        key={group.id}
                        group={group}
                        activeRole={activeRole}
                        isLast={gi === filteredGroups.length - 1}
                      />
                    ))}
                    {filteredGroups.length === 0 ? (
                      <tr>
                        <td
                          colSpan={ROLES.length + 1}
                          className="px-4 py-12 text-center text-muted-foreground text-sm"
                        >
                          No capabilities match "{query}".
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <Separator />
              <div className="flex flex-wrap items-center gap-4 px-4 py-2.5">
                <LegendItem state="yes" label="Allowed" />
                <LegendItem state="no" label="Not allowed" />
                <LegendItem state="na" label="Not applicable" />
                <span className="ml-auto font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Editing as{" "}
                  <span className="text-foreground">
                    {ROLES.find((r) => r.id === activeRole)?.name}
                  </span>
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function GroupRows({
  group,
  activeRole,
  isLast,
}: {
  group: CapabilityGroup;
  activeRole: RoleId;
  isLast: boolean;
}) {
  return (
    <>
      <tr className="border-b border-border/40 bg-foreground/[0.025]">
        <td
          colSpan={ROLES.length + 1}
          className="sticky left-0 px-4 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
        >
          {group.label}
        </td>
      </tr>
      {group.capabilities.map((cap, ci) => {
        const isLastRow = isLast && ci === group.capabilities.length - 1;
        return (
          <tr
            key={cap.id}
            className={`group/row transition-colors odd:bg-foreground/[0.012] hover:bg-foreground/[0.04] ${
              isLastRow ? "" : "border-b border-border/30"
            }`}
          >
            <td className="sticky left-0 z-10 min-w-[240px] bg-inherit px-4 py-2.5">
              <div className="flex flex-col">
                <span className="font-medium text-[13px]">{cap.label}</span>
                {cap.hint ? (
                  <span className="text-muted-foreground text-xs">{cap.hint}</span>
                ) : null}
              </div>
            </td>
            {ROLES.map((role) => {
              const state = cap.perms[role.id];
              const isActive = role.id === activeRole;
              return (
                <td
                  key={role.id}
                  className={`border-l border-border/30 px-2 py-2.5 text-center ${
                    isActive ? "bg-foreground/[0.025]" : ""
                  }`}
                >
                  <PermCell state={state} />
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

export function PermCell({ state }: { state: CellState }) {
  if (state === "yes") {
    return (
      <span
        className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        aria-label="Allowed"
      >
        <CheckIcon className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "na") {
    return (
      <span
        className="inline-flex size-5 items-center justify-center rounded-full bg-foreground/[0.04] text-muted-foreground/60"
        aria-label="Not applicable"
        title="Not applicable for this role"
      >
        <LockIcon className="size-2.5" />
      </span>
    );
  }
  return (
    <span
      className="inline-flex size-5 items-center justify-center text-muted-foreground/40"
      aria-label="Not allowed"
    >
      <MinusIcon className="size-3.5" />
    </span>
  );
}

export function LegendItem({ state, label }: { state: CellState; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <PermCell state={state} />
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}
