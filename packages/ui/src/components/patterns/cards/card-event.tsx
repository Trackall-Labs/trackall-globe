import { ClockIcon, MapPinIcon, VideoIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card, CardPanel } from "@orbit/ui/card";

export interface Event {
  id: string;
  title: string;
  blurb: string;
  month: string;
  day: string;
  weekday: string;
  start: string;
  end: string;
  location: string;
  remote?: boolean;
  attendees: string[];
  status?: "live" | "upcoming";
  tone: string;
}

const EVENTS: Event[] = [
  {
    id: "kickoff",
    title: "Q2 kickoff",
    blurb: "Org-wide goals & roadmap review.",
    month: "APR",
    day: "29",
    weekday: "Tue",
    start: "10:00",
    end: "11:30",
    location: "Main hall, 3F",
    attendees: ["LR", "MK", "PJ", "SC", "AB", "TG"],
    status: "upcoming",
    tone: "from-violet-500/20 to-pink-500/10",
  },
  {
    id: "weekly-sync",
    title: "Platform weekly",
    blurb: "Standing engineering sync.",
    month: "APR",
    day: "25",
    weekday: "Fri",
    start: "14:00",
    end: "14:30",
    location: "Zoom",
    remote: true,
    attendees: ["LR", "MK", "PJ"],
    status: "live",
    tone: "from-sky-500/20 to-emerald-500/10",
  },
  {
    id: "design-crit",
    title: "Design critique",
    blurb: "Friday review of in-flight surfaces.",
    month: "MAY",
    day: "02",
    weekday: "Fri",
    start: "16:00",
    end: "17:00",
    location: "Studio",
    attendees: ["PJ", "AB"],
    status: "upcoming",
    tone: "from-amber-500/20 to-rose-500/10",
  },
];

export function CardEventShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="font-heading text-xl">Up next</h1>
          <p className="text-muted-foreground text-sm">
            3 events on your calendar this week.
          </p>
        </header>
        <div className="flex flex-col gap-3">
          {EVENTS.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden">
      <CardPanel className="flex items-stretch gap-0 p-0">
        <div
          className={
            "flex w-20 shrink-0 flex-col items-center justify-center border-r bg-gradient-to-b p-4 " +
            event.tone
          }
        >
          <div className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.2em]">
            {event.month}
          </div>
          <div className="font-heading text-3xl leading-none">{event.day}</div>
          <div className="mt-1 font-mono text-[10px] text-foreground/60 uppercase tracking-[0.2em]">
            {event.weekday}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-base">
              {event.title}
            </h3>
            {event.status === "live" ? (
              <Badge className="gap-1 bg-destructive font-mono text-[10px] text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm">{event.blurb}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-3" />
              {event.start} – {event.end}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {event.remote ? (
                <VideoIcon className="size-3" />
              ) : (
                <MapPinIcon className="size-3" />
              )}
              {event.location}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center -space-x-1.5">
              {event.attendees.slice(0, 5).map((a) => (
                <Avatar
                  key={a}
                  className="size-6 border-2 border-card bg-muted"
                >
                  <AvatarFallback className="bg-muted text-[10px]">
                    {a}
                  </AvatarFallback>
                </Avatar>
              ))}
              {event.attendees.length > 5 ? (
                <span className="z-10 inline-flex size-6 items-center justify-center rounded-full border-2 border-card bg-foreground font-mono text-[9px] text-background">
                  +{event.attendees.length - 5}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button size="xs" variant="ghost">
                Decline
              </Button>
              <Button size="xs">
                {event.status === "live" ? "Join" : "RSVP"}
              </Button>
            </div>
          </div>
        </div>
      </CardPanel>
    </Card>
  );
}
