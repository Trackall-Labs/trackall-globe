import { CheckIcon, SparklesIcon, XIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const PLANS = [
  {
    name: "Pro",
    price: 24,
    highlight: false,
    features: [
      "10 projects",
      "Up to 10 members",
      "30-day audit log",
      "Email support",
    ],
  },
  {
    name: "Business",
    price: 79,
    highlight: true,
    features: [
      "Unlimited projects",
      "Unlimited members",
      "1-year audit log",
      "SSO & SCIM",
      "Priority support",
      "Custom retention",
    ],
  },
];

export function ModalsUpgradeShowcasePage() {
  return (
    <div className="relative min-h-svh bg-background">
      <div aria-hidden className="px-10 py-10 opacity-25">
        <div className="font-heading text-2xl">Workspace</div>
      </div>

      <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <div className="relative flex items-start gap-4 border-border/60 border-b px-6 pt-6 pb-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
              <SparklesIcon className="size-5" />
            </div>
            <div className="flex-1">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                Limit reached · 10 / 10 projects
              </div>
              <div className="mt-1 font-heading text-xl">
                Time to grow into a bigger plan
              </div>
              <div className="mt-1.5 text-muted-foreground text-sm">
                You've hit the project limit on Free. Upgrade to keep shipping
                — switch back any time.
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-2">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={
                  "relative rounded-xl border p-5 " +
                  (p.highlight
                    ? "border-foreground/60 bg-foreground/[0.04]"
                    : "border-border/60")
                }
              >
                {p.highlight ? (
                  <span className="absolute -top-2 right-4 rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] text-background uppercase tracking-[0.2em]">
                    Recommended
                  </span>
                ) : null}
                <div className="font-heading text-base">{p.name}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-heading text-3xl tracking-tight">
                    ${p.price}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    / member / mo
                  </span>
                </div>
                <ul className="mt-4 flex flex-col gap-2">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-foreground/85 text-sm"
                    >
                      <CheckIcon className="size-3.5 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant={p.highlight ? "default" : "outline"}
                  className="mt-5 w-full"
                >
                  {p.highlight ? "Upgrade to " + p.name : "Choose " + p.name}
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-border/60 border-t bg-background px-6 py-3 text-muted-foreground text-xs">
            <span>14-day money-back · Cancel any time</span>
            <button
              type="button"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              See full plan comparison →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
