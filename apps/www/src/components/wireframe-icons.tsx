type IconProps = { className?: string };

const SVG_PROPS = {
  viewBox: "0 0 80 60",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  xmlns: "http://www.w3.org/2000/svg",
};

/**
 * Frame: window chrome (rounded outer, top bar, traffic-light dots)
 * gives every icon a consistent "this is a UI screen" read.
 */
function Frame({
  children,
  topBarOpacity = 0.5,
}: {
  children: React.ReactNode;
  topBarOpacity?: number;
}) {
  return (
    <>
      <rect x="0.5" y="0.5" width="79" height="59" rx="3.5" className="opacity-30" />
      <line
        x1="0.5"
        y1="6.5"
        x2="79.5"
        y2="6.5"
        style={{ opacity: topBarOpacity }}
      />
      <circle cx="3.5" cy="3.5" r="0.7" fill="currentColor" className="opacity-30" />
      <circle cx="6" cy="3.5" r="0.7" fill="currentColor" className="opacity-30" />
      <circle cx="8.5" cy="3.5" r="0.7" fill="currentColor" className="opacity-30" />
      {children}
    </>
  );
}

export function WireframeSidebar({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Sidebar pane */}
        <rect
          x="1"
          y="7"
          width="22"
          height="52.5"
          fill="currentColor"
          className="opacity-[0.04]"
        />
        <line x1="23" y1="7" x2="23" y2="59.5" className="opacity-40" />

        {/* Workspace switcher */}
        <rect x="4" y="10" width="3" height="3" rx="0.5" fill="currentColor" className="opacity-70" />
        <rect x="8" y="10.5" width="9" height="1.2" rx="0.4" fill="currentColor" className="opacity-60" />
        <rect x="8" y="12.3" width="6" height="0.9" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Section label */}
        <rect x="4" y="17" width="6" height="0.9" rx="0.3" fill="currentColor" className="opacity-35" />

        {/* Nav items */}
        <rect x="4" y="20" width="2" height="2" rx="0.4" className="opacity-50" />
        <rect x="7" y="20.4" width="11" height="1.2" rx="0.4" fill="currentColor" className="opacity-45" />

        {/* Active item with fill */}
        <rect
          x="3"
          y="23.5"
          width="17"
          height="3.2"
          rx="0.8"
          fill="currentColor"
          className="opacity-15"
        />
        <rect x="4" y="24.3" width="2" height="2" rx="0.4" fill="currentColor" className="opacity-80" />
        <rect x="7" y="24.7" width="11" height="1.2" rx="0.4" fill="currentColor" className="opacity-80" />

        <rect x="4" y="28.5" width="2" height="2" rx="0.4" className="opacity-50" />
        <rect x="7" y="28.9" width="9" height="1.2" rx="0.4" fill="currentColor" className="opacity-45" />

        <rect x="4" y="32.5" width="2" height="2" rx="0.4" className="opacity-50" />
        <rect x="7" y="32.9" width="12" height="1.2" rx="0.4" fill="currentColor" className="opacity-45" />

        {/* Section label */}
        <rect x="4" y="38" width="8" height="0.9" rx="0.3" fill="currentColor" className="opacity-35" />

        <rect x="4" y="41" width="2" height="2" rx="0.4" className="opacity-50" />
        <rect x="7" y="41.4" width="10" height="1.2" rx="0.4" fill="currentColor" className="opacity-45" />

        <rect x="4" y="45" width="2" height="2" rx="0.4" className="opacity-50" />
        <rect x="7" y="45.4" width="8" height="1.2" rx="0.4" fill="currentColor" className="opacity-45" />

        {/* User row at bottom */}
        <circle cx="5.5" cy="55" r="1.5" fill="currentColor" className="opacity-50" />
        <rect x="8.5" y="54" width="8" height="1" rx="0.3" fill="currentColor" className="opacity-55" />
        <rect x="8.5" y="55.5" width="5" height="0.8" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Main content placeholder lines */}
        <rect x="27" y="11" width="22" height="1.6" rx="0.4" fill="currentColor" className="opacity-65" />
        <rect x="27" y="14.5" width="44" height="1.1" rx="0.4" fill="currentColor" className="opacity-30" />
        <rect x="27" y="20" width="48" height="14" rx="1.2" fill="currentColor" className="opacity-[0.05]" />
        <rect x="27" y="20" width="48" height="14" rx="1.2" className="opacity-30" />
        <rect x="27" y="38" width="48" height="14" rx="1.2" fill="currentColor" className="opacity-[0.05]" />
        <rect x="27" y="38" width="48" height="14" rx="1.2" className="opacity-30" />
      </Frame>
    </svg>
  );
}

export function WireframeForm({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Title */}
        <rect x="14" y="11" width="20" height="2" rx="0.5" fill="currentColor" className="opacity-70" />
        <rect x="14" y="14.5" width="32" height="1" rx="0.3" fill="currentColor" className="opacity-35" />

        {/* Field 1 (with label + caret cursor focus) */}
        <rect x="14" y="20" width="6" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
        <rect x="14" y="22" width="52" height="5" rx="1" className="opacity-50" />
        <line x1="17" y1="23.5" x2="17" y2="25.5" className="opacity-80" />
        <rect x="19" y="24" width="14" height="1" rx="0.3" fill="currentColor" className="opacity-45" />

        {/* Field 2 */}
        <rect x="14" y="29" width="8" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
        <rect x="14" y="31" width="52" height="5" rx="1" className="opacity-40" />
        <rect x="17" y="33" width="22" height="1" rx="0.3" fill="currentColor" className="opacity-55" />

        {/* Field 3 (select with chevron) */}
        <rect x="14" y="38" width="7" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
        <rect x="14" y="40" width="52" height="5" rx="1" className="opacity-40" />
        <rect x="17" y="42" width="18" height="1" rx="0.3" fill="currentColor" className="opacity-55" />
        <polyline points="61,42 63,44 65,42" className="opacity-60" />

        {/* Footer: cancel + primary */}
        <rect x="40" y="50" width="11" height="4" rx="1" className="opacity-50" />
        <rect x="55" y="50" width="11" height="4" rx="1" fill="currentColor" className="opacity-80" />
      </Frame>
    </svg>
  );
}

