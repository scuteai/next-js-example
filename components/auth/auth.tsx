"use client";
import { EmailAuthForm } from "@/components/auth/auth-form";
import { MagicVerify } from "@/components/auth/magic-verify";
import { WebAuthnRegister } from "@/components/auth/webauthn-register";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { AppLoading } from "@/components/app-loading";
import { appStates, views } from "@/components/auth/shared/constants";
import {
  AUTH_CHANGE_EVENTS,
  ScuteIdentifier,
  ScuteTokenPayload,
  useScuteClient,
} from "@scute/react-hooks";
import { MagicLinkPending } from "./magic-link-pending";
import { WebAuthnVerify } from "./webauthn-verify";
import { VerifyOTP } from "./verify-otp";

export function Auth() {
  // App states
  const [appState, setAppState] = useState(appStates.LOADING);
  const [view, setView] = useState(views.SIGN_IN_OR_UP);

  // Magic link states
  const [magicLinkToken, setMagicLinkToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authPayload, setAuthPayload] = useState<ScuteTokenPayload | null>(
    null
  );
  const [identifier, setIdentifier] = useState<ScuteIdentifier>("");
  const scuteClient = useScuteClient();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await scuteClient.getAuthToken();

      // If user is already logged in, redirect to profile
      if (data?.access) {
        return redirect("/profile");
      }

      const { error: appDataError } = await scuteClient.getAppData();

      if (appDataError) {
        console.error(appDataError);
        setError(appDataError.message);
        setAppState(appStates.ERROR);
        return;
      }

      setAppState(appStates.READY);
    };
    getSession();
  }, [scuteClient]);

  useEffect(() => {
    const unsubscribe = scuteClient.onAuthStateChange(async (event) => {
      console.log({ authState: event });
      if (
        event === AUTH_CHANGE_EVENTS.MAGIC_PENDING ||
        event === AUTH_CHANGE_EVENTS.MAGIC_NEW_DEVICE_PENDING
      ) {
        setView(views.MAGIC_PENDING);
      }

      if (event === AUTH_CHANGE_EVENTS.WEBAUTHN_VERIFY_START) {
        setView(views.WEBAUTHN_VERIFY);
      }

      if (
        event === AUTH_CHANGE_EVENTS.OTP_PENDING ||
        event === AUTH_CHANGE_EVENTS.OTP_NEW_DEVICE_PENDING
      ) {
        setView(views.OTP_PENDING);
      }
    });

    return () => unsubscribe();
  }, [scuteClient]);

  // Catch magic link token from url if it exists and verify it
  useEffect(() => {
    const magicLinkToken = scuteClient.getMagicLinkToken();
    if (magicLinkToken) {
      setView(views.MAGIC_VERIFYING);
      setMagicLinkToken(magicLinkToken);
    }
  }, [scuteClient]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {appState === appStates.LOADING && <AppLoading />}
        {appState === appStates.ERROR && <div>Error: {error}</div>}
        {appState === appStates.READY && (
          <>
            {view === views.SIGN_IN_OR_UP && (
              <EmailAuthForm setIdentifier={setIdentifier} />
            )}
            {view === views.MAGIC_PENDING && (
              <MagicLinkPending identifier={identifier} />
            )}
            {view === views.MAGIC_VERIFYING && (
              <MagicVerify
                magicLinkToken={magicLinkToken}
                setView={setView}
                setAuthPayload={setAuthPayload}
              />
            )}
            {view === views.WEBAUTHN_REGISTER && authPayload && (
              <WebAuthnRegister authPayload={authPayload} />
            )}
            {view === views.WEBAUTHN_VERIFY && (
              <WebAuthnVerify identifier={identifier} />
            )}
            {view === views.OTP_PENDING && (
              <VerifyOTP
                identifier={identifier}
                setView={setView}
                setAuthPayload={setAuthPayload}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
