"use client";

import { env } from "@/env";
import { DynamicContextProvider, getAuthToken } from "../lib/dynamic";
import { EthereumWalletConnectors } from "../lib/dynamic";
import { getCsrfToken, getSession } from "next-auth/react";

const onAuthSuccess = async () => {
  const authToken = getAuthToken() as string;

  const csrfToken = await getCsrfToken();

  const response = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `csrfToken=${encodeURIComponent(
      csrfToken ?? "",
    )}&token=${encodeURIComponent(authToken)}`,
  });

  if (response.ok) {
    await getSession();
    // Handle success - maybe redirect to the home page or user dashboard
  } else {
    // Handle any errors - maybe show an error message to the user
    console.error("Failed to log in");
  }
};

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        events: {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onAuthSuccess,
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