export function WireframeAuth({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Left pane (particle field) */}
        <rect
          x="1"
          y="7"
          width="39"
          height="52.5"
          fill="currentColor"
          className="opacity-[0.04]"
        />
        <line x1="40" y1="7" x2="40" y2="59.5" className="opacity-40" />

        {/* Particle dots in concentric arrangement (head/shoulders silhouette feel) */}
        <g fill="currentColor">
          <circle cx="20" cy="22" r="0.6" className="opacity-80" />
          <circle cx="22.5" cy="20" r="0.5" className="opacity-60" />
          <circle cx="17.5" cy="20" r="0.5" className="opacity-60" />
          <circle cx="20" cy="18.5" r="0.4" className="opacity-50" />
          <circle cx="14" cy="24" r="0.45" className="opacity-50" />
          <circle cx="26" cy="24" r="0.45" className="opacity-50" />
          <circle cx="16" cy="28" r="0.45" className="opacity-55" />
          <circle cx="24" cy="28" r="0.45" className="opacity-55" />
          <circle cx="20" cy="30" r="0.5" className="opacity-70" />
          <circle cx="13" cy="32" r="0.4" className="opacity-40" />
          <circle cx="27" cy="32" r="0.4" className="opacity-40" />
          <circle cx="11" cy="36" r="0.4" className="opacity-35" />
          <circle cx="29" cy="36" r="0.4" className="opacity-35" />
          <circle cx="17" cy="38" r="0.45" className="opacity-50" />
          <circle cx="23" cy="38" r="0.45" className="opacity-50" />
          <circle cx="9" cy="42" r="0.35" className="opacity-30" />
          <circle cx="31" cy="42" r="0.35" className="opacity-30" />
          <circle cx="15" cy="46" r="0.35" className="opacity-25" />
          <circle cx="25" cy="46" r="0.35" className="opacity-25" />
        </g>

        {/* Quote block bottom-left */}
        <rect x="6" y="51" width="14" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />
        <rect x="6" y="53" width="22" height="1" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="6" y="55" width="18" height="1" rx="0.3" fill="currentColor" className="opacity-50" />

        {/* Right pane (form) */}
        <rect x="46" y="13" width="14" height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />
        <rect x="46" y="16" width="20" height="2" rx="0.5" fill="currentColor" className="opacity-75" />
        <rect x="46" y="20" width="26" height="1" rx="0.3" fill="currentColor" className="opacity-35" />

        {/* Email field */}
        <rect x="46" y="26" width="6" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
        <rect x="46" y="28" width="28" height="4" rx="1" className="opacity-50" />

        {/* Primary button */}
        <rect x="46" y="34" width="28" height="4" rx="1" fill="currentColor" className="opacity-80" />

        {/* Or separator */}
        <line x1="46" y1="42" x2="56" y2="42" className="opacity-25" />
        <text x="60" y="43" fontSize="2.4" fill="currentColor" className="opacity-40">
          or
        </text>
        <line x1="64" y1="42" x2="74" y2="42" className="opacity-25" />

        {/* OAuth buttons */}
        <rect x="46" y="45" width="28" height="3.6" rx="1" className="opacity-45" />
        <circle cx="48.5" cy="46.8" r="0.7" fill="currentColor" className="opacity-50" />
        <rect x="50.5" y="46.4" width="14" height="0.9" rx="0.3" fill="currentColor" className="opacity-45" />

        <rect x="46" y="50.4" width="28" height="3.6" rx="1" className="opacity-45" />
        <circle cx="48.5" cy="52.2" r="0.7" fill="currentColor" className="opacity-50" />
        <rect x="50.5" y="51.8" width="13" height="0.9" rx="0.3" fill="currentColor" className="opacity-45" />
      </Frame>
    </svg>
  );
}

export function WireframeDashboard({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Title row */}
        <rect x="3" y="10" width="14" height="1.6" rx="0.4" fill="currentColor" className="opacity-70" />
        <rect x="3" y="13" width="22" height="1" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="62" y="10" width="14" height="3" rx="0.8" fill="currentColor" className="opacity-75" />

        {/* Stat cards */}
        {[3, 22, 41, 60].map((x, i) => (
          <g key={x}>
            <rect x={x} y="17" width="16" height="11" rx="1" className="opacity-30" />
            <rect x={x + 1.5} y="19" width="6" height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />
            <rect x={x + 1.5} y="21.5" width="9" height="2.2" rx="0.4" fill="currentColor" className="opacity-75" />
            <polyline
              points={`${x + 1.5},${27 - i} ${x + 4},${26 - i * 0.5} ${x + 7},${26.5 - i} ${x + 10},${25 - i * 0.5} ${x + 14},${24 - i}`}
              className="opacity-55"
            />
          </g>
        ))}

        {/* Main chart card */}
        <rect x="3" y="32" width="48" height="24" rx="1" className="opacity-30" />
        <rect x="5" y="34" width="10" height="1.2" rx="0.3" fill="currentColor" className="opacity-60" />
        <rect x="5" y="36.4" width="14" height="0.9" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Y-axis grid */}
        <line x1="9" y1="42" x2="48" y2="42" className="opacity-15" />
        <line x1="9" y1="46" x2="48" y2="46" className="opacity-15" />
        <line x1="9" y1="50" x2="48" y2="50" className="opacity-15" />

        {/* Bars + line overlay */}
        {[
          [11, 47.5, 2.5],
          [15.5, 45, 5],
          [20, 43.5, 6.5],
          [24.5, 46.5, 3.5],
          [29, 42, 8],
          [33.5, 44, 6],
          [38, 41, 9],
          [42.5, 43.5, 6.5],
        ].map(([x, y, h]) => (
          <rect key={x} x={x} y={y} width="2.5" height={h} rx="0.4" fill="currentColor" className="opacity-55" />
        ))}
        <polyline
          points="12,46 17,43 21,42 26,44 30,40 35,41 39,38 44,40"
          className="opacity-80"
          strokeWidth="1.2"
        />
        <circle cx="39" cy="38" r="0.8" fill="currentColor" className="opacity-90" />

        {/* Side list */}
        <rect x="54" y="32" width="22" height="24" rx="1" className="opacity-30" />
        <rect x="56" y="34" width="11" height="1.2" rx="0.3" fill="currentColor" className="opacity-60" />
        {[37.5, 41.5, 45.5, 49.5, 53.5].map((y) => (
          <g key={y}>
            <circle cx="57" cy={y + 0.8} r="0.9" fill="currentColor" className="opacity-50" />
            <rect x="59.5" y={y} width="9" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
            <rect x="59.5" y={y + 1.5} width="6" height="0.7" rx="0.2" fill="currentColor" className="opacity-30" />
            <rect x="71" y={y + 0.4} width="3" height="1.2" rx="0.3" fill="currentColor" className="opacity-40" />
          </g>
        ))}
      </Frame>
    </svg>
  );
}

