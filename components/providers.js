"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClientComponentClient } from "@scute/nextjs-handlers";
import { AuthContextProvider, useAuth } from "@scute/react-hooks";

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function AuthProvider({ children }) {
  const [scuteClient] = useState(() =>
    createClientComponentClient({
      appId: process.env.NEXT_PUBLIC_SCUTE_APP_ID,
      baseUrl: process.env.NEXT_PUBLIC_SCUTE_BASE_URL,
    })
  );

  return (
    <AuthContextProvider scuteClient={scuteClient}>
      <ClientAuthGuard>{children}</ClientAuthGuard>
    </AuthContextProvider>
  );
}

const ClientAuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuth();

  const guard = useCallback(
    () =>
      pathname.startsWith("/profile") && session.status === "unauthenticated",
    [session.status, pathname]
  );

  useEffect(() => {
    if (guard()) {
      router.push("/");
    }
  }, [guard, router]);

  if (guard()) {
    return null;
  }

  return <>{children}</>;
};
