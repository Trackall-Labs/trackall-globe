import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@orbit/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@orbit/ui/card";
import {
  OTPField,
  OTPFieldInput,
  OTPFieldSeparator,
} from "@orbit/ui/otp-field";
import { Spinner } from "@orbit/ui/spinner";

const RESEND_SECONDS = 45;

export function AuthOtpVerifyShowcasePage() {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const onVerify = () => {
    if (code.length !== 6 || pending) return;
    setPending(true);
    window.setTimeout(() => setPending(false), 1000);
  };

  const onResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <div className="min-h-svh bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a
          href="#"
          className="mb-3 inline-flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon className="size-3.5" />
          Cancel
        </a>

        <Card>
          <CardHeader className="items-center text-center">
            <div className="flex justify-center">
              <BrandMark />
            </div>
            <CardTitle className="mt-4 font-heading text-2xl tracking-tight">
              Enter your code
            </CardTitle>
            <CardDescription className="text-sm">
              We sent a 6-digit code to{" "}
              <span className="text-foreground">you@example.com</span>
            </CardDescription>
          </CardHeader>

          <CardPanel className="flex flex-col gap-6">
            <div className="flex justify-center">
              <OTPField
                value={code}
                onValueChange={setCode}
                length={6}
                size="lg"
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

            <div className="flex justify-center text-xs">
              {secondsLeft > 0 ? (
                <span className="text-muted-foreground">
                  Resend in {formatTime(secondsLeft)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResend}
                  className="text-foreground underline-offset-4 transition-colors hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={code.length !== 6 || pending}
              onClick={onVerify}
            >
              {pending ? (
                <>
                  <Spinner className="size-4" />
                  Verifying
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <div className="flex justify-center">
              <a
                href="#"
                className="text-muted-foreground text-xs transition-colors hover:text-foreground"
              >
                Try a different method →
              </a>
            </div>
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function BrandMark() {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className="size-9 text-foreground"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 3"
        opacity="0.55"
      />
      <circle cx="20" cy="20" r="6" fill="currentColor" />
    </svg>
  );
}