export function WireframeTable({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Toolbar */}
        <rect x="3" y="10" width="22" height="3.5" rx="0.8" className="opacity-40" />
        <circle cx="5.5" cy="11.75" r="0.6" className="opacity-50" />
        <rect x="7.5" y="11.2" width="14" height="1.1" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="60" y="10" width="7" height="3.5" rx="0.8" className="opacity-50" />
        <rect x="69" y="10" width="8" height="3.5" rx="0.8" fill="currentColor" className="opacity-75" />

        {/* Header row */}
        <rect
          x="1"
          y="17"
          width="78"
          height="4"
          fill="currentColor"
          className="opacity-[0.06]"
        />
        <line x1="1" y1="21" x2="79" y2="21" className="opacity-30" />
        <rect x="3" y="18.5" width="2" height="1" rx="0.3" className="opacity-40" />
        <rect x="9" y="18.5" width="6" height="1.1" rx="0.3" fill="currentColor" className="opacity-65" />
        <polyline points="16,18.8 17,19.6 18,18.8" className="opacity-50" />
        <rect x="22" y="18.5" width="9" height="1.1" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="38" y="18.5" width="7" height="1.1" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="52" y="18.5" width="8" height="1.1" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="66" y="18.5" width="6" height="1.1" rx="0.3" fill="currentColor" className="opacity-50" />

        {/* Body rows */}
        {[
          { y: 23, status: "ok", striped: false },
          { y: 29, status: "warn", striped: true },
          { y: 35, status: "ok", striped: false },
          { y: 41, status: "ok", striped: true },
          { y: 47, status: "warn", striped: false },
          { y: 53, status: "ok", striped: true },
        ].map(({ y, status, striped }) => (
          <g key={y}>
            {striped ? (
              <rect
                x="1"
                y={y - 0.5}
                width="78"
                height="6"
                fill="currentColor"
                className="opacity-[0.025]"
              />
            ) : null}
            <rect x="3" y={y + 1} width="2" height="2" rx="0.3" className="opacity-30" />
            <circle cx="10" cy={y + 2} r="1.2" fill="currentColor" className="opacity-40" />
            <rect x="13" y={y + 0.8} width="6" height="1" rx="0.3" fill="currentColor" className="opacity-55" />
            <rect x="13" y={y + 2.4} width="4" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />
            <rect x="22" y={y + 1.5} width="14" height="1" rx="0.3" fill="currentColor" className="opacity-45" />
            <rect x="38" y={y + 1.5} width="9" height="1" rx="0.3" fill="currentColor" className="opacity-45" />
            <rect
              x="52"
              y={y + 0.8}
              width="9"
              height="2.4"
              rx="1.2"
              fill="currentColor"
              className={status === "warn" ? "opacity-25" : "opacity-15"}
            />
            <rect
              x="53.5"
              y={y + 1.6}
              width="6"
              height="0.8"
              rx="0.3"
              fill="currentColor"
              className="opacity-70"
            />
            <rect x="66" y={y + 1.5} width="6" height="1" rx="0.3" fill="currentColor" className="opacity-45" />
            <line x1="1" y1={y + 5.2} x2="79" y2={y + 5.2} className="opacity-15" />
          </g>
        ))}
      </Frame>
    </svg>
  );
}

export function WireframeEmptyState({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Dashed empty container */}
        <rect
          x="10"
          y="14"
          width="60"
          height="38"
          rx="2"
          strokeDasharray="2 2"
          className="opacity-25"
        />

        {/* Stacked-paper illustration */}
        <rect
          x="32"
          y="22"
          width="16"
          height="14"
          rx="1"
          fill="currentColor"
          className="opacity-[0.08]"
        />
        <rect x="32" y="22" width="16" height="14" rx="1" className="opacity-40" transform="rotate(-6 40 29)" />
        <rect x="32" y="22" width="16" height="14" rx="1" className="opacity-50" transform="rotate(4 40 29)" />
        <rect x="32" y="22" width="16" height="14" rx="1" className="opacity-70" />
        <rect x="34" y="25" width="8" height="0.9" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="34" y="27" width="11" height="0.9" rx="0.3" fill="currentColor" className="opacity-30" />
        <line x1="34" y1="32" x2="46" y2="32" className="opacity-25" />

        {/* Plus glyph next to stack */}
        <circle cx="50" cy="36" r="2.4" fill="currentColor" className="opacity-15" />
        <line x1="48.6" y1="36" x2="51.4" y2="36" className="opacity-80" />
        <line x1="50" y1="34.6" x2="50" y2="37.4" className="opacity-80" />

        {/* Text + CTA */}
        <rect x="22" y="40" width="36" height="1.8" rx="0.5" fill="currentColor" className="opacity-65" />
        <rect x="28" y="43.5" width="24" height="1" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="30" y="46.5" width="20" height="3.5" rx="1" fill="currentColor" className="opacity-80" />
      </Frame>
    </svg>
  );
}

export function WireframeSettings({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Sub-nav */}
        <rect
          x="1"
          y="7"
          width="20"
          height="52.5"
          fill="currentColor"
          className="opacity-[0.04]"
        />
        <line x1="21" y1="7" x2="21" y2="59.5" className="opacity-40" />
        <rect x="3" y="11" width="9" height="1" rx="0.3" fill="currentColor" className="opacity-40" />
        <rect
          x="2.5"
          y="14"
          width="17"
          height="3"
          rx="0.7"
          fill="currentColor"
          className="opacity-15"
        />
        <rect x="4" y="15" width="10" height="1" rx="0.3" fill="currentColor" className="opacity-80" />
        <rect x="4" y="19.5" width="11" height="1" rx="0.3" fill="currentColor" className="opacity-45" />
        <rect x="4" y="23.5" width="9" height="1" rx="0.3" fill="currentColor" className="opacity-45" />
        <rect x="4" y="27.5" width="12" height="1" rx="0.3" fill="currentColor" className="opacity-45" />
        <rect x="4" y="31.5" width="10" height="1" rx="0.3" fill="currentColor" className="opacity-45" />
        <rect x="4" y="35.5" width="8" height="1" rx="0.3" fill="currentColor" className="opacity-45" />

        {/* Right pane title */}
        <rect x="25" y="11" width="22" height="2" rx="0.5" fill="currentColor" className="opacity-75" />
        <rect x="25" y="14.5" width="38" height="1" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Setting row 1 (toggle on) */}
        <rect x="25" y="20" width="50" height="7" rx="1" className="opacity-30" />
        <rect x="27" y="22" width="14" height="1.2" rx="0.3" fill="currentColor" className="opacity-65" />
        <rect x="27" y="24.4" width="26" height="1" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="68" y="22.5" width="6" height="2.5" rx="1.25" fill="currentColor" className="opacity-80" />
        <circle cx="72.5" cy="23.75" r="0.95" fill="currentColor" className="text-background" stroke="none" />

        {/* Setting row 2 (toggle off) */}
        <rect x="25" y="29" width="50" height="7" rx="1" className="opacity-30" />
        <rect x="27" y="31" width="11" height="1.2" rx="0.3" fill="currentColor" className="opacity-65" />
        <rect x="27" y="33.4" width="22" height="1" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="68" y="31.5" width="6" height="2.5" rx="1.25" className="opacity-50" />
        <circle cx="69.5" cy="32.75" r="0.95" className="opacity-60" />

        {/* Setting row 3 (select) */}
        <rect x="25" y="38" width="50" height="7" rx="1" className="opacity-30" />
        <rect x="27" y="40" width="9" height="1.2" rx="0.3" fill="currentColor" className="opacity-65" />
        <rect x="27" y="42.4" width="20" height="1" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="61" y="40.5" width="13" height="2.5" rx="0.6" className="opacity-50" />
        <rect x="63" y="41.4" width="7" height="0.7" rx="0.2" fill="currentColor" className="opacity-50" />
        <polyline points="71,41.5 72,42.4 73,41.5" className="opacity-60" />

        {/* Footer save bar */}
        <rect x="25" y="50" width="50" height="6" rx="1" fill="currentColor" className="opacity-[0.06]" />
        <rect x="25" y="50" width="50" height="6" rx="1" className="opacity-30" />
        <rect x="27" y="51.8" width="20" height="0.9" rx="0.3" fill="currentColor" className="opacity-45" />
        <rect x="27" y="53.4" width="14" height="0.7" rx="0.2" fill="currentColor" className="opacity-25" />
        <rect x="55" y="51.5" width="8" height="3" rx="0.7" className="opacity-50" />
        <rect x="65" y="51.5" width="8" height="3" rx="0.7" fill="currentColor" className="opacity-80" />
      </Frame>
    </svg>
  );
}

