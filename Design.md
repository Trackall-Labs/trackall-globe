# Orbit Scratchpad Design System

This file is the AI-consumable design spec for the repo. Use it when creating or modifying showcase designs, reusable pattern components, or coss-based UI in `apps/www` and `packages/ui`.

## Color System

### Core Tokens

- `--background`: page and app surface. Light is white; dark is near-neutral 950 mixed slightly toward white.
- `--foreground`: primary text. Light uses neutral 800; dark uses neutral 100.
- `--card` / `--card-foreground`: framed component surfaces and their text.
- `--popover` / `--popover-foreground`: floating overlay surfaces.
- `--primary` / `--primary-foreground`: primary actions, selected states, active marks, and high-emphasis glyphs.
- `--secondary` / `--secondary-foreground`: low-emphasis filled controls.
- `--muted` / `--muted-foreground`: subdued panels, helper text, captions, metadata, and axis labels.
- `--accent` / `--accent-foreground`: hover fills, soft selected backgrounds, and subtle emphasis.
- `--border`: hairline borders and dividers.
- `--input`: input borders and control outlines.
- `--ring`: focus rings and active field glow.
- `--destructive` / `--destructive-foreground`: destructive actions, danger states, deletion flows.
- `--success`, `--warning`, `--info`: semantic status accents; use their `*-foreground` tokens for readable text.

### Chart Tokens

- Use `--chart-1` through `--chart-5` for series colors.
- Use `ChartContainer`, `ChartGrid`, `ChartAxis`, `ChartTooltip`, and `ChartLegend` from `@orbit/ui/patterns/charts/chart` for Recharts-based designs.
- Axis text is mono, uppercase, 10px, muted. Grid lines are dashed or low-opacity border color.

### Palette Overrides

The system supports accent palettes through `html[data-palette="<name>"]`. Palette overrides should only redefine accent tokens such as `--primary`, `--primary-foreground`, `--ring`, `--sidebar-primary`, and `--sidebar-ring`. Neutral surface and text tokens stay stable so designs remain consistent across palettes.

## Typography

- Primary UI font: Inter variable via `--font-sans`.
- Heading font: Inter variable via `--font-heading`.
- Mono font: `ui-monospace`, `SF Mono`, `JetBrains Mono`, Menlo, Consolas, monospace via `--font-mono`.
- Page titles: `font-heading`, usually `text-2xl` to `text-3xl`.
- Compact card titles: `font-heading`, usually `text-base` to `text-xl`.
- Metric values: `font-heading`, `text-2xl` to `text-4xl`, `tracking-tight`.
- Eyebrows, labels, metadata, axis labels: `font-mono text-[10px] uppercase tracking-[0.2em-0.3em]`.
- Body and helper text: `text-sm`; secondary copy uses `text-muted-foreground`.
- Do not use negative letter spacing. Keep dense product UI readable and scannable.

## Spacing, Radius, Borders, Shadows

- Base spacing follows Tailwind's 4px scale.
- Dense controls use `gap-1` to `gap-2`; grouped panels use `gap-3` to `gap-6`; page padding usually ranges from `px-6` to `px-10`.
- Standard radius is `--radius: 0.625rem`.
- Use `rounded-lg` for inputs and compact controls, `rounded-xl` for panels, and larger radii only for intentionally soft hero/auth surfaces.
- Borders are usually `border-border/60` or `border-border/70`.
- Shadows are restrained. Prefer borders and tokenized surfaces over heavy elevation.
- Use backdrop blur on sticky bars, sheets, popovers, and frosted overlays only when it improves layering.

## Layout Patterns

- App and dashboard pages use `min-h-svh bg-background text-foreground`.
- Main content is constrained with `mx-auto max-w-*`, commonly `max-w-3xl`, `max-w-5xl`, or `max-w-6xl`.
- Dashboard grids use responsive columns: 2 columns on small screens and 3-4 columns on large screens.
- Settings pages use stacked sections separated by `Separator`, with optional sticky save bars.
- Cards are individual repeated items or real framed tools. Do not nest cards inside cards.
- Sidebars and rails use strong alignment, compact hit targets, clear active states, and muted section labels.
- Tables prioritize scan density, status badges, row actions, and restrained borders.
- Modals use coss dialog primitives; destructive modals must make the risky action visually and semantically clear.
- Auth screens use focused form columns, OAuth rows, separators, and optional visual panels. Keep the form task primary.
- Empty states pair a concise heading with one clear action and optional supporting visual treatment.
- Toast demos use realistic app backdrops and status-specific motion or icons without overdecorating.

## Component Patterns

- Use coss primitives from `@orbit/ui/<primitive>` for buttons, inputs, dialogs, menus, selects, switches, tables, tabs, toasts, popovers, sheets, drawers, and tooltips.
- Use extracted pattern components from `@orbit/ui/patterns/<category>/<file>` for reusable showcase compositions.
- Buttons with icons should use `lucide-react` icons and explicit `type="button"` unless submitting a form.
- Inputs should pair with `Label` or coss `Field`/`FieldLabel` when there is form semantics.
- Overlay triggers and popups must follow the coss/Base UI composition used by existing primitives.
- Status badges use semantic color families: emerald for success, amber for warning, rose/red for danger, blue for info, neutral for passive.
- Metric deltas use directional icons and compact mono pills.
- SVG mini charts should inherit token colors and expose stable dimensions.

## Interaction States

- Hover: use subtle `bg-foreground/[0.05]`, `bg-accent`, or text color transitions.
- Focus: preserve visible focus rings using `ring` tokens or primitive defaults.
- Active/selected: use `bg-foreground/[0.08]`, `bg-primary text-primary-foreground`, or a clear side marker.
- Disabled: keep controls visibly disabled and non-interactive; avoid relying on opacity alone for important labels.
- Destructive: use destructive tokens for confirmation actions and danger copy; keep cancel/escape paths visible.
- Loading/progress: use `Progress`, `Meter`, skeletons, spinners, or deterministic progress visuals from `@orbit/ui`.

## AI Generation Rules

- Prefer existing primitives and pattern components before creating new markup.
- Keep reusable components in `packages/ui/src/components/patterns/<category>`.
- Keep route-level sample data, demo state, and page routing in `apps/www/src/pages/showcase`.
- Preserve exact visual tone: quiet, utilitarian, dense, and polished.
- Avoid marketing-page hero patterns unless the design is explicitly a landing/waitlist page.
- Avoid decorative gradient blobs, nested cards, oversized type inside compact panels, and one-note palettes.
- Use stable dimensions for repeated cards, charts, grids, rails, controls, and canvas-like tools to prevent layout shift.
- Validate substantial UI changes with `npm run typecheck`, `npm run build`, and route spot-checks.
