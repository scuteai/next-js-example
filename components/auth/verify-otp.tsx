"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Asterisk } from "lucide-react";
import { EmailBanner } from "./shared/email-banner";
import { CardHeaderContent } from "./shared/card-header";
import { CARD_WIDTH_CLASS, views } from "./shared/constants";
import { ScuteIdentifier, ScuteTokenPayload } from "@scute/nextjs-handlers";
import { useScuteClient } from "@scute/react-hooks";

interface VerifyOTPProps {
  length?: number;
  identifier: ScuteIdentifier;
  setView: (view: string) => void;
  setAuthPayload: (authPayload: ScuteTokenPayload) => void;
}

export const VerifyOTP = ({
  length = 6,
  identifier,
  setView,
  setAuthPayload,
}: VerifyOTPProps) => {
  const scuteClient = useScuteClient();
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (isNaN(Number(pastedData[i]))) continue;
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
  };

  const handleVerify = async () => {
    const { data, error } = await scuteClient.verifyOtp(
      otp.join(""),
      identifier
    );
    console.log({ data, error });
    // TODO: Handle error
    if (error) {
      console.log(JSON.stringify(error, null, 2));
    }
    if (data) {
      setAuthPayload(data.authPayload);
      setView(views.WEBAUTHN_REGISTER);
    }
  };

  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeaderContent
        icon={<Asterisk className="w-8 h-8 text-primary" />}
        title="Enter verification code"
        description="Please enter the code we sent to verify your identity"
      />
      <CardContent className="space-y-4">
        <EmailBanner email={identifier} />

        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-11 h-11 border-2 rounded-lg text-center text-xl font-semibold bg-background text-foreground focus:border-ring focus:outline-none transition-colors"
            />
          ))}
        </div>

        <Button className="w-full" onClick={handleVerify}>
          Verify Code
        </Button>
        <div className="text-center">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              window.location.reload();
            }}
          >
            Change phone number
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
