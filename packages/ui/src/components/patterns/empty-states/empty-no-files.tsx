import { useRef, useState } from "react";
import { FileTextIcon, ImageIcon, UploadCloudIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Kbd } from "@orbit/ui/kbd";

export function EmptyNoFilesShowcasePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);

  const onFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    setFilename(files[0].name);
  };

  return (
    <div className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-heading text-xl">Files</h1>
            <p className="text-muted-foreground text-sm">
              All assets used across this project.
            </p>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
            0 files · 0 KB
          </span>
        </header>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            onFiles(e.dataTransfer.files);
          }}
          className={
            "relative rounded-2xl border-2 border-dashed bg-background px-6 py-16 transition-colors " +
            (over
              ? "border-primary/60 bg-primary/[0.04]"
              : "border-border/70 hover:border-border")
          }
        >
          <div className="flex flex-col items-center text-center">
            <PreviewStack />
            <h2 className="mt-6 font-heading font-semibold text-xl">
              {filename ? "Ready to upload" : "Drop files to upload"}
            </h2>
            <p className="mt-1 max-w-sm text-balance text-muted-foreground text-sm">
              {filename ? (
                <>
                  Selected:{" "}
                  <span className="font-mono text-foreground">{filename}</span>
                </>
              ) : (
                <>
                  PNG, JPG, PDF up to 25 MB. Or paste from clipboard with{" "}
                  <Kbd>⌘V</Kbd>.
                </>
              )}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Button onClick={() => inputRef.current?.click()}>
                <UploadCloudIcon />
                Choose files
              </Button>
              {filename ? (
                <Button variant="ghost" onClick={() => setFilename(null)}>
                  Clear
                </Button>
              ) : null}
            </div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewStack() {
  return (
    <div className="relative h-16 w-24">
      <div className="-rotate-12 -translate-x-4 absolute top-2 left-1/2 flex h-14 w-10 origin-bottom items-center justify-center rounded-md border border-border bg-background shadow-xs/5">
        <ImageIcon className="size-4 text-muted-foreground" />
      </div>
      <div className="absolute top-0 left-1/2 flex h-14 w-10 origin-bottom -translate-x-1/2 items-center justify-center rounded-md border border-border bg-background shadow-xs/5">
        <FileTextIcon className="size-4 text-muted-foreground" />
      </div>
      <div className="absolute top-2 left-1/2 flex h-14 w-10 origin-bottom translate-x-1 rotate-12 items-center justify-center rounded-md border border-border bg-background shadow-xs/5">
        <FileTextIcon className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}
