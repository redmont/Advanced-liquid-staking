'use client';

import { env } from '@/env';
import { DynamicContextProvider } from '../lib/dynamic';
import {
  EthereumWalletConnectors,
  SolanaWalletConnectors,
} from '../lib/dynamic';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
