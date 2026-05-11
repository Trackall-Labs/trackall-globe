import { BookmarkIcon, ClockIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card, CardPanel } from "@orbit/ui/card";

export interface Article {
  slug: string;
  category: string;
  title: string;
  blurb: string;
  author: string;
  initials: string;
  read: string;
  hueA: string;
  hueB: string;
  pattern: "dots" | "stripes" | "rings";
}

const ARTICLES: Article[] = [
  {
    slug: "particle-fields",
    category: "Engineering",
    title: "Building responsive particle fields with WebGL",
    blurb:
      "How we render 40k animated dots at 120fps without dropping frames on low-end devices.",
    author: "Lina Rodrigues",
    initials: "LR",
    read: "8 min read",
    hueA: "#fde68a",
    hueB: "#fb7185",
    pattern: "dots",
  },
  {
    slug: "type-system",
    category: "Design",
    title: "Anatomy of a type system you can ship",
    blurb:
      "Three rules we follow when designing modular scales and weight ramps for product UI.",
    author: "Priya Joshi",
    initials: "PJ",
    read: "5 min read",
    hueA: "#a7f3d0",
    hueB: "#3b82f6",
    pattern: "stripes",
  },
  {
    slug: "metrics",
    category: "Product",
    title: "Metrics that don't lie: a guide to honest dashboards",
    blurb:
      "Why we ditched 'engagement' and started measuring time-to-first-value instead.",
    author: "Marc Klein",
    initials: "MK",
    read: "12 min read",
    hueA: "#fbcfe8",
    hueB: "#7c3aed",
    pattern: "rings",
  },
];

export function CardMediaShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="font-heading text-xl">Latest from the journal</h1>
          <p className="text-muted-foreground text-sm">
            Notes from the team on engineering, design, and product.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <Cover article={article} />
      <CardPanel className="p-5">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="font-mono text-[10px] uppercase tracking-wider"
          >
            {article.category}
          </Badge>
          <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground text-xs">
            <ClockIcon className="size-3" />
            {article.read}
          </span>
        </div>
        <h2 className="mt-3 font-heading font-semibold text-lg leading-snug">
          {article.title}
        </h2>
        <p className="mt-1.5 line-clamp-2 text-muted-foreground text-sm">
          {article.blurb}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="bg-muted text-[10px]">
                {article.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground text-xs">{article.author}</span>
          </div>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Save for later"
            className="text-muted-foreground"
          >
            <BookmarkIcon />
          </Button>
        </div>
      </CardPanel>
    </Card>
  );
}

export function Cover({ article }: { article: Article }) {
  const bg = `radial-gradient(120% 100% at 20% 20%, ${article.hueA}, transparent 60%), radial-gradient(120% 100% at 80% 80%, ${article.hueB}, transparent 60%), color-mix(in srgb, var(--muted) 80%, transparent)`;
  return (
    <div className="relative aspect-[16/9] w-full" style={{ background: bg }}>
      <Pattern kind={article.pattern} />
    </div>
  );
}

export function Pattern({ kind }: { kind: "dots" | "stripes" | "rings" }) {
  if (kind === "dots") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 100 56"
        className="absolute inset-0 h-full w-full text-foreground/30 mix-blend-overlay"
      >
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i % 10) * 10 + 5;
          const y = Math.floor(i / 10) * 14 + 7;
          return (
            <circle key={i} cx={x} cy={y} r={0.9} fill="currentColor" />
          );
        })}
      </svg>
    );
  }
  if (kind === "stripes") {
    return (
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, color-mix(in srgb, currentColor 18%, transparent) 0 1px, transparent 1px 12px)",
        }}
      />
    );
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 56"
      className="absolute inset-0 h-full w-full text-foreground/35 mix-blend-overlay"
    >
      {[8, 16, 24, 32].map((r) => (
        <circle
          key={r}
          cx={20}
          cy={56}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}
