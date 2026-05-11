import { type FormEvent, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
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

export function AuthLeftSigninShowcasePage() {
  return (
    <div className="min-h-svh grid grid-cols-1 bg-background text-foreground lg:grid-cols-[minmax(440px,1fr)_1.2fr]">
      <LeftColumn />
      <RightColumn />
    </div>
  );
}

export function LeftColumn() {
  return (
    <div className="flex items-center justify-center px-6 py-12 lg:px-12">
      <div className="w-full max-w-sm">
        <BrandRow />
        <div className="mt-12">
          <h1 className="font-heading text-3xl tracking-tight">Sign in</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Welcome back. Continue where you left off.
          </p>
        </div>
        <OAuthRow />
        <OrSeparator />
        <SignInForm />
        <FooterAnchor />
      </div>
    </div>
  );
}

export function BrandRow() {
  return (
    <div className="flex items-center gap-2">
      <BrandMark />
      <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
        Sean's scratch pad
      </span>
    </div>
  );
}

export function BrandMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-5 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M3 12 L21 12" />
      <path d="M12 3 L12 21" />
    </svg>
  );
}

export function OAuthRow() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-2.5">
      <Button variant="outline" size="lg" type="button">
        <GitHubIcon />
        GitHub
      </Button>
      <Button variant="outline" size="lg" type="button">
        <GoogleIcon />
        Google
      </Button>
    </div>
  );
}

export function OrSeparator() {
  return (
    <div className="my-6 flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        or
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
        <FieldLabel htmlFor="auth-left-email">Email</FieldLabel>
        <Input
          id="auth-left-email"
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
        <FieldLabel htmlFor="auth-left-password">Password</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="auth-left-password"
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

      <Button type="submit" size="lg" loading={pending} className="mt-2">
        Sign in
      </Button>

      <div className="flex justify-end">
        <a
          href="#"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
        >
          Forgot password?
        </a>
      </div>
    </form>
  );
}

export function FooterAnchor() {
  return (
    <p className="mt-10 text-center text-muted-foreground text-sm">
      Don't have an account?{" "}
      <a href="#" className="text-foreground hover:underline">
        Sign up
      </a>
    </p>
  );
}

export function RightColumn() {
  return (
    <div
      className="relative hidden items-center justify-center overflow-hidden border-border border-l lg:flex"
      style={{
        background: [
          "radial-gradient(60% 50% at 15% 15%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 65%)",
          "radial-gradient(55% 55% at 85% 85%, color-mix(in oklab, var(--foreground) 8%, transparent), transparent 70%)",
        ].join(", "),
      }}
    >
      <div className="relative flex w-full max-w-xl flex-col items-center gap-12 px-12">
        <TestimonialCard />
        <LogoStrip />
      </div>
    </div>
  );
}

export function TestimonialCard() {
  return (
    <Card className="w-full p-8">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        Testimonial
      </div>
      <blockquote className="mt-5 font-heading text-2xl leading-snug tracking-tight">
        “Orbit feels like the platform we always wanted to build ourselves —
        fast, opinionated, and out of the way.”
      </blockquote>
      <div className="mt-8 flex items-center gap-3">
        <Avatar>
          <AvatarFallback>PJ</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-sm">Priya Joshi</span>
          <span className="text-muted-foreground text-xs">
            Head of Design, Foundry Labs
          </span>
        </div>
      </div>
    </Card>
  );
}

export function LogoStrip() {
  const logos = ["ATLAS", "FOUNDRY", "NIMBUS", "QUARTZ"];
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        Trusted by 2,400 teams
      </div>
      <div className="flex w-full items-center justify-center gap-6 text-muted-foreground">
        {logos.map((logo, i) => (
          <div key={logo} className="flex items-center gap-6">
            {i > 0 ? (
              <Separator orientation="vertical" className="h-4" />
            ) : null}
            <span className="font-heading font-bold text-sm uppercase tracking-[0.25em]">
              {logo}
            </span>
          </div>
        ))}
      </div>
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
