import type { ComponentType } from "react";
import {
  WireframeAuth,
  WireframeCalendars,
  WireframeCard,
  WireframeCharts,
  WireframeDashboard,
  WireframeEmptyState,
  WireframeFilters,
  WireframeForm,
  WireframeModals,
  WireframePricing,
  WireframeProfile,
  WireframeSettings,
  WireframeSidebar,
  WireframeTable,
  WireframeThreads,
  WireframeTimelines,
  WireframeToasts,
  WireframeTours,
} from "@/components/wireframe-icons";

export type CategorySlug =
  | "layouts"
  | "forms"
  | "auth"
  | "dashboards"
  | "tables"
  | "filters"
  | "empty-states"
  | "settings"
  | "cards"
  | "modals"
  | "charts"
  | "timelines"
  | "calendars"
  | "profile"
  | "toasts"
  | "pricing"
  | "tours"
  | "threads";

export type DesignStatus = "new" | "wip";

export interface Design {
  slug: string;
  title: string;
  blurb: string;
  status?: DesignStatus;
}

export interface Category {
  slug: CategorySlug;
  title: string;
  blurb: string;
  Icon: ComponentType<{ className?: string }>;
  designs: Design[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "layouts",
    title: "Layouts",
    blurb: "App shells, sidebars, multi-pane splits, focus modes, canvases.",
    Icon: WireframeSidebar,
    designs: [
      {
        slug: "workspace-rail",
        title: "Workspace rail",
        blurb: "Workspace switcher, sections, projects, user row.",
      },
      {
        slug: "mini-rail",
        title: "Mini icon rail",
        blurb: "Collapsed 60px rail with workspace dots and active marker.",
      },
      {
        slug: "docs-tree",
        title: "Docs tree",
        blurb: "Nested folder/file tree with expand/collapse and search.",
      },
      {
        slug: "inbox-rail",
        title: "Inbox rail",
        blurb: "Conversation list with unread dots, tabs, and avatars.",
      },
      {
        slug: "app-shell",
        title: "App shell",
        blurb: "Top bar + left sidebar + main content — the canonical product frame.",
      },
      {
        slug: "two-pane",
        title: "Two-pane",
        blurb: "List on left, detail on right — Mail / Linear desktop pattern.",
      },
      {
        slug: "three-pane",
        title: "Three-pane",
        blurb: "Workspace rail + channel list + main — Slack-style shell.",
      },
      {
        slug: "split-resizable",
        title: "Split resizable",
        blurb: "Two panes with a draggable handle — code editor + live preview.",
      },
      {
        slug: "focus-mode",
        title: "Focus mode",
        blurb: "Toggleable distraction-free reading layout with collapsing rails.",
      },
      {
        slug: "floating-toolbar",
        title: "Floating toolbar",
        blurb: "Selection-anchored bubble menu over a rich-text document.",
      },
      {
        slug: "canvas-tools",
        title: "Canvas tools",
        blurb: "Full-bleed canvas with floating tool palette + inspector — Figma-style.",
      },
      {
        slug: "bottom-nav",
        title: "Bottom nav",
        blurb: "Mobile shell inside a phone-frame mock with a 5-tab bottom bar.",
      },
    ],
  },
  {
    slug: "forms",
    title: "Forms",
    blurb: "Settings, invites, preferences, API keys.",
    Icon: WireframeForm,
    designs: [
      {
        slug: "workspace-settings",
        title: "Workspace settings",
        blurb: "Sidebar nav, sectioned form, sticky save bar.",
      },
      {
        slug: "invite-teammates",
        title: "Invite teammates",
        blurb: "Multi-row email + role with optional message.",
      },
      {
        slug: "notifications",
        title: "Notification preferences",
        blurb: "Grouped switch matrix for email and push.",
      },
      {
        slug: "api-key",
        title: "Create API key",
        blurb: "Scope checkboxes, expiry, post-create reveal.",
      },
    ],
  },
  {
    slug: "auth",
    title: "Auth & Onboarding",
    blurb: "Sign-in, magic-link, OAuth, waitlist.",
    Icon: WireframeAuth,
    designs: [
      {
        slug: "login",
        title: "Login",
        blurb: "Split layout — particle field, magic-link + OAuth.",
      },
      {
        slug: "onboarding",
        title: "Onboarding",
        blurb: "Multi-step workspace setup with progress dots.",
      },
      {
        slug: "waitlist",
        title: "Waitlist landing",
        blurb: "Full-bleed empty-room figure with soft CTA.",
      },
      {
        slug: "check-email",
        title: "Check your email",
        blurb: "Magic-link sent confirmation with resend countdown and re-route options.",
      },
      {
        slug: "inset-login",
        title: "Inset login",
        blurb: "Dark cloth split inside a rounded card — OAuth, magic link, password.",
      },
      {
        slug: "centered-signin",
        title: "Centered signin",
        blurb: "Classic centered card on a soft gradient — OAuth + email/password.",
      },
      {
        slug: "centered-signup",
        title: "Centered signup",
        blurb: "Benefit pills, OAuth row, full signup form with a live strength meter.",
      },
      {
        slug: "left-signin",
        title: "Left signin",
        blurb: "Form left, testimonial card + customer logo strip on the right.",
      },
      {
        slug: "right-signin",
        title: "Right signin",
        blurb: "Feature hero left with a dashboard mock, signin card on the right.",
        status: "wip",
      },
      {
        slug: "glass-signup",
        title: "Glass signup",
        blurb: "Glass-morphic card over five drifting blurred color blobs.",
        status: "wip",
      },
      {
        slug: "otp-verify",
        title: "OTP verify",
        blurb: "6-digit code entry with split separator and live resend countdown.",
      },
      {
        slug: "reset-password",
        title: "Reset password",
        blurb: "Two-state flow — request → success — with a demo toggle in the corner.",
      },
      {
        slug: "two-factor",
        title: "Two-factor",
        blurb: "Authenticator code with switch + recovery-code fallback state.",
      },
      {
        slug: "magic-link-sent",
        title: "Magic link sent",
        blurb: "Animated envelope confirmation with Open Gmail and resend countdown.",
      },
    ],
  },
  {
    slug: "dashboards",
    title: "Dashboards",
    blurb: "Metric grids, sparklines, activity feeds, plan usage.",
    Icon: WireframeDashboard,
    designs: [
      {
        slug: "metrics-overview",
        title: "Metrics overview",
        blurb: "Stat tiles + sparkline chart + activity feed.",
      },
      {
        slug: "usage",
        title: "Plan usage",
        blurb: "Plan summary, cycle progress, layered limit meters.",
      },
      {
        slug: "analytics",
        title: "Analytics",
        blurb: "Bar chart + breakdown cards for sources, pages, geography.",
      },
      {
        slug: "home",
        title: "Personal home",
        blurb: "Greeting, today's tasks, schedule, fact tiles.",
      },
      {
        slug: "revenue",
        title: "Revenue",
        blurb: "MRR hero with trend area, plan-tier breakdown, top accounts.",
        status: "wip",
      },
      {
        slug: "services",
        title: "Service health",
        blurb: "Services grid — status, latency p99, error sparklines, SLO budget.",
        status: "wip",
      },
      {
        slug: "engineering",
        title: "Engineering velocity",
        blurb: "DORA tiles, weekly PR throughput, CI health, contributor leaderboard.",
        status: "wip",
      },
      {
        slug: "support",
        title: "Support queue",
        blurb: "Ticket donut, SLA breach list, agent leaderboard, tag mix.",
        status: "wip",
      },
      {
        slug: "market",
        title: "Markets",
        blurb: "Featured ticker chart, watchlist with row sparklines, allocation.",
        status: "wip",
      },
    ],
  },
  {
    slug: "tables",
    title: "Tables",
    blurb: "Sortable rows, density, bulk actions.",
    Icon: WireframeTable,
    designs: [
      {
        slug: "invoices",
        title: "Invoices",
        blurb: "Semantic table with status pills and right-aligned tabular amounts.",
      },
      {
        slug: "members",
        title: "Team members",
        blurb: "Avatars, role select cells, last-active time, and a row action menu.",
        status: "wip",
      },
      {
        slug: "orders",
        title: "Orders",
        blurb: "Card-variant table with selection checkboxes and timeline status.",
      },
      {
        slug: "logs",
        title: "Server logs",
        blurb: "Dense monospace log viewer with severity dots and request IDs.",
      },
      {
        slug: "api-keys",
        title: "API keys",
        blurb: "Masked keys with copy buttons, scopes, and a destructive row action.",
        status: "wip",
      },
      {
        slug: "inventory",
        title: "Inventory",
        blurb: "Product rows with thumbnails, SKU, and stock-level meters.",
      },
      {
        slug: "issues",
        title: "Issue tracker",
        blurb: "Issues grid with faceted filter row above — Linear-style filtering.",
      },
      {
        slug: "transactions",
        title: "Transactions",
        blurb: "Transactions table with a search + select toolbar and pagination.",
      },
      {
        slug: "audit-log",
        title: "Audit log",
        blurb: "Audit trail with active filter chips and a clear-all action.",
      },
    ],
  },
  {
    slug: "filters",
    title: "Filters",
    blurb: "Toolbars, faceted popovers, chips, and sidebar filter rails.",
    Icon: WireframeFilters,
    designs: [
      {
        slug: "toolbar",
        title: "Filter toolbar",
        blurb: "Search, select, date range, and a view-density toggle in one bar.",
      },
      {
        slug: "faceted",
        title: "Faceted popover",
        blurb: "Linear-style add-filter popover with multi-select checkbox facets.",
      },
      {
        slug: "chips",
        title: "Active filter chips",
        blurb: "Removable filter pills with operators and a clear-all action.",
      },
      {
        slug: "sidebar",
        title: "Filter sidebar",
        blurb: "Left rail with collapsible sections, sliders, and switches.",
        status: "wip",
      },
    ],
  },
  {
    slug: "empty-states",
    title: "Empty states",
    blurb: "First-run, zero-data, end-of-list.",
    Icon: WireframeEmptyState,
    designs: [
      {
        slug: "inbox-zero",
        title: "Inbox zero",
        blurb: "All caught up — soft sunrise gradient with quiet actions.",
      },
      {
        slug: "no-results",
        title: "No results",
        blurb: "Search with active filter pills and a one-click reset.",
      },
      {
        slug: "first-project",
        title: "First project",
        blurb: "Day-one workspace with create or import-from-Linear paths.",
      },
      {
        slug: "end-of-feed",
        title: "End of feed",
        blurb: "Activity list with a 'you're all caught up' end marker.",
      },
      {
        slug: "no-team",
        title: "No teammates",
        blurb: "Invite link with placeholder avatar slots and email CTA.",
        status: "wip",
      },
      {
        slug: "trash",
        title: "Empty trash",
        blurb: "Settings-style trash folder with 30-day retention copy.",
      },
      {
        slug: "404",
        title: "404",
        blurb: "Big numerals on a faded grid backdrop with go-back actions.",
      },
      {
        slug: "maintenance",
        title: "Maintenance",
        blurb: "Scheduled downtime with live countdown and progress bar.",
      },
      {
        slug: "no-files",
        title: "No files",
        blurb: "Drag-and-drop zone with stacked file-icon preview.",
      },
      {
        slug: "offline",
        title: "Offline",
        blurb: "Connection lost with pulsing destructive ring and retry.",
      },
    ],
  },
  {
    slug: "settings",
    title: "Settings",
    blurb: "Profile, appearance, billing, integrations.",
    Icon: WireframeSettings,
    designs: [
      {
        slug: "profile",
        title: "Profile",
        blurb: "Photo, identity, locale, security rows with destructive zone.",
      },
      {
        slug: "appearance",
        title: "Appearance",
        blurb: "Mode previews, palette swatches, density toggle, font cards.",
        status: "wip",
      },
      {
        slug: "billing",
        title: "Billing",
        blurb: "Plan card, payment method, credits, invoice ledger.",
      },
      {
        slug: "integrations",
        title: "Integrations",
        blurb: "Searchable grid with category filters and connect actions.",
        status: "wip",
      },
      {
        slug: "security",
        title: "Security",
        blurb: "2FA banner, passkeys list, active sessions, recovery codes.",
      },
      {
        slug: "permissions",
        title: "Roles & permissions",
        blurb: "Role sidebar with a sticky-header capability matrix grid.",
        status: "wip",
      },
      {
        slug: "branding",
        title: "Workspace branding",
        blurb: "Logo upload, color palette + live preview, custom domain.",
      },
      {
        slug: "localization",
        title: "Localization",
        blurb: "Language, timezone, formats — with a live Intl preview card.",
      },
      {
        slug: "webhooks",
        title: "Webhooks",
        blurb: "Endpoints table, signing secret reveal, recent deliveries log.",
      },
      {
        slug: "privacy",
        title: "Privacy & data",
        blurb: "Export archive, retention sliders, account-deletion countdown.",
      },
      {
        slug: "developer",
        title: "Developer",
        blurb: "Feature flags, debug console, environment switcher.",
      },
      {
        slug: "sso",
        title: "Single sign-on",
        blurb: "IdP picker with a 4-step setup wizard and attribute mapping.",
        status: "wip",
      },
    ],
  },
  {
    slug: "cards",
    title: "Cards",
    blurb: "Stat tiles, list items, surface containers.",
    Icon: WireframeCard,
    designs: [
      {
        slug: "stat-tile",
        title: "Stat tile",
        blurb: "KPI grid with sparklines and period-over-period delta.",
      },
      {
        slug: "profile",
        title: "Profile card",
        blurb: "Cover gradient, avatar, badges, and split actions.",
        status: "wip",
      },
      {
        slug: "pricing",
        title: "Pricing tiers",
        blurb: "Three-tier pricing with a 'most popular' callout.",
      },
      {
        slug: "product",
        title: "Product card",
        blurb: "E-commerce tile with swatches, rating, and add-to-bag CTA.",
      },
      {
        slug: "invoice",
        title: "Invoice line",
        blurb: "Compact list row with status pill and amount.",
      },
      {
        slug: "task",
        title: "Kanban task",
        blurb: "Issue card with priority, labels, assignees, and progress.",
      },
      {
        slug: "event",
        title: "Calendar event",
        blurb: "Date stripe, attendees stack, and live-meeting badge.",
      },
      {
        slug: "integration",
        title: "Integration",
        blurb: "Connected service row with health pill and Switch toggle.",
      },
      {
        slug: "media",
        title: "Article preview",
        blurb: "Editorial card with patterned cover and bookmark action.",
      },
      {
        slug: "payment-method",
        title: "Payment method",
        blurb: "Stylised credit card art with primary-card switching.",
      },
    ],
  },
  {
    slug: "modals",
    title: "Modals",
    blurb: "Dialogs, drawers, command palettes, confirmations.",
    Icon: WireframeModals,
    designs: [
      {
        slug: "confirm-delete",
        title: "Confirm delete",
        blurb: "Destructive AlertDialog with type-to-confirm phrase guard.",
      },
      {
        slug: "share-link",
        title: "Share link",
        blurb: "Permission selector, copy field, member access table.",
      },
      {
        slug: "upload-files",
        title: "Upload files",
        blurb: "Drag-zone with progress rows and per-file cancel.",
      },
      {
        slug: "command-palette",
        title: "Command palette",
        blurb: "Cmd-K overlay with grouped commands and ⌘ shortcuts.",
      },
      {
        slug: "feedback",
        title: "Feedback",
        blurb: "Bug / idea / praise picker with screenshot attach.",
        status: "wip",
      },
      {
        slug: "shortcuts",
        title: "Keyboard shortcuts",
        blurb: "Cheatsheet with grouped sections and Kbd glyphs.",
      },
      {
        slug: "upgrade",
        title: "Upgrade plan",
        blurb: "Limit-reached modal with comparison and CTA.",
      },
      {
        slug: "export",
        title: "Export data",
        blurb: "Format radio, range picker, includes checklist.",
      },
      {
        slug: "create-workspace",
        title: "Create workspace",
        blurb: "Name + slug + visibility, with live URL preview.",
      },
      {
        slug: "two-factor",
        title: "Two-factor setup",
        blurb: "QR code, recovery codes, OTP confirm step.",
      },
    ],
  },
  {
    slug: "charts",
    title: "Charts",
    blurb: "Area, bar, donut, funnel, heatmap, gauge — pure SVG.",
    Icon: WireframeCharts,
    designs: [
      {
        slug: "revenue-area",
        title: "Revenue area",
        blurb: "Stacked area chart with legend toggles and hover crosshair.",
      },
      {
        slug: "cohort-heatmap",
        title: "Cohort heatmap",
        blurb: "Retention grid with diagonal-fading opacity ramp.",
      },
      {
        slug: "funnel",
        title: "Funnel",
        blurb: "Conversion funnel with drop-off pills between stages.",
      },
      {
        slug: "gauges",
        title: "Radial gauges",
        blurb: "Three SLO gauges with target lines and breach colour.",
      },
      {
        slug: "bar-grouped",
        title: "Grouped bars",
        blurb: "Period-over-period grouped bars with axis ticks.",
      },
      {
        slug: "line-multi",
        title: "Multi-series line",
        blurb: "Three-series line with legend chips and last-point dots.",
      },
      {
        slug: "donut",
        title: "Donut breakdown",
        blurb: "Donut chart with side legend and total in centre.",
      },
      {
        slug: "scatter",
        title: "Scatter plot",
        blurb: "X/Y scatter with quadrant lines and outlier callouts.",
        status: "wip",
      },
      {
        slug: "waterfall",
        title: "Waterfall",
        blurb: "Net-revenue waterfall with positive / negative bars.",
        status: "wip",
      },
    ],
  },
  {
    slug: "timelines",
    title: "Timelines",
    blurb: "Audit trails, changelogs, deploys, status, mentions.",
    Icon: WireframeTimelines,
    designs: [
      {
        slug: "audit",
        title: "Audit trail",
        blurb: "Vertical event rail with actor avatars and JSON diff.",
      },
      {
        slug: "notifications",
        title: "Notifications panel",
        blurb: "Grouped panel with unread filter and clear-all.",
      },
      {
        slug: "changelog",
        title: "Changelog",
        blurb: "Versioned release notes with category tags.",
      },
      {
        slug: "commits",
        title: "Commit history",
        blurb: "Git log with branch graph and commit hashes.",
      },
      {
        slug: "approvals",
        title: "Approvals",
        blurb: "PR approval timeline with reviewer states and CI badges.",
      },
      {
        slug: "pull-request",
        title: "Pull request",
        blurb: "Ship checklist PR — merge readiness hero, inline diff comments, single timeline.",
        status: "wip",
      },
      {
        slug: "pr-ops-console",
        title: "PR ops console",
        blurb: "Mission-control PR view — pipeline DAG, env metrics, merge queue.",
        status: "wip",
      },
      {
        slug: "releases",
        title: "Release timeline",
        blurb: "Stage progression — staging, canary, production.",
        status: "wip",
      },
      {
        slug: "status-page",
        title: "Status page",
        blurb: "Public incident timeline with severity ribbons.",
        status: "wip",
      },
      {
        slug: "deploys",
        title: "Deploy history",
        blurb: "Deploy log with environment badges and roll-back action.",
      },
      {
        slug: "inbox-thread",
        title: "Inbox thread",
        blurb: "Threaded conversation with quoted replies.",
      },
      {
        slug: "activity-feed",
        title: "Activity feed",
        blurb: "Mixed event feed with day separators and avatar stack.",
      },
    ],
  },
  {
    slug: "calendars",
    title: "Calendars",
    blurb: "Month grids, week schedules, agenda lists, heatmaps.",
    Icon: WireframeCalendars,
    designs: [
      {
        slug: "month",
        title: "Month view",
        blurb: "Full month grid with multi-day events and overflow chip.",
      },
      {
        slug: "week",
        title: "Week schedule",
        blurb: "Hour-grid week view with overlapping events.",
      },
      {
        slug: "agenda",
        title: "Agenda list",
        blurb: "Day-grouped event list with travel time gaps.",
      },
      {
        slug: "date-range",
        title: "Date range picker",
        blurb: "Two-month picker with preset shortcuts rail.",
      },
      {
        slug: "timezone",
        title: "Timezone planner",
        blurb: "Stacked timezone bars with overlap window highlighted.",
      },
      {
        slug: "mini",
        title: "Mini calendar",
        blurb: "Compact inline calendar with event dots under days.",
      },
      {
        slug: "year-heatmap",
        title: "Contribution heatmap",
        blurb: "GitHub-style year heatmap with month / weekday axes.",
      },
      {
        slug: "recurring",
        title: "Recurring event",
        blurb: "RRULE editor with weekday picker and end-date options.",
      },
      {
        slug: "holidays",
        title: "Holidays & PTO",
        blurb: "Team-wide PTO calendar with overlap warnings.",
      },
    ],
  },
  {
    slug: "profile",
    title: "Profile",
    blurb: "User pages, hover cards, team grids, presence rails.",
    Icon: WireframeProfile,
    designs: [
      {
        slug: "hero",
        title: "Profile hero",
        blurb: "Cover banner, avatar overlap, identity, action row.",
      },
      {
        slug: "hover-card",
        title: "Hover card",
        blurb: "Mention preview with avatar, role, and follow CTA.",
        status: "wip",
      },
      {
        slug: "team-grid",
        title: "Team grid",
        blurb: "Department-grouped grid of teammate cards.",
      },
      {
        slug: "directory",
        title: "Contact directory",
        blurb: "Searchable A–Z member directory with letter rail.",
      },
      {
        slug: "compact-card",
        title: "Compact user card",
        blurb: "Dense list-row card with role, status dot, and menu.",
      },
      {
        slug: "org-chart",
        title: "Org chart",
        blurb: "Tree of reporting lines with collapsed direct-reports.",
        status: "wip",
      },
      {
        slug: "skills",
        title: "Skills matrix",
        blurb: "Tag cloud with proficiency dots and endorsement counts.",
      },
      {
        slug: "presence-rail",
        title: "Presence rail",
        blurb: "Live online-now strip with idle and DND markers.",
        status: "wip",
      },
      {
        slug: "introductions",
        title: "Suggested intros",
        blurb: "People-you-may-know cards with shared-context hints.",
      },
      {
        slug: "credentials",
        title: "Security credentials",
        blurb: "Sessions list with device icons and revoke action.",
      },
    ],
  },
  {
    slug: "toasts",
    title: "Toasts & banners",
    blurb: "Ephemeral feedback — confirmation, errors, undos, progress.",
    Icon: WireframeToasts,
    designs: [
      { slug: "success", title: "Success toast", blurb: "Top-right confirmation with check glyph." },
      { slug: "error-retry", title: "Error with retry", blurb: "Failed action with an inline retry button." },
      { slug: "info-banner", title: "System banner", blurb: "Sticky top banner with dismiss." },
      { slug: "progress", title: "Progress toast", blurb: "Upload toast with embedded progress bar." },
      { slug: "undo", title: "Undo toast", blurb: "Snackbar with undo action and timer." },
      { slug: "rich", title: "Rich toast", blurb: "Stacked card toasts with avatar, title, body, actions." },
    ],
  },
  {
    slug: "pricing",
    title: "Pricing",
    blurb: "Tier comparisons, sliders, contact-sales, billing toggles.",
    Icon: WireframePricing,
    designs: [
      { slug: "three-tier", title: "Three-tier", blurb: "Classic three-column plan grid with featured center card." },
      { slug: "comparison-table", title: "Feature matrix", blurb: "Detailed comparison table across plans." },
      { slug: "slider-seats", title: "Seat slider", blurb: "Live-priced slider that updates the total." },
      { slug: "simple-card", title: "Single plan", blurb: "Lone offer card with prominent CTA." },
      { slug: "contact-sales", title: "Contact sales", blurb: "Enterprise card with embedded contact form." },
      { slug: "monthly-yearly", title: "Billing toggle", blurb: "Monthly / yearly toggle with savings badge." },
    ],
  },
  {
    slug: "tours",
    title: "Tours & coachmarks",
    blurb: "Welcome modals, spotlights, beacons, onboarding checklists.",
    Icon: WireframeTours,
    designs: [
      { slug: "welcome-carousel", title: "Welcome carousel", blurb: "Multi-step intro with dot pagination and 'skip'." },
      { slug: "spotlight", title: "Spotlight tour", blurb: "Dim mask with cutout around the target element.", status: "wip" },
      { slug: "arrow-tooltip", title: "Arrow tooltip", blurb: "Tooltip with caret, step counter, and prev/next.", status: "wip" },
      { slug: "beacon", title: "Beacon hint", blurb: "Pulsing dot anchored to a feature with hint card.", status: "wip" },
      { slug: "inline-hint", title: "Inline hint", blurb: "Subtle bottom-right floating hint with dismiss." },
      { slug: "checklist", title: "Onboarding checklist", blurb: "Linear-style task list with progress meter." },
    ],
  },
  {
    slug: "threads",
    title: "Threads & comments",
    blurb: "Inline threads, side panels, reactions, mention popovers.",
    Icon: WireframeThreads,
    designs: [
      { slug: "inline-thread", title: "Inline thread", blurb: "Right-margin thread anchored to a doc paragraph." },
      { slug: "side-panel", title: "Side panel", blurb: "Slide-out conversation pane with participant list." },
      { slug: "comment-row", title: "Comment row", blurb: "Single comment with reactions, replies, more menu." },
      { slug: "mention-popover", title: "@mention popover", blurb: "Typeahead member list under an active mention." },
      { slug: "resolved", title: "Resolved thread", blurb: "Collapsed resolved state with reopen action." },
      { slug: "compose-rich", title: "Rich composer", blurb: "Reply box with formatting toolbar and attach." },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getDesign(
  category: CategorySlug,
  designSlug: string,
): Design | undefined {
  return getCategory(category)?.designs.find((d) => d.slug === designSlug);
}
