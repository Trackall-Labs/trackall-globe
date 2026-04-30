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
    id: "explorer",
    name: "Explorer",
    price: "$0",
    cadence: "/mo",
    blurb: "For teams evaluating the live UI surface.",
  },
  {
    id: "analyst",
    name: "Analyst",
    price: "$0",
    cadence: "/mo",
    blurb: "For analytics surfaces and read API access.",
    highlight: true,
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    price: "$0",
    cadence: "/mo",
    blurb: "For custom indexing, isolated nodes, and rate-limit needs.",
  },
];

const SECTIONS: Section[] = [
  {
    title: "Product UI",
    rows: [
      { label: "Globe UI", values: [true, true, true] },
      { label: "Project Explorer", values: [true, true, true] },
      { label: "Project Analytics", values: ["10 projects", "100 projects", "Unlimited"] },
      { label: "Network Analytics", values: ["3 networks", "25 networks", "Unlimited"] },
      { label: "Portfolio Explorer", values: [true, true, true] },
    ],
  },
  {
    title: "APIs",
    rows: [
      { label: "Portfolio tokens API", values: [false, "100K/mo", "2M/mo"] },
      { label: "Token prices API", values: [false, "500K/mo", "10M/mo"] },
      { label: "Network analytics API", values: [false, "100K/mo", "2M/mo"] },
      { label: "Project analytics API", values: [false, "100K/mo", "2M/mo"] },
      { label: "Activity feed API", values: [false, "50K/mo", "1M/mo"] },
    ],
  },
  {
    title: "Users & Activity",
    rows: [
      { label: "Activity feed UI", values: [false, true, true] },
      { label: "Project user analytics", values: [false, true, true] },
      { label: "User filtering", values: [false, "25 filters", "Unlimited"] },
      { label: "User analytics API", values: [false, "50K/mo", "1M/mo"] },
    ],
  },
  {
    title: "Data & Infra",
    rows: [
      { label: "Isolated node indexing", values: [false, false, "1 node"] },
      { label: "Balance history", values: [false, "180 days", "2 years"] },
      { label: "PnL over time", values: [false, "180 days", "2 years"] },
      { label: "Customizable rate limits", values: [false, "300/min", "2K/min"] },
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
            Unlimited onchain intelligence
          </div>
          <h1 className="mt-2 font-heading text-3xl tracking-tight md:text-4xl">
            Unlimited intelligence for your ecosystem.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            See every network, project, wallet, user, token price, activity stream, and API
            signal from one live operating layer.
          </p>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-background/40">
          <div className="scrollbar-none overflow-x-auto">
            <Table className="min-w-[860px] text-sm">
              <TableHeader>
                <TableRow className="border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.02]">
                  <TableHead className="w-[28%] px-4 py-4 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                    Plan
                  </TableHead>
                  {PLANS.map((plan) => (
                    <TableHead
                      key={plan.id}
                      className={
                        "px-4 py-4 align-top whitespace-normal " +
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
                      <div className="mt-2 max-w-44 whitespace-normal text-muted-foreground text-xs leading-5">
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
                  <TableCell className="px-4 py-4 text-muted-foreground text-xs">
                    Pricing is placeholder while access is private.
                  </TableCell>
                  {PLANS.map((plan) => (
                    <TableCell key={plan.id} className="px-4 py-4">
                      <Button
                        type="button"
                        size="sm"
                        variant={plan.highlight ? "default" : "outline"}
                        aria-label={`Request access to ${plan.name}`}
                      >
                        Request access
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
