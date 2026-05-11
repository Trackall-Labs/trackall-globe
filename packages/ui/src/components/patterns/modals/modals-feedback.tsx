import { useState } from "react";
import {
  BugIcon,
  HeartIcon,
  ImageIcon,
  LightbulbIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Textarea } from "@orbit/ui/textarea";

export type Kind = "bug" | "idea" | "praise";

const KINDS: {
  id: Kind;
  label: string;
  Icon: typeof BugIcon;
  description: string;
  tone: string;
}[] = [
  {
    id: "bug",
    label: "Something's broken",
    Icon: BugIcon,
    description: "An error, glitch, or unexpected behaviour.",
    tone: "rose",
  },
  {
    id: "idea",
    label: "I have an idea",
    Icon: LightbulbIcon,
    description: "Something that would make Acme better.",
    tone: "amber",
  },
  {
    id: "praise",
    label: "Praise",
    Icon: HeartIcon,
    description: "Something that delighted you. We share these on Mondays.",
    tone: "pink",
  },
];

export function ModalsFeedbackShowcasePage() {
  const [kind, setKind] = useState<Kind>("idea");

  return (
    <div className="relative min-h-svh bg-background">
      <div aria-hidden className="px-10 py-10 opacity-25">
        <div className="font-heading text-2xl">Project board</div>
      </div>

      <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5">
            <div>
              <div className="font-heading text-sm">Send us feedback</div>
              <div className="mt-0.5 text-muted-foreground text-xs">
                Goes to the product team. Replies within 1 business day.
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="grid grid-cols-3 gap-2">
              {KINDS.map((k) => {
                const active = kind === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKind(k.id)}
                    className={
                      "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-colors " +
                      (active
                        ? "border-foreground/60 bg-foreground/[0.05]"
                        : "border-border/60 hover:border-foreground/30")
                    }
                  >
                    <k.Icon className="size-4 opacity-80" />
                    <span className="text-[12px] leading-tight">
                      {k.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-muted-foreground text-xs">
              {KINDS.find((k) => k.id === kind)?.description}
            </p>

            <Textarea
              placeholder={
                kind === "bug"
                  ? "What did you do? What did you see? What did you expect?"
                  : kind === "idea"
                    ? "What would change? Who would it help?"
                    : "What worked well? Anyone we should call out?"
              }
              className="min-h-32"
            />

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-dashed border-border/70 bg-background px-3 py-2 text-muted-foreground text-xs hover:border-foreground/40 hover:text-foreground"
            >
              <ImageIcon className="size-3.5" />
              Attach screenshot
            </button>
          </div>

          <div className="flex items-center justify-between border-border/60 border-t bg-background px-5 py-3">
            <label className="flex items-center gap-2 text-muted-foreground text-xs">
              <input type="checkbox" defaultChecked className="size-3.5" />
              Include console logs
            </label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
              <Button type="button">Send feedback</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
