import { useEffect, useState } from "react";
import { FileTextIcon, ImageIcon, XIcon } from "lucide-react";

export interface Job {
  id: number;
  name: string;
  size: string;
  kind: "image" | "doc";
  progress: number;
}

export function ToastsProgressShowcasePage() {
  const [jobs, setJobs] = useState<Job[]>([
    { id: 1, name: "preview-render-4k.png", size: "8.1 MB", kind: "image", progress: 28 },
    { id: 2, name: "Q3-roadmap.pdf", size: "684 KB", kind: "doc", progress: 62 },
  ]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setJobs((js) =>
        js.map((j) => ({
          ...j,
          progress: Math.min(100, j.progress + Math.random() * 4),
        })),
      );
    }, 600);
    return () => window.clearInterval(t);
  }, []);

  const total = jobs.length;
  const done = jobs.filter((j) => j.progress >= 100).length;

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeAppBackdrop />
      <div className="absolute right-6 bottom-6 z-50 w-96 rounded-xl border border-border/70 bg-background shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="font-medium text-sm">
              Uploading {done} of {total}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
        <ul className="divide-y divide-border/40">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground/[0.05]">
                {j.kind === "image" ? (
                  <ImageIcon className="size-3.5 opacity-70" />
                ) : (
                  <FileTextIcon className="size-3.5 opacity-70" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-sm">{j.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {Math.round(j.progress)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                  <div
                    className="h-full rounded-full bg-foreground/70 transition-[width]"
                    style={{ width: `${j.progress}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-muted-foreground text-xs">
                  <span>{j.size}</span>
                  <button
                    type="button"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function FakeAppBackdrop() {
  return (
    <div className="absolute inset-0 p-10 opacity-50 space-y-3">
      <div className="h-4 w-48 rounded bg-foreground/15" />
      <div className="h-2 w-72 rounded bg-foreground/10" />
      <div className="h-40 rounded-xl border border-border/40 bg-foreground/[0.02]" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-border/40 bg-foreground/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
