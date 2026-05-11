import { useState } from "react";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilIcon,
  PlusIcon,
  RotateCwIcon,
  TrashIcon,
  TriangleAlertIcon,
  WebhookIcon,
} from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@orbit/ui/menu";
import { Separator } from "@orbit/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orbit/ui/table";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@orbit/ui/tooltip";

export type EndpointStatus = "success" | "failing" | "paused";

export interface Endpoint {
  id: string;
  url: string;
  events: string[];
  status: EndpointStatus;
  lastDelivery: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: "we_8f4ad",
    url: "https://api.acme.com/hooks/orbit",
    events: ["user.created", "user.updated", "billing.updated", "team.invited", "team.removed"],
    status: "success",
    lastDelivery: "2m ago",
  },
  {
    id: "we_220bc",
    url: "https://hooks.flux.dev/v2/orbit/incoming",
    events: ["billing.updated", "billing.refunded"],
    status: "failing",
    lastDelivery: "11m ago",
  },
  {
    id: "we_e1d12",
    url: "https://ops.acme.com/internal/audit",
    events: ["audit.log", "user.created", "user.deleted", "team.invited"],
    status: "success",
    lastDelivery: "3h ago",
  },
  {
    id: "we_aabc8",
    url: "https://stage.acme.com/integrations/orbit/webhook-receiver",
    events: ["user.created", "billing.updated"],
    status: "paused",
    lastDelivery: "—",
  },
  {
    id: "we_44910",
    url: "https://relay.zapier.com/hooks/catch/8829194/abcd",
    events: ["user.created", "user.updated", "billing.updated", "team.invited"],
    status: "success",
    lastDelivery: "27m ago",
  },
];

const STATUS_TONE: Record<
  EndpointStatus,
  { dot: string; label: string; tip: string }
> = {
  success: {
    dot: "bg-emerald-500 shadow-[0_0_0_2px_--theme(--color-emerald-500/15%)]",
    label: "text-emerald-700 dark:text-emerald-400",
    tip: "Healthy — last 100 deliveries succeeded",
  },
  failing: {
    dot: "bg-destructive shadow-[0_0_0_2px_--theme(--color-red-500/15%)]",
    label: "text-destructive",
    tip: "Failing — 4 of last 10 deliveries returned 5xx",
  },
  paused: {
    dot: "bg-muted-foreground/60",
    label: "text-muted-foreground",
    tip: "Paused — endpoint will not receive events",
  },
};

export interface Delivery {
  id: string;
  ts: string;
  event: string;
  endpointShort: string;
  status: number;
  ms: number;
  retried?: boolean;
  request: string;
  response: string;
}

const DELIVERIES: Delivery[] = [
  {
    id: "evt_01HRX2",
    ts: "12:48:21",
    event: "billing.updated",
    endpointShort: "api.acme.com/hooks/orbit",
    status: 200,
    ms: 124,
    request:
      '{\n  "id": "evt_01HRX2",\n  "type": "billing.updated",\n  "created": 1745671701,\n  "data": {\n    "object": {\n      "id": "sub_4F2k",\n      "customer": "cus_acme",\n      "plan": "team_annual",\n      "status": "active",\n      "amount": 29000\n    }\n  }\n}',
    response:
      '{\n  "received": true,\n  "queued_for": "ops-pipeline",\n  "trace_id": "tr_a91f3c8b6e5d04a1"\n}',
  },
  {
    id: "evt_01HRX1",
    ts: "12:46:02",
    event: "user.created",
    endpointShort: "relay.zapier.com/.../abcd",
    status: 200,
    ms: 311,
    request: "",
    response: "",
  },
  {
    id: "evt_01HRX0",
    ts: "12:42:18",
    event: "billing.updated",
    endpointShort: "hooks.flux.dev/v2/orbit",
    status: 502,
    ms: 5021,
    retried: true,
    request: "",
    response: "",
  },
  {
    id: "evt_01HRWZ",
    ts: "12:39:44",
    event: "team.invited",
    endpointShort: "api.acme.com/hooks/orbit",
    status: 200,
    ms: 88,
    request: "",
    response: "",
  },
  {
    id: "evt_01HRWY",
    ts: "12:31:09",
    event: "user.updated",
    endpointShort: "relay.zapier.com/.../abcd",
    status: 429,
    ms: 22,
    retried: true,
    request: "",
    response: "",
  },
  {
    id: "evt_01HRWX",
    ts: "12:18:51",
    event: "audit.log",
    endpointShort: "ops.acme.com/internal/audit",
    status: 204,
    ms: 47,
    request: "",
    response: "",
  },
];

