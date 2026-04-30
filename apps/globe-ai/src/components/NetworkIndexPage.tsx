import { ArrowUpRightIcon, CheckIcon, CpuIcon, ShieldCheckIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card } from "@orbit/ui/card";
import { NETWORKS, networkInitials, type Network } from "@/lib/networks";

type Props = {
  activeNetworkFilter: Network | null;
  onFilterNetwork: (networkId: string) => void;
  onOpenNetwork: (networkId: string) => void;
};

export function NetworkIndexPage({
  activeNetworkFilter,
  onFilterNetwork,
  onOpenNetwork,
}: Props) {
  return (
    <div className="absolute inset-0 z-40 overflow-y-auto overflow-x-hidden bg-background pt-[64px] text-foreground">
      <header className="border-b border-border/60 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Networks · Local registry
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section>
          <h1 className="font-heading text-3xl tracking-tight">Supported networks</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Browse all supported chains and open a dedicated analytics page for each network.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {NETWORKS.map((network) => {
            const active = activeNetworkFilter?.id === network.id;
            return (
              <Card
                key={network.id}
                role="button"
                tabIndex={0}
                data-active-filter={active ? "true" : undefined}
                className="group cursor-pointer border-border/60 bg-background/40 p-4 transition-colors hover:bg-muted/30 data-[active-filter=true]:border-ring/50 data-[active-filter=true]:bg-info/10"
                onClick={() => onFilterNetwork(network.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onFilterNetwork(network.id);
                  }
                }}
                aria-label={`Filter by ${network.name}`}
              >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/60 bg-background/55 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {network.logo ? (
                      <img src={network.logo} alt="" className="size-8 object-contain" />
                    ) : (
                      networkInitials(network)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-medium">{network.name}</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {network.symbol}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenNetwork(network.id);
                  }}
                  aria-label={`Open ${network.name}`}
                >
                  <ArrowUpRightIcon />
                </Button>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{network.description}</p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="info">
                  <ShieldCheckIcon />
                  {network.consensus}
                </Badge>
                <Badge variant="secondary">
                  {network.category}
                </Badge>
                {network.evmCompatible ? (
                  <Badge variant="success">
                    <CheckIcon />
                    EVM
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <CpuIcon />
                    Native
                  </Badge>
                )}
              </div>

              <div className="mt-4 border-t border-border/60 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenNetwork(network.id);
                  }}
                >
                  Open network
                  <ArrowUpRightIcon />
                </Button>
              </div>
            </Card>
          );
        })}
        </section>
      </main>
    </div>
  );
}
