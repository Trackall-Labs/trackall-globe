import { useEffect, useRef, useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileArchiveIcon,
  HourglassIcon,
  ShieldOffIcon,
  TimerResetIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Checkbox } from "@orbit/ui/checkbox";
import { Progress } from "@orbit/ui/progress";
import { Slider } from "@orbit/ui/slider";
import { Switch } from "@orbit/ui/switch";

export type IncludeKey = "messages" | "files" | "comments" | "activity" | "calendar";

const INCLUDE_OPTIONS: ReadonlyArray<{
  key: IncludeKey;
  label: string;
  size: string;
  hint: string;
}> = [
  { key: "messages", label: "Messages", size: "412 MB", hint: "Direct + channel" },
  { key: "files", label: "Files & uploads", size: "1.6 GB", hint: "Originals only" },
  { key: "comments", label: "Comments", size: "38 MB", hint: "All threads" },
  { key: "activity", label: "Activity log", size: "104 MB", hint: "Last 12 months" },
  { key: "calendar", label: "Calendar events", size: "12 MB", hint: "ICS + metadata" },
];

const RETENTION_STOPS = [30, 90, 180, 365, 9999] as const;
const RETENTION_LABELS = ["30d", "90d", "180d", "365d", "Forever"] as const;

export type RetentionKey = "dms" | "activity" | "deleted" | "audit";

const RETENTION_ROWS: ReadonlyArray<{
  key: RetentionKey;
  label: string;
  noun: string;
  defaultStop: number;
}> = [
  { key: "dms", label: "Direct messages", noun: "Messages", defaultStop: 1 },
  { key: "activity", label: "Activity log", noun: "Activity entries", defaultStop: 2 },
  { key: "deleted", label: "Deleted items", noun: "Items in trash", defaultStop: 0 },
  { key: "audit", label: "Audit log", noun: "Audit events", defaultStop: 3 },
];

export type ExportPhase = "idle" | "running" | "done";

