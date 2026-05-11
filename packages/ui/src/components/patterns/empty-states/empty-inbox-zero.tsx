import { useRef } from "react";
import { CheckCheckIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { ParticleField } from "@orbit/ui/particle-field";
import dustyFieldSrc from "../../../assets/figures/dusty-field.png";

export function EmptyInboxZeroShowcasePage() {
  const typingImpulse = useRef(0);
  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-background">
      <ParticleField
        src={dustyFieldSrc}
        sampleStep={2}
        threshold={48}
        dotSize={0.9}
        renderScale={1}
        align="center"
        typingImpulseRef={typingImpulse}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 45%, transparent 35%, color-mix(in srgb, var(--background) 80%, transparent) 95%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--background) 50%, transparent) 35%, color-mix(in srgb, var(--background) 90%, transparent) 70%, var(--background) 100%)",
        }}
      />

      <div className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground backdrop-blur">
        <CheckCheckIcon className="size-3 text-foreground" aria-hidden />
        Inbox · 0 unread
      </div>

      <div className="absolute top-6 right-6 z-10 text-right font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <div>This week</div>
        <div className="mt-0.5 font-heading text-xs tracking-normal text-foreground/85 normal-case">
          47 cleared
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 px-6 pb-20 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          A quiet horizon
        </div>
        <h1 className="max-w-xl font-heading text-4xl leading-tight md:text-5xl">
          You're all caught up.
        </h1>
        <p className="max-w-md text-balance text-muted-foreground text-sm leading-relaxed">
          Nothing new since 8:42 this morning. Take a break — we'll let you
          know when something arrives.
        </p>

        <div className="mt-2 flex items-center gap-2">
          <Button variant="outline" size="sm">
            View archive
          </Button>
          <Button variant="ghost" size="sm">
            Snooze new mail
          </Button>
        </div>
      </div>
    </div>
  );
}
