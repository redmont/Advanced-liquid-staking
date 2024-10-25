'use client';

import { env } from '@/env';
import { DynamicContextProvider, FilterChain } from '../lib/dynamic';
import {
  EthereumWalletConnectors,
  SolanaWalletConnectors,
  BitcoinWalletConnectors,
} from '../lib/dynamic';
import { pipe } from '@dynamic-labs/utils';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [
          EthereumWalletConnectors,
          SolanaWalletConnectors,
          BitcoinWalletConnectors,
        ],
        walletsFilter: pipe(FilterChain('EVM')),
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
