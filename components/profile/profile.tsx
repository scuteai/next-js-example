"use client";
import { useEffect, useState } from "react";
import { ScuteAppData } from "@scute/nextjs-handlers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth, useScuteClient } from "@scute/react-hooks";

export function Profile() {
  const { user } = useAuth();
  const scuteClient = useScuteClient();
  const [appData, setAppData] = useState<ScuteAppData | null>(null);

  useEffect(() => {
    scuteClient.getAppData().then(({ data, error }) => {
      if (error) {
        console.error(error);
      } else {
        setAppData(data);
      }
    });
  }, [scuteClient]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* User Info Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between py-1">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {user.status}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm font-medium">Email Verified</span>
                  <span className="text-sm text-muted-foreground">
                    {user.email_verified ? "Yes" : "No"}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between py-1">
                  <span className="text-sm font-medium">Signup Date</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(user.signup_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                onClick={async () => scuteClient.signOut()}
                variant="destructive"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Info Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>Current application configuration</CardDescription>
        </CardHeader>
        <CardContent>
          {appData ? (
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">App Name</span>
                <span className="text-sm text-muted-foreground">
                  {appData.name}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Public Signup</span>
                <span className="text-sm text-muted-foreground">
                  {appData.public_signup ? "Enabled" : "Disabled"}
                </span>
              </div>

              <Separator className="my-2" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Required Identifiers
                </span>
                <span className="text-sm text-muted-foreground">
                  {appData.required_identifiers.join(", ")}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