function statusTone(code: number): string {
  if (code >= 500) return "border-destructive/30 text-destructive";
  if (code === 429) return "border-amber-500/40 text-amber-600 dark:text-amber-400";
  if (code >= 400) return "border-amber-500/40 text-amber-600 dark:text-amber-400";
  return "border-emerald-500/30 text-emerald-700 dark:text-emerald-400";
}

// Theme-adaptive Prism: tokens get Tailwind classes (which respect the dark
// variant) instead of inline colors from a static theme. The "blank" theme
// keeps Prism's tokenizer but strips its default styling so our classes win.
const PRISM_BLANK: PrismTheme = { plain: {}, styles: [] };

const PRISM_TOKEN_CLASS: Record<string, string> = {
  "string-property": "text-sky-700 dark:text-sky-300",
  property: "text-sky-700 dark:text-sky-300",
  string: "text-emerald-700 dark:text-emerald-300",
  number: "text-amber-700 dark:text-amber-300",
  boolean: "text-violet-700 dark:text-violet-300",
  null: "text-violet-700 dark:text-violet-300",
  punctuation: "text-muted-foreground/70",
  operator: "text-muted-foreground/70",
  comment: "text-muted-foreground italic",
};

function prismClass(types: string[]): string {
  for (const t of types) {
    const c = PRISM_TOKEN_CLASS[t];
    if (c) return c;
  }
  return "text-foreground/85";
}

