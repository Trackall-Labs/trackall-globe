import { useState } from "react";
import {
  BatteryFull,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  HeartIcon,
  HomeIcon,
  MessageCircleIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  SignalHigh,
  UserIcon,
  Wifi,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@orbit/ui/avatar";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Separator } from "@orbit/ui/separator";

export type TabKey = "home" | "discover" | "create" | "alerts" | "profile";

const TAB_TITLES: Record<TabKey, string> = {
  home: "Home",
  discover: "Discover",
  create: "Create",
  alerts: "Notifications",
  profile: "Profile",
};

export function LayoutsBottomNavShowcasePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  return (
    <div className="relative min-h-svh bg-foreground/[0.04] flex items-center justify-center px-6 py-12 text-foreground">
      <PageBackdrop />
      <div className="relative flex flex-col items-center gap-5">
        <PhoneFrame activeTab={activeTab} setActiveTab={setActiveTab} />
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          MOBILE · 380×760
        </span>
      </div>
    </div>
  );
}

export function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: [
          "radial-gradient(60% 50% at 15% 10%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 65%)",
          "radial-gradient(50% 50% at 85% 95%, color-mix(in srgb, var(--foreground) 8%, transparent), transparent 65%)",
        ].join(", "),
      }}
    />
  );
}

export function PhoneFrame({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}) {
  return (
    <div className="relative w-[380px] h-[760px] rounded-[40px] border-8 border-foreground/15 bg-background shadow-2xl overflow-hidden">
      <div className="relative h-full w-full rounded-[28px] overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-24 h-6 rounded-full bg-foreground/85" />
        <div className="flex flex-col h-full">
          <StatusBar />
          <AppHeader title={TAB_TITLES[activeTab]} />
          <main className="flex-1 overflow-y-auto px-5 py-4">
            <TabContent tab={activeTab} />
          </main>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div className="h-10 px-6 flex items-center justify-between text-xs font-medium pt-3">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <SignalHigh className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4" />
      </div>
    </div>
  );
}

export function AppHeader({ title }: { title: string }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between border-b border-border/60">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Back">
          <ChevronLeftIcon />
        </Button>
        <h1 className="font-heading text-base">{title}</h1>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label="Search">
        <SearchIcon />
      </Button>
    </div>
  );
}

export function TabContent({ tab }: { tab: TabKey }) {
  if (tab === "home") return <HomeFeed />;
  if (tab === "discover") return <DiscoverGrid />;
  if (tab === "create") return <CreatePrompt />;
  if (tab === "alerts") return <AlertsList />;
  return <ProfileView />;
}

const FEED = [
  {
    name: "Ava Mercer",
    initials: "AM",
    content: "Shipped a new onboarding flow today. Conversion up 14%.",
    likes: 128,
    comments: 12,
    tone: "from-rose-300 to-amber-200",
  },
  {
    name: "Theo Park",
    initials: "TP",
    content: "Trying out a new typography stack — feels much sharper.",
    likes: 64,
    comments: 8,
    tone: "from-sky-300 to-indigo-300",
  },
  {
    name: "Mira Solis",
    initials: "MS",
    content: "Weekend studio dump. Sketches becoming real components.",
    likes: 212,
    comments: 24,
    tone: "from-emerald-300 to-teal-200",
  },
  {
    name: "Jonas Reed",
    initials: "JR",
    content: "First draft of the bottom-nav pattern. Feedback welcome.",
    likes: 41,
    comments: 5,
    tone: "from-violet-300 to-fuchsia-300",
  },
  {
    name: "Lin Hayes",
    initials: "LH",
    content: "Pair-design session was unreasonably productive.",
    likes: 89,
    comments: 14,
    tone: "from-orange-300 to-rose-300",
  },
];

