import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Kbd } from "@orbit/ui/kbd";
import { useTheme } from "@orbit/ui/theme-provider";
import { CATEGORIES, getCategory, type CategorySlug } from "@/lib/designs";
import { getShowcase } from "@/pages/showcase/registry";
import { CodeViewer } from "@/pages/showcase/_code-viewer";
import { DesignNotFound } from "@/pages/design-not-found";

interface DesignSearch {
  preview?: string;
}

export const Route = createFileRoute("/c/$category/$design")({
  validateSearch: (raw: Record<string, unknown>): DesignSearch => ({
    preview: typeof raw.preview === "string" ? raw.preview : undefined,
  }),
  head: ({ params }) => {
    const category = getCategory(params.category as CategorySlug);
    const design = category?.designs.find((d) => d.slug === params.design);
    if (!category || !design) return {};
    const url = `https://devl.dev/c/${params.category}/${params.design}`;
    const title = `${design.title} · ${category.title} — devl.dev`;
    const description = design.blurb;
    const image = `https://devl.dev/previews/${params.category}__${params.design}--dark.png`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: DesignRoute,
});

type DesignTarget = { category: string; design: string };

function pickRandomDesign(current: DesignTarget): DesignTarget | null {
  const all = CATEGORIES.flatMap((c) =>
    c.designs
      .filter((d) => !!getShowcase(c.slug, d.slug))
      .map((d) => ({ category: c.slug, design: d.slug })),
  );
  const others = all.filter(
    (d) => !(d.category === current.category && d.design === current.design),
  );
  if (others.length === 0) return null;
  return others[Math.floor(Math.random() * others.length)] ?? null;
}

function siblingDesign(
  current: DesignTarget,
  delta: 1 | -1,
): DesignTarget | null {
  const cat = CATEGORIES.find((c) => c.slug === current.category);
  if (!cat) return null;
  const designs = cat.designs.filter((d) => !!getShowcase(cat.slug, d.slug));
  if (designs.length === 0) return null;
  const idx = designs.findIndex((d) => d.slug === current.design);
  if (idx === -1) return null;
  const nextIdx = (idx + delta + designs.length) % designs.length;
  const next = designs[nextIdx];
  return next ? { category: cat.slug, design: next.slug } : null;
}

function siblingCategory(
  current: DesignTarget,
  delta: 1 | -1,
): DesignTarget | null {
  const populated = CATEGORIES.filter((c) =>
    c.designs.some((d) => !!getShowcase(c.slug, d.slug)),
  );
  if (populated.length <= 1) return null;
  const idx = populated.findIndex((c) => c.slug === current.category);
  if (idx === -1) return null;
  const nextIdx = (idx + delta + populated.length) % populated.length;
  const nextCat = populated[nextIdx];
  if (!nextCat) return null;
  const firstDesign = nextCat.designs.find(
    (d) => !!getShowcase(nextCat.slug, d.slug),
  );
  return firstDesign
    ? { category: nextCat.slug, design: firstDesign.slug }
    : null;
}

function isTypingTarget(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true;
  return el.isContentEditable;
}

function DesignRoute() {
  const { category, design } = Route.useParams();
  const { preview } = Route.useSearch();
  const isPreview = preview === "1" || preview === "true";
  const navigate = useNavigate();
  const router = useRouter();
  const { toggleLightDark } = useTheme();
  const found = getCategory(category);
  const [codeOpen, setCodeOpen] = useState(false);

  useEffect(() => {
    if (isPreview || !found) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget()) return;

      if (e.key === "Escape") {
        e.preventDefault();
        if (codeOpen) {
          setCodeOpen(false);
          return;
        }
        if (window.history.length > 1) {
          router.history.back();
        } else {
          void navigate({ to: "/" });
        }
        return;
      }
      // Other hotkeys are suppressed while the code viewer is open.
      if (codeOpen) return;
      if ((e.key === "r" || e.key === "R") && !e.shiftKey) {
        e.preventDefault();
        const next = pickRandomDesign({ category, design });
        if (next) {
          void navigate({
            to: "/c/$category/$design",
            params: { category: next.category, design: next.design },
          });
        }
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const next = siblingDesign(
          { category, design },
          e.key === "ArrowRight" ? 1 : -1,
        );
        if (next) {
          void navigate({
            to: "/c/$category/$design",
            params: { category: next.category, design: next.design },
          });
        }
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = siblingCategory(
          { category, design },
          e.key === "ArrowDown" ? 1 : -1,
        );
        if (next) {
          void navigate({
            to: "/c/$category/$design",
            params: { category: next.category, design: next.design },
          });
        }
        return;
      }
      if ((e.key === "t" || e.key === "T") && !e.shiftKey) {
        e.preventDefault();
        toggleLightDark();
        return;
      }
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setCodeOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [isPreview, found, category, design, navigate, toggleLightDark, codeOpen]);

  if (!found) return <DesignNotFound category={category} />;
  const meta = found.designs.find((d) => d.slug === design);
  const Showcase = getShowcase(found.slug as CategorySlug, design);
  if (!meta || !Showcase) {
    return <DesignNotFound category={category} design={design} />;
  }

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      {isPreview ? null : <ShortcutHints />}
      <Showcase />
      {isPreview ? null : (
        <CodeViewer
          open={codeOpen}
          onOpenChange={setCodeOpen}
          category={found.slug as CategorySlug}
          design={design}
          title={meta.title}
        />
      )}
    </div>
  );
}

function ShortcutHints() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="flex items-center gap-3 rounded-md border border-border/70 bg-background/70 px-3 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur">
        <span className="flex items-center gap-1.5">
          <Kbd>esc</Kbd> back
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="flex items-center gap-1">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
          <span className="ml-0.5">browse</span>
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <span className="ml-0.5">group</span>
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="flex items-center gap-1.5">
          <Kbd>r</Kbd> random
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="flex items-center gap-1.5">
          <Kbd>t</Kbd> theme
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="flex items-center gap-1.5">
          <Kbd>c</Kbd> code
        </span>
      </div>
    </div>
  );
}
