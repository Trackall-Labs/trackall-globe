import { type FormEvent, useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Card } from "@orbit/ui/card";
import { Field, FieldLabel } from "@orbit/ui/field";
import { Input } from "@orbit/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@orbit/ui/input-group";
import { Separator } from "@orbit/ui/separator";

export function AuthRightSigninShowcasePage() {
  return (
    <div className="grid min-h-svh grid-cols-1 bg-background text-foreground lg:grid-cols-[1.2fr_minmax(440px,1fr)]">
      <HeroColumn />
      <FormColumn />
    </div>
  );
}

export function HeroColumn() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(60% 50% at 18% 22%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 65%)",
            "radial-gradient(50% 50% at 82% 78%, color-mix(in oklch, var(--foreground) 6%, transparent), transparent 65%)",
          ].join(", "),
        }}
      />
      <div className="relative z-10 max-w-md px-12">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Open source · MIT
        </div>
        <h2 className="mt-3 font-heading text-4xl tracking-tight">
          Build orbit-class products.
        </h2>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          A practical scratchpad of UI patterns built on coss-ui — fast,
          opinionated, accessible.
        </p>

        <ul className="mt-8 flex flex-col gap-4">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-foreground/[0.04]">
                <CheckIcon className="size-3 text-foreground/70" />
              </span>
              <div>
                <div className="font-medium text-sm">{f.title}</div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  {f.blurb}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <DashboardMock />
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "55 primitives",
    blurb: "Built on Base UI for accessibility-first composition.",
  },
  {
    title: "Tailwind v4",
    blurb: "First-class CSS-vars and dark mode out of the box.",
  },
  {
    title: "Particle field shader",
    blurb: "Real WebGL background with a palette shuffle.",
  },
  {
    title: "10 production-ready cards",
    blurb: "Stat tiles, pricing, kanban, calendar, and more.",
  },
];

export function DashboardMock() {
  const tiles = [
    { label: "MRR", value: "$48.2k", delta: "+12.4%" },
    { label: "Active", value: "12,840", delta: "+4.1%" },
    { label: "Churn", value: "1.8%", delta: "−0.6%" },
  ];
  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-border/70 bg-foreground/[0.02] px-2 py-2"
          >
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
              {t.label}
            </div>
            <div className="mt-1 font-heading font-semibold text-sm tabular-nums">
              {t.value}
            </div>
            <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
              {t.delta}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg border border-border/70 bg-foreground/[0.02] p-2">
        <svg
          viewBox="0 0 200 60"
          aria-hidden
          className="block h-14 w-full"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,48 30,42 60,38 90,30 120,26 150,18 180,12 200,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground/70"
          />
          <polyline
            points="0,52 30,50 60,48 90,46 120,42 150,40 180,38 200,34"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground/30"
            strokeDasharray="3 3"
          />
        </svg>
      </div>
    </div>
  );
}

export function FormColumn() {
  return (
    <div className="flex items-center justify-center px-6 py-12 lg:border-border/60 lg:border-l lg:px-12">
      <Card className="w-full max-w-sm gap-0 px-6 py-8 shadow-sm">
        <BrandMark />
        <Heading />
        <OAuthRow />
        <OrSeparator />
        <SignInForm />
        <FooterLinks />
      </Card>
    </div>
  );
}

export function BrandMark() {
  return (
    <div className="flex items-center justify-center">
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
        <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            transform="rotate(-25 12 12)"
          />
        </svg>
      </span>
    </div>
  );
}

export function Heading() {
  return (
    <div className="mt-5 flex flex-col items-center gap-1.5 text-center">
      <h1 className="font-heading text-2xl tracking-tight">Welcome back</h1>
      <p className="text-muted-foreground text-sm">
        Sign in to your scratchpad
      </p>
    </div>
  );
}

export function OAuthRow() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2.5">
      <Button variant="outline" type="button">
        <GitHubIcon />
        GitHub
      </Button>
      <Button variant="outline" type="button">
        <GoogleIcon />
        Google
      </Button>
    </div>
  );
}

export function OrSeparator() {
  return (
    <div className="my-5 flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        Or
      </span>
      <Separator className="flex-1" />
    </div>
  );
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setPending(true);
    window.setTimeout(() => setPending(false), 800);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="auth-right-email">Email</FieldLabel>
        <Input
          id="auth-right-email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          nativeInput
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="auth-right-password">Password</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="auth-right-password"
            type={reveal ? "text" : "password"}
            required
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            nativeInput
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? "Hide password" : "Show password"}
              className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {reveal ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <Button type="submit" size="lg" loading={pending} className="mt-1">
        Sign in
      </Button>
    </form>
  );
}

export function FooterLinks() {
  return (
    <div className="mt-5 flex items-baseline justify-between gap-4 text-sm">
      <a
        href="#"
        className="whitespace-nowrap text-muted-foreground hover:text-foreground hover:underline"
      >
        Forgot password?
      </a>
      <p className="whitespace-nowrap text-muted-foreground">
        New here?{" "}
        <a href="#" className="text-foreground hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

export function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
      <path d="M12 .5C5.7.5.6 5.6.6 11.9c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.5-1.5 7.8-5.8 7.8-10.8C23.4 5.6 18.3.5 12 .5Z" />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#EA4335"
        d="M12 5c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.5 15 .5 12 .5 7.3.5 3.3 3.2 1.4 7.1l3.8 3c.9-2.8 3.5-4.6 6.8-4.6Z"
      />
      <path
        fill="#34A853"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.6Z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1l-3.8-3C.5 8.7 0 10.3 0 12s.5 3.3 1.4 4.7l3.8-2.6Z"
      />
      <path
        fill="#4285F4"
        d="M12 23.5c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.3 0-6-2-6.9-4.6l-3.8 3C3.3 20.8 7.3 23.5 12 23.5Z"
      />
    </svg>
  );
}
