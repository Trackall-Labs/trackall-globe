import { useEffect, useState } from "react";
import {
  AtSignIcon,
  BellIcon,
  CheckIcon,
  CreditCardIcon,
  KeyboardIcon,
  MessageCircleIcon,
  RocketIcon,
  TrashIcon,
  UserPlusIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@orbit/ui/alert-dialog";
import { Button } from "@orbit/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@orbit/ui/dialog";
import { Input } from "@orbit/ui/input";
import { Kbd } from "@orbit/ui/kbd";
import {
  Sheet,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@orbit/ui/sheet";
import { useDemo, type Notification } from "./store";

const ICONS: Record<Notification["Icon"], React.ComponentType<{ className?: string }>> = {
  deploy: RocketIcon,
  comment: MessageCircleIcon,
  mention: AtSignIcon,
  invite: UserPlusIcon,
  billing: CreditCardIcon,
};

const TONES: Record<Notification["Icon"], string> = {
  deploy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  comment: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  mention: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  invite: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  billing: "bg-foreground/[0.08] text-foreground",
};

export function NotificationsSheet() {
  const {
    overlay,
    setOverlay,
    notifications,
    markAllRead,
    toggleNotificationRead,
  } = useDemo();
  const open = overlay === "notifications";
  const buckets = ["Today", "Earlier"] as const;

  return (
    <Sheet open={open} onOpenChange={(o) => setOverlay(o ? "notifications" : null)}>
      <SheetPopup side="right" className="!max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BellIcon className="size-4 opacity-70" />
            Notifications
            <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 font-mono text-[9px] text-foreground">
              {notifications.filter((n) => !n.read).length}
            </span>
          </SheetTitle>
          <Button size="sm" variant="ghost" type="button" onClick={markAllRead} className="mt-1 self-start">
            Mark all read
          </Button>
        </SheetHeader>
        <SheetPanel className="!p-0">
          {buckets.map((bucket) => {
            const items = notifications.filter((n) => n.bucket === bucket);
            if (items.length === 0) return null;
            return (
              <section key={bucket}>
                <div className="border-border/40 border-b px-4 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  {bucket}
                </div>
                <ul className="divide-y divide-border/40">
                  {items.map((n) => {
                    const Icon = ICONS[n.Icon];
                    return (
                      <li
                        key={n.id}
                        className={`relative flex gap-3 px-4 py-3 transition-colors ${
                          n.read ? "" : "bg-foreground/[0.02]"
                        }`}
                      >
                        {!n.read ? (
                          <span className="absolute top-4 left-1.5 size-1.5 rounded-full bg-primary" />
                        ) : null}
                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${TONES[n.Icon]}`}>
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm ${n.read ? "" : "font-medium"}`}>{n.title}</div>
                          <div className="mt-0.5 text-muted-foreground text-xs">{n.body}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleNotificationRead(n.id)}
                          aria-label="Toggle read"
                          className="self-start text-muted-foreground/40 transition-colors hover:text-foreground"
                        >
                          {n.read ? (
                            <span className="size-2 rounded-full ring-1 ring-current inline-block" />
                          ) : (
                            <CheckIcon className="size-3.5" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}

export function ShortcutsDialog() {
  const { overlay, setOverlay } = useDemo();
  const open = overlay === "shortcuts";

  const sections: { title: string; items: { label: string; keys: string[] }[] }[] = [
    {
      title: "General",
      items: [
        { label: "Open command palette", keys: ["⌘", "K"] },
        { label: "Show shortcuts", keys: ["?"] },
        { label: "Search inbox", keys: ["/"] },
        { label: "Close anything", keys: ["esc"] },
      ],
    },
    {
      title: "Navigate",
      items: [
        { label: "Go to home", keys: ["g", "h"] },
        { label: "Go to projects", keys: ["g", "p"] },
        { label: "Go to members", keys: ["g", "m"] },
        { label: "Go to inbox", keys: ["g", "i"] },
        { label: "Go to settings", keys: ["g", "s"] },
      ],
    },
    {
      title: "Actions",
      items: [
        { label: "New project", keys: ["n"] },
        { label: "Invite teammate", keys: ["i"] },
        { label: "Toggle theme", keys: ["t"] },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => setOverlay(o ? "shortcuts" : null)}>
      <DialogPopup className="!max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyboardIcon className="size-4 opacity-70" />
            Keyboard shortcuts
          </DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
            {sections.map((s) => (
              <section key={s.title}>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  {s.title}
                </div>
                <ul className="mt-2 divide-y divide-border/40">
                  {s.items.map((it) => (
                    <li
                      key={it.label}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                    >
                      <span>{it.label}</span>
                      <span className="flex items-center gap-1">
                        {it.keys.map((k, i) => (
                          <Kbd key={i}>{k}</Kbd>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}

export function ConfirmArchiveAlert() {
  const {
    overlay,
    setOverlay,
    pendingArchive,
    cancelArchive,
    archiveProject,
    pushToast,
  } = useDemo();
  const [phrase, setPhrase] = useState("");
  const open = overlay === "confirm-archive" && !!pendingArchive;
  const matches = pendingArchive ? phrase === pendingArchive.name : false;

  useEffect(() => {
    if (!open) setPhrase("");
  }, [open]);

  if (!pendingArchive) return null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          cancelArchive();
          setOverlay(null);
        }
      }}
    >
      <AlertDialogPopup>
        <AlertDialogHeader>
          <div className="mb-2 inline-flex size-9 items-center justify-center self-start rounded-full bg-destructive/10 text-destructive">
            <TrashIcon className="size-4" />
          </div>
          <AlertDialogTitle>Archive {pendingArchive.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            All issues, files, and history will be hidden from the active list.
            You can restore from archive within 30 days.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-6 pb-2">
          <label
            htmlFor="confirm-phrase"
            className="font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            Type the project name to confirm
          </label>
          <Input
            id="confirm-phrase"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={pendingArchive.name}
            nativeInput
            className="mt-2 font-mono"
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              cancelArchive();
              setOverlay(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!matches}
            onClick={() => {
              archiveProject(pendingArchive.projectId);
              pushToast({
                kind: "info",
                title: "Project archived",
                body: `"${pendingArchive.name}" moved to archive.`,
              });
              cancelArchive();
              setOverlay(null);
            }}
          >
            <TrashIcon />
            Archive project
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
