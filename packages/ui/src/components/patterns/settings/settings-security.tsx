import { useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LaptopIcon,
  LogOutIcon,
  MapPinIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TrashIcon,
  UsbIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Separator } from "@orbit/ui/separator";

export interface Passkey {
  id: string;
  name: string;
  meta: string;
  lastUsed: string;
  icon: React.ReactNode;
}

export interface Session {
  id: string;
  location: string;
  browser: string;
  os: string;
  ip: string;
  lastActive: string;
  current?: boolean;
  icon: React.ReactNode;
}

const PASSKEYS: Passkey[] = [
  {
    id: "mbp",
    name: "MacBook Pro",
    meta: "Chrome · macOS Sequoia",
    lastUsed: "12 minutes ago",
    icon: <LaptopIcon className="size-4" />,
  },
  {
    id: "iphone",
    name: "iPhone 15 Pro",
    meta: "Safari · iOS 18.4",
    lastUsed: "yesterday",
    icon: <SmartphoneIcon className="size-4" />,
  },
  {
    id: "yubikey",
    name: "YubiKey 5C",
    meta: "Hardware key · USB-C",
    lastUsed: "3 days ago",
    icon: <UsbIcon className="size-4" />,
  },
  {
    id: "ipad",
    name: 'iPad Pro 11"',
    meta: "Safari · iPadOS 18",
    lastUsed: "2 weeks ago",
    icon: <SmartphoneIcon className="size-4" />,
  },
];

const SESSIONS: Session[] = [
  {
    id: "current",
    location: "Auckland, NZ",
    browser: "Chrome 132",
    os: "macOS",
    ip: "203.97.42.18",
    lastActive: "Active now",
    current: true,
    icon: <LaptopIcon className="size-4" />,
  },
  {
    id: "s2",
    location: "Auckland, NZ",
    browser: "Safari 18",
    os: "iOS",
    ip: "111.69.224.7",
    lastActive: "2 hours ago",
    icon: <SmartphoneIcon className="size-4" />,
  },
  {
    id: "s3",
    location: "Wellington, NZ",
    browser: "Firefox 132",
    os: "macOS",
    ip: "118.92.5.41",
    lastActive: "Yesterday at 21:14",
    icon: <LaptopIcon className="size-4" />,
  },
  {
    id: "s4",
    location: "Sydney, AU",
    browser: "Chrome 131",
    os: "Windows 11",
    ip: "60.241.18.222",
    lastActive: "3 days ago",
    icon: <LaptopIcon className="size-4" />,
  },
  {
    id: "s5",
    location: "Berlin, DE",
    browser: "Arc 1.62",
    os: "macOS",
    ip: "94.134.88.9",
    lastActive: "Apr 8 at 04:22",
    icon: <LaptopIcon className="size-4" />,
  },
];

const RECOVERY_CODES = [
  "4F2A-9XK7-LM3D",
  "8H2C-PQ4Z-T1NV",
  "B9R5-WYK2-JD7E",
  "C3M8-VL6P-HX4Q",
  "K7N1-ZB9R-FT2W",
  "P4S6-DX3J-MV8L",
  "Q8E2-NH5K-RY9A",
  "X1U7-AC6T-BG3F",
];

