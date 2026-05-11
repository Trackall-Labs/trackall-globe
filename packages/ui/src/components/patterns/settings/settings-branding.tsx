import { useState } from "react";
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  CircleSlashIcon,
  CopyIcon,
  GlobeIcon,
  ImageIcon,
  MailIcon,
  RefreshCwIcon,
  UploadCloudIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Input } from "@orbit/ui/input";
import { Label } from "@orbit/ui/label";
import { Separator } from "@orbit/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@orbit/ui/popover";

export type SwatchKey =
  | "primary"
  | "accent"
  | "surface"
  | "border"
  | "foreground";

export type DomainStatus = "verified" | "pending" | "unset";

const SWATCH_DEFS: { key: SwatchKey; label: string; hint: string }[] = [
  { key: "primary", label: "Primary", hint: "Buttons, links" },
  { key: "accent", label: "Accent", hint: "Highlights" },
  { key: "surface", label: "Surface", hint: "Cards" },
  { key: "border", label: "Border", hint: "Dividers" },
  { key: "foreground", label: "Foreground", hint: "Body text" },
];

const PRESETS = [
  "#0a0a0a",
  "#ffffff",
  "#fafafa",
  "#e4e4e7",
  "#71717a",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#06b6d4",
];

const DEFAULT_COLORS: Record<SwatchKey, string> = {
  primary: "#0a0a0a",
  accent: "#8b5cf6",
  surface: "#ffffff",
  border: "#e4e4e7",
  foreground: "#0a0a0a",
};

