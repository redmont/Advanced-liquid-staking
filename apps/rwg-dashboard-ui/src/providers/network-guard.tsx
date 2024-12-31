'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogOverlay,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useNetworkId from '@/hooks/useNetworkId';
import React, { createContext, useContext, useState } from 'react';
import { useSwitchChain } from 'wagmi';
import * as chains from 'viem/chains';
import { cn } from '@/lib/cn';

type NetworkGuardContextType = {
  networkGuard: (acceptedChains: (number | string)[]) => Promise<void>;
};

const DialogContext = createContext<NetworkGuardContextType | undefined>(
  undefined,
);

export const NetworkGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: currentNetwork, refetch } = useNetworkId();
  const { switchChain, isPending } = useSwitchChain();
  const [state, setState] = useState<{
    resolve: () => void;
    reject: () => void;
    isOpen: boolean;
    acceptedChains: (number | string)[];
  } | null>(null);

  const networkGuard: NetworkGuardContextType['networkGuard'] = async (
    acceptedChains,
  ) => {
    const network = (await refetch()).data;

    return new Promise((resolve, reject) => {
      if (network && acceptedChains.includes(network)) {
        resolve();
        return;
      }

      setState({ resolve, reject, isOpen: true, acceptedChains });
    });
  };

  const handleConfirm = () => {
    if (
      state &&
      currentNetwork &&
      state.acceptedChains.includes(currentNetwork)
    ) {
      state.resolve();
      setState(null);
    }
  };

  const handleDismiss = () => {
    if (state) {
      state.reject();
      setState(null);
    }
  };

  const currentNetworkValid =
    currentNetwork && state?.acceptedChains.includes(currentNetwork);

  return (
    <DialogContext.Provider value={{ networkGuard }}>
      <Dialog
        open={state?.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleDismiss();
          }
        }}
      >
        <DialogOverlay className="bg-black-800/30" />
        <DialogContent className="border-none bg-card px-5 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-normal">
              Confirm Network Switch
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm">
            The functionality you are trying to access requires you to switch
            your network.
          </p>
          <Select
            onValueChange={(value) => switchChain({ chainId: parseInt(value) })}
          >
            <SelectTrigger className={cn('w-[180px] py-2')}>
              <SelectValue
                placeholder={
                  Object.values(chains).find(
                    (c) => c.id.toString() === currentNetwork?.toString(),
                  )?.name ?? 'Select Network'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {Object.values(chains)
                .filter((chain) => state?.acceptedChains.includes(chain.id))
                .map((chain) => (
                  <SelectItem
                    key={chain.id}
                    value={chain.id.toString()}
                    className="w-[180px]"
                  >
                    {chain.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" onClick={handleDismiss}>
              Cancel
            </Button>
            <Button
              loading={!currentNetwork || isPending}
              disabled={!currentNetworkValid}
              onClick={handleConfirm}
            >
              Confirm Change
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
};

export const useNetworkGuard = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
