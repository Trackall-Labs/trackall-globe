import { CopyIcon, MailPlusIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@orbit/ui/input-group";

export function EmptyNoTeamShowcasePage() {
  const inviteUrl = "https://orbit.so/invite/8f3a2c";
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <Backdrop />
      <div className="relative mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.4em]">
          Members · 1
        </div>

        <PlaceholderAvatars />

        <h1 className="mt-1 max-w-md font-heading text-3xl leading-tight md:text-4xl">
          It's just you in here.
        </h1>
        <p className="mt-3 max-w-sm text-muted-foreground text-sm leading-relaxed">
          Add teammates to share projects, leave comments, and review each
          other's work.
        </p>

        <div className="mt-8 w-full max-w-md space-y-3">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Invite link
              </span>
            </InputGroupAddon>
            <InputGroupInput readOnly value={inviteUrl} nativeInput />
            <InputGroupAddon align="inline-end">
              <Button size="xs" variant="ghost" type="button">
                <CopyIcon />
                Copy
              </Button>
            </InputGroupAddon>
          </InputGroup>

          <Button size="default" className="w-full" type="button">
            <MailPlusIcon />
            Invite by email
          </Button>

          <p className="pt-1 text-muted-foreground text-xs">
            Anyone with the link can join as a member. Change in{" "}
            <a
              href="#"
              className="text-foreground underline-offset-4 hover:underline"
            >
              workspace settings
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export function PlaceholderAvatars() {
  const initials = ["S", "?", "?", "?"];
  return (
    <div className="mt-6 mb-5 flex items-center -space-x-2">
      {initials.map((c, i) => (
        <div
          key={i}
          className={
            i === 0
              ? "z-10 flex size-10 items-center justify-center rounded-full border-2 border-background bg-foreground font-medium text-background text-xs shadow-sm"
              : "flex size-10 items-center justify-center rounded-full border-2 border-dashed border-border/70 bg-background/40 font-medium text-[11px] text-muted-foreground backdrop-blur"
          }
          style={{ zIndex: i === 0 ? 10 : 4 - i }}
        >
          {c}
        </div>
      ))}
    </div>
  );
}

export function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-x-0 top-0 h-[60%]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, color-mix(in srgb, var(--foreground) 5%, transparent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
