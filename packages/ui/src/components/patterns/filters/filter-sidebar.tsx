import { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  RotateCcwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Checkbox } from "@orbit/ui/checkbox";
import { CheckboxGroup } from "@orbit/ui/checkbox-group";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@orbit/ui/collapsible";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@orbit/ui/input-group";
import { Label } from "@orbit/ui/label";
import { Slider } from "@orbit/ui/slider";
import { Switch } from "@orbit/ui/switch";

export type CategoryVal = "apparel" | "drinkware" | "stationery" | "hardware" | "home" | "games";
export type ColorVal = "bone" | "moss" | "dune" | "night" | "rust" | "sky";

const CATEGORIES: { value: CategoryVal; label: string }[] = [
  { value: "apparel", label: "Apparel" },
  { value: "drinkware", label: "Drinkware" },
  { value: "stationery", label: "Stationery" },
  { value: "hardware", label: "Hardware" },
  { value: "home", label: "Home & garden" },
  { value: "games", label: "Games" },
];

const COLORS: { value: ColorVal; label: string; color: string }[] = [
  { value: "bone", label: "Bone", color: "bg-stone-200" },
  { value: "moss", label: "Moss", color: "bg-emerald-700" },
  { value: "dune", label: "Dune", color: "bg-amber-300" },
  { value: "night", label: "Night", color: "bg-zinc-900" },
  { value: "rust", label: "Rust", color: "bg-orange-700" },
  { value: "sky", label: "Sky", color: "bg-sky-400" },
];

const RATINGS = [
  { value: "5", label: "5", min: 5 },
  { value: "4+", label: "4 & up", min: 4 },
  { value: "3+", label: "3 & up", min: 3 },
];

export interface Product {
  id: string;
  name: string;
  category: CategoryVal;
  price: number;
  colors: ColorVal[];
  rating: number;
  inStock: boolean;
  onSale: boolean;
  freeShipping: boolean;
  newArrival: boolean;
}

const PRODUCTS: Product[] = [
  { id: "p01", name: "Specimen Tee", category: "apparel", price: 38, colors: ["bone", "night"], rating: 4.6, inStock: true, onSale: true, freeShipping: true, newArrival: false },
  { id: "p02", name: "Lab Hoodie", category: "apparel", price: 92, colors: ["moss", "night"], rating: 4.8, inStock: true, onSale: false, freeShipping: true, newArrival: true },
  { id: "p03", name: "Field Cap", category: "apparel", price: 26, colors: ["dune", "rust"], rating: 4.4, inStock: true, onSale: false, freeShipping: false, newArrival: false },
  { id: "p04", name: "Type Cardigan", category: "apparel", price: 142, colors: ["bone"], rating: 4.9, inStock: false, onSale: false, freeShipping: true, newArrival: true },
  { id: "p05", name: "Ceramic Mug", category: "drinkware", price: 22, colors: ["bone", "night"], rating: 4.7, inStock: true, onSale: false, freeShipping: false, newArrival: false },
  { id: "p06", name: "Vacuum Flask", category: "drinkware", price: 36, colors: ["sky", "night"], rating: 4.5, inStock: true, onSale: true, freeShipping: true, newArrival: false },
  { id: "p07", name: "Espresso Cup", category: "drinkware", price: 14, colors: ["bone"], rating: 4.2, inStock: true, onSale: false, freeShipping: false, newArrival: true },
  { id: "p08", name: "Field Notes vol.4", category: "stationery", price: 14, colors: ["dune"], rating: 4.9, inStock: true, onSale: false, freeShipping: true, newArrival: true },
  { id: "p09", name: "Brass Pen", category: "stationery", price: 48, colors: ["dune", "rust"], rating: 4.7, inStock: false, onSale: false, freeShipping: true, newArrival: false },
  { id: "p10", name: "Specimen Notebook", category: "stationery", price: 22, colors: ["bone", "moss"], rating: 4.4, inStock: true, onSale: true, freeShipping: false, newArrival: false },
  { id: "p11", name: "Mech Keyboard", category: "hardware", price: 168, colors: ["night"], rating: 4.8, inStock: true, onSale: false, freeShipping: true, newArrival: true },
  { id: "p12", name: "Trackball", category: "hardware", price: 88, colors: ["bone", "night"], rating: 4.3, inStock: true, onSale: false, freeShipping: true, newArrival: false },
  { id: "p13", name: "USB-C Hub", category: "hardware", price: 56, colors: ["night"], rating: 4.6, inStock: true, onSale: true, freeShipping: false, newArrival: false },
  { id: "p14", name: "Laser Pointer", category: "hardware", price: 32, colors: ["sky"], rating: 3.9, inStock: false, onSale: false, freeShipping: false, newArrival: false },
  { id: "p15", name: "Linen Throw", category: "home", price: 78, colors: ["bone", "moss"], rating: 4.7, inStock: true, onSale: false, freeShipping: true, newArrival: true },
  { id: "p16", name: "Ceramic Planter", category: "home", price: 28, colors: ["bone", "rust"], rating: 4.5, inStock: true, onSale: true, freeShipping: false, newArrival: false },
  { id: "p17", name: "Brass Candlestick", category: "home", price: 52, colors: ["dune"], rating: 4.6, inStock: true, onSale: false, freeShipping: true, newArrival: false },
  { id: "p18", name: "Wool Blanket", category: "home", price: 124, colors: ["moss", "rust"], rating: 4.8, inStock: false, onSale: false, freeShipping: true, newArrival: true },
  { id: "p19", name: "Chess Set", category: "games", price: 88, colors: ["bone", "night"], rating: 4.7, inStock: true, onSale: false, freeShipping: true, newArrival: false },
  { id: "p20", name: "Card Deck", category: "games", price: 12, colors: ["sky"], rating: 4.4, inStock: true, onSale: true, freeShipping: false, newArrival: false },
  { id: "p21", name: "Field Towel", category: "apparel", price: 18, colors: ["bone", "sky"], rating: 4.1, inStock: true, onSale: false, freeShipping: false, newArrival: true },
  { id: "p22", name: "Brass Compass", category: "hardware", price: 64, colors: ["dune"], rating: 4.6, inStock: true, onSale: false, freeShipping: true, newArrival: false },
  { id: "p23", name: "Type Print", category: "home", price: 42, colors: ["bone"], rating: 4.5, inStock: true, onSale: false, freeShipping: false, newArrival: true },
  { id: "p24", name: "Domino Set", category: "games", price: 24, colors: ["dune", "moss"], rating: 4.2, inStock: true, onSale: false, freeShipping: false, newArrival: false },
];

