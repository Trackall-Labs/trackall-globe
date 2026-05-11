import { CopyIcon, ShieldCheckIcon, XIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";

const RECOVERY = [
  "ZQX-PT4-9KH",
  "BMC-W2L-31R",
  "VEY-RF8-Q2A",
  "JTH-HM5-LD9",
  "WPN-S62-XB7",
  "DKE-9F3-VNL",
  "GRY-7XP-MK2",
  "TRC-J21-AZ4",
];

export function ModalsTwoFactorShowcasePage() {
  return (
    <div className="relative min-h-svh bg-background">
      <div aria-hidden className="px-10 py-10 opacity-25">
        <div className="font-heading text-2xl">Security · Profile</div>
      </div>

      <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
        <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-start justify-between border-border/60 border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                <ShieldCheckIcon className="size-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Step 2 of 3
                </div>
                <div className="mt-0.5 font-heading text-base">
                  Set up two-factor auth
                </div>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-5 px-5 py-5">
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <QrCode />
              <div className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
                Scan with Authenticator
              </div>
            </div>
            <div>
              <div className="text-sm leading-snug">
                Open your authenticator app and scan the code, or paste this
                secret manually.
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2">
                <code className="flex-1 font-mono text-sm">
                  H7K3 9F2N P8L4 RTYQ
                </code>
                <button
                  type="button"
                  className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
                >
                  <CopyIcon className="size-3.5" />
                </button>
              </div>

              <div className="mt-5">
                <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Confirm with a 6-digit code
                </div>
                <div className="flex gap-1.5">
                  {["3", "9", "1", "4", "", ""].map((d, i) => (
                    <input
                      key={i}
                      defaultValue={d}
                      maxLength={1}
                      className={
                        "size-10 rounded-md border text-center font-mono text-base outline-none focus:border-foreground/60 " +
                        (i === 4
                          ? "border-foreground/60 ring-2 ring-foreground/20"
                          : "border-border/60")
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-border/60 border-t bg-muted/20 px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Recovery codes
              </div>
              <button
                type="button"
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
              >
                Download
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 rounded-md border border-border/60 bg-background p-3">
              {RECOVERY.map((c) => (
                <code
                  key={c}
                  className="rounded bg-muted/60 px-1.5 py-1 text-center font-mono text-[11px]"
                >
                  {c}
                </code>
              ))}
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              Save these somewhere safe. Each code can be used once if you
              lose access.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-border/60 border-t px-5 py-3">
            <Button variant="ghost" type="button">
              Back
            </Button>
            <Button type="button">Verify and continue</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Decorative QR — not scannable, but composed like a real one (3 finder
// patterns, 1 alignment pattern, ~47% data density via a hash that doesn't
// produce stripes). 25 modules ≈ a v2 QR — chunky enough to read at thumb size.
export function QrCode() {
  const SIZE = 25;
  const ALIGN_X = SIZE - 6; // alignment center column
  const ALIGN_Y = SIZE - 6; // alignment center row

  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) ||
    (x >= SIZE - 8 && y < 8) ||
    (x < 8 && y >= SIZE - 8);

  const inAlignment = (x: number, y: number) =>
    x >= ALIGN_X - 2 &&
    x <= ALIGN_X + 2 &&
    y >= ALIGN_Y - 2 &&
    y <= ALIGN_Y + 2;

  const hash = (x: number, y: number): number => {
    let h = (x + 1) * 0x9e3779b1;
    h ^= (y + 1) * 0x85ebca77;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h = (h ^ (h >>> 16)) >>> 0;
    return h % 100;
  };

  const modules: { x: number; y: number }[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (inFinder(x, y) || inAlignment(x, y)) continue;
      if (hash(x, y) < 47) modules.push({ x, y });
    }
  }

  const FINDERS: [number, number][] = [
    [0, 0],
    [SIZE - 7, 0],
    [0, SIZE - 7],
  ];

  return (
    <div className="aspect-square w-full">
      <svg
        viewBox={`-1 -1 ${SIZE + 2} ${SIZE + 2}`}
        className="h-full w-full"
        aria-hidden
      >
        <rect
          x={-1}
          y={-1}
          width={SIZE + 2}
          height={SIZE + 2}
          className="fill-background"
        />

        {modules.map(({ x, y }) => (
          <rect
            key={`${x}-${y}`}
            x={x + 0.06}
            y={y + 0.06}
            width={0.88}
            height={0.88}
            rx={0.16}
            className="fill-foreground"
          />
        ))}

        {FINDERS.map(([fx, fy]) => (
          <g key={`${fx}-${fy}`}>
            <rect
              x={fx}
              y={fy}
              width={7}
              height={7}
              rx={1.6}
              className="fill-foreground"
            />
            <rect
              x={fx + 1}
              y={fy + 1}
              width={5}
              height={5}
              rx={1}
              className="fill-background"
            />
            <rect
              x={fx + 2}
              y={fy + 2}
              width={3}
              height={3}
              rx={0.55}
              className="fill-foreground"
            />
          </g>
        ))}

        <g>
          <rect
            x={ALIGN_X - 2}
            y={ALIGN_Y - 2}
            width={5}
            height={5}
            rx={1}
            className="fill-foreground"
          />
          <rect
            x={ALIGN_X - 1}
            y={ALIGN_Y - 1}
            width={3}
            height={3}
            rx={0.55}
            className="fill-background"
          />
          <rect
            x={ALIGN_X - 0.4}
            y={ALIGN_Y - 0.4}
            width={1.8}
            height={1.8}
            rx={0.3}
            className="fill-foreground"
          />
        </g>
      </svg>
    </div>
  );
}
