import { Kbd } from "@orbit/ui/kbd";
import {
  ActivityIcon,
  FileTextIcon,
  HomeIcon,
  InboxIcon,
  Maximize2Icon,
  Minimize2Icon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { icon: HomeIcon, label: "Home" },
  { icon: InboxIcon, label: "Inbox" },
  { icon: ActivityIcon, label: "Activity" },
  { icon: SettingsIcon, label: "Settings" },
];

const DOCS = [
  "On building scratchpads",
  "Notes on spacing",
  "Color tokens 101",
  "Reading rhythm",
  "Why focus modes matter",
];

const TOC = [
  { id: "intro", label: "Introduction" },
  { id: "loop", label: "The iteration loop" },
  { id: "scaffolds", label: "Scaffolds vs. polish" },
  { id: "quote", label: "A note on patience" },
  { id: "closing", label: "Closing thoughts" },
];

export function LayoutsFocusModeShowcasePage() {
  const [focused, setFocused] = useState(true);
  const [progress] = useState(34);

  useEffect(() => {
    if (!focused) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFocused(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);

  return (
    <div className="relative min-h-svh bg-background text-foreground transition-all">
      <div
        className="fixed top-0 left-0 z-50 h-0.5 bg-foreground transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />

      <header className="fixed top-0 right-0 left-0 z-40 flex h-12 items-center justify-between border-border/60 border-b bg-background/80 px-6 backdrop-blur">
        <div
          className={`flex items-center gap-2.5 transition-all duration-300 ${
            focused
              ? "pointer-events-none -translate-x-2 opacity-0"
              : "opacity-100"
          }`}
          aria-hidden={focused}
        >
          <div className="size-6 rounded-md bg-gradient-to-br from-primary/70 to-primary/30 ring-1 ring-border/60" />
          <span className="font-medium text-sm">Scratchpad</span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-md border border-border/60 bg-card px-2.5 py-1 transition-all duration-300 ${
            focused ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={focused}
        >
          <SearchIcon className="size-3.5 opacity-50" />
          <span className="text-muted-foreground text-xs">Quick find…</span>
          <Kbd className="text-[9px]">⌘K</Kbd>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFocused((f) => !f)}
            className={`flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs transition-all duration-300 ${
              focused
                ? "opacity-100"
                : "pointer-events-none translate-x-2 opacity-0"
            }`}
            aria-label="Exit focus mode"
          >
            <Minimize2Icon className="size-3.5" />
            <span>Exit focus</span>
            <Kbd className="text-[9px]">ESC</Kbd>
          </button>

          <div
            className={`flex size-7 items-center justify-center rounded-full bg-foreground font-medium text-[11px] text-background transition-all duration-300 ${
              focused
                ? "pointer-events-none translate-x-2 opacity-0"
                : "opacity-100"
            }`}
            aria-hidden={focused}
          >
            S
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-12 bottom-0 left-0 z-30 w-60 border-border/60 border-r bg-foreground/[0.02] px-3 py-4 transition-all duration-300 ${
          focused
            ? "pointer-events-none -translate-x-full opacity-0"
            : "opacity-100"
        }`}
        aria-hidden={focused}
      >
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
              >
                <item.icon className="size-4 opacity-70" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 mb-1 px-2">
          <span className="font-mono text-[9px] text-muted-foreground/70 uppercase tracking-[0.25em]">
            Documents
          </span>
        </div>
        <ul className="flex flex-col gap-0.5">
          {DOCS.map((d, i) => (
            <li key={d}>
              <button
                type="button"
                className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  i === 0
                    ? "bg-foreground/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
                }`}
              >
                <FileTextIcon className="size-3.5 opacity-60" />
                <span className="truncate">{d}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <aside
        className={`fixed top-12 right-0 bottom-0 z-30 w-[280px] border-border/60 border-l px-5 py-6 transition-all duration-300 ${
          focused
            ? "pointer-events-none translate-x-full opacity-0"
            : "opacity-100"
        }`}
        aria-hidden={focused}
      >
        <div className="mb-3 px-1 font-mono text-[9px] text-muted-foreground/70 uppercase tracking-[0.25em]">
          On this page
        </div>
        <ul className="flex flex-col gap-0.5">
          {TOC.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-muted-foreground text-sm transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main
        className={`mx-auto max-w-2xl px-6 transition-all duration-300 ${
          focused ? "pt-20 pb-32" : "pt-20 pb-20"
        }`}
      >
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Essay · 6 min read
        </div>
        <h1 className="mt-3 font-heading text-4xl tracking-tight">
          On building scratchpads.
        </h1>
        <p
          className={`mt-3 text-muted-foreground transition-all duration-300 ${
            focused ? "text-lg" : "text-base"
          }`}
        >
          A short meditation on iteration, the slow accumulation of taste, and
          why the best UI work happens far away from production.
        </p>

        <div
          className={`mt-10 space-y-5 leading-relaxed transition-all duration-300 ${
            focused ? "text-lg" : "text-base"
          }`}
        >
          <p id="intro">
            Most of what you ship started as a sketch on a napkin, in a Figma
            file you never opened again, or in a tiny app like this one. The
            scratchpad is the place where ideas are allowed to be wrong. It is
            cheap, throwaway, and quiet — and that is precisely what makes it
            useful.
          </p>
          <p>
            When you build inside a real product, every change is filtered
            through six other concerns: routing, auth, analytics, the design
            system, the eight people who will review the PR. Each of those is
            worthwhile in isolation, but together they raise the activation
            energy of trying anything new to a level where you stop trying.
          </p>

          <h2
            id="loop"
            className="!mt-12 !text-2xl pt-4 font-heading tracking-tight"
          >
            The iteration loop
          </h2>
          <p>
            Good interfaces come from tightening the loop between an idea and
            the next thing you learn from it. A scratchpad collapses that loop
            to seconds. You think of a layout, you type it, you see whether it
            holds up, and you decide what to keep. Repeat fifty times.
          </p>
          <p>
            The repetitions are the point. The fiftieth attempt at a sidebar
            does not look like the first because by then your hand knows things
            your head does not yet. Taste is built out of those small motor
            memories — the spacing that felt right, the weight that did not,
            the affordance you reached for without thinking.
          </p>

          <h2
            id="scaffolds"
            className="!mt-12 !text-2xl pt-4 font-heading tracking-tight"
          >
            Scaffolds vs. polish
          </h2>
          <p>
            There is a temptation, when you have a fast environment, to polish
            every sketch into a finished thing. Resist it. The scratchpad is
            for scaffolds — the cheap framing of an idea that lets you decide
            whether it is worth building properly somewhere else.
          </p>
          <p>
            Polish at this stage is a tax on exploration. Every minute spent
            picking the perfect shade of muted-foreground is a minute you are
            not generating the next idea. Sketch with the side of the pencil,
            not the tip.
          </p>

          <blockquote
            id="quote"
            className="!my-10 border-border border-l-4 pl-6 text-foreground/85 italic"
          >
            The fastest way to taste is volume. Build a hundred bad layouts and
            the next ten will be quietly excellent — not because you tried
            harder, but because your hand learned what the brief did not say.
          </blockquote>

          <p>
            A few habits make scratchpad work compounding rather than
            disposable. Keep them small. Name them well enough that you can
            find them next month. Resist building infrastructure inside the
            scratchpad — the moment it starts feeling like a real app, fork
            the idea out to where real apps live.
          </p>

          <ul className="!my-6 list-disc space-y-2 pl-6 text-foreground/90">
            <li>One idea per file. If two ideas want to merge, fork instead.</li>
            <li>No data layer. Hard-code everything. Real data is later.</li>
            <li>Steal shamelessly from your own past sketches.</li>
            <li>Throw away more than you keep, and do not feel bad about it.</li>
          </ul>

          <h2
            id="closing"
            className="!mt-12 !text-2xl pt-4 font-heading tracking-tight"
          >
            Closing thoughts
          </h2>
          <p>
            The work that ends up in production is the visible tip of a much
            larger pile of attempts. The pile is not waste — it is the
            substrate from which the visible work grew. Treat the scratchpad
            with the seriousness of a sketchbook, not the seriousness of a
            shippable product, and the rest follows.
          </p>
          <p>
            Now close the rails, dim the chrome, and write the next bad layout.
          </p>
        </div>
      </main>

      <button
        type="button"
        onClick={() => setFocused((f) => !f)}
        className="fixed right-6 bottom-6 z-50 flex size-10 items-center justify-center rounded-full border border-border/60 bg-card text-foreground shadow-sm transition-all hover:bg-foreground/[0.04]"
        aria-label={focused ? "Exit focus mode" : "Enter focus mode"}
      >
        {focused ? (
          <Maximize2Icon className="size-4" />
        ) : (
          <Minimize2Icon className="size-4" />
        )}
      </button>
    </div>
  );
}
