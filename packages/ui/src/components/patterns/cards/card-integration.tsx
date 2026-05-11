import { useState } from "react";
import { CheckCircle2Icon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card, CardPanel } from "@orbit/ui/card";
import { Switch } from "@orbit/ui/switch";

export interface Integration {
  slug: string;
  name: string;
  letter: string;
  blurb: string;
  status: "ok" | "warn" | "error" | "off";
  lastSync: string;
  tone: string;
  enabled: boolean;
  scopes: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    slug: "slack",
    name: "Slack",
    letter: "S",
    blurb: "Post task updates to channels.",
    status: "ok",
    lastSync: "synced 2m ago",
    tone: "from-emerald-500/20 to-teal-500/10",
    enabled: true,
    scopes: ["#eng-platform", "#design-crit", "+3 channels"],
  },
  {
    slug: "github",
    name: "GitHub",
    letter: "G",
    blurb: "Link PRs to issues automatically.",
    status: "warn",
    lastSync: "rate-limited · retrying",
    tone: "from-slate-500/20 to-slate-500/5",
    enabled: true,
    scopes: ["org/scratchpad", "org/coss-ui"],
  },
  {
    slug: "linear",
    name: "Linear",
    letter: "L",
    blurb: "Two-way sync with Linear issues.",
    status: "off",
    lastSync: "Not connected",
    tone: "from-violet-500/20 to-fuchsia-500/10",
    enabled: false,
    scopes: [],
  },
];

const STATUS_LABEL: Record<Integration["status"], string> = {
  ok: "Healthy",
  warn: "Degraded",
  error: "Failing",
  off: "Disconnected",
};
const STATUS_DOT: Record<Integration["status"], string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  error: "bg-destructive",
  off: "bg-muted-foreground/40",
};

export function CardIntegrationShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-heading text-xl">Connected services</h1>
            <p className="text-muted-foreground text-sm">
              2 connected · 1 needs attention
            </p>
          </div>
          <Button size="sm" variant="outline">
            Browse all
          </Button>
        </header>

        <div className="flex flex-col gap-3">
          {INTEGRATIONS.map((i) => (
            <IntegrationCard key={i.slug} item={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function IntegrationCard({ item }: { item: Integration }) {
  const [enabled, setEnabled] = useState(item.enabled);
  const status: Integration["status"] = enabled ? item.status : "off";
  return (
    <Card className="overflow-hidden">
      <CardPanel className="flex items-center gap-4 p-4">
        <div
          className={
            "flex size-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br font-heading font-semibold text-base " +
            item.tone
          }
        >
          {item.letter}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-base">
              {item.name}
            </span>
            <Badge
              variant="outline"
              className="gap-1.5 font-mono text-[10px] uppercase"
            >
              <span className={"size-1.5 rounded-full " + STATUS_DOT[status]} />
              {STATUS_LABEL[status]}
            </Badge>
          </div>
          <p className="truncate text-muted-foreground text-sm">{item.blurb}</p>
          {enabled && item.scopes.length ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {item.scopes.map((s) => (
                <span
                  key={s}
                  className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            {status === "ok" ? (
              <CheckCircle2Icon className="size-3 text-emerald-600" />
            ) : null}
            {item.lastSync}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={(v) => setEnabled(Boolean(v))}
          />
          <Button variant="ghost" size="xs" className="text-muted-foreground">
            Configure
            <ChevronRightIcon />
          </Button>
        </div>
      </CardPanel>
    </Card>
  );
}
