import { Fragment } from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orbit/ui/table";

type Plan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  ctaLabel: string;
  highlight?: boolean;
};

type RowValue = string | boolean;

type Section = {
  title: string;
  rows: {
    label: string;
    values: RowValue[];
  }[];
};

const PLANS: Plan[] = [
  {
    id: "users",
    name: "Users",
    price: "Free",
    cadence: "",
    blurb: "For wallet holders, community teams, and public ecosystem discovery.",
    ctaLabel: "Start free",
  },
  {
    id: "projects",
    name: "Projects",
    price: "Usage-based",
    cadence: "",
    blurb: "For builders paying by usage across wallet data, activity, and analytics.",
    ctaLabel: "Get API access",
    highlight: true,
  },
  {
    id: "foundation",
    name: "Foundation",
    price: "Custom",
    cadence: "",
    blurb: "For foundations giving every project and user faster data, deeper insights, and dedicated infra.",
    ctaLabel: "Talk to us",
  },
];

const SECTIONS: Section[] = [
  {
    title: "Product",
    rows: [
      { label: "Globe UI", values: [true, true, true] },
      { label: "Project Explorer", values: [true, true, true] },
      { label: "Portfolio Explorer", values: [true, true, true] },
    ],
  },
  {
    title: "Data Access",
    rows: [
      { label: "Wallet balances", values: [false, "Metered", "Unlimited"] },
      { label: "Token prices", values: [false, "Metered", "Unlimited"] },
      { label: "DeFi positions", values: [false, "Metered", "Unlimited"] },
      { label: "Project analytics", values: [false, "Metered", "Unlimited"] },
      { label: "Real-time activity", values: [false, "Metered", "Unlimited"] },
      { label: "Balance history", values: [false, "Metered", "Unlimited"] },
    ],
  },
  {
    title: "Growth Analytics",
    rows: [
      { label: "Activity feed UI", values: [true, true, true] },
      { label: "Project user cohorts", values: [false, true, true] },
      { label: "Wallet filtering", values: [false, "Custom", "Custom"] },
      { label: "User analytics", values: [false, "Metered", "Unlimited"] },
      { label: "Adverts & announcements", values: [false, "Sponsored", "Ecosystem-wide"] },
    ],
  },
  {
    title: "Infrastructure",
    rows: [
      { label: "Dedicated node", values: [false, false, "Dedicated"] },
      { label: "Dedicated support", values: [false, false, true] },
      { label: "Rate limit", values: [false, "300/min", "Custom"] },
    ],
  },
];

function PlanValue({ value }: { value: RowValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckIcon className="size-4 text-emerald-500" aria-label="Included" />
    ) : (
      <MinusIcon className="size-4 text-muted-foreground/45" aria-label="Not included" />
    );
  }

  return (
    <span className="font-mono text-[11px] text-foreground/85 uppercase tracking-[0.14em]">
      {value}
    </span>
  );
}

export function ProductPricingPage() {
  return (
    <div className="absolute inset-0 z-40 overflow-y-auto overflow-x-hidden bg-background pt-[64px] text-foreground">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="max-w-3xl">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Ecosystem intelligence platform
          </div>
          <h1 className="mt-2 max-w-3xl text-balance font-heading text-3xl tracking-tight md:text-4xl">
            Unlimited intelligence for your ecosystem.
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">
            One intelligence layer for ecosystem teams, builders, and users: explorer UI,
            wallet data, project analytics, activity feeds, and infrastructure APIs.
          </p>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-background/40">
          <div className="scrollbar-none overflow-x-auto">
            <Table className="min-w-[1040px] table-fixed text-sm">
              <TableHeader>
                <TableRow className="border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.02]">
                  <TableHead className="w-[40%] px-4 py-4 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                    Plan
                  </TableHead>
                  {PLANS.map((plan) => (
                    <TableHead
                      key={plan.id}
                      className={
                        "w-[20%] px-4 py-4 align-top whitespace-normal " +
                        (plan.highlight ? "bg-foreground/[0.05]" : "")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{plan.name}</span>
                        {plan.highlight ? (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            Focus
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="font-heading text-2xl text-foreground">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {plan.cadence}
                        </span>
                      </div>
                      <div className="mt-2 whitespace-normal text-muted-foreground text-xs leading-5">
                        {plan.blurb}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {SECTIONS.map((section) => (
                  <Fragment key={section.title}>
                    <TableRow className="border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.02]">
                      <TableCell
                        colSpan={4}
                        className="px-4 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]"
                      >
                        {section.title}
                      </TableCell>
                    </TableRow>
                    {section.rows.map((row) => (
                      <TableRow key={`${section.title}:${row.label}`} className="border-border/40">
                        <TableCell className="px-4 py-3 text-foreground/85">
                          {row.label}
                        </TableCell>
                        {row.values.map((value, index) => (
                          <TableCell
                            key={`${row.label}:${PLANS[index]?.id ?? index}`}
                            className={
                              "px-4 py-3 " +
                              (PLANS[index]?.highlight ? "bg-foreground/[0.035]" : "")
                            }
                          >
                            <PlanValue value={value} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
                <TableRow className="border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.02]">
                  <TableCell
                    className="px-4 py-4 whitespace-normal text-muted-foreground text-xs leading-5"
                  >
                    Users are free. Projects are billed by metered API usage. Foundations
                    get custom infrastructure and limits.
                  </TableCell>
                  {PLANS.map((plan) => (
                    <TableCell key={plan.id} className="px-4 py-4 align-middle">
                      <Button
                        type="button"
                        size="sm"
                        variant={plan.highlight ? "default" : "outline"}
                        aria-label={`Request access to ${plan.name}`}
                      >
                        {plan.ctaLabel}
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}
