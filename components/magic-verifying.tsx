import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EmailBanner } from "./shared/email-banner";
import { CardHeaderContent } from "./shared/card-header";
import { CARD_WIDTH_CLASS } from "./shared/constants";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { SCUTE_MAGIC_PARAM } from "@scute/nextjs-handlers";
import { useScuteClient } from "@scute/react-hooks";
import { ScuteTokenPayload } from "@scute/nextjs-handlers";

interface MagicVerifyingProps {
  email: string;
  magicLinkToken: string;
  authPayload: ScuteTokenPayload | null;
  setAuthPayload: (authPayload: ScuteTokenPayload) => void;
  onVerify: () => void;
}

export function MagicVerifying({
  email,
  magicLinkToken,
  authPayload,
  setAuthPayload,
  onVerify,
}: MagicVerifyingProps) {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeout = useRef<NodeJS.Timeout | null>(null);

  const scuteClient = useScuteClient();

  const removeTokenFromUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete(SCUTE_MAGIC_PARAM);
    window.history.replaceState(window.history.state, "", url.toString());
  };

  useEffect(() => {
    const verifyMagicLink = async () => {
      if (!magicLinkToken) {
        return;
      }

      const { data, error } = await scuteClient.verifyMagicLinkToken(
        magicLinkToken
      );

      if (error && !authPayload) {
        setError(error.message);
        return;
      }

      removeTokenFromUrl();

      if (data) {
        setVerified(true);
        setAuthPayload(data.authPayload);

        if (timeout.current) {
          return;
        }

        timeout.current = setTimeout(() => {
          onVerify();
        }, 1000);
      }
    };

    verifyMagicLink();
  }, [magicLinkToken, onVerify, setAuthPayload, authPayload]);

  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeaderContent
        icon={<Loader2 className="h-6 w-6 text-primary animate-spin" />}
        title={
          error
            ? "Error"
            : verified
            ? "Magic Link Verified"
            : "Verifying Your Identity"
        }
        description={
          error
            ? "Please try again."
            : verified
            ? "You will be redirected to Device Registration in soon..."
            : "Please wait while we verify your credentials. This will only take a moment."
        }
      />
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <EmailBanner email={email} />
      </CardContent>
    </Card>
  );
}
