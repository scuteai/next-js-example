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
import { Loader2, Trash2 } from "lucide-react";
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

  const handleDeleteSession = async (sessionId: string) => {
    const response = await scuteClient.revokeSession(sessionId);
    if (response.error) {
      console.error(response.error);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-4">
      {/* User Info Card */}
      <Card className="max-w-[500px]">
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
                  <span className="text-sm font-medium">Email Verified</span>
                  <span className="text-sm text-muted-foreground">
                    {user.email_verified ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm font-medium">Phone</span>
                  <span className="text-sm text-muted-foreground">
                    {user.phone}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm font-medium">Phone Verified</span>
                  <span className="text-sm text-muted-foreground">
                    {user.phone_verified ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {user.status}
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

      {/* Session List Card */}
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Your current active sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : user.sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No active sessions found
            </div>
          ) : (
            <div className="space-y-2">
              {user.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {session.browser} on {session.platform}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
                      <span className="font-mono">{session.id}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>
                        Last used:{" "}
                        {new Date(session.last_used_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{session.last_used_at_ip}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">Type: {session.type}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSession(session.id.toString())}
                    disabled={session.nickname === "current"}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete session</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Info Card */}
      <Card className="max-w-[500px]">
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
