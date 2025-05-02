"use client";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { MagicVerifying } from "@/components/auth/magic-verifying";
import { WebAuthn } from "@/components/auth/webauthn";
import {
  getMeaningfulError,
  SCUTE_MAGIC_PARAM,
  SCUTE_SKIP_PARAM,
  ScuteMagicLinkIdResponse,
  ScuteTokenPayload,
} from "@scute/nextjs-handlers";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppLoading } from "@/components/app-loading";
import { appStates, views } from "@/components/auth/shared/constants";
import { useScuteClient } from "@scute/react-hooks";

export function Auth() {
  // App states
  const [appState, setAppState] = useState(appStates.LOADING);
  const [view, setView] = useState(views.SIGN_IN_OR_UP);

  // Magic link states
  const [magicLinkToken, setMagicLinkToken] = useState("");
  const [authPayload, setAuthPayload] = useState<ScuteTokenPayload | null>(
    null
  );
  const [magicLinkResponse, setMagicLinkResponse] =
    useState<ScuteMagicLinkIdResponse | null>(null);

  // --
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deviceRegistrationInProgress, setDeviceRegistrationInProgress] =
    useState(false);

  const scuteClient = useScuteClient();

  const handleVerifyMagicLink = (magicLinkToken: string) => {
    setView(views.MAGIC_VERIFYING);
    setMagicLinkToken(magicLinkToken);
  };

  const handleEmailAuth = async (email: string) => {
    setEmail(email);
    const { data, error } = await scuteClient.signInOrUp(email);

    console.log({ data, error });

    if (error) {
      console.error(getMeaningfulError(error));
      setError(getMeaningfulError(error).message);
      setAppState(appStates.ERROR);
      return;
    }

    if (!data) {
      // webauthn enabled and device is registered
      redirect("/profile");
    } else {
      // magic link is sent
      setMagicLinkResponse(data as ScuteMagicLinkIdResponse);
    }
  };

  const handleOAuth = (provider: string) => {
    console.log("handleOAuth", provider);
    scuteClient.signInWithOAuthProvider(provider);
  };

  const handleRegisterDevice = async () => {
    setDeviceRegistrationInProgress(true);
    if (!authPayload) {
      return;
    }

    const { error: signInError } = await scuteClient.signInWithTokenPayload(
      authPayload
    );

    if (signInError) {
      setError(signInError.message);
      setDeviceRegistrationInProgress(false);
      return;
    }

    const { error: addDeviceError } = await scuteClient.addDevice();

    if (addDeviceError) {
      setError(addDeviceError.message);
      setDeviceRegistrationInProgress(false);
      return;
    }

    setDeviceRegistrationInProgress(false);

    redirect("/profile");
  };

  const handleSkipDeviceRegistrationAndLogin = useCallback(async () => {
    console.log("handleSkipDeviceRegistrationAndLogin");
    console.log({ authPayload });
    if (!authPayload) {
      return;
    }

    const { error } = await scuteClient.signInWithTokenPayload(authPayload);

    if (error) {
      setError(error.message);
      console.log(error);
    }

    redirect("/profile");
  }, [authPayload, scuteClient]);

  useEffect(() => {
    if (authPayload) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("sct_sk") === "true") {
        handleSkipDeviceRegistrationAndLogin();
      } else {
        setView(views.WEBAUTHN);
      }
      url.searchParams.delete(SCUTE_MAGIC_PARAM);
      url.searchParams.delete(SCUTE_SKIP_PARAM);
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, [authPayload, handleSkipDeviceRegistrationAndLogin]);

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
  }, []);

  // Catch magic link token from url if it exists and verify it
  useEffect(() => {
    const magicLinkToken = scuteClient.getMagicLinkToken();
    if (magicLinkToken) {
      handleVerifyMagicLink(magicLinkToken);
    }
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {appState === appStates.LOADING && <AppLoading />}
        {appState === appStates.ERROR && <div>Error: {error}</div>}
        {appState === appStates.READY && (
          <>
            {view === views.SIGN_IN_OR_UP && (
              <EmailAuthForm
                email={email}
                handleEmailAuth={handleEmailAuth}
                handleOAuth={handleOAuth}
                magicLinkResponse={magicLinkResponse}
              />
            )}
            {view === views.MAGIC_VERIFYING && (
              <MagicVerifying
                email={email}
                magicLinkToken={magicLinkToken}
                authPayload={authPayload}
                setAuthPayload={setAuthPayload}
              />
            )}
            {view === views.WEBAUTHN && (
              <WebAuthn
                deviceRegistrationInProgress={deviceRegistrationInProgress}
                handleRegisterDevice={handleRegisterDevice}
                handleSkipDeviceRegistrationAndLogin={
                  handleSkipDeviceRegistrationAndLogin
                }
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
