import { FilterIcon, XIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import type { Network } from "@/lib/networks";

type Props = {
  network: Network;
  onClear: () => void;
};

export function NetworkFilterChip({ network, onClear }: Props) {
  return (
    <aside className="network-filter-chip" aria-label="Active network filter">
      <Badge variant="outline" className="network-filter-pill">
        <FilterIcon />
        <span className="network-filter-muted">Filter:</span>
        <span className="network-filter-name">{network.name}</span>
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="network-filter-clear"
        onClick={onClear}
        aria-label={`Clear ${network.name} filter`}
      >
        <XIcon />
      </Button>
    </aside>
  );
}
