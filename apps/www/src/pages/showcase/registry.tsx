import type { ComponentType } from "react";
import type { CategorySlug } from "@/lib/designs";
import { SOURCE_FILES } from "./source-files";

type ShowcaseModule = Record<string, ComponentType>;

const MODULES = import.meta.glob<ShowcaseModule>("./*.tsx", {
  eager: true,
}) as Record<string, ShowcaseModule>;

function pickShowcase(mod: ShowcaseModule | undefined): ComponentType | undefined {
  if (!mod) return undefined;
  for (const [name, value] of Object.entries(mod)) {
    if (name.endsWith("ShowcasePage") && typeof value === "function") {
      return value;
    }
  }
  return undefined;
}

type Showcase = Record<string, ComponentType>;

function buildShowcases(): Partial<Record<CategorySlug, Showcase>> {
  const out: Partial<Record<CategorySlug, Showcase>> = {};
  for (const [category, designs] of Object.entries(SOURCE_FILES) as Array<
    [CategorySlug, Record<string, string>]
  >) {
    if (!designs) continue;
    const entry: Showcase = {};
    for (const [designSlug, filename] of Object.entries(designs)) {
      const component = pickShowcase(MODULES[`./${filename}.tsx`]);
      if (component) entry[designSlug] = component;
    }
    out[category] = entry;
  }
  return out;
}

export const SHOWCASES: Partial<Record<CategorySlug, Showcase>> = buildShowcases();

export function getShowcase(
  category: CategorySlug,
  design: string,
): ComponentType | undefined {
  return SHOWCASES[category]?.[design];
}
