import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";

export interface Node {
  name: string;
  initials: string;
  title: string;
  team?: string;
  reports?: Node[];
  collapsed?: boolean;
  collapsedCount?: number;
}

const ROOT: Node = {
  name: "Olive Berg",
  initials: "OB",
  title: "CEO",
  reports: [
    {
      name: "Helena Marsh",
      initials: "HM",
      title: "VP Engineering",
      reports: [
        {
          name: "Maya Okafor",
          initials: "MO",
          title: "Eng Manager · Audit",
          team: "4 reports",
          reports: [
            { name: "James Lin", initials: "JL", title: "Senior Engineer · API" },
            { name: "Riya Patel", initials: "RP", title: "Engineer · Billing" },
            { name: "Alex Tran", initials: "AT", title: "Engineer · Front-end" },
          ],
        },
        {
          name: "Carlos Mendes",
          initials: "CM",
          title: "Eng Manager · Platform",
          team: "3 reports",
          collapsed: true,
          collapsedCount: 3,
        },
      ],
    },
    {
      name: "Mia Lloyd",
      initials: "ML",
      title: "VP Design",
      reports: [
        { name: "Dani Kim", initials: "DK", title: "Lead Designer" },
        { name: "Joon Park", initials: "JP", title: "Designer · Brand" },
      ],
    },
    {
      name: "Elena Vargas",
      initials: "EV",
      title: "Head of Sales",
      collapsed: true,
      collapsedCount: 6,
    },
  ],
};

export function ProfileOrgChartShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Acme · 28 people · 4 levels deep
        </div>
        <h1 className="mt-1 font-heading text-2xl">Reporting lines</h1>

        <div className="mt-8 overflow-x-auto rounded-xl border border-border/60 bg-background/40 p-8">
          <Tree node={ROOT} highlight />
        </div>
      </div>
    </div>
  );
}

export function Tree({ node, highlight = false }: { node: Node; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <Card node={node} highlight={highlight} />
      {node.reports && node.reports.length > 0 ? (
        <>
          {/* Vertical line down */}
          <div className="h-6 w-px bg-border/70" />
          {/* Horizontal connector */}
          {node.reports.length > 1 ? (
            <div
              className="relative w-full"
              style={{ height: "1px" }}
            >
              <span className="absolute top-0 left-[12.5%] right-[12.5%] h-px bg-border/70" />
            </div>
          ) : null}
          <div className="flex items-start gap-6">
            {node.reports.map((r) => (
              <div key={r.name} className="flex flex-col items-center">
                {/* short stem */}
                <div className="h-3 w-px bg-border/70" />
                <Tree node={r} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function Card({ node, highlight }: { node: Node; highlight: boolean }) {
  return (
    <div
      className={
        "flex w-56 items-start gap-3 rounded-xl border bg-background px-3 py-2.5 shadow-sm " +
        (highlight ? "border-foreground/40 ring-2 ring-foreground/15" : "border-border/60")
      }
    >
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className="text-xs">{node.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{node.name}</div>
        <div className="truncate text-muted-foreground text-xs">
          {node.title}
        </div>
        {node.team ? (
          <div className="mt-1 inline-flex items-center gap-1 rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {node.team}
          </div>
        ) : null}
      </div>
      {node.collapsed ? (
        <button
          type="button"
          className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
          title={`Show ${node.collapsedCount} reports`}
        >
          <ChevronRightIcon className="size-3.5" />
        </button>
      ) : node.reports && node.reports.length > 0 ? (
        <button
          type="button"
          className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <ChevronDownIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
