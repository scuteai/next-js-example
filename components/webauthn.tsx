"use client";

import { FaFingerprint } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardHeaderContent } from "./shared/card-header";
import { CARD_WIDTH_CLASS } from "./shared/constants";

interface WebAuthnProps {
  handleRegisterDevice: () => void;
  handleSkipDeviceRegistrationAndLogin: () => void;
}

export const WebAuthn = ({
  handleRegisterDevice,
  handleSkipDeviceRegistrationAndLogin,
}: WebAuthnProps) => {
  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeaderContent
        icon={<FaFingerprint className="w-8 h-8 text-primary" />}
        title="Register Your Device"
        description="Enhance your account security by registering this device"
      />
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={handleRegisterDevice}>
          Register Device
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSkipDeviceRegistrationAndLogin}
        >
          Skip and Login
        </Button>
      </CardContent>
    </Card>
  );
};
