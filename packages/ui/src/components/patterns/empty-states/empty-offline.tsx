import { useEffect, useState } from "react";
import { RotateCwIcon, WifiOffIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const TIPS = [
  "Check that your VPN isn't blocking *.orbit.so",
  "We'll auto-retry every 10 seconds in the background",
  "Drafts you typed offline will sync when you're back",
];

export function EmptyOfflineShowcasePage() {
  const [tipIndex, setTipIndex] = useState(0);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const id = window.setInterval(
      () => setTipIndex((i) => (i + 1) % TIPS.length),
      4000,
    );
    return () => window.clearInterval(id);
  }, []);

  const tryAgain = () => {
    setRetrying(true);
    window.setTimeout(() => setRetrying(false), 1200);
  };

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <Pulse />
      <div className="relative mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-xs/5">
          <WifiOffIcon className="size-7" />
          <span className="-bottom-1 absolute right-2 size-3 rounded-full border-2 border-background bg-destructive" />
        </div>

        <div className="mt-8 font-mono text-[10px] text-destructive uppercase tracking-[0.4em]">
          Offline · waiting
        </div>

        <h1 className="mt-3 font-heading text-2xl leading-tight">
          We've lost the signal.
        </h1>
        <p className="mt-2 text-balance text-muted-foreground text-sm">
          Your connection dropped while we were syncing. Don't worry — your
          last edit is safe locally.
        </p>

        <Button
          className="mt-8 w-full max-w-xs"
          onClick={tryAgain}
          loading={retrying}
        >
          <RotateCwIcon />
          Try again
        </Button>

        <div className="mt-6 h-8 overflow-hidden">
          <p className="font-mono text-[11px] text-muted-foreground" key={tipIndex}>
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Pulse() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--destructive) 8%, transparent), transparent 70%)",
          animationDuration: "3.6s",
        }}
      />
    </div>
  );
}