export function WireframeFilters({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Title */}
        <rect x="3" y="10" width="14" height="1.5" rx="0.4" fill="currentColor" className="opacity-65" />
        <rect x="3" y="12.8" width="20" height="1" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Search input */}
        <rect x="3" y="17" width="22" height="4" rx="1" className="opacity-40" />
        <circle cx="5.5" cy="19" r="0.7" className="opacity-50" />
        <rect x="7.5" y="18.5" width="10" height="1" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Pill row (faceted filters) */}
        <rect x="28" y="17" width="9" height="4" rx="2" className="opacity-50" />
        <rect x="30" y="18.6" width="5" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
        <polyline points="33,20 33.6,20.6 34.2,20" className="opacity-50" />

        <rect x="39" y="17" width="11" height="4" rx="2" fill="currentColor" className="opacity-15" />
        <rect x="39" y="17" width="11" height="4" rx="2" className="opacity-50" />
        <circle cx="41.5" cy="19" r="0.6" fill="currentColor" className="opacity-65" />
        <rect x="43" y="18.6" width="5" height="0.9" rx="0.3" fill="currentColor" className="opacity-65" />

        <rect x="52" y="17" width="9" height="4" rx="2" className="opacity-50" />
        <rect x="54" y="18.6" width="5" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />

        <rect x="63" y="17" width="9" height="4" rx="2" className="opacity-50" />
        <rect x="65" y="18.6" width="5" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />

        {/* Active filter chips row */}
        <rect x="3" y="24" width="6" height="0.9" rx="0.3" fill="currentColor" className="opacity-35" />
        <rect x="11" y="23.5" width="14" height="3.4" rx="1.7" fill="currentColor" className="opacity-15" />
        <rect x="11" y="23.5" width="14" height="3.4" rx="1.7" className="opacity-40" />
        <rect x="13" y="24.8" width="3" height="0.9" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="16.5" y="24.8" width="6" height="0.9" rx="0.3" fill="currentColor" className="opacity-70" />
        <line x1="22.6" y1="24.6" x2="23.4" y2="25.6" className="opacity-60" />
        <line x1="23.4" y1="24.6" x2="22.6" y2="25.6" className="opacity-60" />

        <rect x="27" y="23.5" width="16" height="3.4" rx="1.7" fill="currentColor" className="opacity-15" />
        <rect x="27" y="23.5" width="16" height="3.4" rx="1.7" className="opacity-40" />
        <rect x="29" y="24.8" width="4" height="0.9" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="33.5" y="24.8" width="7" height="0.9" rx="0.3" fill="currentColor" className="opacity-70" />
        <line x1="40.6" y1="24.6" x2="41.4" y2="25.6" className="opacity-60" />
        <line x1="41.4" y1="24.6" x2="40.6" y2="25.6" className="opacity-60" />

        <rect x="45" y="23.5" width="11" height="3.4" rx="1.7" className="opacity-30" />
        <rect x="47" y="24.8" width="7" height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />

        {/* Popover dropdown (faceted filter open) */}
        <rect
          x="38"
          y="30"
          width="26"
          height="26"
          rx="1.5"
          fill="currentColor"
          className="opacity-[0.04]"
        />
        <rect x="38" y="30" width="26" height="26" rx="1.5" className="opacity-50" />
        <rect x="40" y="32" width="22" height="3" rx="0.6" className="opacity-40" />
        <circle cx="41.5" cy="33.5" r="0.6" className="opacity-50" />
        <rect x="43" y="33.1" width="9" height="0.8" rx="0.3" fill="currentColor" className="opacity-40" />
        <line x1="40" y1="36.5" x2="62" y2="36.5" className="opacity-25" />

        {[38, 41, 44, 47, 50].map((y, i) => (
          <g key={y}>
            <rect
              x="40.5"
              y={y}
              width="2"
              height="2"
              rx="0.4"
              fill={i < 2 ? "currentColor" : "none"}
              className={i < 2 ? "opacity-80" : "opacity-50"}
            />
            <rect
              x="44"
              y={y + 0.3}
              width={[10, 8, 11, 7, 9][i]}
              height="1.2"
              rx="0.3"
              fill="currentColor"
              className={i < 2 ? "opacity-65" : "opacity-45"}
            />
            <rect
              x="58"
              y={y + 0.5}
              width="3"
              height="0.9"
              rx="0.3"
              fill="currentColor"
              className="opacity-25"
            />
          </g>
        ))}
        <line x1="40" y1="53" x2="62" y2="53" className="opacity-25" />
        <rect x="40" y="53.6" width="9" height="0.9" rx="0.3" fill="currentColor" className="opacity-35" />
        <rect x="56" y="53.6" width="5" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />

        {/* Sliders panel (left) */}
        <rect x="3" y="32" width="32" height="6" rx="0.6" className="opacity-30" />
        <rect x="4" y="33.5" width="6" height="0.8" rx="0.3" fill="currentColor" className="opacity-45" />
        <rect x="4" y="35.4" width="9" height="0.8" rx="0.3" fill="currentColor" className="opacity-30" />
        <line x1="20" y1="35" x2="33" y2="35" className="opacity-25" strokeWidth="1.5" />
        <line x1="20" y1="35" x2="27" y2="35" className="opacity-65" strokeWidth="1.5" />
        <circle cx="27" cy="35" r="1" fill="currentColor" className="opacity-80" />

        <rect x="3" y="40" width="32" height="6" rx="0.6" className="opacity-30" />
        <rect x="4" y="41.5" width="8" height="0.8" rx="0.3" fill="currentColor" className="opacity-45" />
        <rect x="4" y="43.4" width="11" height="0.8" rx="0.3" fill="currentColor" className="opacity-30" />
        {/* Toggle on */}
        <rect x="28" y="42" width="5" height="2.2" rx="1.1" fill="currentColor" className="opacity-80" />
        <circle cx="31.5" cy="43.1" r="0.85" fill="currentColor" className="text-background" stroke="none" />

        {/* Apply / clear actions */}
        <rect x="3" y="50" width="10" height="4" rx="0.8" className="opacity-40" />
        <rect x="5" y="51.6" width="6" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
        <rect x="15" y="50" width="10" height="4" rx="0.8" fill="currentColor" className="opacity-80" />
        <rect x="17" y="51.6" width="6" height="0.9" rx="0.3" fill="currentColor" className="text-background" stroke="none" />
      </Frame>
    </svg>
  );
}

