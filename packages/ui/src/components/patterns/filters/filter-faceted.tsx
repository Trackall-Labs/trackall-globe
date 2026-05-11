import { useMemo, useState } from "react";
import {
  CheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusCircleIcon,
  SearchIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Checkbox } from "@orbit/ui/checkbox";
import { CheckboxGroup } from "@orbit/ui/checkbox-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@orbit/ui/input-group";
import { Label } from "@orbit/ui/label";
import { Popover, PopoverPopup, PopoverTrigger } from "@orbit/ui/popover";
import { Separator } from "@orbit/ui/separator";

export type StatusKey = "todo" | "in-progress" | "in-review" | "done";
export type PriorityKey = "p0" | "p1" | "p2" | "p3";
export type AssigneeKey = "ada" | "grace" | "alan" | "linus";
export type LabelKey = "bug" | "feature" | "infra" | "docs" | "design";

const STATUS_FACETS = [
  { value: "todo" as StatusKey, label: "Todo", icon: CircleIcon },
  { value: "in-progress" as StatusKey, label: "In Progress", icon: CircleDotIcon },
  { value: "in-review" as StatusKey, label: "In Review", icon: CircleDashedIcon },
  { value: "done" as StatusKey, label: "Done", icon: CheckIcon },
];

const PRIORITY_FACETS = [
  { value: "p0" as PriorityKey, label: "Urgent" },
  { value: "p1" as PriorityKey, label: "High" },
  { value: "p2" as PriorityKey, label: "Medium" },
  { value: "p3" as PriorityKey, label: "Low" },
];

const ASSIGNEE_FACETS = [
  { value: "ada" as AssigneeKey, label: "Ada Lovelace", initials: "AL", tone: "bg-rose-500/15" },
  { value: "grace" as AssigneeKey, label: "Grace Hopper", initials: "GH", tone: "bg-amber-500/15" },
  { value: "alan" as AssigneeKey, label: "Alan Turing", initials: "AT", tone: "bg-sky-500/15" },
  { value: "linus" as AssigneeKey, label: "Linus Torvalds", initials: "LT", tone: "bg-emerald-500/15" },
];

const LABEL_FACETS = [
  { value: "bug" as LabelKey, label: "Bug", color: "bg-red-500" },
  { value: "feature" as LabelKey, label: "Feature", color: "bg-violet-500" },
  { value: "infra" as LabelKey, label: "Infra", color: "bg-amber-500" },
  { value: "docs" as LabelKey, label: "Docs", color: "bg-sky-500" },
  { value: "design" as LabelKey, label: "Design", color: "bg-pink-500" },
];

export interface Issue {
  id: string;
  title: string;
  status: StatusKey;
  priority: PriorityKey;
  assignee: AssigneeKey;
  labels: LabelKey[];
}