export interface FilterState {
  categories: CategoryVal[];
  priceRange: [number, number];
  colors: ColorVal[];
  ratingMin: number;
  inStock: boolean;
  onSale: boolean;
  freeShipping: boolean;
  newArrival: boolean;
  search: string;
}

const INITIAL_STATE: FilterState = {
  categories: [],
  priceRange: [0, 200],
  colors: [],
  ratingMin: 0,
  inStock: false,
  onSale: false,
  freeShipping: false,
  newArrival: false,
  search: "",
};

const RATING_VALUE_TO_MIN: Record<string, number> = {
  "5": 5,
  "4+": 4,
  "3+": 3,
};
const MIN_TO_RATING_VALUE: Record<number, string> = {
  5: "5",
  4: "4+",
  3: "3+",
};

export function FilterSidebarShowcasePage() {
  const [state, setState] = useState<FilterState>(INITIAL_STATE);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (state.categories.length && !state.categories.includes(p.category))
        return false;
      if (p.price < state.priceRange[0] || p.price > state.priceRange[1])
        return false;
      if (state.colors.length && !p.colors.some((c) => state.colors.includes(c)))
        return false;
      if (state.ratingMin > 0 && p.rating < state.ratingMin) return false;
      if (state.inStock && !p.inStock) return false;
      if (state.onSale && !p.onSale) return false;
      if (state.freeShipping && !p.freeShipping) return false;
      if (state.newArrival && !p.newArrival) return false;
      return true;
    });
  }, [state]);

  const counts = useMemo(() => {
    const cat: Record<CategoryVal, number> = {
      apparel: 0, drinkware: 0, stationery: 0, hardware: 0, home: 0, games: 0,
    };
    PRODUCTS.forEach((p) => { cat[p.category]++; });
    const rat: Record<string, number> = {};
    RATINGS.forEach((r) => {
      rat[r.value] = PRODUCTS.filter((p) => p.rating >= r.min).length;
    });
    return { cat, rat };
  }, []);

  const activeCount =
    state.categories.length +
    state.colors.length +
    (state.ratingMin > 0 ? 1 : 0) +
    (state.priceRange[0] !== 0 || state.priceRange[1] !== 200 ? 1 : 0) +
    (state.inStock ? 1 : 0) +
    (state.onSale ? 1 : 0) +
    (state.freeShipping ? 1 : 0) +
    (state.newArrival ? 1 : 0);

  const reset = () => setState(INITIAL_STATE);

  const filtersMatch = (label: string) =>
    state.search.trim() === "" ||
    label.toLowerCase().includes(state.search.trim().toLowerCase());

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-12 lg:h-[calc(100svh-6rem)]">
          <div className="flex h-full flex-col rounded-xl border bg-card shadow-xs/5">
            <header className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
                <h2 className="font-medium text-sm">Filters</h2>
                {activeCount > 0 ? (
                  <Badge size="sm" variant="secondary" className="font-mono text-[10px]">
                    {activeCount}
                  </Badge>
                ) : null}
              </div>
              <Button
                size="xs"
                variant="ghost"
                className="text-muted-foreground"
                onClick={reset}
                disabled={activeCount === 0}
              >
                <RotateCcwIcon />
                Reset
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <InputGroup>
                  <InputGroupAddon>
                    <SearchIcon className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search filters…"
                    className="h-8 text-sm"
                    value={state.search}
                    onChange={(e) =>
                      setState((s) => ({ ...s, search: e.target.value }))
                    }
                    nativeInput
                  />
                </InputGroup>
              </div>

              {filtersMatch("Category") ? (
                <Section
                  title="Category"
                  badge={state.categories.length || undefined}
                >
                  <CheckboxGroup
                    aria-label="Category"
                    value={state.categories}
                    onValueChange={(v) =>
                      setState((s) => ({ ...s, categories: v as CategoryVal[] }))
                    }
                    className="flex flex-col gap-2"
                  >
                    {CATEGORIES.map((c) => (
                      <Label
                        key={c.value}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox value={c.value} />
                        <span className="flex-1">{c.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                          {counts.cat[c.value]}
                        </span>
                      </Label>
                    ))}
                  </CheckboxGroup>
                </Section>
              ) : null}

              {filtersMatch("Price") ? (
                <Section title="Price">
                  <div className="px-1 pt-1">
                    <Slider
                      value={state.priceRange}
                      min={0}
                      max={200}
                      step={2}
                      onValueChange={(v) => {
                        const arr = v as number[];
                        setState((s) => ({
                          ...s,
                          priceRange: [arr[0] ?? 0, arr[1] ?? 200],
                        }));
                      }}
                    />
                    <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs tabular-nums">
                      <span className="font-mono text-foreground">
                        ${state.priceRange[0]} – ${state.priceRange[1]}
                      </span>
                      <span className="text-muted-foreground/60">$0 – $200</span>
                    </div>
                  </div>
                </Section>
              ) : null}

              {filtersMatch("Color") ? (
                <Section
                  title="Color"
                  badge={state.colors.length || undefined}
                >
                  <CheckboxGroup
                    aria-label="Color"
                    value={state.colors}
                    onValueChange={(v) =>
                      setState((s) => ({ ...s, colors: v as ColorVal[] }))
                    }
                    className="grid grid-cols-3 gap-1.5"
                  >
                    {COLORS.map((c) => (
                      <Label
                        key={c.value}
                        className="flex cursor-pointer items-center gap-1.5 rounded-md border p-1.5 text-xs hover:bg-accent has-checked:border-foreground/30 has-checked:bg-foreground/5"
                      >
                        <Checkbox value={c.value} />
                        <span
                          className={
                            "size-3 rounded-full ring-1 ring-border " + c.color
                          }
                        />
                        {c.label}
                      </Label>
                    ))}
                  </CheckboxGroup>
                </Section>
              ) : null}

              {filtersMatch("Rating") ? (
                <Section
                  title="Rating"
                  badge={state.ratingMin > 0 ? 1 : undefined}
                >
                  <CheckboxGroup
                    aria-label="Rating"
                    value={
                      state.ratingMin > 0
                        ? [MIN_TO_RATING_VALUE[state.ratingMin] ?? ""]
                        : []
                    }
                    onValueChange={(v) => {
                      const arr = v as string[];
                      const last = arr[arr.length - 1];
                      const min = last ? RATING_VALUE_TO_MIN[last] ?? 0 : 0;
                      setState((s) => ({ ...s, ratingMin: min }));
                    }}
                    className="flex flex-col gap-2"
                  >
                    {RATINGS.map((r) => (
                      <Label
                        key={r.value}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox value={r.value} />
                        <span className="flex-1">
                          <span className="font-mono text-amber-500">★</span>{" "}
                          {r.label}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                          {counts.rat[r.value]}
                        </span>
                      </Label>
                    ))}
                  </CheckboxGroup>
                </Section>
              ) : null}

              {filtersMatch("More options") ? (
                <Section title="More options">
                  <ToggleRow
                    label="In stock only"
                    checked={state.inStock}
                    onChange={(v) =>
                      setState((s) => ({ ...s, inStock: v }))
                    }
                  />
                  <ToggleRow
                    label="On sale"
                    checked={state.onSale}
                    onChange={(v) => setState((s) => ({ ...s, onSale: v }))}
                  />
                  <ToggleRow
                    label="Free shipping"
                    checked={state.freeShipping}
                    onChange={(v) =>
                      setState((s) => ({ ...s, freeShipping: v }))
                    }
                  />
                  <ToggleRow
                    label="New arrivals"
                    checked={state.newArrival}
                    onChange={(v) =>
                      setState((s) => ({ ...s, newArrival: v }))
                    }
                  />
                </Section>
              ) : null}
            </div>

            <footer className="flex items-center gap-2 border-t bg-background p-3">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={reset}
                disabled={activeCount === 0}
              >
                Cancel
              </Button>
              <Button size="sm" className="flex-1">
                Show {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </Button>
            </footer>
          </div>
        </aside>

        <section>
          <header className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="font-heading text-xl">Filter sidebar</h1>
              <p className="text-muted-foreground text-sm">
                Showing {filtered.length} of {PRODUCTS.length} products.
              </p>
            </div>
          </header>
          <ProductGrid products={filtered} onReset={reset} />
        </section>
      </div>
    </div>
  );
}