export function WireframeCard({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Section title */}
        <rect x="3" y="10" width="14" height="1.5" rx="0.4" fill="currentColor" className="opacity-65" />
        <rect x="3" y="12.8" width="20" height="1" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Card 1 */}
        <rect x="3" y="17" width="23" height="38" rx="1.2" className="opacity-35" />
        <rect
          x="4.5"
          y="18.5"
          width="20"
          height="13"
          rx="0.8"
          fill="currentColor"
          className="opacity-[0.08]"
        />
        <circle cx="14.5" cy="25" r="2.4" fill="currentColor" className="opacity-30" />
        <path
          d="M4.5 31.5 L9 27 L13 30 L17.5 25.5 L24.5 31.5 Z"
          fill="currentColor"
          className="opacity-25"
        />
        <rect x="4.5" y="34" width="6" height="0.8" rx="0.2" fill="currentColor" className="opacity-40" />
        <rect x="4.5" y="36" width="14" height="1.4" rx="0.4" fill="currentColor" className="opacity-65" />
        <rect x="4.5" y="38.5" width="18" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />
        <rect x="4.5" y="40" width="16" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />
        {/* Footer: avatar + button */}
        <circle cx="6" cy="51" r="1.4" fill="currentColor" className="opacity-50" />
        <rect x="8.5" y="50.2" width="7" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
        <rect x="18" y="49" width="6" height="3.5" rx="0.8" fill="currentColor" className="opacity-80" />

        {/* Card 2 */}
        <rect x="29" y="17" width="23" height="38" rx="1.2" className="opacity-30" />
        <rect
          x="30.5"
          y="18.5"
          width="20"
          height="13"
          rx="0.8"
          fill="currentColor"
          className="opacity-[0.05]"
        />
        <rect x="30.5" y="34" width="5" height="0.8" rx="0.2" fill="currentColor" className="opacity-40" />
        <rect x="30.5" y="36" width="12" height="1.4" rx="0.4" fill="currentColor" className="opacity-55" />
        <rect x="30.5" y="38.5" width="18" height="0.8" rx="0.2" fill="currentColor" className="opacity-25" />
        <rect x="30.5" y="40" width="14" height="0.8" rx="0.2" fill="currentColor" className="opacity-25" />
        <circle cx="32" cy="51" r="1.4" fill="currentColor" className="opacity-50" />
        <rect x="34.5" y="50.2" width="7" height="0.9" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="44" y="49" width="6" height="3.5" rx="0.8" className="opacity-50" />

        {/* Card 3 */}
        <rect x="55" y="17" width="22" height="38" rx="1.2" className="opacity-25" />
        <rect
          x="56.5"
          y="18.5"
          width="19"
          height="13"
          rx="0.8"
          fill="currentColor"
          className="opacity-[0.04]"
        />
        <rect x="56.5" y="34" width="5" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />
        <rect x="56.5" y="36" width="11" height="1.4" rx="0.4" fill="currentColor" className="opacity-45" />
        <rect x="56.5" y="38.5" width="17" height="0.8" rx="0.2" fill="currentColor" className="opacity-20" />
        <rect x="56.5" y="40" width="13" height="0.8" rx="0.2" fill="currentColor" className="opacity-20" />
      </Frame>
    </svg>
  );
}

export function WireframeModals({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Backdrop overlay */}
        <rect x="1" y="7" width="78" height="52.5" fill="currentColor" className="opacity-[0.05]" />

        {/* Background page hint */}
        <rect x="6" y="11" width="14" height="1.2" rx="0.3" fill="currentColor" className="opacity-25" />
        <rect x="6" y="14" width="22" height="0.9" rx="0.3" fill="currentColor" className="opacity-15" />
        <rect x="6" y="17" width="20" height="0.9" rx="0.3" fill="currentColor" className="opacity-15" />

        {/* Dialog card */}
        <rect x="18" y="18" width="44" height="32" rx="2" fill="currentColor" className="opacity-[0.06]" />
        <rect x="18" y="18" width="44" height="32" rx="2" className="opacity-60" />

        {/* Dialog header */}
        <rect x="21" y="22" width="18" height="1.6" rx="0.4" fill="currentColor" className="opacity-75" />
        <line x1="56" y1="22" x2="60" y2="26" className="opacity-50" />
        <line x1="60" y1="22" x2="56" y2="26" className="opacity-50" />
        <rect x="21" y="25.5" width="32" height="1" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Dialog body */}
        <rect x="21" y="29" width="38" height="4" rx="0.8" className="opacity-40" />
        <rect x="23" y="30.6" width="18" height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />

        <rect x="21" y="35" width="38" height="4" rx="0.8" className="opacity-40" />
        <rect x="23" y="36.6" width="22" height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />

        {/* Dialog footer */}
        <line x1="18" y1="42" x2="62" y2="42" className="opacity-25" />
        <rect x="36" y="44.5" width="10" height="3.5" rx="0.8" className="opacity-50" />
        <rect x="48" y="44.5" width="12" height="3.5" rx="0.8" fill="currentColor" className="opacity-80" />
      </Frame>
    </svg>
  );
}

