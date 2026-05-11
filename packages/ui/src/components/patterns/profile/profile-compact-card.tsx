import { ChevronDownIcon, MoreHorizontalIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";

export interface Member {
  name: string;
  initials: string;
  role: string;
  email: string;
  status: "online" | "away" | "off" | "dnd";
  customStatus?: string;
  permission: "Owner" | "Admin" | "Member" | "Viewer";
  active: string;
}

const MEMBERS: Member[] = [
  {
    name: "Maya Okafor",
    initials: "MO",
    role: "Engineering",
    email: "maya@acme.dev",
    status: "online",
    customStatus: "🛠 Heads down on audit log",
    permission: "Owner",
    active: "active now",
  },
  {
    name: "James Lin",
    initials: "JL",
    role: "Engineering",
    email: "james@acme.dev",
    status: "dnd",
    customStatus: "🤫 Do not disturb until 5",
    permission: "Admin",
    active: "active 12m ago",
  },
  {
    name: "Riya Patel",
    initials: "RP",
    role: "Billing",
    email: "riya@acme.dev",
    status: "away",
    customStatus: "🚂 Commuting",
    permission: "Member",
    active: "active 2h ago",
  },
  {
    name: "Dani Kim",
    initials: "DK",
    role: "Design",
    email: "dani@acme.dev",
    status: "online",
    permission: "Member",
    active: "active now",
  },
  {
    name: "Alex Tran",
    initials: "AT",
    role: "Front-end",
    email: "alex@acme.dev",
    status: "off",
    customStatus: "Out — back Monday",
    permission: "Viewer",
    active: "active 3d ago",
  },
];

const STATUS_DOT: Record<Member["status"], string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  dnd: "bg-rose-500",
  off: "bg-muted-foreground/40",
};

const PERMISSION_TONE: Record<Member["permission"], string> = {
  Owner: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  Admin: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  Member: "bg-foreground/[0.06] text-foreground",
  Viewer: "bg-muted text-muted-foreground",
};

export function ProfileCompactCardShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Workspace members · 5 of 28
        </div>
        <h1 className="mt-1 font-heading text-2xl">Compact roster</h1>

        <ul className="mt-5 flex flex-col gap-2">
          {MEMBERS.map((m) => (
            <li
              key={m.email}
              className="grid grid-cols-[44px_1fr_140px_120px_28px] items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-sm transition-colors hover:bg-background/95"
            >
              <div className="relative">
                <Avatar className="size-10">
                  <AvatarFallback className="text-xs">
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={
                    "absolute right-0 bottom-0 size-3 rounded-full border-2 border-background " +
                    STATUS_DOT[m.status]
                  }
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm">{m.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    @{m.email.split("@")[0]}
                  </span>
                </div>
                {m.customStatus ? (
                  <div className="mt-0.5 truncate text-foreground/80 text-xs">
                    {m.customStatus}
                  </div>
                ) : (
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    {m.active}
                  </div>
                )}
              </div>

              <div className="text-muted-foreground text-xs">
                <div>{m.role}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em]">
                  {m.active}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className={
                    "inline-flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 font-mono text-[11px] " +
                    PERMISSION_TONE[m.permission]
                  }
                >
                  {m.permission}
                  <ChevronDownIcon className="size-3" />
                </button>
              </div>

              <button
                type="button"
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <MoreHorizontalIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
