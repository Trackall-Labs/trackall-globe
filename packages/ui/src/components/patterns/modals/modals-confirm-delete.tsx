import { useState } from "react";
import { TriangleAlertIcon, Trash2Icon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Input } from "@orbit/ui/input";

const PHRASE = "delete acme-prod";

export function ModalsConfirmDeleteShowcasePage() {
  const [value, setValue] = useState("");
  const matches = value === PHRASE;

  return (
    <div className="relative min-h-svh bg-background">
      {/* Faded page underneath */}
      <div aria-hidden className="px-10 py-10 opacity-30">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Settings · Workspace
        </div>
        <h1 className="mt-1 font-heading text-2xl">Danger zone</h1>
        <div className="mt-6 max-w-xl rounded-xl border border-border/60 p-5">
          <div className="text-sm">Delete workspace</div>
          <div className="mt-1 text-muted-foreground text-xs">
            Permanently remove this workspace and all data. This cannot be
            undone.
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-start gap-3 px-5 pt-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlertIcon className="size-4" />
            </div>
            <div>
              <div className="font-heading text-base">
                Delete acme-prod workspace?
              </div>
              <div className="mt-1 text-muted-foreground text-sm">
                This permanently deletes 12 projects, 84 documents, and revokes
                access for 28 members. Backups retained for 30 days.
              </div>
            </div>
          </div>

          <div className="mx-5 mt-5 rounded-lg border border-border/60 bg-background p-3 text-xs">
            <div className="text-muted-foreground">
              Type{" "}
              <span className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">
                {PHRASE}
              </span>{" "}
              to confirm.
            </div>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={PHRASE}
              className="mt-2 font-mono"
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 border-border/60 border-t bg-background px-5 py-3">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!matches}
            >
              <Trash2Icon />
              Delete forever
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
