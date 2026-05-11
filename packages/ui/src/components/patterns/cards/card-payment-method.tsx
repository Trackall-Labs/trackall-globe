import { useState } from "react";
import { ChevronRightIcon, ShieldCheckIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@orbit/ui/card";

export type Brand = "visa" | "mastercard" | "amex";

export interface PaymentMethod {
  id: string;
  brand: Brand;
  last4: string;
  exp: string;
  holder: string;
  primary: boolean;
}

const METHODS: PaymentMethod[] = [
  {
    id: "pm_1",
    brand: "visa",
    last4: "4242",
    exp: "08/27",
    holder: "Sean Brydon",
    primary: true,
  },
  {
    id: "pm_2",
    brand: "mastercard",
    last4: "8211",
    exp: "11/26",
    holder: "Sean Brydon",
    primary: false,
  },
];

export function CardPaymentMethodShowcasePage() {
  const [primaryId, setPrimaryId] = useState(
    METHODS.find((m) => m.primary)?.id,
  );

  return (
    <div className="min-h-svh bg-background px-6 py-16">
      <div className="mx-auto max-w-md">
        <header className="mb-6">
          <h1 className="font-heading text-xl">Payment methods</h1>
          <p className="text-muted-foreground text-sm">
            Used for subscriptions and team seats.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CreditCardArt
              brand={METHODS[0].brand}
              last4={METHODS[0].last4}
              holder={METHODS[0].holder}
              exp={METHODS[0].exp}
            />
          </CardHeader>
          <CardPanel className="pt-2">
            <CardTitle className="font-heading text-base">
              On file ({METHODS.length})
            </CardTitle>
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {METHODS.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <BrandPill brand={m.brand} />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-foreground text-sm">
                      •••• {m.last4}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Exp {m.exp}
                    </div>
                  </div>
                  {primaryId === m.id ? (
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px] uppercase"
                    >
                      Primary
                    </Badge>
                  ) : (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setPrimaryId(m.id)}
                    >
                      Make primary
                    </Button>
                  )}
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </CardPanel>
          <CardFooter className="flex-col items-stretch gap-2 border-t">
            <Button className="w-full">Add new card</Button>
            <p className="inline-flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
              <ShieldCheckIcon className="size-3.5" />
              Secured by Stripe · we never store your CVC.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function CreditCardArt({
  brand,
  last4,
  holder,
  exp,
}: {
  brand: Brand;
  last4: string;
  holder: string;
  exp: string;
}) {
  const palette: Record<Brand, string> = {
    visa: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #312e81 100%)",
    mastercard:
      "linear-gradient(135deg, #1f2937 0%, #7c2d12 60%, #be185d 100%)",
    amex: "linear-gradient(135deg, #064e3b 0%, #0f766e 60%, #0891b2 100%)",
  };
  return (
    <div
      className="relative h-44 w-full overflow-hidden rounded-xl text-white shadow-md"
      style={{ background: palette[brand] }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(80% 60% at 0% 0%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(60% 60% at 100% 100%, rgba(0,0,0,0.4), transparent 60%)",
        }}
      />
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-80">
              Orbit · primary
            </div>
            <div className="size-7 rounded-md bg-amber-300/80 shadow-inner" />
          </div>
          <BrandPill brand={brand} variant="card" />
        </div>
        <div>
          <div className="font-mono text-lg tracking-[0.2em]">
            •••• •••• •••• {last4}
          </div>
          <div className="mt-2 flex items-end justify-between font-mono text-[10px] uppercase tracking-widest opacity-90">
            <div>
              <div className="opacity-60">Cardholder</div>
              <div>{holder}</div>
            </div>
            <div>
              <div className="opacity-60">Exp</div>
              <div>{exp}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandPill({
  brand,
  variant,
}: {
  brand: Brand;
  variant?: "card";
}) {
  const label = brand === "amex" ? "AMEX" : brand.toUpperCase();
  const cardLook =
    "rounded-md bg-white/15 px-2 py-1 font-heading font-semibold text-[11px] text-white tracking-wider backdrop-blur";
  const inlineLook =
    "flex h-6 min-w-10 items-center justify-center rounded-md border border-border bg-card px-2 font-heading font-semibold text-[10px] text-foreground/80 tracking-wider";
  return <div className={variant === "card" ? cardLook : inlineLook}>{label}</div>;
}
