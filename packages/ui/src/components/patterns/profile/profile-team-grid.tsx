import { GlobeIcon, MailIcon, MapPinIcon, SearchIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Button } from "@orbit/ui/button";

export interface Member {
  name: string;
  initials: string;
  role: string;
  city: string;
  status: "online" | "away" | "off";
  pronouns?: string;
  bio: string;
}

export interface Department {
  name: string;
  count: number;
  members: Member[];
}

const DEPARTMENTS: Department[] = [
  {
    name: "Engineering",
    count: 4,
    members: [
      { name: "Maya Okafor", initials: "MO", role: "Staff Engineer · Audit log", city: "Brooklyn, NY", status: "online", pronouns: "she/her", bio: "Distributed systems, retention, observability." },
      { name: "James Lin", initials: "JL", role: "Senior Engineer · API", city: "Toronto, CA", status: "online", pronouns: "he/him", bio: "API ergonomics. Long-suffering reviewer." },
      { name: "Riya Patel", initials: "RP", role: "Engineer · Billing", city: "Bangalore, IN", status: "away", pronouns: "she/her", bio: "Migrations, tax math, idempotency." },
      { name: "Alex Tran", initials: "AT", role: "Engineer · Front-end", city: "London, UK", status: "off", pronouns: "they/them", bio: "Forms, focus rings, things you don't notice." },
    ],
  },
  {
    name: "Design & Brand",
    count: 2,
    members: [
      { name: "Dani Kim", initials: "DK", role: "Lead Designer", city: "Berlin, DE", status: "online", pronouns: "she/her", bio: "Product surfaces, motion, type." },
      { name: "Sean Brydon", initials: "SB", role: "Brand", city: "San Francisco, CA", status: "online", pronouns: "he/him", bio: "Words, voice, sometimes paint." },
    ],
  },
];

export function ProfileTeamGridShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Acme · 6 teammates · 4 cities
            </div>
            <h1 className="mt-1 font-heading text-3xl tracking-tight">
              Meet the team
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-1.5 text-xs">
              <SearchIcon className="size-3.5 opacity-60" />
              <input
                placeholder="Search by name or role"
                className="bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button type="button">Invite</Button>
          </div>
        </div>

        {DEPARTMENTS.map((d) => (
          <section key={d.name} className="mt-10">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-heading text-base">{d.name}</h2>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                {d.count}
              </span>
              <span className="ml-auto h-px flex-1 bg-border/40" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {d.members.map((m) => (
                <article
                  key={m.name}
                  className="rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:bg-background/60"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="size-12">
                        <AvatarFallback>{m.initials}</AvatarFallback>
                      </Avatar>
                      <span
                        className={
                          "absolute right-0 bottom-0 size-3 rounded-full border-2 border-background " +
                          (m.status === "online"
                            ? "bg-emerald-500"
                            : m.status === "away"
                              ? "bg-amber-500"
                              : "bg-muted-foreground")
                        }
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{m.name}</span>
                        {m.pronouns ? (
                          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                            {m.pronouns}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {m.role}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-foreground/85 text-sm leading-snug">
                    {m.bio}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="size-3" />
                      {m.city}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <MailIcon className="size-3" />
                      Email
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <GlobeIcon className="size-3" />
                      Profile
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
