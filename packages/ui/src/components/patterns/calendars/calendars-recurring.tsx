import { useMemo, useState } from "react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RepeatIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Input } from "@orbit/ui/input";

export type Freq = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type WeekDay = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
export type End =
  | { type: "never" }
  | { type: "until"; date: string }
  | { type: "count"; count: number };

export interface Rule {
  freq: Freq;
  interval: number;
  byday: WeekDay[];
  bymonthday: number[];
  bysetpos: number | null;
  bydayPositional: WeekDay[];
  monthlyMode: "day" | "weekday";
  end: End;
}

const WEEKDAYS_DISPLAY: { key: WeekDay; short: string }[] = [
  { key: "MO", short: "M" },
  { key: "TU", short: "T" },
  { key: "WE", short: "W" },
  { key: "TH", short: "T" },
  { key: "FR", short: "F" },
  { key: "SA", short: "S" },
  { key: "SU", short: "S" },
];
const DAY_NAME: Record<WeekDay, string> = {
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
  SU: "Sun",
};
const DAY_INDEX: Record<WeekDay, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};
const POSITIONS = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
  { value: -1, label: "last" },
];

const START = new Date(2026, 3, 26);

const DEFAULT_RULE: Rule = {
  freq: "WEEKLY",
  interval: 1,
  byday: ["MO", "WE", "FR"],
  bymonthday: [1],
  bysetpos: -1,
  bydayPositional: ["FR"],
  monthlyMode: "weekday",
  end: { type: "until", date: "2026-07-26" },
};

const TEMPLATES: { label: string; rule: Partial<Rule> }[] = [
  {
    label: "Every weekday",
    rule: { freq: "WEEKLY", interval: 1, byday: ["MO", "TU", "WE", "TH", "FR"] },
  },
  {
    label: "Mon · Wed · Fri",
    rule: { freq: "WEEKLY", interval: 1, byday: ["MO", "WE", "FR"] },
  },
  {
    label: "Bi-weekly Tue",
    rule: { freq: "WEEKLY", interval: 2, byday: ["TU"] },
  },
  {
    label: "Last Friday",
    rule: {
      freq: "MONTHLY",
      interval: 1,
      monthlyMode: "weekday",
      bysetpos: -1,
      bydayPositional: ["FR"],
    },
  },
  {
    label: "1st & 15th",
    rule: {
      freq: "MONTHLY",
      interval: 1,
      monthlyMode: "day",
      bymonthday: [1, 15],
    },
  },
  {
    label: "Last day of month",
    rule: {
      freq: "MONTHLY",
      interval: 1,
      monthlyMode: "day",
      bymonthday: [-1],
    },
  },
  {
    label: "1st weekday",
    rule: {
      freq: "MONTHLY",
      interval: 1,
      monthlyMode: "weekday",
      bysetpos: 1,
      bydayPositional: ["MO", "TU", "WE", "TH", "FR"],
    },
  },
  {
    label: "Quarterly",
    rule: {
      freq: "MONTHLY",
      interval: 3,
      monthlyMode: "day",
      bymonthday: [1],
    },
  },
];

function buildRrule(r: Rule): { tokens: { k: string; v: string }[]; raw: string } {
  const tokens: { k: string; v: string }[] = [{ k: "FREQ", v: r.freq }];
  if (r.interval > 1) tokens.push({ k: "INTERVAL", v: String(r.interval) });
  if (r.freq === "WEEKLY" && r.byday.length)
    tokens.push({ k: "BYDAY", v: r.byday.join(",") });
  if (r.freq === "MONTHLY") {
    if (r.monthlyMode === "day" && r.bymonthday.length)
      tokens.push({ k: "BYMONTHDAY", v: r.bymonthday.join(",") });
    if (r.monthlyMode === "weekday") {
      if (r.bydayPositional.length)
        tokens.push({ k: "BYDAY", v: r.bydayPositional.join(",") });
      if (r.bysetpos !== null)
        tokens.push({ k: "BYSETPOS", v: String(r.bysetpos) });
    }
  }
  if (r.end.type === "until")
    tokens.push({ k: "UNTIL", v: `${r.end.date.replace(/-/g, "")}T000000Z` });
  if (r.end.type === "count")
    tokens.push({ k: "COUNT", v: String(r.end.count) });
  return { tokens, raw: tokens.map((t) => `${t.k}=${t.v}`).join(";") };
}

