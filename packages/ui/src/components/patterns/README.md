# Pattern Components

Reusable showcase components live here, grouped by design category.

Use a specific pattern file when you know the component you need:

```tsx
import {
  ProductCard,
  CardProductShowcasePage,
} from "@orbit/ui/patterns/cards/card-product";
```

Use a category barrel when browsing or composing multiple patterns from one area:

```tsx
import { CardProduct, CardPricing } from "@orbit/ui/patterns/cards";

<CardProduct.ProductCard product={product} />
<CardPricing.PricingCard tier={tier} />
```

Rules:

- Keep coss primitives in `packages/ui/src/components/ui`.
- Keep reusable showcase compositions in `packages/ui/src/components/patterns/<category>`.
- Keep route wrappers and app-specific registry metadata in `apps/www`.
- Prefer exporting named subcomponents and prop types from each pattern file so new designs can compose them without copying code.
