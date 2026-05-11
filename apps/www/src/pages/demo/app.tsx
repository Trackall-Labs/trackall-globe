import { useEffect, useRef } from "react";
import { useTheme } from "@orbit/ui/theme-provider";
import { DemoOverlays } from "./overlays";
import { DemoSidebar } from "./sidebar";
import { DemoTopbar } from "./topbar";
import { DemoView } from "./views";
import { DemoProvider, useDemo, type View } from "./store";

export function DemoApp() {
  return (
    <DemoProvider>
      <DemoLayout />
    </DemoProvider>
  );
}

function DemoLayout() {
  useGlobalShortcuts();
  return (
    <div className="grid h-svh grid-cols-[260px_1fr] bg-background text-foreground">
      <DemoSidebar />
      <div className="flex min-w-0 flex-col">
        <DemoTopbar />
        <DemoView />
      </div>
      <DemoOverlays />
    </div>
  );
}

const CHORD_TIMEOUT_MS = 1200;

function useGlobalShortcuts() {
  const { overlay, setOverlay, setView } = useDemo();
  const { toggleLightDark } = useTheme();
  const chordRef = useRef<{ key: "g"; expires: number } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K: open/close palette anywhere.
      if (isMod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOverlay(overlay === "palette" ? null : "palette");
        return;
      }

      // Esc closes any overlay.
      if (e.key === "Escape" && overlay !== null) {
        e.preventDefault();
        setOverlay(null);
        return;
      }

      // Single-letter shortcuts only when nothing is captured (no overlay,
      // not typing in an input).
      if (overlay !== null) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget()) return;

      // ? opens shortcut sheet (works as Shift + /).
      if (e.key === "?") {
        e.preventDefault();
        setOverlay("shortcuts");
        return;
      }

      // / focuses search — open the palette as a stand-in.
      if (e.key === "/") {
        e.preventDefault();
        setOverlay("palette");
        return;
      }

      const key = e.key.toLowerCase();
      const now = Date.now();
      const chord = chordRef.current;

      // Handle the second key of a g-chord.
      if (chord && chord.expires > now) {
        const map: Record<string, View> = {
          h: "home",
          p: "projects",
          m: "members",
          i: "inbox",
          s: "settings",
        };
        if (map[key]) {
          e.preventDefault();
          setView(map[key]!);
          chordRef.current = null;
          return;
        }
        // Any other key cancels the chord.
        chordRef.current = null;
      }

      // Single-letter actions.
      if (key === "g") {
        chordRef.current = { key: "g", expires: now + CHORD_TIMEOUT_MS };
        return;
      }
      if (key === "n") {
        e.preventDefault();
        setOverlay("new-project");
      } else if (key === "i") {
        e.preventDefault();
        setOverlay("invite");
      } else if (key === "t") {
        e.preventDefault();
        toggleLightDark();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [overlay, setOverlay, setView, toggleLightDark]);
}

function isTypingTarget(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true;
  return el.isContentEditable;
}
