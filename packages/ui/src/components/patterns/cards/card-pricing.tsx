import { CheckIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@orbit/ui/card";

export interface Tier {
  slug: string;
  name: string;
  price: string;
  period: string;
  blurb: string;
  features: string[];
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    slug: "starter",
    name: "Starter",
    price: "$0",
    period: "forever",
    blurb: "Everything you need to try us out.",
    features: [
      "Up to 3 projects",
      "Single user",
      "Community support",
      "1 GB storage",
    ],
  },
  {
    slug: "team",
    name: "Team",
    price: "$24",
    period: "per seat / month",
    blurb: "For growing teams that need more.",
    highlight: true,
    features: [
      "Unlimited projects",
      "Up to 25 seats",
      "Priority support",
      "100 GB storage",
      "SSO & audit logs",
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "annual",
    blurb: "For larger orgs with custom needs.",
    features: [
      "Custom seat count",
      "Dedicated CSM",
      "99.99% SLA",
      "Custom data residency",
      "Procurement-ready DPA",
    ],
  },
];

export function CardPricingShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Pricing
          </div>
          <h1 className="mt-2 font-heading text-3xl">Pick a plan that fits.</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Switch or cancel anytime. All plans include a 14-day trial.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <PricingCard key={t.slug} tier={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PricingCard({ tier }: { tier: Tier }) {
  return (
    <Card
      className={
        tier.highlight
          ? "relative scale-[1.01] border-foreground/40 shadow-md"
          : ""
      }
    >
      {tier.highlight ? (
        <Badge className="-top-2.5 -translate-x-1/2 absolute left-1/2 font-mono text-[10px]">
          MOST POPULAR
        </Badge>
      ) : null}
      <CardHeader>
        <CardTitle className="font-heading">{tier.name}</CardTitle>
        <p className="text-muted-foreground text-sm">{tier.blurb}</p>
        <div className="mt-4 flex items-baseline gap-1.5">
          <div className="font-heading text-3xl tracking-tight">
            {tier.price}
          </div>
          <div className="text-muted-foreground text-xs">{tier.period}</div>
        </div>
      </CardHeader>
      <CardPanel className="pt-0">
        <ul className="flex flex-col gap-2 text-sm">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-foreground/70" />
              {f}
            </li>
          ))}
        </ul>
      </CardPanel>
      <CardFooter className="border-t">
        <Button
          variant={tier.highlight ? "default" : "outline"}
          className="w-full"
        >
          {tier.slug === "enterprise" ? "Talk to sales" : "Start free trial"}
        </Button>
      </CardFooter>
    </Card>
  );
}
