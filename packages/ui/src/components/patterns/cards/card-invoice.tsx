import { ArrowDownToLineIcon, ExternalLinkIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card, CardPanel } from "@orbit/ui/card";

export type Status = "paid" | "open" | "overdue" | "void";

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: string;
  due: string;
  status: Status;
}

const INVOICES: Invoice[] = [
  {
    id: "inv_2871",
    number: "INV-2871",
    customer: "Foundry Labs",
    amount: "$4,800.00",
    due: "Due Apr 30",
    status: "open",
  },
  {
    id: "inv_2870",
    number: "INV-2870",
    customer: "Northwind Co.",
    amount: "$1,250.00",
    due: "Paid Apr 22",
    status: "paid",
  },
  {
    id: "inv_2869",
    number: "INV-2869",
    customer: "Halcyon Ventures",
    amount: "$9,900.00",
    due: "11 days late",
    status: "overdue",
  },
  {
    id: "inv_2868",
    number: "INV-2868",
    customer: "Atlas Studio",
    amount: "$320.00",
    due: "Voided Apr 19",
    status: "void",
  },
];

const STATUS_STYLES: Record<Status, string> = {
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  open: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  void: "bg-muted text-muted-foreground border-border",
};

export function CardInvoiceShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-heading text-xl">Recent invoices</h1>
            <p className="text-muted-foreground text-sm">
              4 of 142 · April 2026
            </p>
          </div>
          <Button size="sm" variant="outline">
            <ArrowDownToLineIcon />
            Export
          </Button>
        </header>

        <div className="flex flex-col gap-3">
          {INVOICES.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardPanel className="flex items-center gap-4 p-4">
        <div
          className={
            "flex size-10 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px] uppercase " +
            STATUS_STYLES[invoice.status]
          }
        >
          {invoice.status === "paid" ? "PD" : invoice.number.slice(-2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-foreground text-sm">
              {invoice.number}
            </span>
            <Badge
              variant="outline"
              className={
                "font-mono text-[10px] uppercase tracking-wider " +
                STATUS_STYLES[invoice.status]
              }
            >
              {invoice.status}
            </Badge>
          </div>
          <div className="truncate text-muted-foreground text-sm">
            {invoice.customer}
            <span className="mx-1.5 text-muted-foreground/50">·</span>
            {invoice.due}
          </div>
        </div>
        <div className="text-right">
          <div className="font-heading font-semibold text-base tabular-nums">
            {invoice.amount}
          </div>
          <Button
            variant="ghost"
            size="xs"
            className="-mr-2 h-6 text-muted-foreground"
          >
            Open
            <ExternalLinkIcon />
          </Button>
        </div>
      </CardPanel>
    </Card>
  );
}
