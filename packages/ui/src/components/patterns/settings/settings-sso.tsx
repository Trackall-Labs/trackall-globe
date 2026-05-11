import { useState } from "react";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  KeyRoundIcon,
  LoaderIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@orbit/ui/button";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@orbit/ui/select";
import { Switch } from "@orbit/ui/switch";

export interface Provider {
  id: string;
  name: string;
  description: string;
  letter: string;
  tone: string;
  inProgress?: { step: number; total: number };
}

const PROVIDERS: Provider[] = [
  {
    id: "okta",
    name: "Okta",
    description: "Enterprise IdP with SAML 2.0 + SCIM provisioning.",
    letter: "O",
    tone: "bg-[#007DC1] text-white",
    inProgress: { step: 2, total: 4 },
  },
  {
    id: "google",
    name: "Google Workspace",
    description: "Sign in with corporate Google accounts.",
    letter: "G",
    tone: "bg-[#4285F4] text-white",
  },
  {
    id: "azure",
    name: "Azure AD",
    description: "Microsoft Entra ID via SAML or OIDC.",
    letter: "A",
    tone: "bg-[#0078D4] text-white",
  },
  {
    id: "saml",
    name: "Generic SAML",
    description: "Any SAML 2.0 compliant identity provider.",
    letter: "S",
    tone: "bg-foreground text-background",
  },
];

const STEPS = [
  { id: 1, title: "Application setup", hint: "Endpoints" },
  { id: 2, title: "Attribute mapping", hint: "Claims" },
  { id: 3, title: "Test connection", hint: "Verify" },
  { id: 4, title: "Enforce SSO", hint: "Rollout" },
] as const;

const TARGET_FIELDS = [
  { value: "email", label: "user.email" },
  { value: "first_name", label: "user.firstName" },
  { value: "last_name", label: "user.lastName" },
  { value: "full_name", label: "user.fullName" },
  { value: "groups", label: "user.groups" },
  { value: "role", label: "user.role" },
  { value: "department", label: "user.department" },
  { value: "ignore", label: "(ignore)" },
];

export interface Mapping {
  id: string;
  source: string;
  target: string;
  required?: boolean;
}

const INITIAL_MAPPINGS: Mapping[] = [
  { id: "m1", source: "email", target: "email", required: true },
  { id: "m2", source: "firstName", target: "first_name" },
  { id: "m3", source: "lastName", target: "last_name" },
  { id: "m4", source: "groups", target: "groups" },
];

