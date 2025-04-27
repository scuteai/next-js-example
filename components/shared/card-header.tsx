import { ReactNode } from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CardHeaderContentProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
}

export function CardHeaderContent({
  icon,
  title,
  description,
}: CardHeaderContentProps) {
  return (
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
          {icon}
        </div>
      </div>
      <CardTitle className="text-2xl font-semibold tracking-tight">
        {title}
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
  );
}
