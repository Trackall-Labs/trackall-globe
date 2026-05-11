import { useState } from "react";
import {
  ArrowRightIcon,
  KeyboardIcon,
  LayersIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";

export interface Step {
  Icon: React.ComponentType<{ className?: string }>;
  badge: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    Icon: SparklesIcon,
    badge: "Welcome",
    title: "Welcome to Orbit.",
    body: "A quieter way to ship — projects, comments, and audit log all in one workspace. Three quick things before we drop you in.",
  },
  {
    Icon: LayersIcon,
    badge: "Step 1",
    title: "Projects are how you organise work.",
    body: "Bundle issues, docs, and members together. You can split into teams later — for now, one project is enough.",
  },
  {
    Icon: UsersIcon,
    badge: "Step 2",
    title: "Bring people in when you're ready.",
    body: "We won't ping anyone until you say so. Drop in emails and we'll send invites in your name.",
  },
  {
    Icon: KeyboardIcon,
    badge: "Step 3",
    title: "Keyboard-first, always.",
    body: "Press ⌘K anywhere to jump to anything. Press ? to see every shortcut. We won't get in your way.",
  },
];

export function ToursWelcomeCarouselShowcasePage() {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const current = STEPS[step]!;

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeAppBackdrop />
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl">
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/30 via-primary/10 to-background">
            <div
              aria-hidden
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--primary) 50%, transparent), transparent 50%), radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--primary) 30%, transparent), transparent 50%)",
              }}
            />
            <div className="relative flex h-full items-center justify-center">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-background/85 shadow-lg ring-1 ring-border/60 backdrop-blur">
                <current.Icon className="size-9" />
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              {current.badge}
            </div>
            <h2 className="mt-1 font-heading text-2xl">{current.title}</h2>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {current.body}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Step ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step
                      ? "w-6 bg-foreground"
                      : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" type="button">
                {step === 0 ? "Skip" : "Back"}
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={() =>
                  last ? setStep(0) : setStep((s) => Math.min(s + 1, STEPS.length - 1))
                }
              >
                {last ? "Get started" : "Next"}
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FakeAppBackdrop() {
  return (
    <div className="absolute inset-0 grid grid-cols-[200px_1fr] opacity-30">
      <div className="border-r border-border/40 bg-foreground/[0.02] p-4 space-y-2">
        <div className="h-3 w-24 rounded bg-foreground/10" />
        <div className="h-2 w-32 rounded bg-foreground/10" />
        <div className="h-2 w-28 rounded bg-foreground/10" />
      </div>
      <div className="p-10 space-y-3">
        <div className="h-4 w-48 rounded bg-foreground/15" />
        <div className="h-2 w-72 rounded bg-foreground/10" />
        <div className="h-32 rounded-xl border border-border/40 bg-foreground/[0.02]" />
        <div className="h-32 rounded-xl border border-border/40 bg-foreground/[0.02]" />
      </div>
    </div>
  );
}