const ISSUES: Issue[] = [
  { id: "ENG-204", title: "Migrate billing webhooks to v3", status: "in-progress", priority: "p1", assignee: "ada", labels: ["infra", "feature"] },
  { id: "ENG-198", title: "Audit log retention policy", status: "in-review", priority: "p0", assignee: "alan", labels: ["infra"] },
  { id: "DSN-91", title: "Onboarding particle field micro-anim", status: "in-progress", priority: "p2", assignee: "grace", labels: ["design"] },
  { id: "ENG-211", title: "Investigate stripe.charge.failed spike", status: "todo", priority: "p0", assignee: "ada", labels: ["bug"] },
  { id: "ENG-210", title: "Schema validation: missing event.id", status: "in-progress", priority: "p1", assignee: "linus", labels: ["bug", "infra"] },
  { id: "DOC-44", title: "Document new webhook signing flow", status: "todo", priority: "p3", assignee: "grace", labels: ["docs"] },
  { id: "ENG-209", title: "Rate limit handling for github oauth", status: "todo", priority: "p2", assignee: "alan", labels: ["infra"] },
  { id: "DSN-87", title: "Refresh empty-state illustrations", status: "done", priority: "p3", assignee: "grace", labels: ["design"] },
  { id: "ENG-201", title: "Remove deprecated team_id query param", status: "in-review", priority: "p2", assignee: "ada", labels: ["feature"] },
  { id: "ENG-200", title: "Mobile push notifications backend", status: "in-progress", priority: "p1", assignee: "linus", labels: ["feature"] },
  { id: "ENG-189", title: "Postgres → planetscale prep work", status: "todo", priority: "p1", assignee: "alan", labels: ["infra"] },
  { id: "DOC-41", title: "API key rotation guide", status: "done", priority: "p3", assignee: "grace", labels: ["docs"] },
  { id: "DSN-83", title: "Pricing page A/B variant B", status: "in-review", priority: "p2", assignee: "grace", labels: ["design", "feature"] },
  { id: "ENG-184", title: "Cache projects/atlas (TTL 12s)", status: "done", priority: "p3", assignee: "linus", labels: ["infra"] },
  { id: "ENG-180", title: "Combobox keyboard focus regression", status: "todo", priority: "p2", assignee: "ada", labels: ["bug"] },
  { id: "ENG-176", title: "Toast double-announce in Safari", status: "done", priority: "p3", assignee: "linus", labels: ["bug"] },
  { id: "DOC-40", title: "Rewrite onboarding tutorial", status: "in-progress", priority: "p2", assignee: "grace", labels: ["docs"] },
  { id: "DSN-79", title: "Card: stat tile sparklines", status: "done", priority: "p3", assignee: "grace", labels: ["design", "feature"] },
];

