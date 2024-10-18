'use client';

import { env } from '@/env';
import { DynamicContextProvider, FilterChain } from '../lib/dynamic';
import {
  EthereumWalletConnectors,
  SolanaWalletConnectors,
} from '../lib/dynamic';
import { pipe } from '@dynamic-labs/utils';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
        // Filter multiple chains
        walletsFilter: pipe(FilterChain('EVM')), // todo: How to allow multiple chains?
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
