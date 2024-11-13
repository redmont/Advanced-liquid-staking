'use client';

import { Input } from '@/components/ui/input';
import {
  primaryWalletAddressOverrideAtom,
  connectedAddressesOverrideAtom,
} from '@/store/developer';
import { useAtom } from 'jotai';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { issueVestingToken } from '@/utils/issueVestingToken';
import { useDynamicContext } from '@/lib/dynamic';
import { useMutation } from '@tanstack/react-query';

const DeveloperPage = () => {
  const { primaryWallet } = useDynamicContext();

  const [addressOverride, setAddressOverride] = useAtom(
    primaryWalletAddressOverrideAtom,
  );
  const [connectedAddressesOverride, setConnectedAddressesOverride] = useAtom(
    connectedAddressesOverrideAtom,
  );

  const getVestingToken = useMutation({
    mutationFn: () => {
      if (!primaryWallet) {
        throw new Error('Wallet required');
      }
      return issueVestingToken(primaryWallet.address);
    },
  });

  return (
    <div className="flex flex-col gap-5 p-5">
      <h2 className="mb-3 text-[2rem] font-medium">Developer Tools</h2>
      <div className="max-w-lg space-y-5">
        <div>
          <label className="mb-2 block">Primary Wallet Address Override</label>
          <Input
            placeholder="0x..."
            value={addressOverride ?? ''}
            onChange={(e) => setAddressOverride(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="wallet-addresses" className="mb-2 block">
            Connected Addresses Override
          </label>
          <Textarea
            value={connectedAddressesOverride ?? ''}
            onChange={(e) => setConnectedAddressesOverride(e.target.value)}
            id="wallet-addresses"
            placeholder="Comma separated addresses: i.e. 0x123...,0x456..."
          />
        </div>
        <div>
          <label className="mb-2 block">Issue vesting $REAL ($vREAL)</label>
          <Button
            onClick={() => getVestingToken.mutateAsync()}
            loading={getVestingToken.isPending}
          >
            Issue
          </Button>
          <p className="text-destructive empty:hidden">
            {getVestingToken.error?.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
