"use client";

import { FaFingerprint } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardHeaderContent } from "./shared/card-header";
import { CARD_WIDTH_CLASS } from "./shared/constants";
import { useScuteClient } from "@scute/react-hooks";
import { EmailBanner } from "./shared/email-banner";

export const WebAuthnVerify = ({ identifier }: { identifier: string }) => {
  const scuteClient = useScuteClient();

  const isEmail = identifier.includes("@");
  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeaderContent
        icon={<FaFingerprint className="w-8 h-8 text-primary" />}
        title="Verifying your device"
        description="We are verifying your device"
      />
      <CardContent className="space-y-4">
        <EmailBanner email={identifier} />
        <Button
          className="w-full"
          onClick={() => {
            if (isEmail) {
              scuteClient.sendLoginMagicLink(identifier);
            } else {
              scuteClient.sendLoginOtp(identifier);
            }
          }}
        >
          Sign in with {isEmail ? "magic link" : "OTP"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.reload();
          }}
        >
          Go Back
        </Button>
      </CardContent>
    </Card>
  );
};
