import { CheckIcon, SparklesIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    cadence: "forever",
    blurb: "For solo work and weekend tinkering.",
    features: ["1 workspace", "3 projects", "Up to 5 collaborators", "Community support"],
    cta: "Get started",
    primary: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$24",
    cadence: "/seat/month",
    blurb: "For teams that need real headroom.",
    features: [
      "Unlimited projects",
      "1M API requests",
      "30-day audit log",
      "Priority email support",
      "SSO via Google",
    ],
    cta: "Start free trial",
    primary: true,
    badge: "Most popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "annual",
    blurb: "For organisations with compliance needs.",
    features: [
      "Everything in Pro",
      "Unlimited audit log",
      "SAML SSO + SCIM",
      "Custom roles & DPA",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
    primary: false,
  },
];

export function PricingThreeTierShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Pricing
          </div>
          <h1 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">
            Pay for what your team needs.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground text-sm">
            Three plans, no surprises. Switch up or down at any time — we
            pro-rate the difference.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                p.primary
                  ? "border-foreground bg-foreground/[0.04] shadow-lg lg:scale-[1.02]"
                  : "border-border/60 bg-background/40"
              }`}
            >
              {p.badge ? (
                <div className="-translate-x-1/2 absolute -top-3 left-1/2 inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 font-mono text-[10px] text-background uppercase tracking-[0.3em]">
                  <SparklesIcon className="size-3" />
                  {p.badge}
                </div>
              ) : null}
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                {p.name}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-heading text-4xl">{p.price}</span>
                <span className="text-muted-foreground text-xs">{p.cadence}</span>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">{p.blurb}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckIcon
                      className={`mt-0.5 size-4 shrink-0 ${
                        p.primary ? "text-foreground" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                type="button"
                variant={p.primary ? "default" : "outline"}
                className="mt-6"
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          All prices in USD · billed monthly · cancel any time
        </p>
      </div>
    </div>
  );
}
