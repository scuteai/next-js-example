"use client";
import { AuthForm } from "@/components/auth-form";
import { MagicVerifying } from "@/components/magic-verifying";
import { WebAuthn } from "@/components/webauthn";
import {
  createClient,
  ScuteAppData,
  ScuteMagicLinkIdResponse,
  ScuteTokenPayload,
} from "@scute/nextjs-handlers";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { AppLoading } from "@/components/app-loading";
import { appStates, views } from "@/components/shared/constants";

const scuteClient = createClient({
  appId: process.env.NEXT_PUBLIC_SCUTE_APP_ID as string,
  baseUrl: process.env.NEXT_PUBLIC_SCUTE_BASE_URL as string,
});

export default function Home() {
  // App states
  const [appData, setAppData] = useState<ScuteAppData | null>(null);
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

  const handleVerifyMagicLink = (magicLinkToken: string) => {
    setView(views.WEBAUTHN);
    setMagicLinkToken(magicLinkToken);
  };

  const handleEmailAuth = async (
    email: string,
    metaFields: Record<string, string>
  ) => {
    setEmail(email);
    const { data, error } = await scuteClient.signInOrUp(email, {
      userMeta: metaFields,
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setAppState(appStates.ERROR);
      return;
    }

    if (!data) {
      // webauthn enabled and device is registered
      setView(views.WEBAUTHN);
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
    if (!authPayload) {
      return;
    }

    const { error: signInError } = await scuteClient.signInWithTokenPayload(
      authPayload
    );

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const { data, error: addDeviceError } = await scuteClient.addDevice();
    console.log({ data, error });
    if (addDeviceError) {
      setError(addDeviceError.message);
      return;
    }

    redirect("/profile");
  };

  const handleSkipDeviceRegistrationAndLogin = async () => {
    if (!authPayload) {
      return;
    }

    const { error } = await scuteClient.signInWithTokenPayload(authPayload);

    if (error) {
      setError(error.message);
      console.error(error);
    }

    redirect("/profile");
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await scuteClient.getAuthToken();

      if (data) {
        console.log("Session Data", data);
        redirect("/profile");
      }

      const { data: appData, error: appDataError } =
        await scuteClient.getAppData();

      if (appDataError) {
        console.error(appDataError);
        setError(appDataError.message);
        setAppState(appStates.ERROR);
        return;
      }

      setAppData(appData);
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

  if (appState === appStates.ERROR || error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {appState === appStates.LOADING && <AppLoading />}
        {appState === appStates.ERROR && <div>Error</div>}
        {appState === appStates.READY && (
          <>
            {view === views.SIGN_IN_OR_UP && (
              <AuthForm
                email={email}
                handleEmailAuth={handleEmailAuth}
                handleOAuth={handleOAuth}
                metaFields={appData?.user_meta_data_schema || []}
                magicLinkResponse={magicLinkResponse}
              />
            )}
            {view === views.MAGIC_VERIFYING && (
              <MagicVerifying
                email={email}
                magicLinkToken={magicLinkToken}
                authPayload={authPayload}
                setAuthPayload={setAuthPayload}
                onVerify={() => setView(views.WEBAUTHN)}
              />
            )}
            {view === views.WEBAUTHN && (
              <WebAuthn
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
