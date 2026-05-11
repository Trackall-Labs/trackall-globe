import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const PER_SEAT = 24;

export function PricingSliderSeatsShowcasePage() {
  const [seats, setSeats] = useState(8);
  const [annual, setAnnual] = useState(true);
  const monthly = seats * PER_SEAT;
  const yearly = monthly * 12 * 0.8;
  const display = annual ? Math.round(yearly / 12) : monthly;
  const totalAnnual = annual ? Math.round(yearly) : null;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Pro plan
          </div>
          <h1 className="mt-1 font-heading text-3xl">
            How big is your team?
          </h1>
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-background/40 p-8">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-5xl tracking-tight">${display}</span>
                <span className="text-muted-foreground text-sm">/ month</span>
              </div>
              {totalAnnual ? (
                <p className="mt-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">
                  ${totalAnnual.toLocaleString()} billed annually · save 20%
                </p>
              ) : (
                <p className="mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Billed monthly
                </p>
              )}
            </div>
            <div className="inline-flex rounded-full border border-border/60 bg-background/40 p-0.5 font-mono text-[11px] uppercase tracking-[0.2em]">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  !annual ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  annual ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="seats"
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
              >
                Seats
              </label>
              <div className="font-mono text-sm">
                <span className="font-heading text-2xl">{seats}</span>
                <span className="text-muted-foreground"> × ${PER_SEAT}</span>
              </div>
            </div>
            <input
              id="seats"
              type="range"
              min={1}
              max={50}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="mt-3 w-full accent-foreground"
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
              <span>1</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50+</span>
            </div>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-2.5">
            {[
              "Unlimited projects",
              "1M API requests / mo",
              "30-day audit log",
              "SSO via Google",
              "Priority email support",
              "Custom roles",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {f}
              </li>
            ))}
          </ul>

          <Button size="lg" type="button" className="mt-8 w-full">
            Continue with {seats} seat{seats === 1 ? "" : "s"}
          </Button>
          <p className="mt-2 text-center text-muted-foreground text-xs">
            14-day free trial · no card required
          </p>
        </div>
      </div>
    </div>
  );
}
