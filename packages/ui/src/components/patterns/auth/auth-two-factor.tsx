import { type FormEvent, useState } from "react";
import { LifeBuoyIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import { Card, CardFooter, CardHeader, CardPanel } from "@orbit/ui/card";
import { Field, FieldLabel } from "@orbit/ui/field";
import { Input } from "@orbit/ui/input";
import { Label } from "@orbit/ui/label";
import {
  OTPField,
  OTPFieldInput,
  OTPFieldSeparator,
} from "@orbit/ui/otp-field";
import { Switch } from "@orbit/ui/switch";

export type Mode = "code" | "recovery";

export function AuthTwoFactorShowcasePage() {
  const [mode, setMode] = useState<Mode>("code");
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [pending, setPending] = useState(false);

  const switchToRecovery = () => {
    setMode("recovery");
    setCode("");
  };

  const switchToCode = () => {
    setMode("code");
    setRecoveryCode("");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === "code" && code.length !== 6) return;
    if (mode === "recovery" && recoveryCode.length < 8) return;
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      console.log("2fa submit", {
        mode,
        code: mode === "code" ? code : recoveryCode,
        remember,
      });
    }, 800);
  };

  return (
    <div className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <BrandMark />
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Step 2 of 2
            </span>
            <h1 className="font-heading text-2xl tracking-tight">
              Two-factor authentication
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "code"
                ? "Open your authenticator app and enter the 6-digit code."
                : "Enter one of your one-time recovery codes."}
            </p>
          </div>
        </CardHeader>

        <CardPanel>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {mode === "code" ? (
              <CodeFields
                code={code}
                setCode={setCode}
                remember={remember}
                setRemember={setRemember}
              />
            ) : (
              <RecoveryFields
                recoveryCode={recoveryCode}
                setRecoveryCode={setRecoveryCode}
              />
            )}

            <Button
              type="submit"
              size="lg"
              loading={pending}
              disabled={
                mode === "code"
                  ? code.length !== 6
                  : recoveryCode.length < 8
              }
              className="w-full"
            >
              Verify
            </Button>

            <button
              type="button"
              onClick={mode === "code" ? switchToRecovery : switchToCode}
              className="text-center text-muted-foreground text-sm transition-colors hover:text-foreground hover:underline"
            >
              {mode === "code"
                ? "Use a recovery code instead"
                : "Try authenticator app instead"}
            </button>
          </form>
        </CardPanel>

        <CardFooter className="justify-center">
          <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <LifeBuoyIcon className="size-3.5" />
            Lost access?{" "}
            <a href="#" className="underline hover:text-foreground">
              Contact support
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export function CodeFields({
  code,
  setCode,
  remember,
  setRemember,
}: {
  code: string;
  setCode: (v: string) => void;
  remember: boolean;
  setRemember: (v: boolean) => void;
}) {
  return (
    <>
      <div className="flex justify-center">
        <OTPField
          size="lg"
          length={6}
          value={code}
          onValueChange={(value) => setCode(value)}
        >
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldSeparator />
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldInput />
        </OTPField>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
        <Label htmlFor="remember-device" className="text-sm font-normal">
          Remember this device for 30 days
        </Label>
        <Switch
          id="remember-device"
          checked={remember}
          onCheckedChange={setRemember}
        />
      </div>
    </>
  );
}

export function RecoveryFields({
  recoveryCode,
  setRecoveryCode,
}: {
  recoveryCode: string;
  setRecoveryCode: (v: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="recovery-code" className="sr-only">
        Recovery code
      </FieldLabel>
      <Input
        id="recovery-code"
        type="text"
        autoComplete="one-time-code"
        autoFocus
        placeholder="xxxxx-xxxxx"
        value={recoveryCode}
        onChange={(e) => setRecoveryCode(e.target.value)}
        nativeInput
        className="text-center font-mono tracking-[0.2em]"
      />
    </Field>
  );
}

export function BrandMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className="size-9"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <rect width="64" height="64" rx="14" fill="url(#tfa-bg)" />
      <g transform="translate(32 32) rotate(-25)">
        <path
          d="M -23 0 A 23 8 0 0 1 23 0"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <circle cx="32" cy="32" r="13" fill="url(#tfa-sphere)" />
      <g transform="translate(32 32) rotate(-25)">
        <path
          d="M 23 0 A 23 8 0 0 1 -23 0"
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <radialGradient id="tfa-bg" cx="50%" cy="15%" r="95%">
          <stop offset="0%" stopColor="#1d1d2c" />
          <stop offset="100%" stopColor="#0a0a0f" />
        </radialGradient>
        <linearGradient id="tfa-sphere" x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#b9b9d2" />
          <stop offset="100%" stopColor="#5a5a78" />
        </linearGradient>
      </defs>
    </svg>
  );
}