export function WireframeCharts({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Title */}
        <rect x="3" y="10" width="14" height="1.5" rx="0.4" fill="currentColor" className="opacity-65" />
        <rect x="3" y="12.8" width="20" height="1" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Top chart card: line + area */}
        <rect x="3" y="17" width="48" height="22" rx="1.2" className="opacity-30" />
        <line x1="6" y1="36" x2="48" y2="36" className="opacity-25" />
        <line x1="6" y1="32" x2="48" y2="32" className="opacity-15" />
        <line x1="6" y1="28" x2="48" y2="28" className="opacity-15" />
        <line x1="6" y1="24" x2="48" y2="24" className="opacity-15" />
        <path
          d="M6 33 L11 30 L16 32 L22 27 L28 28 L34 23 L40 25 L46 21 L48 21 L48 36 L6 36 Z"
          fill="currentColor"
          className="opacity-[0.12]"
        />
        <polyline
          points="6,33 11,30 16,32 22,27 28,28 34,23 40,25 46,21"
          className="opacity-90"
          strokeWidth="1.3"
        />
        <circle cx="46" cy="21" r="0.9" fill="currentColor" className="opacity-90" />

        {/* Right donut card */}
        <rect x="54" y="17" width="22" height="22" rx="1.2" className="opacity-30" />
        <circle cx="65" cy="28" r="6" className="opacity-20" strokeWidth="2" />
        <path
          d="M65 22 A 6 6 0 0 1 71 28"
          className="opacity-90"
          strokeWidth="2"
        />
        <path
          d="M71 28 A 6 6 0 0 1 67 33.5"
          className="opacity-55"
          strokeWidth="2"
        />
        <text x="63" y="29.5" fontSize="2.4" fill="currentColor" className="opacity-70">62%</text>

        {/* Bar chart bottom */}
        <rect x="3" y="42" width="73" height="14" rx="1.2" className="opacity-30" />
        {[6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72].map((x, i) => {
          const heights = [4, 6, 5, 8, 7, 9, 6, 10, 8, 7, 9, 6];
          const h = heights[i];
          return (
            <rect
              key={x}
              x={x - 1.5}
              y={54 - h}
              width="3"
              height={h}
              rx="0.4"
              fill="currentColor"
              className={i === 7 ? "opacity-90" : "opacity-50"}
            />
          );
        })}
      </Frame>
    </svg>
  );
}

export function WireframeTimelines({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Title */}
        <rect x="3" y="10" width="16" height="1.6" rx="0.4" fill="currentColor" className="opacity-70" />
        <rect x="3" y="13" width="22" height="1" rx="0.3" fill="currentColor" className="opacity-30" />

        {/* Vertical rail */}
        <line x1="9" y1="20" x2="9" y2="56" className="opacity-30" />

        {/* Events */}
        {[20, 28, 36, 44, 52].map((y, i) => (
          <g key={y}>
            <circle
              cx="9"
              cy={y}
              r={i === 0 ? 1.6 : 1.1}
              fill={i === 0 ? "currentColor" : "none"}
              className={i === 0 ? "opacity-90" : "opacity-60"}
            />
            <rect
              x="14"
              y={y - 1.2}
              width={[18, 16, 22, 14, 20][i]}
              height="1.4"
              rx="0.4"
              fill="currentColor"
              className={i === 0 ? "opacity-75" : "opacity-55"}
            />
            <rect
              x="14"
              y={y + 0.8}
              width={[28, 22, 30, 18, 24][i]}
              height="0.9"
              rx="0.3"
              fill="currentColor"
              className="opacity-30"
            />
            <rect
              x="64"
              y={y - 1}
              width="12"
              height="1.1"
              rx="0.3"
              fill="currentColor"
              className="opacity-30"
            />
          </g>
        ))}
      </Frame>
    </svg>
  );
}

export function WireframeCalendars({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Title */}
        <rect x="3" y="10" width="14" height="1.6" rx="0.4" fill="currentColor" className="opacity-70" />
        <rect x="60" y="10" width="6" height="3" rx="0.6" className="opacity-50" />
        <rect x="68" y="10" width="8" height="3" rx="0.6" fill="currentColor" className="opacity-75" />

        {/* Day headers */}
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <text
            key={i}
            x={5 + i * 10.5}
            y="19"
            fontSize="2.2"
            fill="currentColor"
            className="opacity-40"
          >
            {d}
          </text>
        ))}
        <line x1="3" y1="20.5" x2="76" y2="20.5" className="opacity-25" />

        {/* Calendar grid (6 rows × 7 cols) */}
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 7 }).map((_, col) => {
            const i = row * 7 + col;
            const x = 3 + col * 10.5;
            const y = 22 + row * 7;
            const isActive = i === 17;
            const hasEvent = [3, 8, 12, 17, 22, 25, 28].includes(i);
            return (
              <g key={i}>
                {isActive ? (
                  <rect
                    x={x + 0.5}
                    y={y}
                    width="9"
                    height="6.5"
                    rx="0.6"
                    fill="currentColor"
                    className="opacity-80"
                  />
                ) : null}
                <text
                  x={x + 1.5}
                  y={y + 2.5}
                  fontSize="2"
                  fill="currentColor"
                  className={isActive ? "text-background opacity-100" : "opacity-55"}
                >
                  {i + 1}
                </text>
                {hasEvent && !isActive ? (
                  <rect
                    x={x + 1}
                    y={y + 4}
                    width={[6, 4, 7, 5, 6, 4, 5][i % 7]}
                    height="1"
                    rx="0.3"
                    fill="currentColor"
                    className="opacity-50"
                  />
                ) : null}
                {i === 12 ? (
                  <rect
                    x={x + 1}
                    y={y + 5.4}
                    width="5"
                    height="1"
                    rx="0.3"
                    fill="currentColor"
                    className="opacity-30"
                  />
                ) : null}
              </g>
            );
          })
        )}
      </Frame>
    </svg>
  );
}

