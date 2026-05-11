import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  LinkIcon,
  ShieldIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Label } from "@orbit/ui/label";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@orbit/ui/popover";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@orbit/ui/select";
import { Textarea } from "@orbit/ui/textarea";

const WORKSPACE_DOMAIN = "acme.com";

export type Role = "admin" | "member" | "viewer";
const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Manage workspace and people." },
  { value: "member", label: "Member", description: "Create and edit projects." },
  { value: "viewer", label: "Viewer", description: "Read-only access." },
];

const roleLabel = (r: Role) => ROLES.find((x) => x.value === r)!.label;

export interface Chip {
  id: number;
  email: string;
  role: Role;
}

let _id = 0;
const nextId = () => ++_id;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValid = (email: string) => EMAIL_RE.test(email);
const isAutoJoin = (email: string) =>
  email.toLowerCase().endsWith(`@${WORKSPACE_DOMAIN}`);
const initials = (email: string) =>
  email.trim().split("@")[0]?.slice(0, 2).toUpperCase() || "??";

const SPLIT_RE = /[\s,;]+/;

export function FormsInviteTeammatesShowcasePage() {
  const [chips, setChips] = useState<Chip[]>([
    { id: nextId(), email: "alex@globex.com", role: "member" },
    { id: nextId(), email: "priya@acme.com", role: "member" },
  ]);
  const [draft, setDraft] = useState("");
  const [defaultRole, setDefaultRole] = useState<Role>("member");
  const [message, setMessage] = useState(
    "Hey — joining us in Acme's workspace. Click the link to set up your account.",
  );
  const [pending, setPending] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const valid = chips.filter((c) => isValid(c.email));
    const invitable = valid.filter((c) => !isAutoJoin(c.email));
    const autojoin = valid.filter((c) => isAutoJoin(c.email));
    const invalid = chips.length - valid.length;
    return {
      sendable: invitable.length,
      autojoin: autojoin.length,
      invalid,
    };
  }, [chips]);

  const addEmails = (raw: string) => {
    const parts = raw.split(SPLIT_RE).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    setChips((prev) => {
      const seen = new Set(prev.map((c) => c.email.toLowerCase()));
      const next = [...prev];
      for (const email of parts) {
        const key = email.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        next.push({ id: nextId(), email, role: defaultRole });
      }
      return next;
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";" || e.key === "Tab") {
      if (draft.trim().length === 0) return;
      e.preventDefault();
      addEmails(draft);
      setDraft("");
    } else if (e.key === "Backspace" && draft.length === 0 && chips.length > 0) {
      e.preventDefault();
      setChips((prev) => prev.slice(0, -1));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!SPLIT_RE.test(text)) return;
    e.preventDefault();
    addEmails(`${draft} ${text}`);
    setDraft("");
  };

  const onBlur = () => {
    if (draft.trim().length === 0) return;
    addEmails(draft);
    setDraft("");
  };

  const removeChip = (id: number) =>
    setChips((prev) => prev.filter((c) => c.id !== id));
  const setRole = (id: number, role: Role) =>
    setChips((prev) => prev.map((c) => (c.id === id ? { ...c, role } : c)));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (stats.sendable === 0) return;
    setPending(true);
    window.setTimeout(() => setPending(false), 700);
  };

  return (
    <div className="min-h-svh bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Members · invite
        </div>
        <h1 className="mt-1 font-heading text-3xl">Bring people in.</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Paste or type emails — separate with spaces, commas, or new lines.
          Links expire after 7 days.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-xl border border-border/60 bg-background/40 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <Label className="font-medium text-sm">Invitees</Label>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] sm:inline">
                Default role
              </span>
              <Select
                items={ROLES}
                value={defaultRole}
                onValueChange={(v) => setDefaultRole(v as Role)}
              >
                <SelectTrigger size="sm" className="h-8 w-32 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex flex-col">
                        <span>{r.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {r.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="mt-3 flex w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background p-2 text-left transition-shadow focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/24"
          >
            {chips.map((chip) => (
              <ChipPill
                key={chip.id}
                chip={chip}
                onRemove={() => removeChip(chip.id)}
                onRole={(role) => setRole(chip.id, role)}
              />
            ))}
            <input
              ref={inputRef}
              type="email"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              onBlur={onBlur}
              placeholder={
                chips.length === 0
                  ? "name@example.com, another@example.com…"
                  : "Add another"
              }
              className="min-w-[12ch] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
          </button>

          <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            <span>
              <span className="text-foreground">{stats.sendable}</span> to invite
            </span>
            {stats.autojoin > 0 && (
              <span className="flex items-center gap-1">
                <SparklesIcon className="size-3" />
                {stats.autojoin} auto-join
              </span>
            )}
            {stats.invalid > 0 && (
              <span className="text-destructive">
                {stats.invalid} invalid
              </span>
            )}
          </div>

          {showMessage ? (
            <div className="mt-5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="invite-message" className="font-medium text-sm">
                  Personal note
                </Label>
                <button
                  type="button"
                  onClick={() => setShowMessage(false)}
                  className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
                >
                  Hide
                </button>
              </div>
              <Textarea
                id="invite-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a quick hello so they know what they're joining."
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowMessage(true)}
              className="mt-4 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
            >
              + Add a personal note
            </button>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-5">
            <CopyLinkButton />
            <Button
              type="submit"
              loading={pending}
              disabled={stats.sendable === 0}
            >
              {stats.sendable > 0
                ? `Send ${stats.sendable} invite${stats.sendable === 1 ? "" : "s"}`
                : "Send invites"}
              <ArrowRightIcon />
            </Button>
          </div>
        </form>

        <div className="mt-5 rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-sm">
          <div className="flex items-start gap-3">
            <ShieldIcon className="mt-0.5 size-4 shrink-0 opacity-60" />
            <div className="flex-1">
              <div className="font-medium">Domain auto-join is on</div>
              <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
                Anyone with an{" "}
                <span className="font-mono text-foreground">
                  @{WORKSPACE_DOMAIN}
                </span>{" "}
                email joins automatically — no invite needed.
              </p>
            </div>
            <Button variant="ghost" size="sm" type="button">
              Manage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChipPill({
  chip,
  onRemove,
  onRole,
}: {
  chip: Chip;
  onRemove: () => void;
  onRole: (role: Role) => void;
}) {
  const valid = isValid(chip.email);
  const autoJoin = valid && isAutoJoin(chip.email);

  return (
    <span
      className={[
        "group inline-flex h-7 items-center gap-1.5 rounded-full border pl-1 pr-1 text-xs",
        !valid &&
          "border-destructive/50 bg-destructive/8 text-destructive",
        valid &&
          autoJoin &&
          "border-emerald-500/30 bg-emerald-500/8 text-foreground",
        valid &&
          !autoJoin &&
          "border-border bg-foreground/[0.03] text-foreground",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] uppercase",
          autoJoin
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            : valid
              ? "bg-foreground/[0.06] text-muted-foreground"
              : "bg-destructive/15 text-destructive",
        ].join(" ")}
        aria-hidden
      >
        {valid ? initials(chip.email) : "!"}
      </span>
      <span className="truncate">{chip.email}</span>

      {autoJoin ? (
        <span className="flex items-center gap-0.5 font-mono text-[9px] text-emerald-700 uppercase tracking-[0.2em] dark:text-emerald-400">
          <SparklesIcon className="size-2.5" />
          Auto
        </span>
      ) : valid ? (
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex h-5 items-center gap-0.5 rounded-full px-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em] transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                {roleLabel(chip.role)}
                <svg
                  viewBox="0 0 12 12"
                  className="size-2.5"
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 5 6 8 9 5" />
                </svg>
              </button>
            }
            aria-label={`Change role for ${chip.email}`}
          />
          <PopoverPopup className="w-56 p-1">
            {ROLES.map((r) => {
              const active = r.value === chip.role;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onRole(r.value)}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-foreground/[0.04]"
                >
                  <CheckIcon
                    className={[
                      "mt-0.5 size-3.5 shrink-0",
                      active ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                  <div className="flex-1">
                    <div>{r.label}</div>
                    <div className="text-muted-foreground text-xs">
                      {r.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </PopoverPopup>
        </Popover>
      ) : (
        <span className="font-mono text-[9px] uppercase tracking-[0.2em]">
          Invalid
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${chip.email}`}
        className="flex size-5 items-center justify-center rounded-full opacity-50 hover:bg-foreground/[0.06] hover:opacity-100"
      >
        <XIcon className="size-3" />
      </button>
    </span>
  );
}

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="group inline-flex items-center gap-2 rounded-md border border-dashed border-border/60 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
    >
      {copied ? (
        <CheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <LinkIcon className="size-3.5 opacity-60 group-hover:opacity-100" />
      )}
      <span className="truncate">orbit.so/invite/8f3a2c</span>
      <span className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
        <CopyIcon className="size-3" />
        <span className="uppercase tracking-[0.2em]">
          {copied ? "Copied" : "Copy link"}
        </span>
      </span>
    </button>
  );
}