export function HomeFeed() {
  return (
    <div className="flex flex-col gap-3">
      {FEED.map((item) => (
        <article
          key={item.name}
          className="rounded-2xl border border-border/60 bg-card p-3"
        >
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8">
              <AvatarFallback className="text-[11px]">
                {item.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none">{item.name}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                2h · Public
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-sm text-foreground/90 line-clamp-1">
            {item.content}
          </p>
          <div
            className={`mt-2.5 h-24 w-full rounded-xl bg-gradient-to-br ${item.tone}`}
          />
          <div className="mt-2.5 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <HeartIcon className="size-3.5" />
              {item.likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircleIcon className="size-3.5" />
              {item.comments}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

const DISCOVER = [
  { title: "Type & motion", tone: "from-amber-300 to-rose-300" },
  { title: "Editorial grids", tone: "from-sky-300 to-violet-300" },
  { title: "Color systems", tone: "from-emerald-300 to-cyan-300" },
  { title: "Iconography", tone: "from-fuchsia-300 to-orange-300" },
  { title: "Mobile patterns", tone: "from-indigo-300 to-teal-300" },
  { title: "Micro-interactions", tone: "from-rose-300 to-yellow-200" },
];

export function DiscoverGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {DISCOVER.map((item) => (
        <div key={item.title} className="flex flex-col gap-1.5">
          <div
            className={`aspect-square w-full rounded-2xl bg-gradient-to-br ${item.tone}`}
          />
          <p className="text-xs font-medium">{item.title}</p>
          <p className="text-[10px] text-muted-foreground -mt-1">
            24 explorations
          </p>
        </div>
      ))}
    </div>
  );
}

export function CreatePrompt() {
  return (
    <div className="flex h-full items-center justify-center py-10">
      <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border/80 bg-card/40 px-8 py-12 text-center w-full">
        <div className="flex size-16 items-center justify-center rounded-full bg-foreground text-background">
          <PlusIcon className="size-7" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-lg">Create something new</h2>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            Start a post, capture a thought, or upload from your library.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 pt-2">
          <Button size="sm" className="w-full">
            New post
          </Button>
          <Button size="sm" variant="outline" className="w-full">
            Upload media
          </Button>
        </div>
      </div>
    </div>
  );
}

const ALERTS_TODAY = [
  {
    name: "Ava Mercer",
    initials: "AM",
    text: "liked your post about onboarding metrics.",
    time: "12m",
  },
  {
    name: "Theo Park",
    initials: "TP",
    text: "started following you.",
    time: "1h",
  },
  {
    name: "Mira Solis",
    initials: "MS",
    text: "commented: \"This palette is gorgeous.\"",
    time: "3h",
  },
];

const ALERTS_EARLIER = [
  {
    name: "Lin Hayes",
    initials: "LH",
    text: "shared your design with their team.",
    time: "Yesterday",
  },
  {
    name: "Jonas Reed",
    initials: "JR",
    text: "mentioned you in a thread.",
    time: "Mon",
  },
];

export function AlertsList() {
  return (
    <div className="flex flex-col gap-4">
      <AlertSection label="Today" items={ALERTS_TODAY} />
      <AlertSection label="Earlier" items={ALERTS_EARLIER} />
    </div>
  );
}

export function AlertSection({
  label,
  items,
}: {
  label: string;
  items: typeof ALERTS_TODAY;
}) {
  return (
    <section className="flex flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col rounded-2xl border border-border/60 bg-card divide-y divide-border/60">
        {items.map((item) => (
          <div key={item.name + item.time} className="flex items-start gap-2.5 p-3">
            <Avatar className="size-8 mt-0.5">
              <AvatarFallback className="text-[11px]">
                {item.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-snug">
                <span className="font-medium">{item.name}</span>{" "}
                <span className="text-muted-foreground">{item.text}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const PROFILE_ACTIONS = [
  { icon: SettingsIcon, label: "Account settings", hint: "Profile, plan, billing" },
  { icon: BellIcon, label: "Notifications", hint: "Email, push, digest" },
  { icon: ShieldIcon, label: "Privacy & security", hint: "2FA, sessions, devices" },
];

export function ProfileView() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 pt-2">
        <Avatar className="size-20">
          <AvatarFallback className="text-lg">SB</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-heading text-base">Sean Brydon</p>
          <p className="text-xs text-muted-foreground">
            Product designer · Brooklyn
          </p>
        </div>
        <Badge variant="secondary" className="mt-1">
          Pro member
        </Badge>
      </div>

      <div className="flex items-stretch rounded-2xl border border-border/60 bg-card">
        <ProfileStat label="Posts" value="142" />
        <Separator orientation="vertical" />
        <ProfileStat label="Followers" value="2.4k" />
        <Separator orientation="vertical" />
        <ProfileStat label="Following" value="318" />
      </div>

      <div className="flex flex-col rounded-2xl border border-border/60 bg-card divide-y divide-border/60">
        {PROFILE_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            className="flex items-center gap-3 p-3.5 text-left hover:bg-muted/40 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <action.icon className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-[11px] text-muted-foreground">{action.hint}</p>
            </div>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-3">
      <span className="font-heading text-base">{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-0.5">
        {label}
      </span>
    </div>
  );
}

export type TabDef = {
  key: TabKey;
  label: string;
  icon: typeof HomeIcon;
  badge?: string;
};

const TABS: TabDef[] = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "discover", label: "Discover", icon: CompassIcon },
  { key: "create", label: "Create", icon: PlusIcon },
  { key: "alerts", label: "Alerts", icon: BellIcon, badge: "3" },
  { key: "profile", label: "Profile", icon: UserIcon },
];

export function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}) {
  return (
    <nav className="h-[72px] border-t border-border/60 bg-background flex items-stretch justify-around relative">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const isCenter = tab.key === "create";

        if (isCenter) {
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-label={tab.label}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 cursor-pointer"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-foreground text-background -translate-y-3 shadow-md">
                <PlusIcon className="size-5" />
              </span>
              <span
                className={`text-[10px] -mt-2 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 cursor-pointer transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {isActive ? (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-foreground" />
            ) : null}
            <span className="relative">
              <Icon
                className="size-5"
                strokeWidth={isActive ? 2.4 : 2}
              />
              {tab.badge ? (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-foreground text-background text-[9px] font-medium flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </span>
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
