'use client';

import { Input } from '@/components/ui/input';
import {
  primaryWalletAddressOverrideAtom,
  connectedAddressesOverrideAtom,
} from '@/store/developer';
import { useAtom } from 'jotai';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getAuthToken, useDynamicContext } from '@/lib/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { issueVestingToken } from '@/server/actions/issueVestingToken';
import { isDev } from '@/env';
import assert from 'assert';
import { Checkbox } from '@/components/ui/checkbox';
import type { RewardWave } from '@prisma/client';
import { useEffect, useState } from 'react';
import { saveWave } from './saveWave';
import { getCurrentWave } from './getWave';
import { useToken } from '@/hooks/useToken';

type WaveUpdate = Pick<
  RewardWave,
  'label' | 'live' | 'availableSeats' | 'ticketsPerMember' | 'id'
>;

const useDevWave = () =>
  useQuery({ queryKey: ['devRewardWave'], queryFn: () => getCurrentWave() });

const DeveloperPage = () => {
  assert(isDev, 'Not in dev mode');
  const token = useToken();
  const queryClient = useQueryClient();
  const currentWave = useDevWave();
  const { primaryWallet } = useDynamicContext();
  const [mintAmount, setMintAmount] = useState(100);
  const [addressOverride, setAddressOverride] = useAtom(
    primaryWalletAddressOverrideAtom,
  );
  const [connectedAddressesOverride, setConnectedAddressesOverride] = useAtom(
    connectedAddressesOverrideAtom,
  );

  const issueVestingTokenMutation = useMutation({
    mutationFn: () => {
      if (!primaryWallet) {
        throw new Error('Wallet required');
      }
      return issueVestingToken(primaryWallet.address);
    },
  });

  const [waveState, setWaveState] = useState<undefined | WaveUpdate>(undefined);

  useEffect(() => {
    if (!currentWave.data) {
      return;
    }

    setWaveState({
      id: currentWave.data.id,
      label: currentWave.data.label,
      live: currentWave.data.live,
      availableSeats: currentWave.data.availableSeats,
      ticketsPerMember: currentWave.data.ticketsPerMember,
    });
  }, [currentWave.data]);

  const isDirty =
    waveState !== undefined &&
    (waveState.label !== currentWave.data?.label ||
      waveState.live !== currentWave.data?.live ||
      waveState.availableSeats !== currentWave.data?.availableSeats ||
      waveState.ticketsPerMember !== currentWave.data?.ticketsPerMember);

  const saveWaveMutation = useMutation({
    mutationFn: async (wave: WaveUpdate) => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No token');
      }

      return saveWave(authToken, wave);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['devRewardWave'],
      });
    },
  });

  return (
    <div className="flex flex-col gap-5 p-5">
      <h2 className="mb-3 text-[2rem] font-medium">Developer Tools</h2>
      <div className="max-w-lg space-y-5">
        <div>
          <label className="mb-2 block">Primary Wallet Address Override</label>
          <Input
            className="mb-3"
            placeholder="0x..."
            value={addressOverride ?? ''}
            onChange={(e) => setAddressOverride(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="default"
              onClick={() =>
                setAddressOverride('0xB6b7cE10a5Aaf0B9dB80bdB8aAAc01237CB78103')
              }
            >
              Make me Admin
            </Button>
            <Button variant="outline" onClick={() => setAddressOverride(null)}>
              Clear
            </Button>
          </div>
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
          <label className="mb-2 block">Issue {token.symbol}</label>
          <Input
            className="mb-3"
            placeholder=""
            value={mintAmount}
            onChange={(e) => setMintAmount(parseFloat(e.target.value))}
            endAdornment={
              <Button
                loading={token.mint.isPending}
                onClick={() =>
                  token.mint.mutate(
                    BigInt(mintAmount) * BigInt(10 ** token.decimals),
                  )
                }
              >
                Issue
              </Button>
            }
          />
          <p className="text-destructive empty:hidden">
            {issueVestingTokenMutation.error?.message}
          </p>
        </div>
        <div>
          <label className="mb-2 block">Issue vesting $REAL ($vREAL)</label>
          <Button
            onClick={() => issueVestingTokenMutation.mutateAsync()}
            loading={issueVestingTokenMutation.isPending}
          >
            Issue
          </Button>
          <p className="text-destructive empty:hidden">
            {issueVestingTokenMutation.error?.message}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="mb-3 text-xl font-medium">
            Modify Current Reward Wave
          </h3>
          {waveState !== undefined && (
            <>
              <div className="flex items-center gap-2">
                <Input
                  loading={currentWave.isLoading}
                  id="wave-label"
                  placeholder="Enter reward amount for signup"
                  value={waveState.label}
                  onChange={(e) =>
                    setWaveState({
                      ...waveState,
                      label: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  disabled={currentWave.isLoading}
                  onCheckedChange={(event) => {
                    const isChecked =
                      typeof event === 'boolean' ? event : false;
                    setWaveState({
                      ...waveState,
                      live: isChecked,
                    });
                  }}
                  checked={waveState.live}
                  id="enabled"
                />
                <label
                  htmlFor="enabled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enabled
                </label>
              </div>
              <div>
                <label htmlFor="tickets-per-member" className="mb-2 block">
                  Signup Bonus Tickets
                </label>
                <Input
                  loading={currentWave.isLoading}
                  id="tickets-per-member"
                  placeholder="Enter reward amount for signup"
                  type="number"
                  value={waveState?.ticketsPerMember}
                  onChange={(e) =>
                    setWaveState({
                      ...waveState,
                      ticketsPerMember: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor="seats-remaining" className="mb-2 block">
                  Seats Remaining (current members:{' '}
                  {currentWave.data?._count.memberships}, total seats:{' '}
                  {currentWave.data?.totalSeats})
                </label>
                <Input
                  loading={currentWave.isLoading}
                  id="seats-remaining"
                  placeholder="Enter reward amount for signup"
                  type="number"
                  value={waveState?.availableSeats}
                  onChange={(e) =>
                    setWaveState({
                      ...waveState,
                      availableSeats: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}
          <Button
            onClick={() => waveState && saveWaveMutation.mutate(waveState)}
            disabled={!isDirty}
            loading={saveWaveMutation.isPending}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
