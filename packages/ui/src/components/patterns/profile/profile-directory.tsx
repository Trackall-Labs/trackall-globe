import { MessageCircleIcon, PhoneIcon, SearchIcon, VideoIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";

export interface Person {
  name: string;
  role: string;
  initials: string;
  email: string;
  status: "online" | "away" | "off";
}

const PEOPLE: Person[] = [
  { name: "Alex Tran", role: "Engineer · Front-end", initials: "AT", email: "alex@acme.dev", status: "off" },
  { name: "Avery Hughes", role: "Recruiter", initials: "AH", email: "avery@acme.dev", status: "online" },
  { name: "Bea Park", role: "Customer Support Lead", initials: "BP", email: "bea@acme.dev", status: "online" },
  { name: "Camille Roy", role: "Counsel", initials: "CR", email: "camille@acme.dev", status: "away" },
  { name: "Carlos Mendes", role: "Engineer · Platform", initials: "CM", email: "carlos@acme.dev", status: "online" },
  { name: "Dani Kim", role: "Lead Designer", initials: "DK", email: "dani@acme.dev", status: "online" },
  { name: "Demarcus Hall", role: "Engineer · Mobile", initials: "DH", email: "dh@acme.dev", status: "off" },
  { name: "Elena Vargas", role: "Head of Sales", initials: "EV", email: "elena@acme.dev", status: "online" },
  { name: "Farah Hassan", role: "Engineer · ML", initials: "FH", email: "farah@acme.dev", status: "away" },
  { name: "James Lin", role: "Senior Engineer · API", initials: "JL", email: "james@acme.dev", status: "online" },
  { name: "Joon Park", role: "Designer · Brand", initials: "JP", email: "joon@acme.dev", status: "online" },
  { name: "Maya Okafor", role: "Staff Engineer", initials: "MO", email: "maya@acme.dev", status: "online" },
  { name: "Nadia Costa", role: "Product Manager", initials: "NC", email: "nadia@acme.dev", status: "away" },
  { name: "Riya Patel", role: "Engineer · Billing", initials: "RP", email: "riya@acme.dev", status: "away" },
  { name: "Sean Brydon", role: "Brand", initials: "SB", email: "sean@acme.dev", status: "online" },
];

const STATUS_DOT: Record<Person["status"], string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  off: "bg-muted-foreground/40",
};

export function ProfileDirectoryShowcasePage() {
  // Group by first letter of last name
  const groups: Record<string, Person[]> = {};
  PEOPLE.forEach((p) => {
    const last = p.name.split(" ").slice(-1)[0];
    const k = last[0].toUpperCase();
    (groups[k] ??= []).push(p);
  });
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Acme directory · {PEOPLE.length} people
            </div>
            <h1 className="mt-1 font-heading text-2xl">Contact directory</h1>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-1.5 text-xs">
            <SearchIcon className="size-3.5 opacity-60" />
            <input
              placeholder="Find by name, role, or team"
              className="w-72 bg-transparent outline-none placeholder:text-muted-foreground"
            />
            <span className="font-mono text-[10px] text-muted-foreground">
              ⌘K
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_28px] gap-4">
          <div className="overflow-hidden rounded-xl border border-border/60 bg-background/40">
            {Object.keys(groups)
              .sort()
              .map((letter) => (
                <section key={letter}>
                  <h2
                    id={`letter-${letter}`}
                    className="sticky top-0 flex items-center gap-3 border-border/40 border-b bg-background px-5 py-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
                  >
                    {letter}
                    <span className="h-px flex-1 bg-border/40" />
                    <span>{groups[letter].length}</span>
                  </h2>
                  <ul className="divide-y divide-border/40">
                    {groups[letter].map((p) => (
                      <li
                        key={p.email}
                        className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-foreground/[0.02]"
                      >
                        <div className="relative">
                          <Avatar className="size-9">
                            <AvatarFallback className="text-xs">
                              {p.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={
                              "absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-background " +
                              STATUS_DOT[p.status]
                            }
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm">{p.name}</div>
                          <div className="truncate text-muted-foreground text-xs">
                            {p.role} · {p.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity hover:opacity-100">
                          <button
                            type="button"
                            className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
                          >
                            <MessageCircleIcon className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
                          >
                            <VideoIcon className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
                          >
                            <PhoneIcon className="size-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
          </div>

          {/* Letter rail */}
          <nav className="flex flex-col items-center gap-0.5 pt-1 font-mono text-[10px]">
            {letters.map((l) => {
              const active = l in groups;
              return (
                <a
                  key={l}
                  href={`#letter-${l}`}
                  className={
                    "grid size-5 place-items-center rounded transition-colors " +
                    (active
                      ? "text-foreground hover:bg-foreground/[0.06]"
                      : "text-muted-foreground/40 pointer-events-none")
                  }
                >
                  {l}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
