import { useState } from "react";
import {
  BuildingIcon,
  EyeIcon,
  GlobeIcon,
  LockIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Input } from "@orbit/ui/input";

export type Visibility = "private" | "team" | "public";

const VIZ: {
  id: Visibility;
  label: string;
  meta: string;
  Icon: typeof LockIcon;
}[] = [
  {
    id: "private",
    label: "Private",
    meta: "Only invited members can join",
    Icon: LockIcon,
  },
  {
    id: "team",
    label: "Team",
    meta: "Anyone in @acme.dev can request access",
    Icon: EyeIcon,
  },
  {
    id: "public",
    label: "Public",
    meta: "Anyone with the link can join",
    Icon: GlobeIcon,
  },
];

export function ModalsCreateWorkspaceShowcasePage() {
  const [name, setName] = useState("Acme studios");
  const [viz, setViz] = useState<Visibility>("team");
  const slug = slugify(name);

  return (
    <div className="relative min-h-svh bg-background">
      <div aria-hidden className="px-10 py-10 opacity-25">
        <div className="font-heading text-2xl">Workspaces</div>
      </div>

      <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
        <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-start justify-between border-border/60 border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-foreground/[0.06]">
                <BuildingIcon className="size-4 opacity-80" />
              </div>
              <div>
                <div className="font-heading text-sm">
                  Create a new workspace
                </div>
                <div className="mt-0.5 text-muted-foreground text-xs">
                  You can change these later in settings.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Workspace name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme studios"
              />
              <div className="mt-1.5 text-muted-foreground text-xs">
                14 / 50
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Workspace URL
              </label>
              <div className="flex h-10 items-center rounded-md border border-border bg-background pl-3 transition-colors focus-within:border-foreground/40">
                <span className="text-muted-foreground text-sm">
                  acme.dev/
                </span>
                <code className="flex-1 bg-transparent font-mono text-foreground text-sm outline-none">
                  {slug || "your-workspace"}
                </code>
                <span className="mr-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                  <span className="size-1 rounded-full bg-emerald-500" />
                  available
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Visibility
              </label>
              <div className="flex flex-col gap-2">
                {VIZ.map((v) => {
                  const active = viz === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setViz(v.id)}
                      className={
                        "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors " +
                        (active
                          ? "border-foreground/60 bg-foreground/[0.04]"
                          : "border-border/60 hover:border-foreground/30")
                      }
                    >
                      <span
                        className={
                          "mt-1 size-3.5 shrink-0 rounded-full border " +
                          (active
                            ? "border-foreground bg-foreground ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
                            : "border-border")
                        }
                      />
                      <v.Icon className="mt-0.5 size-4 opacity-70" />
                      <div className="flex-1">
                        <div className="text-sm">{v.label}</div>
                        <div className="text-muted-foreground text-xs">
                          {v.meta}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-border/60 border-t bg-background px-5 py-3">
            <span className="text-muted-foreground text-xs">
              Step 1 of 3 · Workspace
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
              <Button type="button">Create workspace</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
