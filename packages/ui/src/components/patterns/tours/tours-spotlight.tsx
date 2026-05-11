import { useState } from "react";
import { ArrowRightIcon, XIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const TOTAL_STEPS = 4;

export function ToursSpotlightShowcasePage() {
  const [step, setStep] = useState(2);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeApp />

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 h-full w-full"
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x="240"
              y="120"
              width="240"
              height="44"
              rx="10"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#spotlight-mask)"
          className="dark:fill-black/70"
        />
      </svg>

      <div
        aria-hidden
        className="pointer-events-none absolute z-40 rounded-[10px] ring-2 ring-foreground"
        style={{ left: 240, top: 120, width: 240, height: 44 }}
      >
        <span className="-top-1 -right-1 absolute size-2 rounded-full bg-foreground" />
        <span
          className="absolute inset-0 animate-pulse rounded-[10px] ring-1 ring-foreground/40"
          style={{ animationDuration: "2s" }}
        />
      </div>

      <div
        className="absolute z-50 w-80 rounded-xl border border-border/70 bg-background p-4 shadow-2xl"
        style={{ left: 240, top: 180 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Step {step + 1} of {TOTAL_STEPS}
            </div>
            <h3 className="mt-1 font-heading text-base">
              Press ⌘K to open the palette.
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close tour"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
        <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
          Type the first few letters of any project, page, or person. It also
          runs commands like "create issue" or "switch theme".
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-5 bg-foreground"
                    : i < step
                      ? "w-1.5 bg-foreground/60"
                      : "w-1.5 bg-foreground/15"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              type="button"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              size="xs"
              type="button"
              onClick={() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))}
            >
              Next
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FakeApp() {
  return (
    <div className="absolute inset-0 grid grid-cols-[220px_1fr]">
      <aside className="border-r border-border/60 bg-foreground/[0.02] p-4 space-y-2">
        <div className="h-3 w-24 rounded bg-foreground/15" />
        <div className="h-2 w-32 rounded bg-foreground/10" />
        <div className="h-2 w-28 rounded bg-foreground/10" />
        <div className="h-2 w-24 rounded bg-foreground/10" />
      </aside>
      <main className="p-10">
        <div className="h-3 w-48 rounded bg-foreground/20" />
        <div className="mt-2 h-2 w-72 rounded bg-foreground/10" />
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-border/50 bg-foreground/[0.02]"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
