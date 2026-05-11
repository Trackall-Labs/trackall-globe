import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const FEATURES = [
  "Unlimited projects",
  "Unlimited team members",
  "All integrations",
  "Audit log",
  "Priority support",
  "Cancel any time",
];

export function PricingSimpleCardShowcasePage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 py-16">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          One plan. Everything in.
        </div>
        <h1 className="mt-2 font-heading text-4xl tracking-tight">
          Just one price.
        </h1>
        <p className="mt-2 text-balance text-center text-muted-foreground text-sm">
          We don't do tiers. Either it's worth it, or it isn't.
        </p>

        <div className="mt-10 w-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-xl">
          <div className="relative px-7 py-7">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Pro
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-heading text-5xl tracking-tight">$19</span>
              <span className="text-muted-foreground text-sm">/ user / month</span>
            </div>
            <p className="mt-2 text-muted-foreground text-sm">
              Billed monthly. Less when paid annually.
            </p>

            <Button size="lg" type="button" className="mt-6 w-full">
              Start your trial
              <ArrowRightIcon />
            </Button>
            <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              14 days free · no card needed
            </p>
          </div>
          <div className="border-t border-border/60 bg-foreground/[0.02] px-7 py-6">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Includes
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-balance text-center text-muted-foreground text-xs">
          Need more seats or compliance features?{" "}
          <a
            href="#"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Talk to us
          </a>
          .
        </p>
      </div>
    </div>
  );
}
