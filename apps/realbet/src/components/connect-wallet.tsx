'use client';

import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { Button } from './ui/button';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { Wallet2 } from 'lucide-react';
import usePrimaryAddress from '@/hooks/usePrimaryAddress';

export default function ConnectWallet() {
  const authHandler = useDynamicAuthClickHandler();
  const isAuthenticated = useIsLoggedIn();
  const primaryAddress = usePrimaryAddress();

  return (
    <Button onClick={authHandler} variant="default" className="w-full max-w-64">
      {isAuthenticated ? (
        <>
          <Wallet2 className="size-4 shrink-0" />
          <span className="truncate">
            {primaryAddress?.slice(0, primaryAddress?.length - 4)}
          </span>
          <span className="-ml-1">{primaryAddress?.slice(-4)}</span>
        </>
      ) : (
        <>Connect Wallet</>
      )}
    </Button>
  );
}
