import {
  CornerUpLeftIcon,
  PaperclipIcon,
  ReplyIcon,
  SmileIcon,
  StarIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";
import { Textarea } from "@orbit/ui/textarea";

export interface Msg {
  who: string;
  initials: string;
  email: string;
  at: string;
  body: string;
  quoted?: string;
  attachments?: string[];
}

const MSGS: Msg[] = [
  {
    who: "Maya Okafor",
    initials: "MO",
    email: "maya@acme.dev",
    at: "Apr 22 · 09:14",
    body: "Hi James — wanted to share the audit log retention proposal we discussed. The headline is that we lift Business plans from 30 days to 1 year, with deeper export controls. Curious where you'd push back.",
    attachments: ["audit-retention-proposal.pdf · 482 KB"],
  },
  {
    who: "James Lin",
    initials: "JL",
    email: "james@acme.dev",
    at: "Apr 22 · 11:02",
    body: "Loved the framing. Two things: I'd want SSO logs included by default — half the customers who'll buy this will buy it for SOC 2. And the export contract should match our existing CSV schema so we don't break the SDK.",
    quoted: "we lift Business plans from 30 days to 1 year",
  },
  {
    who: "Maya Okafor",
    initials: "MO",
    email: "maya@acme.dev",
    at: "Apr 24 · 14:36",
    body: "Great calls — both folded in. Riya is taking the migration, I'm doing the UI. I'll cut a draft PR by EOW. Want me to loop in legal for the retention copy?",
  },
];

export function TimelinesInboxThreadShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Inbox · thread
        </div>
        <div className="mt-1 flex items-start justify-between">
          <h1 className="font-heading text-2xl leading-tight">
            Audit log retention proposal
          </h1>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <StarIcon className="size-4" />
          </button>
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          <span>3 messages</span>
          <span>·</span>
          <span>2 participants</span>
          <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 normal-case tracking-normal">
            #design
          </span>
          <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 normal-case tracking-normal">
            #q2-roadmap
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-background/40">
          <ol className="relative divide-y divide-border/40">
            {MSGS.map((m, i) => (
              <li key={i} className="grid grid-cols-[40px_1fr] gap-4 px-5 py-5">
                <Avatar className="mt-0.5 size-9">
                  <AvatarFallback className="text-xs">
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{m.who}</span>
                    <span className="text-muted-foreground text-xs">
                      {m.email}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {m.at}
                    </span>
                  </div>
                  {m.quoted ? (
                    <blockquote className="mt-3 flex gap-3 border-foreground/30 border-l-2 pl-3 text-muted-foreground text-sm italic">
                      <CornerUpLeftIcon className="mt-0.5 size-3 shrink-0 opacity-60" />
                      "{m.quoted}"
                    </blockquote>
                  ) : null}
                  <p className="mt-2 text-foreground/90 text-sm leading-relaxed">
                    {m.body}
                  </p>
                  {m.attachments?.length ? (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {m.attachments.map((a) => (
                        <div
                          key={a}
                          className="inline-flex w-fit items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs"
                        >
                          <PaperclipIcon className="size-3 opacity-60" />
                          {a}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {i < MSGS.length - 1 ? (
                    <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <ReplyIcon className="size-3" />
                        Reply
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <SmileIcon className="size-3" />
                        React
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <div className="border-border/60 border-t bg-background p-4">
            <Textarea
              placeholder="Reply to Maya, James — Cmd+Enter to send"
              className="min-h-24"
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <PaperclipIcon className="size-4" />
              </button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" type="button">
                  Save draft
                </Button>
                <Button type="button">Send reply</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
