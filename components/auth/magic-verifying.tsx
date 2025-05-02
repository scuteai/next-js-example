import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EmailBanner } from "./shared/email-banner";
import { CardHeaderContent } from "./shared/card-header";
import { CARD_WIDTH_CLASS } from "./shared/constants";
import { useState } from "react";
import { useEffect } from "react";
import { SCUTE_MAGIC_PARAM, SCUTE_SKIP_PARAM } from "@scute/nextjs-handlers";
import { useScuteClient } from "@scute/react-hooks";
import { ScuteTokenPayload } from "@scute/nextjs-handlers";

interface MagicVerifyingProps {
  email: string;
  magicLinkToken: string;
  authPayload: ScuteTokenPayload | null;
  setAuthPayload: (authPayload: ScuteTokenPayload) => void;
}

export function MagicVerifying({
  email,
  magicLinkToken,
  setAuthPayload,
}: MagicVerifyingProps) {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scuteClient = useScuteClient();

  useEffect(() => {
    const verifyMagicLink = async () => {
      if (!magicLinkToken) {
        return;
      }

      const { data, error } = await scuteClient.verifyMagicLinkToken(
        magicLinkToken
      );

      console.log("verifyMagicLinkToken");
      console.log({ data, error });

      if (error) {
        console.log("error", error);
        setError(
          error.code === 404 ? "Invalid or expired magic link" : error.message
        );
        return;
      }

      if (data) {
        setVerified(true);
        setAuthPayload(data.authPayload);
      }
    };

    verifyMagicLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            ? error
            : verified
            ? "You will be redirected to Device Registration in soon..."
            : "Please wait while we verify your credentials. This will only take a moment."
        }
        error={error}
      />
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <EmailBanner email={email} />
      </CardContent>
    </Card>
  );
}