export function FilterFacetedShowcasePage() {
  const [status, setStatus] = useState<StatusKey[]>(["todo", "in-progress"]);
  const [priority, setPriority] = useState<PriorityKey[]>(["p1"]);
  const [assignee, setAssignee] = useState<AssigneeKey[]>([]);
  const [label, setLabel] = useState<LabelKey[]>(["bug", "infra"]);

  const filtered = useMemo(() => {
    return ISSUES.filter((iss) => {
      if (status.length && !status.includes(iss.status)) return false;
      if (priority.length && !priority.includes(iss.priority)) return false;
      if (assignee.length && !assignee.includes(iss.assignee)) return false;
      if (label.length && !iss.labels.some((l) => label.includes(l))) return false;
      return true;
    });
  }, [status, priority, assignee, label]);

  const counts = useMemo(() => {
    const count = <T extends string>(
      facet: T,
      get: (i: Issue) => T | T[],
    ): number =>
      ISSUES.filter((i) => {
        const v = get(i);
        return Array.isArray(v) ? v.includes(facet) : v === facet;
      }).length;
    return {
      status: Object.fromEntries(
        STATUS_FACETS.map((f) => [f.value, count(f.value, (i) => i.status)]),
      ) as Record<StatusKey, number>,
      priority: Object.fromEntries(
        PRIORITY_FACETS.map((f) => [f.value, count(f.value, (i) => i.priority)]),
      ) as Record<PriorityKey, number>,
      assignee: Object.fromEntries(
        ASSIGNEE_FACETS.map((f) => [f.value, count(f.value, (i) => i.assignee)]),
      ) as Record<AssigneeKey, number>,
      label: Object.fromEntries(
        LABEL_FACETS.map((f) => [f.value, count(f.value, (i) => i.labels)]),
      ) as Record<LabelKey, number>,
    };
  }, []);

  const totalSelected =
    status.length + priority.length + assignee.length + label.length;
  const reset = () => {
    setStatus([]);
    setPriority([]);
    setAssignee([]);
    setLabel([]);
  };

  return (
    <div className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="font-heading text-xl">Faceted filters</h1>
          <p className="text-muted-foreground text-sm">
            Linear-style — each facet opens a popover with multi-select facets and counts.
          </p>
        </header>

        <div className="rounded-xl border bg-card p-4 shadow-xs/5">
          <div className="flex flex-wrap items-center gap-2">
            <FacetTrigger
              label="Status"
              selected={status}
              labelFor={(v) => STATUS_FACETS.find((f) => f.value === v)?.label}
              onClear={() => setStatus([])}
            >
              <FacetCheckboxList
                value={status}
                onValueChange={(v) => setStatus(v as StatusKey[])}
              >
                {STATUS_FACETS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <FacetRow
                      key={f.value}
                      value={f.value}
                      label={f.label}
                      count={counts.status[f.value]}
                      leading={<Icon className="size-3.5 text-muted-foreground" />}
                    />
                  );
                })}
              </FacetCheckboxList>
            </FacetTrigger>

            <FacetTrigger
              label="Priority"
              selected={priority}
              labelFor={(v) => PRIORITY_FACETS.find((f) => f.value === v)?.label}
              onClear={() => setPriority([])}
            >
              <FacetCheckboxList
                value={priority}
                onValueChange={(v) => setPriority(v as PriorityKey[])}
              >
                {PRIORITY_FACETS.map((f) => (
                  <FacetRow
                    key={f.value}
                    value={f.value}
                    label={f.label}
                    count={counts.priority[f.value]}
                    leading={<PriorityDot value={f.value} />}
                  />
                ))}
              </FacetCheckboxList>
            </FacetTrigger>

            <FacetTrigger
              label="Assignee"
              icon={<UserIcon className="size-3.5" />}
              selected={assignee}
              labelFor={(v) => ASSIGNEE_FACETS.find((f) => f.value === v)?.label}
              onClear={() => setAssignee([])}
            >
              <FacetCheckboxList
                value={assignee}
                onValueChange={(v) => setAssignee(v as AssigneeKey[])}
              >
                {ASSIGNEE_FACETS.map((f) => (
                  <FacetRow
                    key={f.value}
                    value={f.value}
                    label={f.label}
                    count={counts.assignee[f.value]}
                    leading={
                      <span
                        className={
                          "flex size-5 items-center justify-center rounded-full font-medium text-[9px] " +
                          f.tone
                        }
                        aria-hidden
                      >
                        {f.initials}
                      </span>
                    }
                  />
                ))}
              </FacetCheckboxList>
            </FacetTrigger>

            <FacetTrigger
              label="Label"
              icon={<TagIcon className="size-3.5" />}
              selected={label}
              labelFor={(v) => LABEL_FACETS.find((f) => f.value === v)?.label}
              onClear={() => setLabel([])}
            >
              <FacetCheckboxList
                value={label}
                onValueChange={(v) => setLabel(v as LabelKey[])}
              >
                {LABEL_FACETS.map((f) => (
                  <FacetRow
                    key={f.value}
                    value={f.value}
                    label={f.label}
                    count={counts.label[f.value]}
                    leading={<span className={"size-2 rounded-full " + f.color} />}
                  />
                ))}
              </FacetCheckboxList>
            </FacetTrigger>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" size="sm" className="border-dashed">
                    <PlusCircleIcon />
                    Add filter
                  </Button>
                }
              />
              <PopoverPopup className="w-56 p-1">
                <div className="px-2 pt-1 pb-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  Add filter
                </div>
                <p className="px-2 py-2 text-muted-foreground text-xs">
                  Custom fields aren't wired up in this demo — open the
                  facets above instead.
                </p>
              </PopoverPopup>
            </Popover>
          </div>

          <Separator className="my-3" />

          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>
              <span className="text-foreground">
                {totalSelected} filter{totalSelected === 1 ? "" : "s"}
              </span>{" "}
              · {filtered.length} of {ISSUES.length} issues
            </span>
            <Button
              size="xs"
              variant="ghost"
              onClick={reset}
              disabled={totalSelected === 0}
            >
              Reset filters
            </Button>
          </div>
        </div>

        <IssueList issues={filtered} onReset={reset} />
      </div>
    </div>
  );
}

export function PriorityDot({ value }: { value: PriorityKey }) {
  const tone =
    value === "p0"
      ? "bg-destructive"
      : value === "p1"
        ? "bg-amber-500"
        : value === "p2"
          ? "bg-sky-500"
          : "bg-muted-foreground/40";
  return <span className={"size-2 rounded-full " + tone} />;
}

