import { useState } from "react";
import { BellIcon, MailIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Separator } from "@orbit/ui/separator";
import { Switch } from "@orbit/ui/switch";

export interface Pref {
  key: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
}

const SECTIONS: { id: string; title: string; description: string; prefs: Pref[] }[] = [
  {
    id: "activity",
    title: "Activity",
    description: "Things happening in projects you follow.",
    prefs: [
      {
        key: "comments",
        title: "Comments and replies",
        description: "When someone replies to a thread you're in.",
        email: true,
        push: true,
      },
      {
        key: "mentions",
        title: "@mentions",
        description: "When you're called out specifically.",
        email: true,
        push: true,
      },
      {
        key: "assignments",
        title: "Assignments",
        description: "When something is assigned to you.",
        email: true,
        push: false,
      },
    ],
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Membership, billing, and admin events.",
    prefs: [
      {
        key: "invites",
        title: "New members",
        description: "Someone joins or accepts an invite.",
        email: false,
        push: false,
      },
      {
        key: "billing",
        title: "Billing receipts",
        description: "Monthly invoices and payment failures.",
        email: true,
        push: false,
      },
    ],
  },
  {
    id: "product",
    title: "Product updates",
    description: "Newsletters and what's new.",
    prefs: [
      {
        key: "weekly",
        title: "Weekly digest",
        description: "A short Monday summary of activity.",
        email: true,
        push: false,
      },
      {
        key: "changelog",
        title: "Changelog highlights",
        description: "Major shipments, ~once a month.",
        email: false,
        push: false,
      },
    ],
  },
];

export function FormsNotificationsShowcasePage() {
  const [prefs, setPrefs] = useState<Record<string, { email: boolean; push: boolean }>>(
    () => {
      const out: Record<string, { email: boolean; push: boolean }> = {};
      for (const s of SECTIONS) for (const p of s.prefs) out[p.key] = { email: p.email, push: p.push };
      return out;
    },
  );

  const flip = (key: string, channel: "email" | "push") =>
    setPrefs((p) => ({
      ...p,
      [key]: { ...p[key]!, [channel]: !p[key]![channel] },
    }));

  return (
    <div className="min-h-svh bg-background py-16 text-foreground">
      <div className="mx-auto max-w-3xl px-6">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Settings · Notifications
        </div>
        <h1 className="mt-1 font-heading text-3xl">Notifications</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Pick which moments deserve a tap on the shoulder. Defaults err on the
          quiet side — turn things on as you need them.
        </p>

        <div className="mt-8 flex items-center justify-end gap-6 border-y border-border/60 py-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          <span className="flex w-16 justify-center gap-1.5">
            <MailIcon className="size-3.5 opacity-70" />
            Email
          </span>
          <span className="flex w-16 justify-center gap-1.5">
            <BellIcon className="size-3.5 opacity-70" />
            Push
          </span>
        </div>

        {SECTIONS.map((section, idx) => (
          <section key={section.id} className="mt-8">
            <header>
              <h2 className="font-heading text-base">{section.title}</h2>
              <p className="mt-0.5 text-muted-foreground text-xs">
                {section.description}
              </p>
            </header>

            <ul className="mt-4 divide-y divide-border/50 rounded-xl border border-border/60 bg-background/40">
              {section.prefs.map((p) => {
                const v = prefs[p.key]!;
                return (
                  <li
                    key={p.key}
                    className="flex items-center gap-6 px-4 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{p.title}</div>
                      <p className="mt-0.5 truncate text-muted-foreground text-xs">
                        {p.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex w-16 justify-center">
                        <Switch
                          checked={v.email}
                          onCheckedChange={() => flip(p.key, "email")}
                        />
                      </div>
                      <div className="flex w-16 justify-center">
                        <Switch
                          checked={v.push}
                          onCheckedChange={() => flip(p.key, "push")}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {idx < SECTIONS.length - 1 ? null : null}
          </section>
        ))}

        <Separator className="my-10" />

        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-start gap-3">
            <MessageSquareIcon className="mt-0.5 size-4 opacity-60" />
            <div className="flex-1">
              <div className="font-medium text-sm">Quiet hours</div>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Push notifications are paused between 10pm and 8am in your
                workspace timezone.
              </p>
            </div>
            <Button variant="outline" size="sm" type="button">
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
