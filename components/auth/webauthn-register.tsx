"use client";

import { FaFingerprint } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardHeaderContent } from "./shared/card-header";
import { CARD_WIDTH_CLASS } from "./shared/constants";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useScuteClient } from "@scute/react-hooks";
import { redirect } from "next/navigation";
import { ScuteTokenPayload } from "@scute/nextjs-handlers";
interface WebAuthnProps {
  authPayload: ScuteTokenPayload;
}

export const WebAuthnRegister = ({ authPayload }: WebAuthnProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const scuteClient = useScuteClient();

  const handleRegisterDevice = async () => {
    setLoading(true);
    const { error: signInError } = await scuteClient.signInWithTokenPayload(
      authPayload
    );

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { error } = await scuteClient.addDevice();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    redirect("/profile");
  };

  const handleSkipAndLogin = async () => {
    setLoading(true);
    const { error: signInError } = await scuteClient.signInWithTokenPayload(
      authPayload
    );

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    redirect("/profile");
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeaderContent
        icon={<FaFingerprint className="w-8 h-8 text-primary" />}
        title="Register Your Device"
        description="Enhance your account security by registering this device"
      />
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          onClick={handleRegisterDevice}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Registering Device..." : "Register Device"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSkipAndLogin}
        >
          Skip and Login
        </Button>
      </CardContent>
    </Card>
  );
};