export function WireframeProfile({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Cover banner */}
        <rect
          x="1"
          y="7"
          width="78"
          height="14"
          fill="currentColor"
          className="opacity-[0.08]"
        />
        <line x1="1" y1="21" x2="79" y2="21" className="opacity-30" />

        {/* Avatar */}
        <circle cx="14" cy="22" r="6" fill="currentColor" className="opacity-15" />
        <circle cx="14" cy="22" r="6" className="opacity-50" strokeWidth="1.2" />
        <circle cx="14" cy="20" r="2" fill="currentColor" className="opacity-50" />
        <path d="M9 26 Q14 22 19 26" fill="currentColor" className="opacity-50" />

        {/* Identity */}
        <rect x="22" y="24" width="14" height="1.8" rx="0.4" fill="currentColor" className="opacity-75" />
        <rect x="22" y="27" width="22" height="1" rx="0.3" fill="currentColor" className="opacity-35" />
        <rect x="22" y="29.5" width="8" height="2" rx="1" fill="currentColor" className="opacity-15" />
        <rect x="22" y="29.5" width="8" height="2" rx="1" className="opacity-50" />
        <rect x="32" y="29.5" width="9" height="2" rx="1" fill="currentColor" className="opacity-15" />
        <rect x="32" y="29.5" width="9" height="2" rx="1" className="opacity-50" />

        {/* CTA buttons */}
        <rect x="56" y="24" width="9" height="3.5" rx="0.8" className="opacity-50" />
        <rect x="67" y="24" width="9" height="3.5" rx="0.8" fill="currentColor" className="opacity-80" />

        {/* Tabs */}
        <line x1="3" y1="36" x2="76" y2="36" className="opacity-25" />
        <rect x="3" y="33.5" width="8" height="1.2" rx="0.3" fill="currentColor" className="opacity-75" />
        <line x1="3" y1="36" x2="11" y2="36" className="opacity-90" strokeWidth="1.2" />
        <rect x="14" y="33.5" width="9" height="1.2" rx="0.3" fill="currentColor" className="opacity-40" />
        <rect x="26" y="33.5" width="7" height="1.2" rx="0.3" fill="currentColor" className="opacity-40" />
        <rect x="36" y="33.5" width="10" height="1.2" rx="0.3" fill="currentColor" className="opacity-40" />

        {/* Content cards */}
        <rect x="3" y="40" width="35" height="16" rx="1" className="opacity-30" />
        <rect x="5" y="42" width="10" height="1.1" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="5" y="44.4" width="20" height="0.9" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="5" y="46.4" width="22" height="0.9" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="5" y="48.4" width="18" height="0.9" rx="0.3" fill="currentColor" className="opacity-30" />
        {[5, 11, 17, 23].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy="53"
            r="1.4"
            fill="currentColor"
            className={`opacity-${[60, 50, 40, 30][i]}`}
          />
        ))}

        <rect x="41" y="40" width="35" height="16" rx="1" className="opacity-30" />
        <rect x="43" y="42" width="9" height="1.1" rx="0.3" fill="currentColor" className="opacity-50" />
        <rect x="43" y="44.4" width="14" height="0.9" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="43" y="47" width="14" height="3" rx="0.6" fill="currentColor" className="opacity-15" />
        <rect x="43" y="47" width="14" height="3" rx="0.6" className="opacity-40" />
        <rect x="59" y="47" width="14" height="3" rx="0.6" className="opacity-30" />
      </Frame>
    </svg>
  );
}

export function WireframeToasts({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Faded app behind */}
        <rect x="3" y="11" width="40" height="2" rx="0.4" fill="currentColor" className="opacity-20" />
        <rect x="3" y="15" width="32" height="1.2" rx="0.3" fill="currentColor" className="opacity-15" />
        <rect x="3" y="20" width="50" height="14" rx="1" className="opacity-15" />
        <rect x="3" y="38" width="38" height="1.2" rx="0.3" fill="currentColor" className="opacity-15" />
        <rect x="3" y="42" width="44" height="1.2" rx="0.3" fill="currentColor" className="opacity-15" />

        {/* Stacked toasts top-right */}
        <rect x="50" y="11" width="27" height="6" rx="1" fill="currentColor" className="opacity-[0.06]" />
        <rect x="50" y="11" width="27" height="6" rx="1" className="opacity-50" />
        <circle cx="53" cy="14" r="1" fill="currentColor" className="opacity-80" />
        <rect x="55.5" y="12.5" width="13" height="1" rx="0.3" fill="currentColor" className="opacity-70" />
        <rect x="55.5" y="14.4" width="18" height="0.8" rx="0.2" fill="currentColor" className="opacity-40" />

        <rect x="50" y="19" width="27" height="6" rx="1" fill="currentColor" className="opacity-[0.06]" />
        <rect x="50" y="19" width="27" height="6" rx="1" className="opacity-50" />
        <circle cx="53" cy="22" r="1" fill="currentColor" className="opacity-65" />
        <rect x="55.5" y="20.5" width="11" height="1" rx="0.3" fill="currentColor" className="opacity-65" />
        <rect x="55.5" y="22.4" width="16" height="0.8" rx="0.2" fill="currentColor" className="opacity-35" />
        <rect x="69" y="20.6" width="6" height="2.2" rx="0.4" fill="currentColor" className="opacity-70" />

        <rect x="50" y="27" width="27" height="6" rx="1" fill="currentColor" className="opacity-[0.04]" />
        <rect x="50" y="27" width="27" height="6" rx="1" className="opacity-30" />
        <circle cx="53" cy="30" r="1" fill="currentColor" className="opacity-45" />
        <rect x="55.5" y="28.5" width="13" height="1" rx="0.3" fill="currentColor" className="opacity-45" />

        {/* Bottom banner */}
        <rect x="2" y="48" width="76" height="6" rx="1" fill="currentColor" className="opacity-[0.06]" />
        <rect x="2" y="48" width="76" height="6" rx="1" className="opacity-40" />
        <circle cx="6" cy="51" r="1.1" fill="currentColor" className="opacity-70" />
        <rect x="9" y="49.4" width="22" height="1.1" rx="0.3" fill="currentColor" className="opacity-70" />
        <rect x="9" y="51.5" width="34" height="0.9" rx="0.3" fill="currentColor" className="opacity-35" />
        <rect x="68" y="49.6" width="8" height="2.5" rx="0.5" fill="currentColor" className="opacity-70" />
      </Frame>
    </svg>
  );
}