export function SettingsWebhooksShowcasePage() {
  const [revealed, setRevealed] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "failed">("all");
  const [expandedId, setExpandedId] = useState<string | null>("evt_01HRX2");

  const SECRET_REAL = "whsec_8a2f0bd1e44c5a9772f3a";
  const SECRET_MASKED = "whsec_••••••••••••2f3a";

  const filtered =
    deliveryFilter === "failed"
      ? DELIVERIES.filter((d) => d.status >= 400)
      : DELIVERIES;

  return (
    <div className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Top bar */}
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-heading text-xl">
              <WebhookIcon className="size-5 text-muted-foreground" />
              Webhooks
            </h1>
            <p className="text-muted-foreground text-sm">
              Send realtime events to your servers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              render={<a href="#docs" />}
              className="text-muted-foreground hover:text-foreground"
            >
              View docs
              <ArrowUpRightIcon />
            </Button>
            <Button size="sm">
              <PlusIcon />
              Add endpoint
            </Button>
          </div>
        </header>

        {/* Signing secret row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-xs/5">
          <div className="flex items-center gap-3">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Signing secret
            </div>
            <div className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 font-mono text-xs">
              <span className="text-foreground/85">
                {revealed ? SECRET_REAL : SECRET_MASKED}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="-mr-1 size-5"
                aria-label={revealed ? "Hide signing secret" : "Reveal signing secret"}
                onClick={() => setRevealed((v) => !v)}
              >
                {revealed ? (
                  <EyeOffIcon className="!size-3" />
                ) : (
                  <EyeIcon className="!size-3" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-5"
                aria-label="Copy signing secret"
                onClick={() => {
                  try {
                    void navigator.clipboard.writeText(SECRET_REAL);
                  } catch {
                    /* ignore */
                  }
                  setCopiedSecret(true);
                  window.setTimeout(() => setCopiedSecret(false), 1200);
                }}
              >
                {copiedSecret ? (
                  <CheckIcon className="!size-3 text-emerald-500" />
                ) : (
                  <CopyIcon className="!size-3" />
                )}
              </Button>
            </div>
            <span className="text-muted-foreground text-xs">
              Used to verify the <code className="font-mono">Orbit-Signature</code> header.
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-amber-700 text-xs underline-offset-4 hover:underline dark:text-amber-400"
                >
                  <TriangleAlertIcon className="size-3.5" />
                  Rotate
                </button>
              }
            />
            <TooltipPopup side="top" className="max-w-[260px] p-2 text-left">
              <p className="font-medium text-foreground">Rotate signing secret</p>
              <p className="mt-0.5 text-muted-foreground">
                The previous secret stays valid for 24 hours so you can roll deploys.
              </p>
            </TooltipPopup>
          </Tooltip>
        </div>

        {/* Endpoints table */}
        <div className="mb-10 overflow-hidden rounded-xl border bg-card shadow-xs/5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4 text-[10px] uppercase tracking-wider">
                  URL
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Events
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Last delivery
                </TableHead>
                <TableHead className="w-px pe-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENDPOINTS.map((ep) => {
                const tone = STATUS_TONE[ep.status];
                const visible = ep.events.slice(0, 2);
                const overflow = ep.events.length - visible.length;
                return (
                  <TableRow key={ep.id}>
                    <TableCell className="ps-4">
                      <div className="flex max-w-[280px] items-center gap-2 font-mono text-xs">
                        <span className="truncate text-foreground/90">
                          {ep.url}
                        </span>
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/80">
                        {ep.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {visible.map((e) => (
                          <Badge
                            key={e}
                            variant="outline"
                            size="sm"
                            className="font-mono text-[10px]"
                          >
                            {e}
                          </Badge>
                        ))}
                        {overflow > 0 ? (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className="cursor-default font-mono text-[10px] text-muted-foreground"
                                >
                                  {`+${overflow}`}
                                </Badge>
                              }
                            />
                            <TooltipPopup side="top" className="p-2 text-left">
                              <ul className="flex flex-col gap-0.5 font-mono text-[11px]">
                                {ep.events.slice(2).map((e) => (
                                  <li key={e}>{e}</li>
                                ))}
                              </ul>
                            </TooltipPopup>
                          </Tooltip>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span className="inline-flex cursor-default items-center gap-2">
                              <span className={"size-1.5 rounded-full " + tone.dot} />
                              <span
                                className={
                                  "text-[10px] uppercase tracking-wider " +
                                  tone.label
                                }
                              >
                                {ep.status}
                              </span>
                            </span>
                          }
                        />
                        <TooltipPopup side="top">{tone.tip}</TooltipPopup>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {ep.lastDelivery}
                    </TableCell>
                    <TableCell className="pe-4">
                      <Menu>
                        <MenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${ep.url}`}
                            />
                          }
                        >
                          <MoreHorizontalIcon />
                        </MenuTrigger>
                        <MenuPopup align="end">
                          <MenuItem>
                            <PencilIcon /> Edit
                          </MenuItem>
                          <MenuItem>
                            <PauseIcon />{" "}
                            {ep.status === "paused" ? "Resume" : "Pause"}
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem variant="destructive">
                            <TrashIcon /> Delete
                          </MenuItem>
                        </MenuPopup>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Recent deliveries */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs/5">
          <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
            <div className="flex items-baseline gap-2">
              <h2 className="font-heading text-sm">Recent deliveries</h2>
              <span className="font-mono text-[10px] text-muted-foreground/80 uppercase tracking-[0.2em]">
                · last 24 hours
              </span>
            </div>
            <div className="inline-flex items-center rounded-md border bg-background p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDeliveryFilter("all")}
                className={
                  "rounded px-2 py-0.5 font-mono text-[11px] transition-colors " +
                  (deliveryFilter === "all"
                    ? "bg-foreground/[0.08] text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDeliveryFilter("failed")}
                className={
                  "rounded px-2 py-0.5 font-mono text-[11px] transition-colors " +
                  (deliveryFilter === "failed"
                    ? "bg-foreground/[0.08] text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Failed
              </button>
            </div>
          </header>

          <ul className="divide-y divide-border/60 font-mono text-xs">
            {filtered.map((d) => {
              const expanded = expandedId === d.id;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : d.id)}
                    className="grid w-full grid-cols-[64px_160px_1fr_56px_64px_24px] items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-foreground/[0.03]"
                  >
                    <span className="text-muted-foreground tabular-nums">
                      {d.ts}
                    </span>
                    <span className="truncate text-foreground/90">{d.event}</span>
                    <span className="truncate text-muted-foreground">
                      {d.endpointShort}
                    </span>
                    <Badge
                      variant="outline"
                      size="sm"
                      className={"justify-center font-mono text-[10px] " + statusTone(d.status)}
                    >
                      {d.status}
                    </Badge>
                    <span className="flex items-center justify-end gap-1 text-muted-foreground tabular-nums">
                      {d.retried ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <RotateCwIcon className="size-3 text-amber-500" />
                            }
                          />
                          <TooltipPopup side="top">Retried</TooltipPopup>
                        </Tooltip>
                      ) : null}
                      {d.ms}ms
                    </span>
                    <ChevronDownIcon
                      className={
                        "size-3.5 text-muted-foreground transition-transform " +
                        (expanded ? "rotate-180" : "")
                      }
                    />
                  </button>
                  {expanded ? (
                    <div className="border-t bg-foreground/[0.02] px-4 py-3 dark:bg-white/[0.02]">
                      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                        <span className="text-muted-foreground">
                          id{" "}
                          <span className="text-foreground/85">{d.id}</span>
                        </span>
                        <span className="text-muted-foreground">
                          attempt{" "}
                          <span className="text-foreground/85">
                            {d.retried ? "2 of 3" : "1 of 1"}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          duration{" "}
                          <span className="text-foreground/85">{d.ms}ms</span>
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1.5">
                          <Button size="xs" variant="outline">
                            <RotateCwIcon /> Resend
                          </Button>
                          <Button size="xs" variant="ghost">
                            <ArrowUpRightIcon /> Open
                          </Button>
                        </span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <PayloadBlock
                          label="Request"
                          body={
                            d.request ||
                            `{\n  "id": "${d.id}",\n  "type": "${d.event}",\n  "created": 1745671701\n}`
                          }
                        />
                        <PayloadBlock
                          label="Response"
                          status={d.status}
                          body={
                            d.response ||
                            (d.status >= 500
                              ? '{\n  "error": "upstream timeout",\n  "retry_after": 30\n}'
                              : d.status === 429
                                ? '{\n  "error": "rate_limited",\n  "retry_after": 12\n}'
                                : '{\n  "received": true\n}')
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <Separator />
          <div className="flex items-center justify-between px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
            <span>
              Showing {filtered.length} of {DELIVERIES.length} attempts
            </span>
            <a
              href="#all"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              View all deliveries
              <ArrowUpRightIcon className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PayloadBlock({
  label,
  body,
  status,
}: {
  label: string;
  body: string;
  status?: number;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-md border border-border/60 bg-background">
      <div className="flex items-center justify-between border-b border-border/60 px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            {label}
          </span>
          {status !== undefined ? (
            <Badge
              variant="outline"
              size="sm"
              className={"font-mono text-[9px] " + statusTone(status)}
            >
              {status}
            </Badge>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            try {
              void navigator.clipboard.writeText(body);
            } catch {
              /* ignore */
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        >
          {copied ? (
            <CheckIcon className="size-3 text-emerald-500" />
          ) : (
            <CopyIcon className="size-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <Highlight code={body.trim()} language="json" theme={PRISM_BLANK}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="max-h-56 overflow-auto px-3 py-2 font-mono text-[11px] leading-relaxed">
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line });
              return (
                <div key={i} {...lineProps} className="table-row">
                  <span className="table-cell select-none pr-3 text-right text-muted-foreground/40 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="table-cell whitespace-pre">
                    {line.map((token, key) => {
                      const tokenProps = getTokenProps({ token });
                      return (
                        <span
                          key={key}
                          className={prismClass(token.types)}
                        >
                          {tokenProps.children}
                        </span>
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
