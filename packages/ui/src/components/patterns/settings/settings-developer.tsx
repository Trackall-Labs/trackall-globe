import { useState } from "react";
import { TerminalIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Radio, RadioGroup } from "@orbit/ui/radio-group";
import { Separator } from "@orbit/ui/separator";
import { Switch } from "@orbit/ui/switch";

export type FlagStatus = "stable" | "beta" | "experimental";

export interface Flag {
  key: string;
  description: string;
  status: FlagStatus;
  defaultOn: boolean;
}

export interface FlagGroup {
  id: string;
  title: string;
  flags: Flag[];
}

const GROUPS: FlagGroup[] = [
  {
    id: "ui",
    title: "UI",
    flags: [
      {
        key: "experimental-mentions-v2",
        description: "Re-architected mentions popover with portal-based positioning.",
        status: "experimental",
        defaultOn: false,
      },
      {
        key: "command-bar-fuzzy",
        description: "Fuzzy ranking on the global command bar instead of prefix match.",
        status: "beta",
        defaultOn: true,
      },
      {
        key: "sidebar-resize-handles",
        description: "Drag handles for resizing left and right sidebars.",
        status: "stable",
        defaultOn: true,
      },
      {
        key: "preview-card-hover",
        description: "Hover card previews on internal links across the product.",
        status: "beta",
        defaultOn: false,
      },
    ],
  },
  {
    id: "api",
    title: "API",
    flags: [
      {
        key: "graphql-batching",
        description: "Batch GraphQL operations into a single round-trip.",
        status: "stable",
        defaultOn: true,
      },
      {
        key: "rest-cursor-v2",
        description: "Opaque cursor pagination on list endpoints.",
        status: "beta",
        defaultOn: true,
      },
      {
        key: "webhooks-retries-v3",
        description: "Exponential retry with jitter and DLQ surfacing.",
        status: "experimental",
        defaultOn: false,
      },
    ],
  },
  {
    id: "ai",
    title: "AI",
    flags: [
      {
        key: "smart-summaries",
        description: "Generate thread summaries with the local model.",
        status: "beta",
        defaultOn: true,
      },
      {
        key: "inline-rewrite",
        description: "Slash-command rewrites inside the editor.",
        status: "experimental",
        defaultOn: false,
      },
      {
        key: "agent-actions",
        description: "Allow agents to call write-side tools (create, update).",
        status: "experimental",
        defaultOn: false,
      },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    flags: [
      {
        key: "query-cache-persist",
        description: "Persist react-query cache to IndexedDB across reloads.",
        status: "stable",
        defaultOn: true,
      },
      {
        key: "list-virtualization",
        description: "Virtualize lists over 200 rows.",
        status: "stable",
        defaultOn: true,
      },
      {
        key: "speculative-prefetch",
        description: "Prefetch routes on link hover after 80ms.",
        status: "beta",
        defaultOn: false,
      },
    ],
  },
];

const STATUS_STYLES: Record<
  FlagStatus,
  { label: string; className: string }
> = {
  stable: {
    label: "Stable",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  beta: {
    label: "Beta",
    className:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  experimental: {
    label: "Experimental",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
};

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogLine {
  ts: string;
  level: LogLevel;
  channel: string;
  body: string;
}

const LOG_LINES: LogLine[] = [
  { ts: "12:04:01.221", level: "info", channel: "evt:render", body: '"/dashboard"  87ms' },
  { ts: "12:04:01.310", level: "info", channel: "api:GET   ", body: "/api/users     id=req_abc  204" },
  { ts: "12:04:01.412", level: "debug", channel: "cache:hit ", body: "projects:atlas ttl=12s" },
  { ts: "12:04:01.587", level: "warn", channel: "evt:render", body: '"/inbox"      312ms  (slow)' },
  { ts: "12:04:01.601", level: "info", channel: "api:POST  ", body: "/api/messages  id=req_acd  201" },
  { ts: "12:04:01.744", level: "debug", channel: "ws:tick   ", body: "presence n=23 dt=2.1s" },
  { ts: "12:04:01.812", level: "error", channel: "api:POST  ", body: "/api/billing   id=req_acf  402  card_declined" },
  { ts: "12:04:01.901", level: "info", channel: "evt:nav   ", body: '"/billing" -> "/billing/invoices"  44ms' },
  { ts: "12:04:02.018", level: "debug", channel: "flag:read ", body: "experimental-mentions-v2=false (default)" },
  { ts: "12:04:02.144", level: "info", channel: "api:GET   ", body: "/api/feed      id=req_acg  204  cache=stale-while-revalidate" },
  { ts: "12:04:02.299", level: "warn", channel: "evt:render", body: '"/feed"       298ms  (re-render x4)' },
  { ts: "12:04:02.421", level: "debug", channel: "rq:dehydr ", body: "67 keys persisted (124KB)" },
];

const LEVEL_TONE: Record<LogLevel, string> = {
  debug: "text-zinc-500",
  info: "text-sky-300",
  warn: "text-amber-300",
  error: "text-rose-400",
};

export function SettingsDeveloperShowcasePage() {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const g of GROUPS) for (const f of g.flags) out[f.key] = f.defaultOn;
    return out;
  });
  const [debug, setDebug] = useState(false);
  const [env, setEnv] = useState<"production" | "staging" | "local">(
    "production",
  );

  const flip = (key: string) =>
    setFlags((p) => ({ ...p, [key]: !p[key] }));

  const enabledCount = Object.values(flags).filter(Boolean).length;
  const totalCount = Object.values(flags).length;

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Settings · Developer & Labs
            </div>
            <h1 className="mt-1 font-heading text-3xl">Developer</h1>
            <p className="mt-1.5 text-muted-foreground text-sm">
              Experimental features, debug tooling, and feature flags.
            </p>
          </div>
          <Button variant="outline" size="sm" type="button">
            <TerminalIcon />
            API explorer
          </Button>
        </header>

        <Separator className="my-8" />

        <section>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="font-heading text-base">Feature flags</h2>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Toggles roll out per-account. Experimental flags can change or
                disappear without notice.
              </p>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] tabular-nums">
              {enabledCount} / {totalCount} on
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-6">
            {GROUPS.map((group) => (
              <div key={group.id}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                    {group.title}
                  </h3>
                  <span className="h-px flex-1 bg-border/60" />
                  <span className="font-mono text-[10px] text-muted-foreground/70 tabular-nums">
                    {group.flags.length}
                  </span>
                </div>
                <ul className="divide-y divide-border/50 rounded-xl border border-border/60 bg-background/40">
                  {group.flags.map((f) => {
                    const status = STATUS_STYLES[f.status];
                    return (
                      <li
                        key={f.key}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="font-mono text-[12px] text-foreground">
                              {f.key}
                            </code>
                            <Badge
                              variant="outline"
                              size="sm"
                              className={
                                "font-mono text-[9px] uppercase tracking-[0.18em] " +
                                status.className
                              }
                            >
                              {status.label}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {f.description}
                          </p>
                        </div>
                        <Switch
                          checked={!!flags[f.key]}
                          onCheckedChange={() => flip(f.key)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        <section>
          <h2 className="font-heading text-base">Debug mode</h2>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Verbose tooling for engineers. Off by default.
          </p>

          <div className="mt-4 flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">Debug mode</div>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Surfaces telemetry events, render timings, and request IDs in
                the UI.
              </p>
            </div>
            <Switch checked={debug} onCheckedChange={setDebug} />
          </div>

          {debug ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-xs/5">
              <div className="flex items-center justify-between border-zinc-800 border-b bg-zinc-900/60 px-3 py-1.5">
                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 uppercase tracking-[0.25em]">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  console · live
                </div>
                <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                  {LOG_LINES.length} lines
                </span>
              </div>
              <pre className="max-h-72 overflow-y-auto px-3 py-2.5 font-mono text-[11px] leading-relaxed text-zinc-300">
                {LOG_LINES.map((line, i) => (
                  <div key={i} className="flex gap-3 whitespace-pre">
                    <span className="text-zinc-600 tabular-nums">{line.ts}</span>
                    <span
                      className={
                        "uppercase tracking-wider " + LEVEL_TONE[line.level]
                      }
                    >
                      {line.level.padEnd(5, " ")}
                    </span>
                    <span className="text-zinc-400">{line.channel}</span>
                    <span className="text-zinc-200">{line.body}</span>
                  </div>
                ))}
              </pre>
            </div>
          ) : null}
        </section>

        <Separator className="my-10" />

        <section>
          <h2 className="font-heading text-base">Environment</h2>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Point the client at a different backend. Switching is restricted to
            workspace admins.
          </p>

          <RadioGroup
            value={env}
            onValueChange={(v) =>
              setEnv(v as "production" | "staging" | "local")
            }
            className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            {(
              [
                {
                  value: "production",
                  label: "Production",
                  host: "api.coss.dev",
                  tone: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  value: "staging",
                  label: "Staging",
                  host: "api.staging.coss.dev",
                  tone: "text-sky-600 dark:text-sky-400",
                },
                {
                  value: "local",
                  label: "Local",
                  host: "localhost:4000",
                  tone: "text-amber-600 dark:text-amber-400",
                },
              ] as const
            ).map((opt) => {
              const active = env === opt.value;
              return (
                <label
                  key={opt.value}
                  className={
                    "flex cursor-pointer items-start gap-3 rounded-xl border bg-background/40 px-3.5 py-3 transition-colors " +
                    (active
                      ? "border-foreground/40 bg-foreground/[0.03]"
                      : "border-border/60 hover:border-foreground/20")
                  }
                >
                  <Radio value={opt.value} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{opt.label}</span>
                      <span className={"size-1.5 rounded-full " +
                        (opt.value === "production"
                          ? "bg-emerald-500"
                          : opt.value === "staging"
                            ? "bg-sky-500"
                            : "bg-amber-500")}
                      />
                    </div>
                    <code
                      className={"mt-0.5 block truncate font-mono text-[11px] " + opt.tone}
                    >
                      {opt.host}
                    </code>
                  </div>
                </label>
              );
            })}
          </RadioGroup>

          <p className="mt-3 font-mono text-[10px] text-muted-foreground/80 uppercase tracking-[0.2em]">
            Admin-only — contact your workspace owner to change.
          </p>
        </section>
      </div>
    </div>
  );
}
