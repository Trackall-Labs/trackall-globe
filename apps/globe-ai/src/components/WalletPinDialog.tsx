import { useMemo, useState } from "react";
import { CheckCircle2Icon, MapPinIcon, XIcon } from "lucide-react";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@orbit/ui/dialog";
import { Input } from "@orbit/ui/input";
import {
  COUNTRY_TIMEZONES,
  randomPointInFeature,
  type CountryFeature,
} from "@/lib/countries";
import { getPortfolioAddressPath } from "@/lib/protocol-route";
import { isValidSolanaAddress, shortenWallet } from "@/lib/solana";
import type { WalletPin } from "@/lib/types";

type SelectedCountry = {
  country: string;
  feature: CountryFeature;
};

type Props = {
  selected: SelectedCountry | null;
  onClose: () => void;
  onPinCreated: (pin: WalletPin) => void;
  onOpenWallet: (address: string) => void;
};

function makeMockAnalysis(walletAddress: string, country: string) {
  let hash = 0;
  for (let i = 0; i < `${walletAddress}:${country}`.length; i += 1) {
    hash = (hash * 31 + `${walletAddress}:${country}`.charCodeAt(i)) | 0;
  }
  const unit = Math.abs(hash % 1000) / 1000;
  const checkedCount = 18 + Math.round(unit * 34);
  const matchRatio = 0.42 + unit * 0.44;
  return {
    checkedCount,
    matchRatio,
    matchedCount: Math.max(1, Math.round(checkedCount * matchRatio)),
  };
}

export function WalletPinDialog({ selected, onClose, onPinCreated, onOpenWallet }: Props) {
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<WalletPin | null>(null);

  const open = Boolean(selected);
  const timezone = useMemo(() => {
    if (!selected) return "UTC";
    return COUNTRY_TIMEZONES[selected.country] ?? "UTC";
  }, [selected]);

  const reset = () => {
    setWalletAddress("");
    setError(null);
    setCreated(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;

    const trimmed = walletAddress.trim();
    if (!trimmed) {
      setError("Enter a Solana wallet address.");
      return;
    }
    if (!isValidSolanaAddress(trimmed)) {
      setError("That does not look like a Solana address.");
      return;
    }

    const point = randomPointInFeature(selected.feature, `${selected.country}:${trimmed}`);
    const analysis = makeMockAnalysis(trimmed, selected.country);
    const pin: WalletPin = {
      id: `${Date.now()}:${trimmed}`,
      walletAddress: trimmed,
      country: selected.country,
      lat: point.lat,
      lng: point.lng,
      timezone,
      createdAt: Date.now(),
      ...analysis,
    };

    onPinCreated(pin);
    setCreated(pin);
    setError(null);
    setWalletAddress("");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? close() : undefined)}>
      <DialogPopup className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="dialog-title-row">
            <div className={created ? "dialog-icon dialog-icon-success" : "dialog-icon"}>
              {created ? <CheckCircle2Icon /> : <MapPinIcon />}
            </div>
            <div>
              <DialogTitle>{created ? "Wallet pinned" : "Pin wallet"}</DialogTitle>
              <DialogDescription>
                {selected
                  ? `Attach a local mock wallet signal to ${selected.country}.`
                  : "Select a country on the globe first."}
              </DialogDescription>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={close} aria-label="Close wallet pin dialog">
              <XIcon />
            </Button>
          </div>
        </DialogHeader>

        {created ? (
          <>
            <DialogPanel className="flex flex-col gap-4">
              <div className="pin-result-card">
                <Badge variant="success" size="sm">{created.country}</Badge>
                <strong>
                  <a
                    href={getPortfolioAddressPath(created.walletAddress)}
                    onClick={(event) => {
                      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      onOpenWallet(created.walletAddress);
                    }}
                    className="wallet-address-link"
                    aria-label="Open pinned wallet portfolio"
                  >
                    {shortenWallet(created.walletAddress)}
                  </a>
                </strong>
                <small>
                  {created.matchedCount}/{created.checkedCount} local-hour matches /{" "}
                  {(created.matchRatio * 100).toFixed(0)}%
                </small>
              </div>
            </DialogPanel>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreated(null)}>
                Add another
              </Button>
              <Button type="button" onClick={close}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form className="contents" onSubmit={submit}>
            <DialogPanel className="flex flex-col gap-4">
              <div className="wallet-form-grid">
                <label htmlFor="wallet-address">Wallet address</label>
                <Input
                  id="wallet-address"
                  type="text"
                  placeholder="9xQeWvG816bUx9EPf..."
                  value={walletAddress}
                  onChange={(event) => {
                    setWalletAddress(event.currentTarget.value);
                    setError(null);
                  }}
                />
                <p>
                  MVP mode uses local validation and a generated confidence score.
                  Nothing is sent to a server.
                </p>
                {error ? <div className="wallet-error" role="alert">{error}</div> : null}
              </div>
            </DialogPanel>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Create pin</Button>
            </DialogFooter>
          </form>
        )}
      </DialogPopup>
    </Dialog>
  );
}