export function FacetTrigger({
  label,
  icon,
  selected,
  labelFor,
  onClear,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  selected: string[];
  labelFor: (v: string) => string | undefined;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const count = selected.length;
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className={
              count > 0
                ? "border-foreground/20 bg-foreground/5"
                : "border-dashed"
            }
          >
            {icon ?? <PlusCircleIcon />}
            {label}
            {count > 0 ? (
              <>
                <Separator orientation="vertical" className="mx-1 h-3" />
                <Badge
                  variant="secondary"
                  size="sm"
                  className="font-mono text-[10px]"
                >
                  {count}
                </Badge>
                {count <= 2 ? (
                  <span className="hidden gap-1 lg:inline-flex">
                    {selected.slice(0, 2).map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        size="sm"
                        className="font-mono text-[10px]"
                      >
                        {labelFor(s) ?? s}
                      </Badge>
                    ))}
                  </span>
                ) : null}
              </>
            ) : null}
          </Button>
        }
      />
      <PopoverPopup className="w-64 p-0">
        <div className="flex flex-col">
          <FacetSearch placeholder={`Filter ${label.toLowerCase()}…`} />
          <Separator />
          {children}
          <Separator />
          <div className="flex items-center justify-between p-1">
            <Button
              size="xs"
              variant="ghost"
              className="text-muted-foreground"
              onClick={onClear}
              disabled={count === 0}
            >
              Clear
            </Button>
            <span className="px-2 font-mono text-[10px] text-muted-foreground tabular-nums">
              {count} selected
            </span>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  );
}

export function FacetSearch({ placeholder }: { placeholder: string }) {
  return (
    <div className="p-2">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon className="size-3.5 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput placeholder={placeholder} className="h-8 text-sm" />
      </InputGroup>
    </div>
  );
}

export function FacetCheckboxList({
  value,
  onValueChange,
  children,
}: {
  value: string[];
  onValueChange: (v: string[]) => void;
  children: React.ReactNode;
}) {
  return (
    <CheckboxGroup
      aria-label="Filter options"
      value={value}
      onValueChange={onValueChange}
      className="flex max-h-72 flex-col overflow-y-auto p-1"
    >
      {children}
    </CheckboxGroup>
  );
}

export function FacetRow({
  value,
  label,
  count,
  leading,
}: {
  value: string;
  label: string;
  count?: number;
  leading?: React.ReactNode;
}) {
  return (
    <Label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
      <Checkbox value={value} />
      {leading ? (
        <span className="flex size-5 items-center justify-center">
          {leading}
        </span>
      ) : null}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined ? (
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {count}
        </span>
      ) : null}
    </Label>
  );
}

export function IssueList({
  issues,
  onReset,
}: {
  issues: Issue[];
  onReset: () => void;
}) {
  if (issues.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed bg-card/40 p-12 text-center">
        <p className="text-muted-foreground text-sm">
          No issues match these filters.
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <ul className="mt-6 divide-y rounded-xl border bg-card shadow-xs/5">
      {issues.map((iss) => (
        <li
          key={iss.id}
          className="flex items-center gap-3 px-4 py-3 first:rounded-t-xl last:rounded-b-xl hover:bg-background"
        >
          <StatusBadge status={iss.status} />
          <PriorityDot value={iss.priority} />
          <span className="font-mono text-[11px] text-muted-foreground">
            {iss.id}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm">{iss.title}</span>
          <div className="hidden items-center gap-1.5 sm:flex">
            {iss.labels.map((l) => {
              const meta = LABEL_FACETS.find((f) => f.value === l);
              if (!meta) return null;
              return (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 rounded-full border bg-background px-1.5 py-0.5 text-[10px]"
                >
                  <span className={"size-1.5 rounded-full " + meta.color} />
                  {meta.label}
                </span>
              );
            })}
          </div>
          <span className="text-muted-foreground text-xs">
            {ASSIGNEE_FACETS.find((f) => f.value === iss.assignee)?.initials}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StatusBadge({ status }: { status: StatusKey }) {
  const meta = STATUS_FACETS.find((f) => f.value === status);
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
      <Icon className="size-3.5" />
    </span>
  );
}
