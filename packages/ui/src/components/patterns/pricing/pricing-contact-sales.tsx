import { CheckIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Input } from "@orbit/ui/input";
import { Label } from "@orbit/ui/label";
import { Textarea } from "@orbit/ui/textarea";

const FEATURES = [
  "Unlimited everything",
  "SAML SSO + SCIM",
  "Custom roles & permissions",
  "Audit log forever",
  "Dedicated success manager",
  "DPA + procurement support",
  "99.99% uptime SLA",
];

export function PricingContactSalesShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh max-w-6xl grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <section className="flex flex-col justify-center border-border/60 px-8 py-16 lg:border-r">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            <ShieldCheckIcon className="size-3" />
            Enterprise
          </div>
          <h1 className="mt-4 font-heading text-4xl tracking-tight md:text-5xl">
            Built for the procurement people.
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
            For organisations with compliance, identity, and procurement
            requirements. We'll work through your security questionnaire and DPA
            on the same call.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-6 border-t border-border/60 pt-6">
            <Logo>Linear</Logo>
            <Logo>Vercel</Logo>
            <Logo>Stripe</Logo>
            <Logo>Notion</Logo>
          </div>
        </section>

        <section className="flex flex-col justify-center px-8 py-16">
          <form className="rounded-2xl border border-border/60 bg-background/40 p-6">
            <h2 className="font-heading text-xl">Talk to us.</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Reply within one business day.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ent-name">Name</Label>
                <Input id="ent-name" placeholder="Sean Brydon" nativeInput />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ent-co">Company</Label>
                <Input id="ent-co" placeholder="Acme inc." nativeInput />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ent-email">Work email</Label>
                <Input
                  id="ent-email"
                  type="email"
                  placeholder="you@company.com"
                  nativeInput
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ent-seats">Estimated seats</Label>
                <div className="relative">
                  <select
                    id="ent-seats"
                    className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-9 text-sm outline-none"
                  >
                    <option>50–100</option>
                    <option>100–500</option>
                    <option>500–1000</option>
                    <option>1000+</option>
                  </select>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 opacity-60"
                  >
                    <polyline points="4 6 8 10 12 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <Label htmlFor="ent-msg">What are you looking for?</Label>
              <Textarea
                id="ent-msg"
                rows={4}
                placeholder="Compliance constraints, timeline, or anything else."
              />
            </div>

            <Button size="lg" type="submit" className="mt-5 w-full">
              Request a call
            </Button>
            <p className="mt-2 text-center text-muted-foreground text-xs">
              We don't share your details with anyone.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export function Logo({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-medium text-muted-foreground/60 text-sm tracking-wide">
      {children}
    </span>
  );
}
