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

import { getMeaningfulError, ScuteIdentifier } from "@scute/nextjs-handlers";
import { useScuteClient } from "@scute/react-hooks";
import { redirect } from "next/navigation";

export function EmailAuthForm({
  setIdentifier,
}: {
  setIdentifier: (identifier: ScuteIdentifier) => void;
}) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const scuteClient = useScuteClient();

  const [error, setError] = React.useState<string | null>(null);

  const onPhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { phone } = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as { phone: string };
    const identifier = phone.replace(/[^\d]+/g, "");
    setIdentifier(identifier);
    const { data, error } = await scuteClient.signInOrUp(identifier);

    if (error) {
      // TODO: Better error handling on sign in or up
      console.log(error.message, error.name, error.cause, error.stack);
      console.log(getMeaningfulError(error));
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (!data) {
      // webauthn enabled and device is registered
      redirect("/profile");
    }
    setIsLoading(false);
  };

  const onEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { email } = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as { email: string };

    setIdentifier(email);
    const { data, error } = await scuteClient.signInOrUp(email);

    if (error) {
      // TODO: Better error handling on sign in or up
      console.log(error.message, error.name, error.cause, error.stack);
      console.log(getMeaningfulError(error));
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (!data) {
      // webauthn enabled and device is registered
      redirect("/profile");
    }
    setIsLoading(false);
  };

  const onOAuth = async (provider: string) => {
    setIsLoading(true);
    await scuteClient.signInWithOAuthProvider(provider);
    setIsLoading(false);
  };

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return (
    <Card className={CARD_WIDTH_CLASS}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in or sign up</CardTitle>
        <CardDescription>Enter your email to continue.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <form onSubmit={onEmailSubmit}>
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
            <Button className="mt-1" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in or sign up
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <form onSubmit={onPhoneSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="123-456-7890"
                type="tel"
                autoComplete="tel"
                name="phone"
                disabled={isLoading}
                required
              />
            </div>
            <Button className="mt-1" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in or sign up
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
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
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground"></CardFooter>
    </Card>
  );
}
