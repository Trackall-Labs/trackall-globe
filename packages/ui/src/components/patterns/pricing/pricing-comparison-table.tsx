import { CheckIcon, MinusIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const PLANS = [
  { id: "starter", name: "Starter", price: "$0", cadence: "/mo" },
  { id: "pro", name: "Pro", price: "$24", cadence: "/seat/mo", highlight: true },
  { id: "team", name: "Team", price: "$48", cadence: "/seat/mo" },
  { id: "enterprise", name: "Enterprise", price: "Custom", cadence: "annual" },
];

export interface Row {
  label: string;
  values: (string | boolean)[];
}

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: "Workspace",
    rows: [
      { label: "Projects", values: ["3", "Unlimited", "Unlimited", "Unlimited"] },
      { label: "Members", values: ["5", "25", "100", "Unlimited"] },
      { label: "API requests / mo", values: ["10k", "1M", "10M", "Custom"] },
      { label: "Storage", values: ["1 GB", "100 GB", "1 TB", "Custom"] },
    ],
  },
  {
    title: "Security",
    rows: [
      { label: "SSO via Google", values: [false, true, true, true] },
      { label: "SAML SSO", values: [false, false, true, true] },
      { label: "SCIM provisioning", values: [false, false, false, true] },
      { label: "Custom roles", values: [false, false, true, true] },
      { label: "Audit log retention", values: ["7 days", "30 days", "1 year", "Forever"] },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "Community", values: [true, true, true, true] },
      { label: "Email", values: [false, true, true, true] },
      { label: "Priority email + chat", values: [false, false, true, true] },
      { label: "Dedicated success manager", values: [false, false, false, true] },
    ],
  },
];

export function PricingComparisonTableShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Compare plans
        </div>
        <h1 className="mt-1 font-heading text-3xl">Every feature, side by side.</h1>

        <div className="mt-10 overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-foreground/[0.02]">
                <th className="w-[28%] px-4 py-4 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                  Plan
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    className={`px-4 py-4 text-left ${
                      p.highlight ? "bg-foreground/[0.06]" : ""
                    }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-heading text-xl">{p.price}</span>
                      <span className="text-muted-foreground text-xs">
                        {p.cadence}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((section) => (
                <>
                  <tr key={`header-${section.title}`}>
                    <td
                      colSpan={5}
                      className="border-y border-border/50 bg-foreground/[0.02] px-4 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]"
                    >
                      {section.title}
                    </td>
                  </tr>
                  {section.rows.map((row, i) => (
                    <tr
                      key={`${section.title}-${row.label}`}
                      className={i < section.rows.length - 1 ? "border-b border-border/30" : ""}
                    >
                      <td className="px-4 py-3 text-foreground/85">{row.label}</td>
                      {row.values.map((v, j) => (
                        <td
                          key={j}
                          className={`px-4 py-3 ${
                            PLANS[j]?.highlight ? "bg-foreground/[0.04]" : ""
                          }`}
                        >
                          {typeof v === "boolean" ? (
                            v ? (
                              <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <MinusIcon className="size-4 text-muted-foreground/40" />
                            )
                          ) : (
                            <span className="font-mono text-sm text-foreground/85">
                              {v}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
              <tr className="bg-foreground/[0.02]">
                <td />
                {PLANS.map((p) => (
                  <td key={p.id} className="px-4 py-4">
                    <Button
                      size="sm"
                      variant={p.highlight ? "default" : "outline"}
                      type="button"
                    >
                      {p.id === "starter" ? "Get started" : p.id === "enterprise" ? "Talk to us" : "Choose"}
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
