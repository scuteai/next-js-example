"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { CARD_WIDTH_CLASS } from "./shared/constants";

import {
  ScuteMagicLinkIdResponse,
  ScuteUserMetaDataSchema,
} from "@scute/nextjs-handlers";
import { CardHeaderContent } from "./shared/card-header";
import { Loader2 } from "lucide-react";

export function AuthForm({
  email,
  handleEmailAuth,
  handleOAuth,
  metaFields,
  magicLinkResponse,
}: {
  email: string;
  handleEmailAuth: (email: string, metaFields: Record<string, string>) => void;
  handleOAuth: (provider: string) => void;
  metaFields: ScuteUserMetaDataSchema[];
  magicLinkResponse: ScuteMagicLinkIdResponse | null;
}) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { email, ...metaFields } = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    );

    await handleEmailAuth(
      email as string,
      metaFields as Record<string, string>
    );

    setIsLoading(false);
  };

  const onOAuth = (provider: string) => {
    setIsLoading(true);
    handleOAuth(provider);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  if (!!magicLinkResponse) {
    return <MagicLinkLoading email={email} />;
  }

  const registrationMetaFields = metaFields.filter(
    (field) => field.visible_registration
  );

  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in or sign up</CardTitle>
        <CardDescription>
          Enter your email to continue. We&apos;ll send you a magic link.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div>
          <Button
            variant="outline"
            disabled={isLoading}
            className="w-full"
            onClick={() => onOAuth("google")}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
                name="email"
                disabled={isLoading}
                required
              />
            </div>
            {registrationMetaFields.map((field) => (
              <div key={field.id} className="grid gap-2">
                <Label htmlFor={field.field_name}>{field.name}</Label>
                <Input
                  id={field.field_name}
                  name={field.field_name}
                  required={field.required}
                />
              </div>
            ))}
            <Button className="mt-1" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send magic link
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
        <p>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}

const MagicLinkLoading = ({ email }: { email: string }) => {
  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeaderContent
        icon={<Loader2 className="h-6 w-6 text-primary animate-spin" />}
        title="Check your email"
        description={
          <>
            We&apos;ve sent you a magic link to{" "}
            <span className="font-medium text-foreground">{email}</span>. Click
            the link in your email to sign in.
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