export function SettingsBrandingShowcasePage() {
  const [colors, setColors] = useState<Record<SwatchKey, string>>(
    DEFAULT_COLORS,
  );
  const [openKey, setOpenKey] = useState<SwatchKey | null>(null);
  const [domain, setDomain] = useState("workspace.acme.io");
  const [domainStatus, setDomainStatus] = useState<DomainStatus>("pending");
  const [copied, setCopied] = useState(false);
  const [fromName, setFromName] = useState("Orbit");
  const [fromAddress, setFromAddress] = useState("noreply@acme.io");

  const txtRecord = "_orbit-verify=abc123def456";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(txtRecord).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Settings · Branding
        </div>
        <h1 className="mt-1 font-heading text-3xl">Workspace branding</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Logo, colours, custom domain, and the from-name on outbound mail.
        </p>

        {/* Logos */}
        <section className="mt-10">
          <SectionHeader
            title="Logo"
            hint="Shown in nav, login, and emails. Pick one for each surface."
          />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LogoZone variant="light" />
            <LogoZone variant="dark" />
          </div>
          <p className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            <ImageIcon className="size-3" />
            SVG or PNG · max 2MB
          </p>
        </section>

        <Separator className="my-10" />

        {/* Palette + preview */}
        <section>
          <SectionHeader
            title="Colour palette"
            hint="Five tokens drive the look of the whole product."
          />
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="flex flex-wrap items-start gap-3">
              {SWATCH_DEFS.map((s) => (
                <Popover
                  key={s.key}
                  open={openKey === s.key}
                  onOpenChange={(o) => setOpenKey(o ? s.key : null)}
                >
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-background/40 p-3 transition-colors hover:border-border"
                      />
                    }
                  >
                    <span
                      className="size-10 rounded-full ring-1 ring-border/60 ring-offset-2 ring-offset-background transition-transform group-hover:scale-105"
                      style={{ background: colors[s.key] }}
                    />
                    <span className="font-medium text-xs">{s.label}</span>
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                      {colors[s.key]}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-3">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                      {s.label} · {s.hint}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="size-7 shrink-0 rounded-md ring-1 ring-border/60"
                        style={{ background: colors[s.key] }}
                      />
                      <Input
                        size="sm"
                        nativeInput
                        value={colors[s.key]}
                        onChange={(e) =>
                          setColors((c) => ({
                            ...c,
                            [s.key]: e.target.value,
                          }))
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="mt-3 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                      Presets
                    </div>
                    <div className="mt-1.5 grid grid-cols-6 gap-1.5">
                      {PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          aria-label={`Use ${p}`}
                          onClick={() =>
                            setColors((c) => ({ ...c, [s.key]: p }))
                          }
                          className={`size-7 rounded-md ring-1 ring-border/60 transition-transform hover:scale-110 ${
                            colors[s.key].toLowerCase() === p.toLowerCase()
                              ? "ring-2 ring-foreground"
                              : ""
                          }`}
                          style={{ background: p }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setColors((c) => ({
                            ...c,
                            [s.key]: DEFAULT_COLORS[s.key],
                          }))
                        }
                        className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:text-foreground"
                      >
                        Reset
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setOpenKey(null)}
                      >
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
              <button
                type="button"
                onClick={() => setColors(DEFAULT_COLORS)}
                className="ml-auto inline-flex h-8 items-center gap-1.5 self-start rounded-md px-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <RefreshCwIcon className="size-3" />
                Reset all
              </button>
            </div>

            <aside className="lg:sticky lg:top-12 lg:self-start">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                Live preview
              </div>
              <PalettePreview colors={colors} />
            </aside>
          </div>
        </section>

        <Separator className="my-10" />

        {/* Custom domain */}
        <section>
          <SectionHeader
            title="Custom domain"
            hint="Serve the workspace from your own subdomain."
          />
          <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-5">
            <Label htmlFor="b-domain">Domain</Label>
            <div className="mt-1.5 flex items-stretch gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
                  <GlobeIcon className="size-3.5 opacity-60" />
                </span>
                <Input
                  id="b-domain"
                  nativeInput
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="workspace.yourcompany.com"
                  className="pl-8 font-mono text-sm"
                />
              </div>
              <DomainStatusPill status={domainStatus} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDomainStatus("verified")}
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:text-foreground"
              >
                · simulate verified
              </button>
              <button
                type="button"
                onClick={() => setDomainStatus("pending")}
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:text-foreground"
              >
                · simulate pending
              </button>
              <button
                type="button"
                onClick={() => setDomainStatus("unset")}
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:text-foreground"
              >
                · simulate unset
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-border/60 bg-foreground/[0.02] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                    TXT record
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Add this to your DNS so we can verify ownership.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <CheckCircle2Icon />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1.5 rounded-md border border-border/60 bg-background p-3 font-mono text-[11px]">
                <span className="text-muted-foreground uppercase tracking-[0.2em]">
                  Type
                </span>
                <span>TXT</span>
                <span className="text-muted-foreground uppercase tracking-[0.2em]">
                  Host
                </span>
                <span>{domain || "@"}</span>
                <span className="text-muted-foreground uppercase tracking-[0.2em]">
                  Value
                </span>
                <span className="break-all">{txtRecord}</span>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-10" />

        {/* Email from name */}
        <section className="pb-12">
          <SectionHeader
            title="Email from-name"
            hint="What recipients see in their inbox."
          />
          <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-from-name">From name</Label>
                <Input
                  id="b-from-name"
                  nativeInput
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Orbit"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-from-addr">Reply-to address</Label>
                <Input
                  id="b-from-addr"
                  nativeInput
                  type="email"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  placeholder="noreply@acme.io"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="mt-4 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Inbox preview
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-border/60">
                <MailIcon className="size-4 opacity-70" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-sm">
                    {fromName || "Orbit"}
                  </span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">
                    &lt;{fromAddress || "noreply@example.com"}&gt;
                  </span>
                </div>
                <div className="mt-0.5 truncate text-sm">
                  Welcome to {fromName || "Orbit"} — your account is ready.
                </div>
                <div className="mt-0.5 truncate text-muted-foreground text-xs">
                  Tap to confirm your email and get started in under a minute…
                </div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                2m
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <header>
      <h2 className="font-heading text-base">{title}</h2>
      {hint ? (
        <p className="mt-1 text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </header>
  );
}

export function LogoZone({ variant }: { variant: "light" | "dark" }) {
  const isLight = variant === "light";
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-background/40">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full ring-1 ring-border/60"
            style={{ background: isLight ? "#fafafa" : "#0a0a0a" }}
          />
          <span className="font-medium text-sm">
            {isLight ? "Light mode logo" : "Dark mode logo"}
          </span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.25em]">
          {isLight ? "Light" : "Dark"}
        </span>
      </div>
      <div
        className="relative flex h-32 items-center justify-center overflow-hidden"
        style={{
          background: isLight ? "#fafafa" : "#0a0a0a",
          color: isLight ? "#0a0a0a" : "#fafafa",
        }}
      >
        <BrandWordmark color={isLight ? "#0a0a0a" : "#fafafa"} />
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 border-t py-1.5 font-mono text-[9px] uppercase tracking-[0.25em]"
          style={{
            background: isLight ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)",
            borderColor: isLight ? "#e4e4e7" : "#27272a",
            color: isLight ? "#71717a" : "#a1a1aa",
          }}
        >
          <UploadCloudIcon className="size-3" />
          Drop or click to replace
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          orbit-{variant}.svg · 4.2 KB
        </span>
        <Button size="sm" variant="outline" type="button">
          <UploadCloudIcon />
          Replace
        </Button>
      </div>
    </div>
  );
}

