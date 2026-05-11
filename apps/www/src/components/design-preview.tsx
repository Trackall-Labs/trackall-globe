import { useState } from "react";
import type { ComponentType } from "react";

export interface DesignPreviewProps {
  category: string;
  design: string;
  /** Always rendered until the snapshot loads, and stays as the visual
   *  if no snapshot exists yet (or `iconOnly` is set). */
  Fallback: ComponentType<{ className?: string }>;
  /** Skip the snapshot lookup entirely and just render the fallback. */
  iconOnly?: boolean;
}

export function DesignPreview({
  category,
  design,
  Fallback,
  iconOnly,
}: DesignPreviewProps) {
  const [lightFailed, setLightFailed] = useState(false);
  const [darkFailed, setDarkFailed] = useState(false);
  const lightSrc = `/previews/${category}__${design}--light.png`;
  const darkSrc = `/previews/${category}__${design}--dark.png`;
  const showLight = !iconOnly && !lightFailed;
  const showDark = !iconOnly && !darkFailed;
  const showFallback = iconOnly || (lightFailed && darkFailed);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-border/60 bg-background/60">
      {showLight ? (
        <img
          src={lightSrc}
          alt=""
          loading="eager"
          decoding="async"
          onError={() => setLightFailed(true)}
          className="absolute inset-0 block h-full w-full object-cover object-top dark:hidden"
        />
      ) : null}

      {showDark ? (
        <img
          src={darkSrc}
          alt=""
          loading="eager"
          decoding="async"
          onError={() => setDarkFailed(true)}
          className="absolute inset-0 hidden h-full w-full object-cover object-top dark:block"
        />
      ) : null}

      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Fallback className="h-full w-full text-foreground/70" />
        </div>
      ) : null}
    </div>
  );
}
