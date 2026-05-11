import { useState } from "react";
import {
  AtSignIcon,
  GlobeIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Input } from "@orbit/ui/input";
import { Label } from "@orbit/ui/label";
import { Separator } from "@orbit/ui/separator";
import { Textarea } from "@orbit/ui/textarea";

export function SettingsProfileShowcasePage() {
  const [dirty, setDirty] = useState(false);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-8 py-12 pb-32">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Account · Profile
        </div>
        <h1 className="mt-1 font-heading text-3xl">Your profile</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          How you appear across every workspace you belong to.
        </p>

        <Section title="Photo">
          <div className="flex items-center gap-5">
            <div className="size-20 shrink-0 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 ring-1 ring-border/60" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" type="button">
                  <UploadIcon />
                  Upload
                </Button>
                <Button size="sm" variant="ghost" type="button">
                  Remove
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Recommended: 400×400 PNG, JPG, or SVG.
              </p>
            </div>
          </div>
        </Section>

        <Separator className="my-8" />

        <Section title="Identity">
          <Field label="Display name" htmlFor="p-name">
            <Input
              id="p-name"
              defaultValue="Sean Brydon"
              onChange={() => setDirty(true)}
              nativeInput
            />
          </Field>
          <Field label="Handle" htmlFor="p-handle">
            <div className="flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-3 font-mono text-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/24">
              <AtSignIcon className="size-3.5 opacity-60" />
              <input
                id="p-handle"
                defaultValue="seancassiere"
                onChange={() => setDirty(true)}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </Field>
          <Field label="Pronouns" htmlFor="p-pron">
            <Input
              id="p-pron"
              placeholder="e.g. they / them"
              onChange={() => setDirty(true)}
              nativeInput
            />
          </Field>
          <Field label="Bio" htmlFor="p-bio" hint="Up to 240 characters.">
            <Textarea
              id="p-bio"
              rows={3}
              placeholder="Designer, engineer, generally indoors."
              onChange={() => setDirty(true)}
            />
          </Field>
        </Section>

        <Separator className="my-8" />

        <Section title="Locale">
          <Field label="Email" htmlFor="p-email">
            <Input
              id="p-email"
              type="email"
              defaultValue="sean@cal.com"
              readOnly
              nativeInput
            />
          </Field>
          <Field label="Language" htmlFor="p-lang">
            <NativeSelect
              id="p-lang"
              defaultValue="en"
              onChange={() => setDirty(true)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </NativeSelect>
          </Field>
          <Field label="Timezone" htmlFor="p-tz">
            <NativeSelect
              id="p-tz"
              defaultValue="utc-5"
              onChange={() => setDirty(true)}
              icon={<GlobeIcon className="size-3.5 opacity-60" />}
            >
              <option value="utc-8">Pacific (UTC−8)</option>
              <option value="utc-5">Eastern (UTC−5)</option>
              <option value="utc">UTC</option>
              <option value="utc+1">Central European (UTC+1)</option>
              <option value="utc+9">Japan (UTC+9)</option>
            </NativeSelect>
          </Field>
        </Section>

        <Separator className="my-8" />

        <Section title="Security">
          <SecurityRow
            icon={<ShieldCheckIcon className="size-4" />}
            title="Two-factor authentication"
            description="Authenticator app · enabled"
            cta="Manage"
          />
          <SecurityRow
            icon={<KeyRoundIcon className="size-4" />}
            title="Active sessions"
            description="3 devices · last active 2 minutes ago"
            cta="Review"
          />
          <SecurityRow
            destructive
            icon={<TrashIcon className="size-4" />}
            title="Delete account"
            description="Permanently remove your account and personal data."
            cta="Delete"
          />
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-8 py-3">
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
            <Button size="sm" type="button" disabled={!dirty}>
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-base">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function Field({
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

export function NativeSelect({
  className,
  icon,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </span>
      ) : null}
      <select
        className={`h-9 w-full appearance-none rounded-lg border border-input bg-background ${icon ? "pl-8" : "pl-3"} pr-9 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24 ${className ?? ""}`}
        {...props}
      />
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 opacity-60"
      >
        <polyline points="4 6 8 10 12 6" />
      </svg>
    </div>
  );
}

export function SecurityRow({
  icon,
  title,
  description,
  cta,
  destructive,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  destructive?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-3.5 ${
        destructive
          ? "border-destructive/40 bg-destructive/[0.03]"
          : "border-border/60 bg-background/40"
      }`}
    >
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
          destructive ? "bg-destructive/10 text-destructive" : "bg-foreground/[0.06]"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm">{title}</div>
        <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
      </div>
      <Button
        variant={destructive ? "outline" : "ghost"}
        size="sm"
        type="button"
        className={destructive ? "border-destructive/40 text-destructive hover:bg-destructive/10" : ""}
      >
        {cta}
      </Button>
    </div>
  );
}
