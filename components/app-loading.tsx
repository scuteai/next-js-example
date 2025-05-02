import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CardHeaderContent } from "./auth/shared/card-header";

export function AppLoading() {
  return (
    <Card className="w-[300px]">
      <CardHeaderContent
        icon={<Loader2 className="h-6 w-6 text-primary animate-spin" />}
        title="Please Wait"
      />
    </Card>
  );
}