function describeRule(r: Rule): string {
  const intervalWord = (singular: string, plural: string) =>
    r.interval > 1 ? `${r.interval} ${plural}` : singular;
  let main = "";
  if (r.freq === "DAILY")
    main = `Every ${intervalWord("day", "days")}`;
  if (r.freq === "WEEKLY") {
    const days = r.byday.map((d) => DAY_NAME[d]).join(", ") || "—";
    main = `Every ${intervalWord("week", "weeks")} on ${days}`;
  }
  if (r.freq === "MONTHLY") {
    if (r.monthlyMode === "day") {
      const days = r.bymonthday
        .map((d) => (d === -1 ? "last day" : `the ${ord(d)}`))
        .join(", ");
      main = `Every ${intervalWord("month", "months")} on ${days || "—"}`;
    } else {
      const pos =
        POSITIONS.find((p) => p.value === r.bysetpos)?.label ?? "";
      const days =
        r.bydayPositional.length === 5 &&
        r.bydayPositional.every((d) =>
          ["MO", "TU", "WE", "TH", "FR"].includes(d),
        )
          ? "weekday"
          : r.bydayPositional.map((d) => DAY_NAME[d]).join(" or ");
      main = `Every ${intervalWord("month", "months")} on the ${pos} ${days || "—"}`;
    }
  }
  if (r.freq === "YEARLY")
    main = `Every ${intervalWord("year", "years")}`;
  if (r.end.type === "until") {
    const d = new Date(r.end.date);
    main += `, until ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (r.end.type === "count") main += `, for ${r.end.count} occurrences`;
  return main + ".";
}

function ord(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = Math.abs(n) % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function expandOccurrences(rule: Rule, start: Date, max: number): Date[] {
  const out: Date[] = [];
  const limit = (d: Date) => {
    if (rule.end.type === "until") return d <= new Date(rule.end.date);
    return true;
  };
  const cap =
    rule.end.type === "count" ? Math.min(max, rule.end.count) : max;

  if (rule.freq === "DAILY") {
    const d = new Date(start);
    while (out.length < cap && limit(d)) {
      out.push(new Date(d));
      d.setDate(d.getDate() + rule.interval);
    }
  }

  if (rule.freq === "WEEKLY") {
    const targets = rule.byday.map((d) => DAY_INDEX[d]).sort();
    if (!targets.length) return out;
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    let safety = 0;
    while (out.length < cap && safety++ < 500) {
      for (const t of targets) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + t);
        if (d >= start && limit(d)) {
          out.push(new Date(d));
          if (out.length >= cap) break;
        }
        if (rule.end.type === "until" && d > new Date(rule.end.date))
          return out;
      }
      weekStart.setDate(weekStart.getDate() + 7 * rule.interval);
    }
  }

  if (rule.freq === "MONTHLY") {
    const m = new Date(start.getFullYear(), start.getMonth(), 1);
    let safety = 0;
    while (out.length < cap && safety++ < 200) {
      const y = m.getFullYear();
      const mo = m.getMonth();
      const last = new Date(y, mo + 1, 0).getDate();
      if (rule.monthlyMode === "day") {
        const days = rule.bymonthday
          .map((d) => (d < 0 ? last + d + 1 : d))
          .filter((d) => d >= 1 && d <= last)
          .sort((a, b) => a - b);
        for (const day of days) {
          const d = new Date(y, mo, day);
          if (d >= start && limit(d)) {
            out.push(d);
            if (out.length >= cap) break;
          }
          if (rule.end.type === "until" && d > new Date(rule.end.date))
            return out;
        }
      } else if (
        rule.bydayPositional.length &&
        rule.bysetpos !== null
      ) {
        const matches: Date[] = [];
        for (let day = 1; day <= last; day++) {
          const d = new Date(y, mo, day);
          if (
            rule.bydayPositional.some((wd) => DAY_INDEX[wd] === d.getDay())
          )
            matches.push(d);
        }
        const idx =
          rule.bysetpos > 0
            ? rule.bysetpos - 1
            : matches.length + rule.bysetpos;
        const picked = matches[idx];
        if (picked && picked >= start && limit(picked)) {
          out.push(picked);
        }
        if (
          rule.end.type === "until" &&
          picked &&
          picked > new Date(rule.end.date)
        )
          return out;
      }
      m.setMonth(m.getMonth() + rule.interval);
    }
  }

  if (rule.freq === "YEARLY") {
    const d = new Date(start);
    while (out.length < cap && limit(d)) {
      out.push(new Date(d));
      d.setFullYear(d.getFullYear() + rule.interval);
    }
  }

  return out;
}

export function CalendarsRecurringShowcasePage() {
  const [rule, setRule] = useState<Rule>(DEFAULT_RULE);
  const [monthOffset, setMonthOffset] = useState(0);

  const built = useMemo(() => buildRrule(rule), [rule]);
  const occurrences = useMemo(
    () => expandOccurrences(rule, START, 100),
    [rule],
  );
  const description = useMemo(() => describeRule(rule), [rule]);
  const next8 = occurrences.slice(0, 8);

  const apply = (patch: Partial<Rule>) => setRule((r) => ({ ...r, ...patch }));

  return (
    <div className="min-h-svh bg-muted/30 px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <RepeatIcon className="size-4 text-muted-foreground" />
            <h1 className="font-heading text-lg">Recurrence</h1>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            iCalendar · RFC 5545
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <Templates
            current={built.raw}
            onPick={(t) =>
              setRule((r) => ({ ...DEFAULT_RULE, ...r, ...t }))
            }
          />
          <div className="grid grid-cols-1 divide-y divide-border/60 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <Editor rule={rule} apply={apply} />
            <Preview
              rule={rule}
              tokens={built.tokens}
              raw={built.raw}
              description={description}
              occurrences={next8}
              allOccurrences={occurrences}
              monthOffset={monthOffset}
              setMonthOffset={setMonthOffset}
            />
          </div>
          <div className="flex items-center justify-between border-border/60 border-t bg-muted/20 px-5 py-3">
            <span className="font-mono text-[11px] text-muted-foreground">
              Starts {START.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
              <Button type="button">Save recurrence</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Templates({
  current,
  onPick,
}: {
  current: string;
  onPick: (rule: Partial<Rule>) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-border/60 border-b bg-background px-5 py-3">
      <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
        <SparklesIcon className="size-3" />
        Presets
      </span>
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATES.map((t) => {
          const built = buildRrule({ ...DEFAULT_RULE, ...t.rule }).raw;
          const isActive = built === current;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => onPick(t.rule)}
              className={
                "rounded-md border px-2.5 py-0.5 text-[12px] transition-colors " +
                (isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground/80 hover:border-foreground/40 hover:bg-muted/40")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Editor({
  rule,
  apply,
}: {
  rule: Rule;
  apply: (patch: Partial<Rule>) => void;
}) {
  const FREQS: Freq[] = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
  return (
    <div className="space-y-5 px-5 py-5">
      <Row label="FREQ">
        <div className="flex items-center rounded-md border border-border/70 bg-background p-0.5">
          {FREQS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => apply({ freq: f })}
              className={
                "rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] " +
                (rule.freq === f
                  ? "bg-foreground/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {f}
            </button>
          ))}
        </div>
      </Row>

      <Row label="INTERVAL">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={rule.interval}
            onChange={(e) =>
              apply({ interval: Math.max(1, Number(e.target.value || 1)) })
            }
            className="w-16"
            min={1}
          />
          <span className="text-muted-foreground text-sm">
            {rule.freq === "DAILY" && (rule.interval > 1 ? "days" : "day")}
            {rule.freq === "WEEKLY" && (rule.interval > 1 ? "weeks" : "week")}
            {rule.freq === "MONTHLY" &&
              (rule.interval > 1 ? "months" : "month")}
            {rule.freq === "YEARLY" && (rule.interval > 1 ? "years" : "year")}
          </span>
        </div>
      </Row>

      {rule.freq === "WEEKLY" && (
        <Row label="BYDAY">
          <div className="flex items-center gap-1">
            {WEEKDAYS_DISPLAY.map((d) => {
              const active = rule.byday.includes(d.key);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() =>
                    apply({
                      byday: active
                        ? rule.byday.filter((x) => x !== d.key)
                        : [...rule.byday, d.key],
                    })
                  }
                  className={
                    "grid size-8 place-items-center rounded-md font-mono text-xs transition-colors " +
                    (active
                      ? "bg-foreground text-background"
                      : "border border-border/70 text-foreground/85 hover:border-foreground/40")
                  }
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        </Row>
      )}

      {rule.freq === "MONTHLY" && (
        <>
          <Row label="ON">
            <div className="flex items-center rounded-md border border-border/70 bg-background p-0.5">
              <button
                type="button"
                onClick={() => apply({ monthlyMode: "day" })}
                className={
                  "rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] " +
                  (rule.monthlyMode === "day"
                    ? "bg-foreground/[0.08] text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Day of month
              </button>
              <button
                type="button"
                onClick={() => apply({ monthlyMode: "weekday" })}
                className={
                  "rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] " +
                  (rule.monthlyMode === "weekday"
                    ? "bg-foreground/[0.08] text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Position + day
              </button>
            </div>
          </Row>

          {rule.monthlyMode === "day" && (
            <Row label="BYMONTHDAY">
              <DayOfMonthGrid
                selected={rule.bymonthday}
                onChange={(bymonthday) => apply({ bymonthday })}
              />
            </Row>
          )}

          {rule.monthlyMode === "weekday" && (
            <>
              <Row label="BYSETPOS">
                <div className="flex items-center rounded-md border border-border/70 bg-background p-0.5">
                  {POSITIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => apply({ bysetpos: p.value })}
                      className={
                        "rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] " +
                        (rule.bysetpos === p.value
                          ? "bg-foreground/[0.08] text-foreground"
                          : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="BYDAY">
                <div className="flex items-center gap-1">
                  {WEEKDAYS_DISPLAY.map((d) => {
                    const active = rule.bydayPositional.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() =>
                          apply({
                            bydayPositional: active
                              ? rule.bydayPositional.filter((x) => x !== d.key)
                              : [...rule.bydayPositional, d.key],
                          })
                        }
                        className={
                          "grid size-8 place-items-center rounded-md font-mono text-xs transition-colors " +
                          (active
                            ? "bg-foreground text-background"
                            : "border border-border/70 text-foreground/85 hover:border-foreground/40")
                        }
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </Row>
            </>
          )}
        </>
      )}

      <Row label="ENDS">
        <div className="flex flex-col gap-2">
          <EndOption
            label="Never"
            checked={rule.end.type === "never"}
            onSelect={() => apply({ end: { type: "never" } })}
          />
          <EndOption
            label="On a date"
            checked={rule.end.type === "until"}
            onSelect={() =>
              apply({ end: { type: "until", date: "2026-07-26" } })
            }
            trailing={
              rule.end.type === "until" ? (
                <button
                  type="button"
                  className="ml-auto inline-flex items-center gap-2 rounded-md border border-border/70 bg-background px-2 py-1 font-mono text-[11px]"
                >
                  <CalendarIcon className="size-3 opacity-60" />
                  {new Date(rule.end.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </button>
              ) : null
            }
          />
          <EndOption
            label="After N times"
            checked={rule.end.type === "count"}
            onSelect={() => apply({ end: { type: "count", count: 12 } })}
            trailing={
              rule.end.type === "count" ? (
                <Input
                  type="number"
                  value={rule.end.count}
                  onChange={(e) =>
                    apply({
                      end: {
                        type: "count",
                        count: Math.max(1, Number(e.target.value || 1)),
                      },
                    })
                  }
                  className="ml-auto w-20"
                />
              ) : null
            }
          />
        </div>
      </Row>
    </div>
  );
}

export function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-3">
      <label className="pt-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function EndOption({
  label,
  checked,
  onSelect,
  trailing,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="radio"
        checked={checked}
        onChange={onSelect}
        className="size-3.5"
      />
      <span>{label}</span>
      {trailing}
    </label>
  );
}

export function DayOfMonthGrid({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (next: number[]) => void;
}) {
  const toggle = (n: number) => {
    onChange(
      selected.includes(n)
        ? selected.filter((x) => x !== n)
        : [...selected, n].sort((a, b) => a - b),
    );
  };
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
          const active = selected.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              className={
                "grid h-7 place-items-center rounded font-mono text-[11px] tabular-nums " +
                (active
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-foreground/80 hover:border-foreground/40")
              }
            >
              {n}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => toggle(-1)}
          className={
            "col-span-3 grid h-7 place-items-center rounded font-mono text-[10px] uppercase tracking-[0.2em] " +
            (selected.includes(-1)
              ? "bg-foreground text-background"
              : "border border-border/60 text-foreground/80 hover:border-foreground/40")
          }
        >
          Last day
        </button>
      </div>
    </div>
  );
}

export function Preview({
  tokens,
  raw,
  description,
  occurrences,
  allOccurrences,
  monthOffset,
  setMonthOffset,
}: {
  rule: Rule;
  tokens: { k: string; v: string }[];
  raw: string;
  description: string;
  occurrences: Date[];
  allOccurrences: Date[];
  monthOffset: number;
  setMonthOffset: (n: number) => void;
}) {
  return (
    <div className="space-y-5 bg-muted/10 px-5 py-5">
      <div>
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          RRULE
        </div>
        <div className="mt-1.5 overflow-x-auto rounded-lg border border-border/60 bg-background px-3 py-2.5 font-mono text-[12px] leading-relaxed">
          <span className="text-muted-foreground">RRULE:</span>
          {tokens.map((t, i) => (
            <span key={i}>
              {i > 0 && <span className="text-muted-foreground/60">;</span>}
              <span className="text-violet-600 dark:text-violet-400">
                {t.k}
              </span>
              <span className="text-muted-foreground/70">=</span>
              <span className="text-foreground">{t.v}</span>
            </span>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-foreground/80">{description}</p>
      </div>

      <MiniCalendar
        occurrences={allOccurrences}
        offset={monthOffset}
        setOffset={setMonthOffset}
      />

      <div>
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            Next {occurrences.length} occurrences
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {allOccurrences.length === 100 ? "100+" : allOccurrences.length}{" "}
            total
          </span>
        </div>
        <ul className="mt-2 divide-y divide-border/40 overflow-hidden rounded-lg border border-border/60 bg-background">
          {occurrences.length === 0 ? (
            <li className="px-3 py-4 text-center text-[12px] text-muted-foreground">
              No occurrences match this rule.
            </li>
          ) : (
            occurrences.map((d, i) => {
              const days = Math.round(
                (d.getTime() - START.getTime()) / 86400000,
              );
              return (
                <li
                  key={i}
                  className="flex items-baseline justify-between px-3 py-1.5 font-mono text-[12px]"
                >
                  <span className="flex items-baseline gap-2">
                    <span className="w-5 text-muted-foreground/60 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-foreground">
                      {d.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {days === 0
                      ? "today"
                      : days === 1
                        ? "tomorrow"
                        : `+${days}d`}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export function MiniCalendar({
  occurrences,
  offset,
  setOffset,
}: {
  occurrences: Date[];
  offset: number;
  setOffset: (n: number) => void;
}) {
  const current = new Date(START.getFullYear(), START.getMonth() + offset, 1);
  const y = current.getFullYear();
  const mo = current.getMonth();
  const firstDay = current.getDay();
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const today = START;

  const hits = new Set(
    occurrences
      .filter((d) => d.getFullYear() === y && d.getMonth() === mo)
      .map((d) => d.getDate()),
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset(offset - 1)}
          className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeftIcon className="size-3.5" />
        </button>
        <span className="font-mono text-[11px] text-foreground">
          {current.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          type="button"
          onClick={() => setOffset(offset + 1)}
          className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRightIcon className="size-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]"
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          if (c === null) return <div key={i} />;
          const isToday =
            c === today.getDate() &&
            mo === today.getMonth() &&
            y === today.getFullYear();
          const isHit = hits.has(c);
          return (
            <div key={i} className="grid place-items-center">
              <div
                className={
                  "grid size-7 place-items-center rounded-md font-mono text-[11px] tabular-nums " +
                  (isHit
                    ? "bg-foreground text-background"
                    : isToday
                      ? "border border-foreground/40 text-foreground"
                      : "text-foreground/70")
                }
              >
                {c}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 border-border/60 border-t pt-2 font-mono text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-foreground" />
          Occurrence
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm border border-foreground/40" />
          Today
        </span>
        <span className="ml-auto tabular-nums">
          {hits.size} this month
        </span>
      </div>
    </div>
  );
}
