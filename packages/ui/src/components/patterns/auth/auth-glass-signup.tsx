import { type FormEvent, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Field, FieldLabel } from "@orbit/ui/field";
import { Input } from "@orbit/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@orbit/ui/input-group";
import { Separator } from "@orbit/ui/separator";

export function AuthGlassSignupShowcasePage() {
  return (
    <div className="dark relative min-h-svh overflow-hidden bg-[#0a0a0c] text-white flex items-center justify-center px-4">
      <BlobBackground />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <div className="mt-7 flex flex-col items-center text-center">
          <h1 className="font-heading text-3xl tracking-tight">
            Make something.
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Sign up in seconds — no credit card.
          </p>
        </div>

        <OAuthRow />
        <OrSeparator />
        <SignupForm />

        <p className="mt-6 text-center text-white/65 text-xs">
          Already have an account?{" "}
          <a href="#" className="text-white underline underline-offset-2 hover:text-white">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export function BlobBackground() {
  // Larger movement range, faster cycle, and per-blob hue-rotate so colours
  // drift through neighbours instead of returning identically every loop.
  // Filter is set INSIDE the keyframes so the animation owns blur + hue —
  // don't add `filter: blur(...)` inline or it'll override the animation.
  const styles = `
@keyframes glass-blob-1 {
  0%   { transform: translate(-30%, -25%) scale(1);    filter: blur(80px) hue-rotate(0deg); }
  50%  { transform: translate(35%, 25%) scale(1.25);   filter: blur(80px) hue-rotate(40deg); }
  100% { transform: translate(-30%, -25%) scale(1);    filter: blur(80px) hue-rotate(0deg); }
}
@keyframes glass-blob-2 {
  0%   { transform: translate(30%, 35%) scale(1.1);    filter: blur(80px) hue-rotate(0deg); }
  50%  { transform: translate(-30%, -25%) scale(0.85); filter: blur(80px) hue-rotate(-50deg); }
  100% { transform: translate(30%, 35%) scale(1.1);    filter: blur(80px) hue-rotate(0deg); }
}
@keyframes glass-blob-3 {
  0%   { transform: translate(20%, -35%) scale(0.9);   filter: blur(80px) hue-rotate(0deg); }
  50%  { transform: translate(-35%, 30%) scale(1.2);   filter: blur(80px) hue-rotate(60deg); }
  100% { transform: translate(20%, -35%) scale(0.9);   filter: blur(80px) hue-rotate(0deg); }
}
@keyframes glass-blob-4 {
  0%   { transform: translate(-40%, 30%) scale(1);     filter: blur(80px) hue-rotate(0deg); }
  50%  { transform: translate(35%, -35%) scale(1.18);  filter: blur(80px) hue-rotate(-45deg); }
  100% { transform: translate(-40%, 30%) scale(1);     filter: blur(80px) hue-rotate(0deg); }
}
@keyframes glass-blob-5 {
  0%   { transform: translate(0%, 40%) scale(1.1);     filter: blur(80px) hue-rotate(0deg); }
  50%  { transform: translate(20%, -25%) scale(0.8);   filter: blur(80px) hue-rotate(70deg); }
  100% { transform: translate(0%, 40%) scale(1.1);     filter: blur(80px) hue-rotate(0deg); }
}
.glass-bg-blob-1 { animation: glass-blob-1 14s ease-in-out infinite; will-change: transform, filter; }
.glass-bg-blob-2 { animation: glass-blob-2 16s ease-in-out infinite; will-change: transform, filter; }
.glass-bg-blob-3 { animation: glass-blob-3 12s ease-in-out infinite; will-change: transform, filter; }
.glass-bg-blob-4 { animation: glass-blob-4 18s ease-in-out infinite; will-change: transform, filter; }
.glass-bg-blob-5 { animation: glass-blob-5 11s ease-in-out infinite; will-change: transform, filter; }
@media (prefers-reduced-motion: reduce) {
  .glass-bg-blob-1, .glass-bg-blob-2, .glass-bg-blob-3,
  .glass-bg-blob-4, .glass-bg-blob-5 { animation: none; }
}
`;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <style>{styles}</style>
      <div
        className="glass-bg-blob-1 absolute -top-[20vmax] -left-[15vmax] h-[60vmax] w-[60vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(236,72,153,0.55), rgba(236,72,153,0) 70%)",
        }}
      />
      <div
        className="glass-bg-blob-2 absolute top-[10vmax] -right-[20vmax] h-[60vmax] w-[60vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.5), rgba(139,92,246,0) 70%)",
        }}
      />
      <div
        className="glass-bg-blob-3 absolute -bottom-[25vmax] left-[10vmax] h-[60vmax] w-[60vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(20,184,166,0.45), rgba(20,184,166,0) 70%)",
        }}
      />
      <div
        className="glass-bg-blob-4 absolute top-[30vmax] left-[20vmax] h-[60vmax] w-[60vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.4), rgba(245,158,11,0) 70%)",
        }}
      />
      <div
        className="glass-bg-blob-5 absolute -bottom-[20vmax] -right-[10vmax] h-[60vmax] w-[60vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.45), rgba(56,189,248,0) 70%)",
        }}
      />
    </div>
  );
}

export function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className="size-9"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="white" strokeOpacity="0.85" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="6" fill="white" fillOpacity="0.95" />
      <path d="M 16 4 L 16 28" stroke="white" strokeOpacity="0.5" strokeWidth="1.25" />
    </svg>
  );
}

export function OAuthRow() {
  return (
    <div className="mt-7 grid grid-cols-2 gap-2.5">
      <OAuthButton icon={<GitHubIcon />} label="GitHub" />
      <OAuthButton icon={<GoogleIcon />} label="Google" />
    </div>
  );
}

export function OAuthButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.08] px-3 text-sm text-white transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <span className="size-4 shrink-0 [&_svg]:size-4">{icon}</span>
      <span className="truncate whitespace-nowrap">{label}</span>
    </button>
  );
}

export function OrSeparator() {
  return (
    <div className="my-6 flex items-center gap-3">
      <Separator className="flex-1 bg-white/15" />
      <span className="font-mono text-[10px] text-white/55 uppercase tracking-[0.3em]">
        Or
      </span>
      <Separator className="flex-1 bg-white/15" />
    </div>
  );
}

export function SignupForm() {
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
        <FieldLabel htmlFor="glass-signup-email" className="text-white/85">
          Email
          <span className="text-white/45">*</span>
        </FieldLabel>
        <Input
          id="glass-signup-email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          nativeInput
          className="border-white/15 bg-white/[0.06] text-white placeholder:text-white/40 hover:bg-white/[0.08] focus-visible:border-white/30"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="glass-signup-password" className="text-white/85">
          Password
          <span className="text-white/45">*</span>
        </FieldLabel>
        <InputGroup className="border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.08] focus-within:border-white/30">
          <InputGroupInput
            id="glass-signup-password"
            type={reveal ? "text" : "password"}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            nativeInput
            className="text-white placeholder:text-white/40"
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? "Hide password" : "Show password"}
              className="cursor-pointer rounded p-1 text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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

      <Button
        type="submit"
        size="lg"
        loading={pending}
        className="mt-2 border-transparent bg-white text-[#0a0a0c] hover:bg-white/90 [&_[data-slot=button-loading-indicator]]:text-[#0a0a0c]"
      >
        Create account
      </Button>
    </form>
  );
}

export function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 .5C5.7.5.6 5.6.6 11.9c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.5-1.5 7.8-5.8 7.8-10.8C23.4 5.6 18.3.5 12 .5Z" />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
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
