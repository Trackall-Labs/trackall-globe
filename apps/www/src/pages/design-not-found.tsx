import { Link } from "@tanstack/react-router";

export function DesignNotFound({
  category,
  design,
}: {
  category: string;
  design?: string;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background px-6 text-center font-mono text-foreground">
      <div className="text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
        404
      </div>
      <h1 className="font-heading text-2xl">
        {design ? "Design not found" : "Folder not found"}
      </h1>
      <p className="max-w-md text-muted-foreground text-sm">
        {design ? (
          <>
            No design <code>{design}</code> in folder <code>{category}</code>.
          </>
        ) : (
          <>
            No folder named <code>{category}</code>.
          </>
        )}
      </p>
      <Link
        to="/"
        className="mt-3 text-[11px] text-foreground uppercase tracking-[0.2em] underline-offset-4 hover:underline"
      >
        ← Back to folders
      </Link>
    </div>
  );
}