export function BrandWordmark({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 140 32"
      width={140}
      height={32}
      fill="none"
      aria-label="ORBIT wordmark"
    >
      <circle cx="14" cy="16" r="10" stroke={color} strokeWidth="2.5" />
      <circle cx="14" cy="16" r="3" fill={color} />
      <text
        x="32"
        y="22"
        fontFamily='ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
        fontSize="18"
        fontWeight="700"
        letterSpacing="0.18em"
        fill={color}
      >
        ORBIT
      </text>
    </svg>
  );
}

export function DomainStatusPill({ status }: { status: DomainStatus }) {
  if (status === "verified") {
    return (
      <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 font-mono text-[10px] text-emerald-700 uppercase tracking-[0.25em] dark:text-emerald-400">
        <CheckCircle2Icon className="size-3.5" />
        Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 font-mono text-[10px] text-amber-700 uppercase tracking-[0.25em] dark:text-amber-400">
        <CircleAlertIcon className="size-3.5" />
        Pending DNS
      </span>
    );
  }
  return (
    <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-foreground/[0.04] px-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
      <CircleSlashIcon className="size-3.5" />
      Not configured
    </span>
  );
}

export function PalettePreview({ colors }: { colors: Record<SwatchKey, string> }) {
  const style = {
    "--p-primary": colors.primary,
    "--p-accent": colors.accent,
    "--p-surface": colors.surface,
    "--p-border": colors.border,
    "--p-foreground": colors.foreground,
  } as React.CSSProperties;

  return (
    <div
      className="mt-2 overflow-hidden rounded-xl ring-1 ring-border/60 shadow-sm"
      style={{
        ...style,
        background: "var(--p-surface)",
        color: "var(--p-foreground)",
      }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-2 text-[10px] uppercase tracking-[0.25em]"
        style={{
          borderColor: "var(--p-border)",
          color: "var(--p-foreground)",
          opacity: 0.7,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="size-1.5 rounded-full"
            style={{ background: "var(--p-accent)" }}
          />
          Acme · Pro
        </div>
        <span style={{ opacity: 0.5 }}>v2.4</span>
      </div>

      <div className="p-4">
        <div
          className="rounded-lg border p-3"
          style={{ borderColor: "var(--p-border)" }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ opacity: 0.6 }}
          >
            Active users
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className="font-heading text-2xl"
              style={{ color: "var(--p-foreground)" }}
            >
              12,408
            </span>
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]"
              style={{
                background: "color-mix(in srgb, var(--p-accent) 20%, transparent)",
                color: "var(--p-accent)",
              }}
            >
              +4.1%
            </span>
          </div>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
            style={{
              background:
                "color-mix(in srgb, var(--p-foreground) 8%, transparent)",
            }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: "62%", background: "var(--p-accent)" }}
            />
          </div>
        </div>

        <button
          type="button"
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg px-3 font-medium text-sm transition-opacity hover:opacity-90"
          style={{
            background: "var(--p-primary)",
            color:
              "color-mix(in srgb, var(--p-primary) 100%, transparent) ",
          }}
        >
          <span style={{ color: contrastOn(colors.primary) }}>
            Save changes
          </span>
        </button>
        <button
          type="button"
          className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-lg border px-3 font-medium text-sm"
          style={{
            borderColor: "var(--p-border)",
            color: "var(--p-foreground)",
            background: "transparent",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function contrastOn(hex: string): string {
  // crude luminance check so text stays legible on any primary
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#fff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0a0a0a" : "#ffffff";
}