export function SettingsSecurityShowcasePage() {
  const [revealCodes, setRevealCodes] = useState(false);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Account · Security
        </div>
        <h1 className="mt-1 font-heading text-3xl">Security</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Sign-in methods, devices, and recovery options.
        </p>

        {/* 2FA banner */}
        <section className="mt-8 overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.07] to-emerald-500/[0.02]">
          <div className="flex items-start gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <ShieldCheckIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-sm">Two-factor authentication</span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-2.5" />
                  Enabled
                </span>
              </div>
              <p className="mt-1 text-muted-foreground text-xs">
                Authenticator app · paired with 1Password.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/80 uppercase tracking-[0.25em]">
                <ClockIcon className="size-2.5" />
                Last verified 2 hours ago
              </div>
            </div>
            <Button variant="ghost" size="sm" type="button">
              Manage
            </Button>
          </div>
        </section>

        {/* Passkeys */}
        <section className="mt-3 rounded-xl border border-border/60 bg-background/40">
          <header className="flex items-start justify-between gap-3 p-5">
            <div>
              <h2 className="font-heading text-base">Passkeys</h2>
              <p className="mt-1 text-muted-foreground text-xs">
                Phishing-resistant sign-in via Touch ID, Face ID, or hardware keys.
              </p>
            </div>
            <Button size="sm" type="button">
              <PlusIcon />
              Add passkey
            </Button>
          </header>
          <Separator />
          <ul>
            {PASSKEYS.map((p, i) => (
              <li
                key={p.id}
                className={`flex items-center gap-4 px-5 py-3.5 ${
                  i < PASSKEYS.length - 1 ? "border-b border-border/40" : ""
                }`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground/[0.06] text-muted-foreground">
                  {p.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    {p.meta}
                  </div>
                </div>
                <div className="hidden font-mono text-[10px] text-muted-foreground/80 uppercase tracking-[0.2em] sm:block">
                  {p.lastUsed}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${p.name}`}
                >
                  <TrashIcon className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Active sessions */}
        <section className="mt-3 rounded-xl border border-border/60 bg-background/40">
          <header className="flex items-center justify-between gap-3 p-5">
            <div>
              <h2 className="font-heading text-base">Active sessions</h2>
              <p className="mt-1 text-muted-foreground text-xs">
                {SESSIONS.length} signed-in devices.
              </p>
            </div>
            <span className="hidden font-mono text-[10px] text-muted-foreground/80 uppercase tracking-[0.25em] sm:inline">
              IP · last active
            </span>
          </header>
          <Separator />
          <ul className="px-2 py-2">
            {SESSIONS.map((s) => (
              <li
                key={s.id}
                className={`flex items-center gap-4 rounded-lg px-3 py-3 ${
                  s.current
                    ? "bg-emerald-500/[0.06] ring-1 ring-emerald-500/25"
                    : "transition-colors hover:bg-foreground/[0.03]"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                    s.current
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-foreground/[0.06] text-muted-foreground"
                  }`}
                >
                  {s.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-medium text-sm">
                      <MapPinIcon className="size-3 opacity-50" />
                      {s.location}
                    </span>
                    {s.current ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2Icon className="size-2.5" />
                        This device
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    {s.browser} · {s.os}
                  </div>
                </div>
                <div className="hidden flex-col items-end text-right sm:flex">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {s.ip}
                  </span>
                  <span className="mt-0.5 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                    {s.lastActive}
                  </span>
                </div>
                {s.current ? (
                  <span className="w-[68px] text-right font-mono text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em]">
                    Current
                  </span>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-[68px] items-center justify-center gap-1 rounded-md border border-border/60 bg-background/40 px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] transition-colors hover:border-destructive/40 hover:text-destructive"
                    aria-label="Revoke session"
                  >
                    <XIcon className="size-2.5" />
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="text-muted-foreground text-xs">
              Signs out everything except this device.
            </p>
            <Button
              size="sm"
              variant="outline"
              type="button"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOutIcon />
              Sign out of all other sessions
            </Button>
          </div>
        </section>

        {/* Recovery codes */}
        <section className="mt-3 rounded-xl border border-border/60 bg-background/40 p-6">
          <header className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <KeyRoundIcon className="size-4 opacity-60" />
                <h2 className="font-heading text-base">Recovery codes</h2>
              </div>
              <p className="mt-1 text-muted-foreground text-xs">
                Use one of these one-time codes if you lose access to your authenticator.
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => setRevealCodes((v) => !v)}
            >
              {revealCodes ? (
                <>
                  <EyeOffIcon />
                  Hide codes
                </>
              ) : (
                <>
                  <EyeIcon />
                  Reveal codes
                </>
              )}
            </Button>
          </header>

          <div className="relative mt-4">
            <ul
              className={`grid grid-cols-2 gap-2 transition ${
                revealCodes ? "" : "select-none blur-sm"
              }`}
              aria-hidden={!revealCodes}
            >
              {RECOVERY_CODES.map((code, i) => (
                <li
                  key={code}
                  className="flex items-center gap-3 rounded-md border border-border/50 bg-background/60 px-3 py-2"
                >
                  <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[13px] tracking-wider">
                    {code}
                  </span>
                </li>
              ))}
            </ul>
            {!revealCodes ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-background/80 px-3 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] ring-1 ring-border/60 backdrop-blur">
                  Hidden
                </span>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-amber-800 text-xs leading-relaxed dark:text-amber-200/90">
                Regenerating invalidates all 8 codes above. Store the new set somewhere safe.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              type="button"
              className="shrink-0 border-amber-500/40 text-amber-800 hover:bg-amber-500/10 dark:text-amber-200"
            >
              <RefreshCwIcon />
              Regenerate codes
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
