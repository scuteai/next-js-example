import { Loader2 } from "lucide-react";
import { CARD_WIDTH_CLASS } from "./shared/constants";
import { CardHeaderContent } from "./shared/card-header";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ScuteIdentifier } from "@scute/react-hooks";

export const MagicLinkPending = ({
  identifier,
}: {
  identifier: ScuteIdentifier;
}) => {
  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeaderContent
        icon={<Loader2 className="h-6 w-6 text-primary animate-spin" />}
        title="Check your email"
        description={
          <>
            We&apos;ve sent you a magic link to{" "}
            <span className="font-medium text-foreground">{identifier}</span>.
            Click the link in your email to sign in.
          </>
        }
      />
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-full">
          <Button
            className="w-full"
            onClick={() => {
              window.location.reload();
            }}
          >
            Change email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
