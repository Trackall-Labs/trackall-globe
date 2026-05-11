# devl.dev
<img width="1200" height="630" alt="og" src="https://github.com/user-attachments/assets/35c5aa90-d18e-401b-be1e-9634fe38e488" />

A scratch pad for playing with UI ideas built on cossUI primitives and my personal designs over the last two years. The components here are not perfect, not complete. This is just my workspace and design pad of POC i have for app ideas or designs. 

## Layout

```
.
├── apps/
│   └── www         →  TanStack Start app — the whole product (port 4000)
└── packages/
    └── ui          →  coss-ui components (55), Tailwind v4 + Base UI
```

No backend, no auth, no database, no marketing site. Just the showcase.

## Scripts

```bash
npm run dev          # start the scratchpad on :4000
npm run typecheck    # tsc -b across workspaces
npm run build        # build all workspaces
npm run lint         # lint all workspaces
npm run registry     # rebuild the design registry
npm run snapshot     # capture design snapshots
```

## How designs are organised

- `apps/www/src/lib/designs.ts` — single source of truth for categories and the designs in each.
- `apps/www/src/components/wireframe-icons.tsx` — mini SVG wireframes used as folder icons on the index.
- `apps/www/src/pages/showcase/` — the showcased designs (one component per design).
- `apps/www/src/pages/showcase/registry.tsx` — maps `(category, design-slug) → component`.

A design lives at `/c/<category>/<design-slug>`.

### Adding a new design

1. Add the showcase component in `apps/www/src/pages/showcase/<my-design>.tsx`.
2. Register it in `apps/www/src/pages/showcase/registry.tsx` under the right category.
3. Add a `{ slug, title, blurb }` entry to that category in `apps/www/src/lib/designs.ts`.

### Adding a new category

1. Add the wireframe SVG to `wireframe-icons.tsx`.
2. Add the category to `CATEGORIES` in `designs.ts` (and to the `CategorySlug` union).
3. Optionally add a `SHOWCASES[<slug>]` entry in `registry.tsx`.
