import { MailIcon, MapPinIcon, MessageSquareIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@orbit/ui/card";
import { Separator } from "@orbit/ui/separator";

export function CardProfileShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-6 py-16">
      <div className="mx-auto max-w-md">
        <Card className="overflow-hidden">
          <Cover />
          <CardHeader className="-mt-10 relative pb-2">
            <Avatar className="size-20 border-4 border-background">
              <AvatarFallback className="bg-foreground font-heading font-semibold text-background text-xl">
                LR
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-3 flex items-center gap-2">
              Lina Rodrigues
              <Badge variant="secondary" className="font-mono text-[10px]">
                PRO
              </Badge>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Senior Engineer · Platform team
            </p>
          </CardHeader>
          <CardPanel className="pt-2">
            <div className="flex flex-col gap-1.5 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <MapPinIcon className="size-3.5" />
                Lisbon, PT · GMT
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="size-3.5" />
                lina@orbit.so
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Reviews" value="142" />
              <Stat label="PRs merged" value="89" />
              <Stat label="On-call" value="12d" />
            </div>
          </CardPanel>
          <CardFooter className="gap-2 border-t bg-background">
            <Button className="flex-1">
              <MessageSquareIcon />
              Message
            </Button>
            <Button variant="outline" className="flex-1">
              View profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-heading font-semibold text-base">{value}</div>
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
        {label}
      </div>
    </div>
  );
}

export function Cover() {
  return (
    <div
      className="h-24"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, transparent), color-mix(in srgb, var(--primary) 6%, transparent) 60%, transparent), radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, var(--foreground) 8%, transparent), transparent 60%)",
      }}
    />
  );
}