export function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen className="border-b py-3 last:border-b-0">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-medium text-sm">
          {title}
          {badge ? (
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {badge}
            </Badge>
          ) : null}
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[panel-open]:-rotate-180" />
      </CollapsibleTrigger>
      <CollapsiblePanel className="overflow-hidden">
        <div className="pt-3">{children}</div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Label className="flex cursor-pointer items-center justify-between py-1.5 text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
    </Label>
  );
}

export function ProductGrid({
  products,
  onReset,
}: {
  products: Product[];
  onReset: () => void;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/40 p-12 text-center">
        <p className="text-muted-foreground text-sm">
          No products match these filters.
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const colorMeta = product.colors
    .map((c) => COLORS.find((m) => m.value === c))
    .filter(Boolean) as { value: ColorVal; label: string; color: string }[];
  return (
    <div className="rounded-xl border bg-card p-3 shadow-xs/5">
      <div
        className="relative h-28 overflow-hidden rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${swatchHex(product.colors[0])} 0%, ${swatchHex(product.colors[1] ?? product.colors[0])} 100%)`,
        }}
      >
        {product.onSale ? (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 font-mono text-[10px] uppercase"
          >
            Sale
          </Badge>
        ) : null}
        {product.newArrival ? (
          <Badge
            variant="outline"
            className="absolute top-2 right-2 border-foreground/20 bg-background/80 font-mono text-[10px] uppercase backdrop-blur"
          >
            New
          </Badge>
        ) : null}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="truncate font-medium text-sm">{product.name}</span>
        <span className="font-mono text-foreground text-sm tabular-nums">
          ${product.price}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-muted-foreground text-xs">
        <span className="inline-flex items-center gap-1">
          <span className="font-mono text-amber-500">★</span>
          {product.rating.toFixed(1)}
        </span>
        <span className="flex items-center gap-1">
          {colorMeta.map((c) => (
            <span
              key={c.value}
              className={
                "size-2.5 rounded-full ring-1 ring-border " + c.color
              }
              title={c.label}
            />
          ))}
        </span>
      </div>
      {!product.inStock ? (
        <p className="mt-1 font-mono text-[10px] text-destructive uppercase tracking-wider">
          Out of stock
        </p>
      ) : null}
    </div>
  );
}

function swatchHex(c?: ColorVal): string {
  switch (c) {
    case "bone": return "#e7e5e4";
    case "moss": return "#065f46";
    case "dune": return "#fcd34d";
    case "night": return "#18181b";
    case "rust": return "#9a3412";
    case "sky": return "#38bdf8";
    default: return "#a1a1aa";
  }
}
