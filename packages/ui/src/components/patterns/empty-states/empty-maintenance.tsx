import { useEffect, useState } from "react";
import { WrenchIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Progress } from "@orbit/ui/progress";

const TOTAL_SECONDS = 18 * 60;

export function EmptyMaintenanceShowcasePage() {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);

  useEffect(() => {
    const id = window.setInterval(
      () => setRemaining((s) => (s > 0 ? s - 1 : TOTAL_SECONDS)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = ((TOTAL_SECONDS - remaining) / TOTAL_SECONDS) * 100;

  return (
    <div className="min-h-svh bg-background px-6 py-16">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <Badge
          variant="outline"
          className="gap-2 font-mono text-[10px] uppercase tracking-[0.25em]"
        >
          <span className="relative inline-flex">
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="absolute inset-0 size-2 animate-ping rounded-full bg-amber-500/60" />
          </span>
          Scheduled maintenance
        </Badge>

        <div className="mt-8 flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-xs/5">
          <WrenchIcon className="size-6" />
        </div>

        <h1 className="mt-6 font-heading text-2xl leading-tight md:text-3xl">
          We'll be back shortly.
        </h1>
        <p className="mt-2 max-w-md text-balance text-muted-foreground text-sm">
          We're rolling out a database migration. Reads and writes are paused
          for the duration. No data will be lost.
        </p>

        <div className="mt-10 w-full max-w-sm">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
            <span>ETA</span>
            <span className="tabular-nums text-foreground">
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </span>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>

        <div className="mt-8 flex items-center gap-2">
          <Button variant="outline" size="sm">
            Subscribe to updates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            render={
              <a
                href="https://status.orbit.so"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            View status page
          </Button>
        </div>
      </div>
    </div>
  );
}
