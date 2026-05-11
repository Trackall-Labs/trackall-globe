import { GitPullRequestIcon, MessageCircleIcon, UserPlusIcon, XIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

export interface ToastSpec {
  Icon: React.ComponentType<{ className?: string }>;
  badgeTone: string;
  title: string;
  body: string;
  meta: string;
  actions?: { label: string; primary?: boolean }[];
  avatar?: { initials: string; tone: string };
}

const TOASTS: ToastSpec[] = [
  {
    Icon: UserPlusIcon,
    badgeTone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    title: "Maya joined the workspace",
    body: "Auto-joined via @acme.com domain rule. Say hi or assign a project.",
    meta: "just now",
    actions: [{ label: "Assign" }, { label: "Welcome", primary: true }],
    avatar: { initials: "MO", tone: "bg-emerald-500/85 text-white" },
  },
  {
    Icon: GitPullRequestIcon,
    badgeTone: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    title: "PR #128 ready for review",
    body: "James moved \"audit log query rewrite\" to ready.",
    meta: "2m ago",
    actions: [{ label: "Snooze" }, { label: "Review", primary: true }],
    avatar: { initials: "JL", tone: "bg-amber-500/85 text-white" },
  },
  {
    Icon: MessageCircleIcon,
    badgeTone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    title: "Riya replied",
    body: "@sean — same — let's pair on the bouncing invites tomorrow morning.",
    meta: "12m ago",
    actions: [{ label: "Reply" }],
    avatar: { initials: "RP", tone: "bg-violet-500/85 text-white" },
  },
];

export function ToastsRichShowcasePage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeAppBackdrop />
      <div className="absolute top-6 right-6 z-50 flex w-[380px] flex-col gap-2">
        {TOASTS.map((t, i) => (
          <article
            key={i}
            className="rounded-xl border border-border/70 bg-background p-3.5 shadow-lg"
          >
            <div className="flex items-start gap-3">
              {t.avatar ? (
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full font-medium text-[11px] ${t.avatar.tone}`}
                >
                  {t.avatar.initials}
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-5 items-center justify-center rounded-full ${t.badgeTone}`}
                  >
                    <t.Icon className="size-3" />
                  </span>
                  <span className="truncate font-medium text-sm">{t.title}</span>
                </div>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  {t.body}
                </p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                    {t.meta}
                  </span>
                  {t.actions ? (
                    <div className="flex items-center gap-1">
                      {t.actions.map((a) => (
                        <Button
                          key={a.label}
                          size="xs"
                          variant={a.primary ? "default" : "ghost"}
                          type="button"
                        >
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function FakeAppBackdrop() {
  return (
    <div className="absolute inset-0 p-10 opacity-50 space-y-3">
      <div className="h-4 w-56 rounded bg-foreground/15" />
      <div className="h-2 w-72 rounded bg-foreground/10" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-border/40 bg-foreground/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
