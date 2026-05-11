import {
  KeyRoundIcon,
  LaptopIcon,
  LockIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@orbit/ui/button";

export interface Session {
  device: string;
  browser: string;
  Icon: ComponentType<{ className?: string }>;
  location: string;
  ip: string;
  lastActive: string;
  current?: boolean;
  trusted?: boolean;
}

const SESSIONS: Session[] = [
  { device: "MacBook Pro", browser: "Arc 1.42", Icon: LaptopIcon, location: "Brooklyn, NY · this network", ip: "203.0.113.18", lastActive: "active now", current: true, trusted: true },
  { device: "iPhone 16 Pro", browser: "Acme app · iOS 18.4", Icon: SmartphoneIcon, location: "Brooklyn, NY", ip: "203.0.113.18", lastActive: "12 min ago", trusted: true },
  { device: "iPad Air", browser: "Safari 18", Icon: TabletIcon, location: "Brooklyn, NY", ip: "203.0.113.18", lastActive: "Yesterday", trusted: true },
  { device: "Chromebook", browser: "Chrome 142", Icon: LaptopIcon, location: "Toronto, CA", ip: "198.51.100.7", lastActive: "3 days ago" },
  { device: "Pixel 8", browser: "Acme app · Android 15", Icon: SmartphoneIcon, location: "Berlin, DE", ip: "192.0.2.41", lastActive: "Apr 18", trusted: false },
];

const KEYS = [
  { label: "YubiKey 5C NFC", added: "Apr 2024", lastUsed: "today" },
  { label: "MacBook · Touch ID", added: "Aug 2024", lastUsed: "today" },
];

export function ProfileCredentialsShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Settings · security
        </div>
        <h1 className="mt-1 font-heading text-2xl">Credentials & sessions</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage where you're signed in and how you sign in. We notify you on
          new devices.
        </p>

        <div className="mt-6 rounded-xl border border-border/60 bg-emerald-500/[0.04] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <div className="text-sm">
                Your account is protected with two-factor and a passkey.
              </div>
              <div className="mt-0.5 text-muted-foreground text-xs">
                Recovery codes regenerated 14 days ago.
              </div>
            </div>
            <Button variant="ghost" type="button">
              Review
            </Button>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-lg">Active sessions</h2>
              <p className="text-muted-foreground text-xs">
                {SESSIONS.length} devices · 1 active now
              </p>
            </div>
            <Button variant="outline" type="button">
              Sign out everywhere
            </Button>
          </div>

          <ul className="mt-4 divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-background/40">
            {SESSIONS.map((s) => (
              <li
                key={s.device + s.ip}
                className="grid grid-cols-[44px_1fr_140px_auto] items-center gap-3 px-4 py-3.5"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-foreground/[0.06]">
                  <s.Icon className="size-5 opacity-70" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    {s.device}
                    {s.current ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-700 uppercase tracking-[0.2em] dark:text-emerald-400">
                        This device
                      </span>
                    ) : null}
                    {s.trusted ? (
                      <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                        Trusted
                      </span>
                    ) : null}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {s.browser} · {s.location}
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] text-muted-foreground">
                  <div>{s.lastActive}</div>
                  <div>{s.ip}</div>
                </div>
                {s.current ? (
                  <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em]">
                    —
                  </span>
                ) : (
                  <button
                    type="button"
                    className="rounded-md border border-border/60 px-3 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] hover:border-rose-500/40 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    Sign out
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-lg">Passkeys & security keys</h2>
            <Button variant="outline" type="button">
              <KeyRoundIcon />
              Add a passkey
            </Button>
          </div>
          <ul className="mt-4 divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-background/40">
            {KEYS.map((k) => (
              <li
                key={k.label}
                className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-3"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-foreground/[0.06]">
                  <LockIcon className="size-4 opacity-70" />
                </div>
                <div>
                  <div className="text-sm">{k.label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    Added {k.added} · last used {k.lastUsed}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-border/60 px-3 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] hover:border-rose-500/40 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
