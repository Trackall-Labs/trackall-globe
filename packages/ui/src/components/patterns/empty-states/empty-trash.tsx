import { Trash2Icon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@orbit/ui/empty";

export function EmptyTrashShowcasePage() {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Breadcrumb />
        <div className="mt-6 rounded-2xl border border-border/70 bg-background">
          <div className="flex items-center justify-between border-border/60 border-b px-5 py-3">
            <div>
              <h1 className="font-heading text-base">Trash</h1>
              <p className="text-muted-foreground text-xs">
                Items here are permanently removed after 30 days.
              </p>
            </div>
            <Button variant="ghost" size="sm" disabled>
              Empty trash
            </Button>
          </div>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Trash2Icon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Trash is empty.</EmptyTitle>
              <EmptyDescription>
                Nothing's been deleted recently. When you remove a project or
                file, it'll show up here for 30 days before disappearing for
                good.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm">
                Back to projects
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    </div>
  );
}

export function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
      <a href="#" className="hover:text-foreground">
        Workspace
      </a>
      <span>/</span>
      <a href="#" className="hover:text-foreground">
        Settings
      </a>
      <span>/</span>
      <span className="text-foreground">Trash</span>
    </nav>
  );
}
