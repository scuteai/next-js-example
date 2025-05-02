import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CardHeaderContent } from "./shared/card-header";
import { CARD_WIDTH_CLASS } from "./shared/constants";
import { useRef, useState } from "react";
import { useEffect } from "react";
import {
  SCUTE_MAGIC_PARAM,
  SCUTE_SKIP_PARAM,
  ScuteTokenPayload,
} from "@scute/nextjs-handlers";
import { useScuteClient } from "@scute/react-hooks";
import { views } from "./shared/constants";
import { redirect } from "next/navigation";

interface MagicVerifyingProps {
  magicLinkToken: string;
  setView: (view: string) => void;
  setAuthPayload: (authPayload: ScuteTokenPayload | null) => void;
}

export function MagicVerify({
  magicLinkToken,
  setView,
  setAuthPayload,
}: MagicVerifyingProps) {
  const url = new URL(window.location.href);
  const shouldSkipDeviceRegistration = !!url.searchParams.get(SCUTE_SKIP_PARAM);

  const [error, setError] = useState<string | null>(null);
  const verificationStarted = useRef(false);

  const scuteClient = useScuteClient();

  useEffect(() => {
    const verifyMagicLink = async () => {
      if (!magicLinkToken) {
        return;
      }

      const { data, error } = await scuteClient.verifyMagicLinkToken(
        magicLinkToken
      );

      if (error) {
        if (error.code === 404) {
          console.log("Invalid or expired magic link token");
          setError("Invalid or expired magic link token");
        } else {
          console.log(error);
          setError("Unknown error verifying magic link token");
        }
        return;
      }

      if (!shouldSkipDeviceRegistration && data?.authPayload) {
        setAuthPayload(data.authPayload);
        setView(views.WEBAUTHN_REGISTER);
      } else {
        redirect("/profile");
      }
      url.searchParams.delete(SCUTE_SKIP_PARAM);
      url.searchParams.delete(SCUTE_MAGIC_PARAM);
      window.history.replaceState({}, "", url.toString());
    };

    if (!verificationStarted.current) {
      verificationStarted.current = true;
      verifyMagicLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeaderContent
        icon={<Loader2 className="h-6 w-6 text-primary animate-spin" />}
        title={error ? "Error" : "Verifying Your Identity"}
        description={
          error
            ? error
            : "Please wait while we verify your credentials. This will only take a moment."
        }
        error={error}
      />
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4"></CardContent>
    </Card>
  );
}
