import {
  ChevronDownIcon,
  CopyIcon,
  GlobeIcon,
  LinkIcon,
  LockIcon,
  XIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";
import { Input } from "@orbit/ui/input";

const MEMBERS = [
  { name: "Maya Okafor", email: "maya@acme.dev", role: "Owner", initials: "MO" },
  { name: "James Lin", email: "james@acme.dev", role: "Editor", initials: "JL" },
  { name: "Riya Patel", email: "riya@acme.dev", role: "Viewer", initials: "RP" },
  { name: "Dani Kim", email: "dani@acme.dev", role: "Editor", initials: "DK" },
];

export function ModalsShareLinkShowcasePage() {
  return (
    <div className="relative min-h-svh bg-background">
      <div aria-hidden className="px-10 py-10 opacity-25">
        <div className="font-heading text-2xl">Onboarding handbook v3</div>
        <div className="mt-2 text-muted-foreground text-sm">
          Last edited by Maya 2h ago · 14 collaborators
        </div>
      </div>

      <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5">
            <div className="flex items-center gap-2">
              <LinkIcon className="size-4 opacity-60" />
              <span className="font-heading text-sm">
                Share "Onboarding handbook v3"
              </span>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add people, groups, or emails…"
                className="flex-1"
              />
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-1.5 text-xs"
              >
                Editor
                <ChevronDownIcon className="size-3" />
              </button>
            </div>

            <div className="rounded-lg border border-border/60 bg-background p-3">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground/[0.06]">
                  <GlobeIcon className="size-4 opacity-70" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">Anyone with the link</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] text-muted-foreground hover:bg-foreground/[0.05]"
                    >
                      Can view
                      <ChevronDownIcon className="size-3" />
                    </button>
                  </div>
                  <div className="mt-1 text-muted-foreground text-xs">
                    No sign-in required. Anyone can view this document.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2">
              <LockIcon className="size-3.5 opacity-50" />
              <code className="flex-1 truncate font-mono text-xs">
                https://acme.dev/d/onboarding-handbook-v3-3b9f2a
              </code>
              <Button size="sm" variant="ghost" type="button">
                <CopyIcon />
                Copy
              </Button>
            </div>

            <div>
              <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                People with access · {MEMBERS.length}
              </div>
              <ul className="divide-y divide-border/40 rounded-lg border border-border/60">
                {MEMBERS.map((m) => (
                  <li
                    key={m.email}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px]">
                        {m.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{m.name}</div>
                      <div className="truncate text-muted-foreground text-xs">
                        {m.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] text-muted-foreground hover:bg-foreground/[0.05]"
                    >
                      {m.role}
                      <ChevronDownIcon className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between border-border/60 border-t px-5 py-3">
            <span className="text-muted-foreground text-xs">
              Workspace defaults to viewer access
            </span>
            <Button type="button">Done</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