export function SettingsPrivacyShowcasePage() {
  // ── Export state ────────────────────────────────────────────────────────
  const [include, setInclude] = useState<Record<IncludeKey, boolean>>({
    messages: true,
    files: true,
    comments: true,
    activity: false,
    calendar: false,
  });
  const [phase, setPhase] = useState<ExportPhase>("idle");
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "running") return;
    const start = performance.now();
    const DURATION = 4200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setProgress(Math.round(t * 100));
      if (t < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        setPhase("done");
      }
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [phase]);

  // ── Retention state ─────────────────────────────────────────────────────
  const [retention, setRetention] = useState<Record<RetentionKey, number>>(
    () =>
      RETENTION_ROWS.reduce(
        (acc, r) => {
          acc[r.key] = r.defaultStop;
          return acc;
        },
        {} as Record<RetentionKey, number>,
      ),
  );

  // ── Delete account state ────────────────────────────────────────────────
  const [pending, setPending] = useState(false);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Settings · Privacy & data
        </div>
        <h1 className="mt-1 font-heading text-3xl">Privacy & data</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Export what we have, decide how long it sticks around, or shut it
          down for good.
        </p>

        {/* ── Export ── */}
        <section className="mt-8 rounded-xl border border-border/60 bg-background/40">
          <div className="flex items-start gap-4 p-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground/[0.06]">
              <FileArchiveIcon className="size-4" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-base">Export your data</h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Bundle everything we hold for you into a single archive. We'll
                email a download link when it's ready.
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Approx
              </div>
              <div className="mt-0.5 font-heading text-xl tabular-nums">
                2.4 GB
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 px-6 py-4">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Include in archive
            </div>
            <ul className="mt-3 flex flex-col gap-1">
              {INCLUDE_OPTIONS.map((opt) => (
                <li key={opt.key}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-foreground/[0.03]">
                    <Checkbox
                      checked={include[opt.key]}
                      onCheckedChange={(v) =>
                        setInclude((s) => ({ ...s, [opt.key]: Boolean(v) }))
                      }
                    />
                    <span className="flex-1 text-sm">{opt.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                      {opt.hint}
                    </span>
                    <span className="w-16 text-right font-mono text-xs tabular-nums">
                      {opt.size}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border/40 p-4">
            {phase === "idle" ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  We'll prepare the archive and email{" "}
                  <span className="font-mono">sean@cal.com</span> when it's
                  ready.
                </p>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => {
                    setProgress(0);
                    setPhase("running");
                  }}
                >
                  Generate export
                </Button>
              </div>
            ) : null}

            {phase === "running" ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2">
                    <HourglassIcon className="size-3.5 animate-pulse text-muted-foreground" />
                    Preparing archive…
                  </span>
                  <span className="font-mono text-xs tabular-nums">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} />
                <p className="text-muted-foreground text-xs">
                  Compressing {selectedCount(include)} categories — this stays
                  in the background.
                </p>
              </div>
            ) : null}

            {phase === "done" ? (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-500/[0.08] px-3 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-emerald-700 dark:text-emerald-400" />
                  <div>
                    <div className="font-medium text-sm">Archive ready</div>
                    <p className="text-muted-foreground text-xs">
                      orbit-export-2026-04-26.zip · link expires in 24h
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setPhase("idle");
                      setProgress(0);
                    }}
                  >
                    Reset
                  </Button>
                  <Button size="sm" type="button">
                    <DownloadIcon />
                    Download
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* ── Retention ── */}
        <section className="mt-3 rounded-xl border border-border/60 bg-background/40">
          <div className="flex items-start gap-4 p-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground/[0.06]">
              <TimerResetIcon className="size-4" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-base">Data retention</h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Auto-delete older content on a schedule. Workspace admins can
                tighten — never loosen — these rules.
              </p>
            </div>
          </div>

          <div className="border-t border-border/40 px-6 py-2">
            {RETENTION_ROWS.map((row, i) => {
              const stop = retention[row.key];
              const days = RETENTION_STOPS[stop] ?? RETENTION_STOPS[0];
              const label = RETENTION_LABELS[stop] ?? RETENTION_LABELS[0];
              return (
                <div
                  key={row.key}
                  className={`py-5 ${i < RETENTION_ROWS.length - 1 ? "border-b border-border/40" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{row.label}</div>
                    <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] tabular-nums">
                      {label}
                    </span>
                  </div>
                  <div className="mt-3 px-1">
                    <Slider
                      min={0}
                      max={RETENTION_STOPS.length - 1}
                      step={1}
                      value={[stop]}
                      onValueChange={(v) => {
                        const arr = v as number[];
                        const next = arr[0] ?? 0;
                        setRetention((s) => ({ ...s, [row.key]: next }));
                      }}
                    />
                    <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] tabular-nums">
                      {RETENTION_LABELS.map((l, idx) => (
                        <span
                          key={l}
                          className={
                            idx === stop
                              ? "text-foreground"
                              : "text-muted-foreground/60"
                          }
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-muted-foreground text-xs">
                    {retentionPreview(row.noun, days)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Delete account ── */}
        <section className="relative mt-3 overflow-hidden rounded-xl border border-destructive/40 bg-destructive/[0.025]">
          <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/85 px-2 py-1 backdrop-blur">
            <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.25em]">
              Demo
            </span>
            <Switch
              checked={pending}
              onCheckedChange={(v) => setPending(Boolean(v))}
            />
            <span className="font-mono text-[10px] tabular-nums">
              {pending ? "pending" : "active"}
            </span>
          </div>

          <div className="flex items-start gap-4 p-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              {pending ? (
                <AlertTriangleIcon className="size-4" />
              ) : (
                <ShieldOffIcon className="size-4" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-base">Delete this account</h2>
              <p className="mt-1 text-muted-foreground text-sm">
                {pending
                  ? "Your account is queued for deletion. Cancel any time before the deadline."
                  : "This is irreversible. We hold a 30-day grace window so you can change your mind."}
              </p>
            </div>
          </div>

          {!pending ? <DeleteActive onRequest={() => setPending(true)} /> : null}
          {pending ? <DeletePending onCancel={() => setPending(false)} /> : null}
        </section>
      </div>
    </div>
  );
}

function selectedCount(include: Record<IncludeKey, boolean>): number {
  return Object.values(include).filter(Boolean).length;
}

function retentionPreview(noun: string, days: number): string {
  if (days >= 9999) {
    return `${noun} are kept indefinitely. Nothing is auto-deleted.`;
  }
  return `${noun} older than ${days} days will be permanently deleted at the end of each month.`;
}

export function DeleteActive({ onRequest }: { onRequest: () => void }) {
  return (
    <>
      <div className="border-t border-destructive/20 px-6 py-4">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          What happens
        </div>
        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
          <DeleteRow
            tone="now"
            label="Profile, sessions, API tokens"
            sub="Deleted immediately"
          />
          <DeleteRow
            tone="grace"
            label="Messages, files, comments"
            sub="Recoverable for 30 days, then purged"
          />
          <DeleteRow
            tone="legal"
            label="Billing & audit records"
            sub="Retained 90 days for legal compliance"
          />
        </ul>
      </div>
      <div className="flex items-center justify-between border-t border-destructive/20 p-4">
        <p className="text-muted-foreground text-xs">
          You'll receive a confirmation email before anything is touched.
        </p>
        <Button
          size="sm"
          variant="outline"
          type="button"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRequest}
        >
          Request account deletion
        </Button>
      </div>
    </>
  );
}

export function DeletePending({ onCancel }: { onCancel: () => void }) {
  const TOTAL = 30;
  const remaining = 23;
  const pct = remaining / TOTAL;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - pct);

  return (
    <div className="border-t border-destructive/20">
      <div className="flex items-center gap-6 p-6">
        <div className="relative flex size-24 shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="size-24 -rotate-90"
            aria-hidden
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-destructive/15"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="text-destructive transition-[stroke-dashoffset] duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-heading text-xl tabular-nums">{remaining}</div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
              days left
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">Deletion scheduled</div>
          <p className="mt-1 text-muted-foreground text-sm">
            We'll permanently delete your account on{" "}
            <span className="font-medium text-foreground">May 19, 2026</span>{" "}
            at 00:00 UTC. Cancel any time before then.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-foreground/[0.04] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
            <span className="size-1.5 rounded-full bg-destructive" />
            Pending deletion · requested Apr 26
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-destructive/20 p-4">
        <p className="text-muted-foreground text-xs">
          Cancelling restores your account to its current state immediately.
        </p>
        <Button size="sm" type="button" onClick={onCancel}>
          Cancel deletion request
        </Button>
      </div>
    </div>
  );
}

export function DeleteRow({
  tone,
  label,
  sub,
}: {
  tone: "now" | "grace" | "legal";
  label: string;
  sub: string;
}) {
  const dot =
    tone === "now"
      ? "bg-destructive"
      : tone === "grace"
        ? "bg-amber-500"
        : "bg-muted-foreground/60";
  const tag =
    tone === "now"
      ? "Now"
      : tone === "grace"
        ? "30 days"
        : "90 days";
  return (
    <li className="flex items-center gap-3">
      <span className={`size-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="flex-1">{label}</span>
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
        {tag}
      </span>
      <span className="w-44 text-right text-muted-foreground text-xs">
        {sub}
      </span>
    </li>
  );
}
