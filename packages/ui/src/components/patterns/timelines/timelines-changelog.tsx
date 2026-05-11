import { CalendarIcon, RssIcon, SparklesIcon } from "lucide-react";

export interface Release {
  version: string;
  date: string;
  highlight: boolean;
  groups: { tag: string; tone: string; items: string[] }[];
}

const RELEASES: Release[] = [
  {
    version: "v3.4",
    date: "Apr 24, 2026",
    highlight: true,
    groups: [
      {
        tag: "New",
        tone: "emerald",
        items: [
          "Introduced workspace-level audit log retention (1 year on Business).",
          "Added a Linear-style command palette — try ⌘K from anywhere.",
        ],
      },
      {
        tag: "Improved",
        tone: "indigo",
        items: [
          "Onboarding now skips empty steps and remembers progress.",
          "API token rotation surface is reachable from the keyboard.",
        ],
      },
      {
        tag: "Fixed",
        tone: "amber",
        items: [
          "Avatar uploads no longer fail silently on Safari < 17.",
          "CSV exports now respect the active filter set.",
        ],
      },
    ],
  },
  {
    version: "v3.3",
    date: "Apr 10, 2026",
    highlight: false,
    groups: [
      {
        tag: "New",
        tone: "emerald",
        items: ["First version of the integrations directory."],
      },
      {
        tag: "Fixed",
        tone: "amber",
        items: [
          "Empty-state CTAs are now reachable via keyboard in inbox.",
          "Prevented occasional double-fire on the invite endpoint.",
        ],
      },
    ],
  },
  {
    version: "v3.2",
    date: "Mar 28, 2026",
    highlight: false,
    groups: [
      {
        tag: "Improved",
        tone: "indigo",
        items: [
          "Faster project switcher — under 80ms with 10k workspaces.",
        ],
      },
      {
        tag: "Removed",
        tone: "rose",
        items: ["Deprecated the legacy /v1/auth endpoint (sunset May 1)."],
      },
    ],
  },
];

const TONE_BG: Record<string, string> = {
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  indigo: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-400",
  amber: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  rose: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
};

export function TimelinesChangelogShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Changelog
            </div>
            <h1 className="mt-1 font-heading text-3xl tracking-tight">
              What's new in Acme
            </h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            <RssIcon className="size-3" />
            Subscribe
          </button>
        </div>

        <div className="mt-10 flex flex-col">
          {RELEASES.map((r, i) => (
            <article
              key={r.version}
              className="grid grid-cols-[140px_1fr] gap-8 border-border/40 border-b py-10 last:border-b-0"
            >
              <aside className="sticky top-8 self-start">
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  <CalendarIcon className="size-3" />
                  {r.date}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-heading text-xl tracking-tight">
                    {r.version}
                  </span>
                  {r.highlight ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 font-mono text-[9px] text-background uppercase tracking-[0.2em]">
                      <SparklesIcon className="size-2.5" />
                      Latest
                    </span>
                  ) : null}
                </div>
              </aside>

              <div>
                {i === 0 ? (
                  <div className="mb-5 aspect-[16/7] w-full overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-indigo-500/10 via-foreground/[0.04] to-teal-500/10">
                    <div className="grid h-full place-items-center">
                      <div className="text-center">
                        <SparklesIcon className="mx-auto size-6 opacity-50" />
                        <div className="mt-2 font-heading text-lg">
                          Audit log, palette, and more.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {r.groups.map((g) => (
                  <div key={g.tag} className="mt-5 first:mt-0">
                    <span
                      className={
                        "inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] " +
                        TONE_BG[g.tone]
                      }
                    >
                      {g.tag}
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {g.items.map((it) => (
                        <li
                          key={it}
                          className="flex gap-2 text-foreground/85 text-sm leading-relaxed"
                        >
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