export function WireframePricing({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Heading row */}
        <rect x="22" y="10" width="36" height="2" rx="0.5" fill="currentColor" className="opacity-70" />
        <rect x="29" y="14" width="22" height="1.1" rx="0.3" fill="currentColor" className="opacity-35" />

        {/* 3 pricing columns */}
        {[3, 28, 53].map((x, i) => (
          <g key={x}>
            <rect x={x} y="20" width="24" height="35" rx="1.5" className={i === 1 ? "opacity-70" : "opacity-30"} />
            {i === 1 ? (
              <rect x={x} y="20" width="24" height="35" rx="1.5" fill="currentColor" className="opacity-[0.05]" />
            ) : null}
            {/* Tier name */}
            <rect x={x + 2} y="22.5" width="8" height="0.9" rx="0.3" fill="currentColor" className="opacity-60" />
            {/* Price */}
            <rect x={x + 2} y="25.5" width="10" height="3" rx="0.4" fill="currentColor" className={i === 1 ? "opacity-85" : "opacity-65"} />
            <rect x={x + 13} y="27.5" width="6" height="1" rx="0.3" fill="currentColor" className="opacity-30" />
            {/* Feature checks */}
            {[32, 35.5, 39, 42.5, 46].map((y, j) => (
              <g key={y}>
                <circle cx={x + 3} cy={y} r="0.7" fill="currentColor" className="opacity-50" />
                <rect x={x + 5} y={y - 0.5} width={[14, 16, 12, 18, 14][j]} height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />
              </g>
            ))}
            {/* CTA */}
            <rect x={x + 2} y="50" width="20" height="3.5" rx="0.7" fill="currentColor" className={i === 1 ? "opacity-80" : "opacity-15"} />
            <rect x={x + 2} y="50" width="20" height="3.5" rx="0.7" className={i === 1 ? "opacity-80" : "opacity-50"} />
          </g>
        ))}
      </Frame>
    </svg>
  );
}

export function WireframeTours({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Faded app shell */}
        <line x1="20" y1="7" x2="20" y2="59.5" className="opacity-25" />
        <rect x="22" y="11" width="54" height="2" rx="0.4" fill="currentColor" className="opacity-20" />
        <rect x="22" y="15" width="40" height="1.2" rx="0.3" fill="currentColor" className="opacity-15" />
        <rect x="22" y="22" width="54" height="14" rx="1" className="opacity-15" />

        {/* Spotlight cutout (highlighting target) */}
        <rect x="40" y="36" width="20" height="6" rx="1" fill="currentColor" className="opacity-[0.04]" />
        <rect x="40" y="36" width="20" height="6" rx="1" className="opacity-90" strokeDasharray="2 1" />

        {/* Pulsing beacon */}
        <circle cx="50" cy="39" r="3" fill="currentColor" className="opacity-15" />
        <circle cx="50" cy="39" r="1.5" fill="currentColor" className="opacity-90" />

        {/* Tooltip */}
        <path d="M50 44 L48 47 L52 47 Z" fill="currentColor" className="opacity-95" />
        <rect x="32" y="47" width="38" height="11" rx="1.2" fill="currentColor" className="opacity-95" />
        <rect x="34" y="49" width="14" height="1" rx="0.3" fill="currentColor" className="opacity-30" />
        <rect x="34" y="51" width="20" height="0.8" rx="0.2" fill="currentColor" className="opacity-25" />
        <rect x="34" y="52.5" width="22" height="0.8" rx="0.2" fill="currentColor" className="opacity-25" />
        {/* Step dots */}
        <circle cx="34" cy="56" r="0.5" fill="currentColor" className="opacity-25" />
        <circle cx="36" cy="56" r="0.5" fill="currentColor" className="opacity-25" />
        <circle cx="38" cy="56" r="0.7" fill="currentColor" className="opacity-95" />
        <circle cx="40" cy="56" r="0.5" fill="currentColor" className="opacity-25" />
        <rect x="62" y="55" width="6" height="2" rx="0.3" fill="currentColor" className="opacity-30" />
      </Frame>
    </svg>
  );
}

export function WireframeThreads({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <Frame>
        {/* Comment 1 */}
        <circle cx="6" cy="13" r="2" fill="currentColor" className="opacity-65" />
        <rect x="10" y="11" width="40" height="14" rx="1" fill="currentColor" className="opacity-[0.04]" />
        <rect x="10" y="11" width="40" height="14" rx="1" className="opacity-30" />
        <rect x="12" y="13" width="9" height="1" rx="0.3" fill="currentColor" className="opacity-65" />
        <rect x="22" y="13" width="6" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />
        <rect x="12" y="15.5" width="34" height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />
        <rect x="12" y="17.5" width="30" height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />
        <rect x="12" y="19.5" width="22" height="0.9" rx="0.3" fill="currentColor" className="opacity-40" />
        {/* Reactions */}
        <rect x="12" y="22" width="6" height="2" rx="1" fill="currentColor" className="opacity-15" />
        <rect x="19" y="22" width="6" height="2" rx="1" fill="currentColor" className="opacity-15" />

        {/* Comment 2 (indented reply) */}
        <line x1="7" y1="27" x2="7" y2="38" className="opacity-25" />
        <circle cx="14" cy="32" r="1.6" fill="currentColor" className="opacity-50" />
        <rect x="17" y="29" width="33" height="11" rx="1" className="opacity-30" />
        <rect x="19" y="30.5" width="8" height="0.9" rx="0.3" fill="currentColor" className="opacity-55" />
        <rect x="19" y="32.5" width="28" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />
        <rect x="19" y="34" width="24" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />
        <rect x="19" y="36" width="20" height="0.8" rx="0.2" fill="currentColor" className="opacity-30" />

        {/* Compose box */}
        <rect x="4" y="42" width="46" height="13" rx="1" fill="currentColor" className="opacity-[0.05]" />
        <rect x="4" y="42" width="46" height="13" rx="1" className="opacity-40" />
        <rect x="6" y="44" width="20" height="0.9" rx="0.3" fill="currentColor" className="opacity-35" />
        <rect x="6" y="46" width="28" height="0.8" rx="0.2" fill="currentColor" className="opacity-25" />
        {/* Toolbar */}
        <line x1="6" y1="50" x2="48" y2="50" className="opacity-20" />
        {[7, 11, 15, 19].map((x) => (
          <circle key={x} cx={x} cy="52.5" r="0.7" fill="currentColor" className="opacity-40" />
        ))}
        <rect x="40" y="51.5" width="7" height="2.5" rx="0.4" fill="currentColor" className="opacity-80" />

        {/* Side participants */}
        <rect x="54" y="11" width="22" height="44" rx="1" fill="currentColor" className="opacity-[0.04]" />
        <rect x="54" y="11" width="22" height="44" rx="1" className="opacity-25" />
        <rect x="56" y="14" width="10" height="0.9" rx="0.3" fill="currentColor" className="opacity-45" />
        {[18, 24, 30, 36].map((y) => (
          <g key={y}>
            <circle cx="58" cy={y} r="1.4" fill="currentColor" className="opacity-50" />
            <rect x="61" y={y - 0.5} width="12" height="0.8" rx="0.2" fill="currentColor" className="opacity-40" />
            <rect x="61" y={y + 0.7} width="8" height="0.6" rx="0.2" fill="currentColor" className="opacity-25" />
          </g>
        ))}
      </Frame>
    </svg>
  );
}

