import { PlusIcon, ThumbsUpIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";

export interface Skill {
  name: string;
  level: number; // 1–5
  endorsements: number;
  endorsers: string[];
  category: string;
}

const SKILLS: Skill[] = [
  { name: "Distributed systems", level: 5, endorsements: 28, endorsers: ["JL", "RP", "OB"], category: "Engineering" },
  { name: "Postgres", level: 5, endorsements: 22, endorsers: ["JL", "RP"], category: "Engineering" },
  { name: "Kubernetes", level: 4, endorsements: 14, endorsers: ["CM"], category: "Engineering" },
  { name: "TypeScript", level: 4, endorsements: 19, endorsers: ["AT", "JL", "DK"], category: "Engineering" },
  { name: "Rust", level: 3, endorsements: 8, endorsers: ["CM"], category: "Engineering" },
  { name: "Mentorship", level: 5, endorsements: 36, endorsers: ["JL", "RP", "AT", "DK"], category: "Leadership" },
  { name: "Public speaking", level: 4, endorsements: 12, endorsers: ["OB"], category: "Leadership" },
  { name: "Hiring", level: 4, endorsements: 9, endorsers: ["AH"], category: "Leadership" },
  { name: "Product strategy", level: 3, endorsements: 6, endorsers: ["NC"], category: "Product" },
  { name: "Technical writing", level: 4, endorsements: 17, endorsers: ["DK"], category: "Communication" },
  { name: "Compliance · SOC 2", level: 4, endorsements: 11, endorsers: ["CR"], category: "Security" },
  { name: "Threat modeling", level: 3, endorsements: 4, endorsers: ["MO"], category: "Security" },
];

export function ProfileSkillsShowcasePage() {
  const grouped = SKILLS.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Maya Okafor · skills
        </div>
        <h1 className="mt-1 font-heading text-2xl">
          Skills & endorsements
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {SKILLS.reduce((acc, s) => acc + s.endorsements, 0)} endorsements
          across {SKILLS.length} skills.
        </p>

        {Object.entries(grouped).map(([cat, list]) => (
          <section key={cat} className="mt-8">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-heading text-base">{cat}</h2>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                {list.length}
              </span>
              <span className="ml-auto h-px flex-1 bg-border/40" />
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {list.map((s) => (
                <li
                  key={s.name}
                  className="rounded-xl border border-border/60 bg-background/40 px-3.5 py-2.5 transition-colors hover:bg-background/60"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm">{s.name}</span>
                    <Stars level={s.level} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center -space-x-1.5">
                      {s.endorsers.slice(0, 4).map((e) => (
                        <Avatar
                          key={e}
                          className="size-5 border-2 border-background"
                        >
                          <AvatarFallback className="text-[9px]">
                            {e}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      <span className="ml-3 font-mono text-[10px] text-muted-foreground tabular-nums">
                        {s.endorsements}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md bg-foreground/[0.04] px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] hover:bg-foreground/[0.08] hover:text-foreground"
                    >
                      <ThumbsUpIcon className="size-3" />
                      Endorse
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-dashed border-border/70 px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:border-foreground/40 hover:text-foreground"
        >
          <PlusIcon className="size-3.5" />
          Add a skill
        </button>
      </div>
    </div>
  );
}

export function Stars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            "size-1.5 rounded-full " +
            (i < level ? "bg-foreground" : "bg-muted-foreground/25")
          }
        />
      ))}
    </div>
  );
}
