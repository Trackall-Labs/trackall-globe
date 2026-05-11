import { useState } from "react";
import { ArrowRightIcon, XIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const STEPS = 5;

export function ToursArrowTooltipShowcasePage() {
  const [step, setStep] = useState(1);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeApp />

      <div
        aria-hidden
        className="pointer-events-none absolute z-30 rounded-md ring-2 ring-primary/70"
        style={{ left: 100, top: 220, width: 120, height: 36 }}
      />

      <div
        className="absolute z-40 w-72"
        style={{ left: 240, top: 200 }}
      >
        <div className="-left-1.5 absolute top-6 size-3 rotate-45 bg-foreground" />
        <div className="rounded-lg bg-foreground p-4 text-background shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
                Tip · {step} / {STEPS}
              </div>
              <h3 className="mt-1 font-medium text-sm">
                Click here to filter by status.
              </h3>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed opacity-80">
            Stack filters with{" "}
            <kbd className="rounded bg-background/15 px-1 font-mono text-[10px]">
              ⇧
            </kbd>{" "}
            click to multi-select values.
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-background/15 pt-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i + 1 === step
                      ? "w-4 bg-background"
                      : i + 1 < step
                        ? "w-1 bg-background/60"
                        : "w-1 bg-background/20"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="xs"
                variant="ghost"
                type="button"
                className="text-background/80 hover:bg-background/10 hover:text-background"
                onClick={() => setStep((s) => Math.max(s - 1, 1))}
                disabled={step === 1}
              >
                Back
              </Button>
              <Button
                size="xs"
                type="button"
                className="bg-background text-foreground hover:bg-background/90"
                onClick={() => setStep((s) => Math.min(s + 1, STEPS))}
              >
                Next
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FakeApp() {
  return (
    <div className="absolute inset-0 grid grid-cols-[60px_1fr]">
      <aside className="border-r border-border/60 bg-foreground/[0.02]" />
      <main className="p-10">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Issues
        </div>
        <h1 className="mt-1 font-heading text-2xl">Workload</h1>

        <div className="mt-8 flex items-center gap-2">
          <div className="h-9 w-32 rounded-md border border-border/60 bg-background/40" />
          <div className="h-9 w-28 rounded-md border border-border/60 bg-background/40 opacity-60" />
          <div className="h-9 w-24 rounded-md border border-border/60 bg-background/40 opacity-60" />
        </div>

        <div className="mt-6 space-y-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 rounded-md border border-border/40 bg-foreground/[0.02]"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
