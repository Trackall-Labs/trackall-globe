import { ArrowUpRightIcon, DatabaseIcon, GlobeIcon, LayersIcon, UsersIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card } from "@orbit/ui/card";
import type { Network } from "@/lib/networks";
import type { Protocol } from "@/lib/types";

type Props = {
  activeNetworkFilter: Network | null;
  onOpenProtocol: (protocolId: string) => void;
  protocols: Protocol[];
};

const VISIBLE_NETWORKS = 3;

function projectInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProjectIndexPage({
  activeNetworkFilter,
  onOpenProtocol,
  protocols,
}: Props) {
  return (
    <div className="absolute inset-0 z-40 overflow-y-auto overflow-x-hidden bg-background pt-[64px] text-foreground">
      <header className="border-b border-border/60 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Projects · DeFi protocols
          </div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            {protocols.length.toString().padStart(2, "0")} listed
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section>
          <h1 className="font-heading text-3xl tracking-tight">Featured projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {activeNetworkFilter
              ? `Browse ${activeNetworkFilter.name} projects tracked on the globe. Open any project to see live block flow, liquidity, and connected networks.`
              : "Browse every DeFi protocol tracked on the globe. Open any project to see live block flow, liquidity, and the networks it operates across."}
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {protocols.map((protocol) => {
            const visibleNetworks = protocol.networks.slice(0, VISIBLE_NETWORKS);
            const overflow = protocol.networks.length - visibleNetworks.length;
            return (
              <Card
                key={protocol.id}
                className="group flex flex-col border-border/60 bg-background/40 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/60 bg-background/55 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {protocol.logo ? (
                        <img src={protocol.logo} alt="" className="size-8 object-contain" />
                      ) : (
                        projectInitials(protocol.name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-medium">{protocol.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {protocol.symbol}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
                    onClick={() => onOpenProtocol(protocol.id)}
                    aria-label={`Open ${protocol.name}`}
                  >
                    <ArrowUpRightIcon />
                  </Button>
                </div>

                <p className="mt-3 min-h-10 line-clamp-2 text-sm text-muted-foreground">
                  {protocol.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="info">
                    {protocol.category}
                  </Badge>
                  {visibleNetworks.map((network) => (
                    <Badge key={network} variant="outline">
                      <LayersIcon />
                      {network}
                    </Badge>
                  ))}
                  {overflow > 0 ? (
                    <Badge variant="secondary">
                      +{overflow}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-1 flex items-center gap-1.5 pt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
                  <GlobeIcon className="size-3" />
                  {protocol.country}
                </div>

                {(protocol.activeUsers != null && protocol.activeUsers > 0) || protocol.programIds ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 border-y border-border/60 py-3">
                    {protocol.activeUsers != null && protocol.activeUsers > 0 ? (
                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <UsersIcon className="size-3.5 shrink-0" />
                        <span className="truncate tabular-nums">
                          {protocol.activeUsers.toLocaleString("en-US")} active
                        </span>
                      </div>
                    ) : null}
                    <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <DatabaseIcon className="size-3.5 shrink-0" />
                      <span className="truncate tabular-nums">
                        {(protocol.programIds?.length ?? 0).toLocaleString("en-US")} programs
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => onOpenProtocol(protocol.id)}
                  >
                    Open project
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
