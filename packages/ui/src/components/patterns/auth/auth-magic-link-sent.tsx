import { useEffect, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Card } from "@orbit/ui/card";

const RESEND_SECONDS = 30;

export function AuthMagicLinkSentShowcasePage() {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft]);

  const onResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-svh bg-background flex items-center justify-center px-4">
      <style>{`
        @keyframes magic-float-a {
          0%, 100% { transform: translate(0, 0); opacity: 0.55; }
          50% { transform: translate(0, -6px); opacity: 0.95; }
        }
        @keyframes magic-float-b {
          0%, 100% { transform: translate(0, 0); opacity: 0.45; }
          50% { transform: translate(0, -8px); opacity: 0.85; }
        }
        @keyframes magic-float-c {
          0%, 100% { transform: translate(0, 0); opacity: 0.35; }
          50% { transform: translate(2px, -5px); opacity: 0.75; }
        }
        @keyframes magic-pulse-dot {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 0%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)",
        }}
      />

      <Card className="relative z-10 w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center">
          <EnvelopeArt />

          <div className="mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Magic link sent
          </div>
          <h1 className="mt-3 font-heading text-3xl tracking-tight">
            Check your inbox
          </h1>

          <p className="mt-3 text-muted-foreground text-sm">
            We sent a magic link to
          </p>
          <div className="font-mono text-foreground text-base mt-1">
            you@example.com
          </div>

          <p className="mt-4 max-w-xs text-muted-foreground text-xs leading-relaxed">
            Click the link in the email to sign in. The link expires in 10
            minutes.
          </p>

          <div className="mt-7 flex w-full flex-col gap-2">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              render={
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Open Gmail
              <ExternalLinkIcon />
            </Button>
            <Button
              variant="ghost"
              size="default"
              className="w-full"
              type="button"
              disabled={secondsLeft > 0}
              onClick={onResend}
            >
              {secondsLeft > 0
                ? `Resend in ${formatCountdown(secondsLeft)}`
                : "Resend link"}
            </Button>
          </div>

          <p className="mt-6 text-muted-foreground text-xs">
            Didn't get it? Check your spam folder, or{" "}
            <a className="underline cursor-pointer">use a different email</a>.
          </p>
        </div>
      </Card>
    </div>
  );
}

export function EnvelopeArt() {
  return (
    <div className="relative flex size-24 items-center justify-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-2 rounded-2xl bg-primary/10 animate-ping"
        style={{ animationDuration: "3s" }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute top-1 left-2 size-1 rounded-full bg-muted-foreground/60"
        style={{ animation: "magic-float-a 3s ease-in-out infinite" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-3 right-1 size-1.5 rounded-full bg-muted-foreground/50"
        style={{ animation: "magic-float-b 4s ease-in-out infinite 0.4s" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-0 size-1 rounded-full bg-muted-foreground/40"
        style={{ animation: "magic-float-c 3.6s ease-in-out infinite 0.8s" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-4 size-1 rounded-full bg-muted-foreground/55"
        style={{ animation: "magic-float-a 3.4s ease-in-out infinite 1.2s" }}
      />

      <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-sm">
        <svg
          viewBox="0 0 20 16"
          aria-hidden
          className="h-8 w-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="2" width="18" height="12" rx="2.4" />
          <path d="M2 4l8 5.2L18 4" />
          <circle
            cx="16.2"
            cy="11.8"
            r="1.4"
            fill="currentColor"
            stroke="none"
            style={{
              transformOrigin: "16.2px 11.8px",
              animation: "magic-pulse-dot 1.8s ease-in-out infinite",
            }}
          />
        </svg>
      </div>
    </div>
  );
}