export function SettingsSsoShowcasePage() {
  const [currentStep, setCurrentStep] = useState(2);
  // Steps 1..currentStep-1 are completed when navigating forward; we track
  // the highest step the user has reached so the rail shows checks correctly.
  const [maxReached, setMaxReached] = useState(2);
  const [mappings, setMappings] = useState<Mapping[]>(INITIAL_MAPPINGS);
  const [testState, setTestState] = useState<"idle" | "running" | "success">(
    "idle",
  );
  const [showJson, setShowJson] = useState(false);
  const [enforce, setEnforce] = useState(false);

  const goTo = (step: number) => {
    setCurrentStep(step);
    if (step > maxReached) setMaxReached(step);
  };

  const next = () => {
    if (currentStep < STEPS.length) goTo(currentStep + 1);
  };
  const back = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const runTest = () => {
    setTestState("running");
    setTimeout(() => setTestState("success"), 900);
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-8 py-12">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Settings · Authentication
        </div>
        <h1 className="mt-1 font-heading text-3xl">Single Sign-On</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Let your team sign in through your identity provider.
        </p>

        {/* Provider picker */}
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-medium text-sm">Choose a provider</h2>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              SAML 2.0 · OIDC
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROVIDERS.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </ul>
        </div>

        {/* Wizard */}
        <div className="mt-10 overflow-hidden rounded-xl border border-border/70 bg-background/40">
          <div className="flex items-center justify-between border-border/60 border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#007DC1] font-medium text-[13px] text-white">
                O
              </div>
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Configuring · Okta
                </div>
                <div className="mt-0.5 font-heading text-base">
                  SAML application
                </div>
              </div>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Step {String(currentStep).padStart(2, "0")} / 04
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
            {/* Step rail */}
            <ol className="flex flex-col gap-1 border-border/60 px-3 py-5 md:border-r">
              {STEPS.map((s) => {
                const isCurrent = s.id === currentStep;
                const isComplete = s.id < maxReached;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(s.id)}
                      className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
                        isCurrent
                          ? "bg-foreground/[0.06]"
                          : "hover:bg-foreground/[0.04]"
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-[10px] ${
                          isComplete
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : isCurrent
                              ? "bg-foreground text-background"
                              : "border border-border/70 text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <CheckIcon className="size-3" />
                        ) : (
                          s.id
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm ${
                            isCurrent
                              ? "font-medium text-foreground"
                              : "text-foreground/85"
                          }`}
                        >
                          {s.title}
                        </span>
                        <span className="block font-mono text-[9px] text-muted-foreground uppercase tracking-[0.25em]">
                          {s.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Step pane */}
            <div className="px-6 py-6">
              {currentStep === 1 ? <ApplicationSetupStep /> : null}
              {currentStep === 2 ? (
                <AttributeMappingStep
                  mappings={mappings}
                  onChange={(id, target) =>
                    setMappings((prev) =>
                      prev.map((m) =>
                        m.id === id ? { ...m, target } : m,
                      ),
                    )
                  }
                  onAdd={() =>
                    setMappings((prev) => [
                      ...prev,
                      {
                        id: `m${prev.length + 1}-${Date.now()}`,
                        source: "",
                        target: "ignore",
                      },
                    ])
                  }
                />
              ) : null}
              {currentStep === 3 ? (
                <TestConnectionStep
                  state={testState}
                  onRun={runTest}
                  showJson={showJson}
                  onToggleJson={() => setShowJson((v) => !v)}
                />
              ) : null}
              {currentStep === 4 ? (
                <EnforceStep enforce={enforce} onToggle={setEnforce} />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between border-border/60 border-t bg-muted/20 px-5 py-3">
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                {currentStep === STEPS.length ? "Final step" : "Continue when ready"}
              </span>
              {currentStep === STEPS.length ? (
                <Button type="button">Save & enforce</Button>
              ) : (
                <Button type="button" onClick={next}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <li className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:border-foreground/30">
      <div className="flex items-start justify-between">
        <div
          className={`grid size-10 place-items-center rounded-lg font-medium text-base ${provider.tone}`}
        >
          {provider.letter}
        </div>
        {provider.inProgress ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
            Step {provider.inProgress.step} of {provider.inProgress.total}
          </span>
        ) : null}
      </div>

      <div>
        <div className="font-medium text-sm">{provider.name}</div>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {provider.description}
        </p>
      </div>

      <div className="mt-auto pt-1">
        <Button
          size="sm"
          variant="outline"
          type="button"
          className="w-full"
        >
          {provider.inProgress ? "Resume setup" : "Set up"}
        </Button>
      </div>
    </li>
  );
}

export function ApplicationSetupStep() {
  return (
    <div>
      <StepHeader
        eyebrow="Step 01"
        title="Application setup"
        description="Paste these endpoints into your Okta SAML application. They identify Orbit as the service provider."
      />

      <div className="mt-6 flex flex-col gap-3">
        <CopyRow
          label="SSO URL (ACS)"
          value="https://orbit.app/api/auth/saml/acme/callback"
        />
        <CopyRow label="Audience URI" value="urn:orbit:saml:acme" />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3">
        <KeyRoundIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          In Okta, create a new SAML 2.0 app and paste these into the
          <span className="text-foreground"> Single sign-on URL </span>
          and
          <span className="text-foreground"> Audience URI </span>
          fields. Leave name ID format as
          <span className="text-foreground"> EmailAddress</span>.
        </p>
      </div>
    </div>
  );
}

export function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {label}
      </div>
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2">
        <code className="flex-1 truncate font-mono text-xs">{value}</code>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <CopyIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function AttributeMappingStep({
  mappings,
  onChange,
  onAdd,
}: {
  mappings: Mapping[];
  onChange: (id: string, target: string) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 02"
        title="Attribute mapping"
        description="Map SAML assertion attributes from your IdP to Orbit user fields. Email is required — everything else is optional."
      />

      <div className="mt-6 overflow-hidden rounded-md border border-border/60">
        <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 border-border/60 border-b bg-muted/30 px-4 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          <span>IdP attribute</span>
          <span className="w-4" />
          <span>Orbit field</span>
          <span className="w-16 text-right">Required</span>
        </div>
        <ul>
          {mappings.map((m, idx) => (
            <li
              key={m.id}
              className={`grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 px-4 py-2.5 ${
                idx < mappings.length - 1 ? "border-border/60 border-b" : ""
              }`}
            >
              <code className="truncate font-mono text-xs text-foreground/85">
                {m.source || (
                  <span className="text-muted-foreground italic">
                    new.attribute
                  </span>
                )}
              </code>
              <ChevronRightIcon className="size-3.5 text-muted-foreground" />
              <Select
                value={m.target}
                onValueChange={(v: unknown) => onChange(m.id, String(v))}
              >
                <SelectTrigger size="sm" className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {TARGET_FIELDS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <div className="w-16 text-right">
                {m.required ? (
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                    Required
                  </span>
                ) : (
                  <span className="font-mono text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em]">
                    Optional
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:text-foreground"
      >
        <PlusIcon className="size-3" />
        Add mapping
      </button>
    </div>
  );
}

export function TestConnectionStep({
  state,
  onRun,
  showJson,
  onToggleJson,
}: {
  state: "idle" | "running" | "success";
  onRun: () => void;
  showJson: boolean;
  onToggleJson: () => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 03"
        title="Test connection"
        description="Trigger a test login against your IdP. We'll show the attributes we received so you can confirm the mapping."
      />

      {state === "success" ? (
        <div className="mt-6 rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckIcon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">
                Test login successful
              </div>
              <p className="mt-0.5 text-muted-foreground text-xs">
                User attributes received from Okta. Mapped 4 of 4 fields.
              </p>

              <button
                type="button"
                onClick={onToggleJson}
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] transition-colors hover:text-foreground"
              >
                <ChevronDownIcon
                  className={`size-3 transition-transform ${
                    showJson ? "" : "-rotate-90"
                  }`}
                />
                {showJson ? "Hide" : "Show"} received attributes
              </button>

              {showJson ? (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border/60 bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground/85">
                  {`{
  "nameId": "ada@acme.com",
  "email": "ada@acme.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "groups": [
    "engineering",
    "admins"
  ],
  "sessionIndex": "_2f9c…7e1a"
}`}
                </pre>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-border/70 bg-background/30 p-6 text-center">
          <p className="text-muted-foreground text-xs">
            Opens a new tab to your IdP, then redirects back here with the
            asserted attributes. Nothing is saved.
          </p>
          <Button
            type="button"
            onClick={onRun}
            disabled={state === "running"}
            className="mt-4"
          >
            {state === "running" ? (
              <>
                <LoaderIcon className="size-3.5 animate-spin" />
                Waiting for IdP…
              </>
            ) : (
              "Run test login"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function EnforceStep({
  enforce,
  onToggle,
}: {
  enforce: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 04"
        title="Enforce SSO"
        description="Once enforced, all members must authenticate through your IdP. Personal credentials stop working immediately."
      />

      <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/[0.06] p-4">
        <div className="flex items-start gap-3">
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangleIcon className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm">
              This is a one-way switch
            </div>
            <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
              All members will be required to sign in via your IdP. Existing
              password sessions will be revoked. Service accounts and API
              tokens are unaffected.
            </p>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-sm">Require SSO for all members</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  17 active sessions will be revoked
                </div>
              </div>
              <Switch checked={enforce} onCheckedChange={onToggle} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        {eyebrow}
      </div>
      <h3 className="mt-1 font-heading text-xl">{title}</h3>
      <p className="mt-1.5 max-w-prose text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
