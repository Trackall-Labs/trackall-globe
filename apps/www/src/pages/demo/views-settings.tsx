import { useState } from "react";
import {
  CheckIcon,
  PaintbrushIcon,
  SettingsIcon,
  ShieldAlertIcon,
  TrashIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Input } from "@orbit/ui/input";
import { Label } from "@orbit/ui/label";
import { Separator } from "@orbit/ui/separator";
import { Switch } from "@orbit/ui/switch";
import { useTheme } from "@orbit/ui/theme-provider";
import { useDemo, type SettingsTab } from "./store";

const TABS: { id: SettingsTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", Icon: SettingsIcon },
  { id: "appearance", label: "Appearance", Icon: PaintbrushIcon },
  { id: "members", label: "Members", Icon: UsersIcon },
  { id: "danger", label: "Danger zone", Icon: ShieldAlertIcon },
];

export function SettingsView() {
  const { settingsTab, setSettingsTab } = useDemo();
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-[200px_1fr] gap-10">
      <aside>
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Settings
        </div>
        <ul className="mt-3 flex flex-col gap-0.5">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSettingsTab(t.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                  settingsTab === t.id
                    ? "bg-foreground/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
                } ${t.id === "danger" ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : ""} ${
                  settingsTab === "danger" && t.id === "danger" ? "bg-destructive/[0.08]" : ""
                }`}
              >
                <t.Icon className="size-4 opacity-70" />
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main>
        {settingsTab === "general" ? <GeneralPane /> : null}
        {settingsTab === "appearance" ? <AppearancePane /> : null}
        {settingsTab === "members" ? <MembersPane /> : null}
        {settingsTab === "danger" ? <DangerPane /> : null}
      </main>
    </div>
  );
}

function GeneralPane() {
  const { workspaces, currentWorkspaceId, pushToast } = useDemo();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId)!;
  const [name, setName] = useState(ws.name);
  const [slug, setSlug] = useState("acme");
  const [dirty, setDirty] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [publicSignup, setPublicSignup] = useState(true);

  return (
    <>
      <Header
        eyebrow="Settings · General"
        title="General"
        sub="Workspace identity and defaults."
      />

      <Section title="Identity" hint="Visible to anyone with access.">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 ring-1 ring-border/60" />
          <div className="flex-1">
            <Button size="sm" variant="outline" type="button">
              <UploadIcon />
              Upload avatar
            </Button>
            <p className="mt-1.5 text-muted-foreground text-xs">
              PNG or SVG, 1024×1024 max.
            </p>
          </div>
        </div>

        <Field label="Workspace name" htmlFor="ws-name">
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDirty(true);
            }}
            nativeInput
          />
        </Field>

        <Field label="URL" htmlFor="ws-slug" hint="orbit.so/<slug>">
          <div className="flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-3 font-mono text-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/24">
            <span className="text-muted-foreground">orbit.so/</span>
            <input
              id="ws-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setDirty(true);
              }}
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </Field>
      </Section>

      <Separator className="my-8" />

      <Section title="Defaults">
        <SwitchRow
          title="Public sign-up"
          description="Anyone with a workspace email can request access."
          checked={publicSignup}
          onChange={() => {
            setPublicSignup((v) => !v);
            setDirty(true);
          }}
        />
        <SwitchRow
          title="Two-factor for admins"
          description="Require a second factor for owner and admin roles."
          checked={twoFactor}
          onChange={() => {
            setTwoFactor((v) => !v);
            setDirty(true);
          }}
        />
      </Section>

      <div className="-mx-2 mt-8 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-5 py-3">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          {dirty ? "Unsaved changes" : "All saved"}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            disabled={!dirty}
            onClick={() => setDirty(false)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            type="button"
            disabled={!dirty}
            onClick={() => {
              setDirty(false);
              pushToast({ kind: "success", title: "Saved", body: "Workspace settings updated." });
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </>
  );
}

const PALETTES: { id: string; name: string; swatch: [string, string] }[] = [
  { id: "graphite", name: "Graphite", swatch: ["#71717a", "#a1a1aa"] },
  { id: "indigo", name: "Indigo", swatch: ["#3b82f6", "#1e40af"] },
  { id: "crimson", name: "Crimson", swatch: ["#ef4444", "#991b1b"] },
  { id: "sage", name: "Sage", swatch: ["#22c55e", "#15803d"] },
  { id: "amber", name: "Amber", swatch: ["#f59e0b", "#b45309"] },
  { id: "violet", name: "Violet", swatch: ["#a855f7", "#7e22ce"] },
];

function AppearancePane() {
  const { resolved, preference, setPreference } = useTheme();
  const [palette, setPalette] = useState("graphite");
  const [density, setDensity] = useState<"comfortable" | "cozy" | "compact">("cozy");

  const accent = PALETTES.find((p) => p.id === palette)!.swatch[0];

  return (
    <>
      <Header
        eyebrow="Settings · Appearance"
        title="Appearance"
        sub="Theme, palette, density. Changes apply across the app."
      />

      <Section title="Mode" hint="Light, dark, or system.">
        <div className="grid max-w-md grid-cols-3 gap-2">
          {(["light", "dark", "system"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPreference(m)}
              aria-pressed={preference === m}
              className={`rounded-lg border p-3 text-left transition-colors ${
                preference === m
                  ? "border-foreground/60 bg-foreground/[0.04]"
                  : "border-border/60 bg-background/40 hover:border-border"
              }`}
            >
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                {m}
              </div>
              <div className="mt-1 font-medium text-sm capitalize">{m}</div>
            </button>
          ))}
        </div>
      </Section>

      <Separator className="my-8" />

      <Section title="Palette" hint="Accent for buttons, links, and highlights.">
        <div className="grid max-w-md grid-cols-3 gap-2 sm:grid-cols-6">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPalette(p.id)}
              aria-pressed={palette === p.id}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                palette === p.id
                  ? "border-foreground/60 bg-foreground/[0.04]"
                  : "border-border/60 bg-background/40 hover:border-border"
              }`}
            >
              <div className="flex">
                <span
                  className="size-6 rounded-full ring-2 ring-background"
                  style={{ background: p.swatch[0] }}
                />
                <span
                  className="-ml-2 size-6 rounded-full ring-2 ring-background"
                  style={{ background: p.swatch[1] }}
                />
              </div>
              <span className="font-medium text-xs">{p.name}</span>
              {palette === p.id ? (
                <CheckIcon className="absolute top-1.5 right-1.5 size-3 opacity-80" />
              ) : null}
            </button>
          ))}
        </div>
      </Section>

      <Separator className="my-8" />

      <Section title="Density">
        <div className="inline-flex max-w-md rounded-lg border border-border/60 bg-background/40 p-1">
          {(["comfortable", "cozy", "compact"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDensity(d)}
              aria-pressed={density === d}
              className={`rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                density === d
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-foreground/[0.05]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </Section>

      <Separator className="my-8" />

      <Section title="Preview" hint="Reflects only this card.">
        <div
          className="overflow-hidden rounded-xl ring-1 ring-border/60 shadow-sm"
          style={{
            background: resolved === "dark" ? "#0a0a0a" : "#fafafa",
            color: resolved === "dark" ? "#fafafa" : "#0a0a0a",
            fontSize: density === "compact" ? "12.5px" : density === "cozy" ? "13.5px" : "14px",
          }}
        >
          <div
            className="flex items-center justify-between border-b px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{
              borderColor: resolved === "dark" ? "#27272a" : "#e4e4e7",
              color: resolved === "dark" ? "#a1a1aa" : "#71717a",
            }}
          >
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ background: accent }} />
              Acme · Workspace
            </span>
            <span>{resolved}</span>
          </div>
          <div
            className="flex flex-col gap-3"
            style={{ padding: density === "compact" ? "12px" : density === "cozy" ? "16px" : "20px" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Roadmap notes</span>
              <button
                type="button"
                className="rounded-md px-3 py-1 text-xs font-medium"
                style={{ background: accent, color: "#fff" }}
              >
                Save
              </button>
            </div>
            <div
              className="rounded-lg border p-3"
              style={{
                background: resolved === "dark" ? "#141416" : "#ffffff",
                borderColor: resolved === "dark" ? "#27272a" : "#e4e4e7",
              }}
            >
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ background: `${accent}22`, color: accent }}
              >
                Pro
              </span>
              <p
                className="mt-2 leading-relaxed"
                style={{ color: resolved === "dark" ? "#a1a1aa" : "#71717a" }}
              >
                Three things shipped this week — the audit log API, scoped invites, and a simpler pricing page.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function MembersPane() {
  const { members, setMemberRole } = useDemo();
  return (
    <>
      <Header
        eyebrow="Settings · Members"
        title="Members"
        sub={`${members.length} people · ${members.filter((m) => m.status === "online").length} online`}
      />
      <ul className="rounded-xl border border-border/60 bg-background/40 divide-y divide-border/40">
        {members.map((m, i) => (
          <li key={m.id} className="flex items-center gap-4 px-4 py-3">
            <div className={`flex size-8 items-center justify-center rounded-full font-medium text-[12px] ${m.tone}`}>
              {m.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-sm">{m.name}</span>
                {i === 0 ? (
                  <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]">
                    You
                  </span>
                ) : null}
              </div>
              <div className="truncate text-muted-foreground text-xs">{m.email}</div>
            </div>
            <div className="relative">
              <select
                value={m.role}
                disabled={i === 0}
                onChange={(e) => setMemberRole(m.id, e.target.value as typeof m.role)}
                className="h-8 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 font-mono text-[11px] uppercase tracking-[0.2em] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24 disabled:opacity-40"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 opacity-60">
                <polyline points="4 6 8 10 12 6" />
              </svg>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function DangerPane() {
  const { workspaces, currentWorkspaceId, pushToast } = useDemo();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId)!;
  const [phrase, setPhrase] = useState("");
  const matches = phrase === ws.name;

  return (
    <>
      <Header
        eyebrow="Settings · Danger"
        title="Danger zone"
        sub="Irreversible actions. We'll prompt for confirmation before each."
      />

      <div className="rounded-xl border border-destructive/40 bg-destructive/[0.03] p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive">
            <TrashIcon className="size-4" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Delete workspace</div>
            <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
              Removes all projects, members, and audit history. This cannot be
              undone.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="confirm-ws" className="font-mono text-[10px] uppercase tracking-[0.25em]">
            Type the workspace name to confirm
          </Label>
          <Input
            id="confirm-ws"
            placeholder={ws.name}
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            nativeInput
            className="mt-2 font-mono"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            size="sm"
            type="button"
            variant="destructive"
            disabled={!matches}
            onClick={() => {
              setPhrase("");
              pushToast({
                kind: "info",
                title: "Demo only",
                body: "Workspace deletion is just for show.",
              });
            }}
          >
            <TrashIcon />
            Delete workspace
          </Button>
        </div>
      </div>
    </>
  );
}

function Header({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <header className="border-b border-border/60 pb-6">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        {eyebrow}
      </div>
      <h1 className="mt-1 font-heading text-2xl">{title}</h1>
      <p className="mt-1 text-muted-foreground text-sm">{sub}</p>
    </header>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 grid grid-cols-[180px_minmax(0,1fr)] gap-x-10 gap-y-6">
      <div>
        <h2 className="font-medium text-sm">{title}</h2>
        {hint ? <p className="mt-1 text-muted-foreground text-xs leading-relaxed">{hint}</p> : null}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

function SwitchRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
      <div>
        <div className="font-medium text-sm">{title}</div>
        <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
