'use client';

import { Card } from '@/components/ui/card';
import RealIcon from '@/assets/images/R.svg';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useToken } from '@/hooks/useToken';
import { useStakingVault } from '@/hooks/useStakingVault';
import { formatBalance } from '@/utils';
import React, { useEffect, useState } from 'react';
import AnimatedNumber from '@/components/ui/animated-number';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StakeComponent from './components/stake-component';
import RewardComponent from './components/reward-component';
import { Info } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function Stake() {
  const token = useToken();
  const {
    deposits,
    stakedBalance,
    shares,
    shareSymbol,
    currentEpoch,
    calculateRewards,
    claimRewards,
    merkleProofs,
  } = useStakingVault();
  const { sdkHasLoaded } = useDynamicContext();
  const [rewards, setRewards] = useState(0n);

  useEffect(() => {
    const calculate = async () => {
      if (!currentEpoch || !merkleProofs.data) {
        return 0n;
      }

      let rewards = 0n;
      const promises: Promise<bigint>[] = [];
      deposits.data?.forEach((deposit, i) => {
        const votedEpochs = merkleProofs
          .data!.filter((proof) => proof.epoch > deposit.lastClaimEpoch)
          .map((proof) => BigInt(proof.epoch));

        promises.push(calculateRewards(BigInt(i), votedEpochs));
      });

      const rewardsPerEpoch = await Promise.all(promises);

      rewardsPerEpoch.forEach((r) => {
        rewards += r;
      });

      setRewards(rewards);
    };
    void calculate();
  }, [deposits.data, currentEpoch, calculateRewards, merkleProofs.data]);

  const claim = useMutation({
    mutationFn: async () => {
      if (!merkleProofs.data) {
        return;
      }

      const promises: Promise<void>[] = [];

      deposits.data?.forEach((deposit, i) => {
        const proofs = merkleProofs.data!.filter(
          (proof) =>
            proof.epoch > deposit.lastClaimEpoch && proof.proof.length > 0,
        );
        const votedEpochs = proofs.map((proof) => proof.epoch);

        promises.push(
          claimRewards.mutateAsync({
            stakeIndex: BigInt(i),
            epochs: votedEpochs,
            merkleProofs: proofs.map(
              (proof) => proof.proof.split(',') as `0x${string}`[],
            ),
          }),
        );
      });

      await Promise.all(promises);
    },
  });

  return (
    <div className="w-full p-3 sm:p-5">
      <div className="w-full">
        <h2 className="mb-3 text-[2rem] font-medium">REAL Staking Dashboard</h2>
        <p className="text-lg leading-tight text-white/90">
          Stake REAL tokens, earn rewards, and participate in platform
          governance
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 py-3 sm:gap-5 md:grid-cols-3 md:py-5">
        <Card className="flex flex-col justify-center gap-6 rounded-2xl border border-primary/15 p-8">
          <h2>{token.symbol} balance</h2>
          <p
            className={cn('flex items-center gap-3 text-xl', {
              'animate-pulse': !sdkHasLoaded || deposits.isLoading,
            })}
          >
            <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
              <RealIcon className="inline size-5" />
            </span>
            <span className="mb-1 text-3xl font-medium leading-none">
              <AnimatedNumber
                value={formatBalance(token.balance)}
                decimals={2}
              />
            </span>
          </p>
        </Card>
        <Card className="flex flex-col justify-center gap-6 rounded-2xl border border-primary/15 p-8">
          <div className="flex items-center justify-between">
            <h2>{shareSymbol} balance</h2>

            <Popover>
              <PopoverTrigger>
                <Info className="text-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent align="start">
                <div className="leading-tight">
                  The amount of {token.symbol} you have staked.
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <p
            className={cn('flex items-center gap-3 text-xl', {
              'animate-pulse': !sdkHasLoaded || deposits.isLoading,
            })}
          >
            <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
              <RealIcon className="inline size-5" />
            </span>
            <span className="mb-1 text-3xl font-medium leading-none">
              <AnimatedNumber
                value={formatBalance(stakedBalance ?? 0n)}
                decimals={2}
              />
            </span>
          </p>
        </Card>
        <Card className="flex flex-col justify-center gap-6 rounded-2xl border border-primary/15 p-8">
          <div className="flex items-center justify-between">
            <h2>{token.symbol} rewards</h2>
            <Popover>
              <PopoverTrigger>
                <Info className="text-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent align="start">
                <div className="leading-tight">
                  The amount of {token.symbol} rewards that you can claim.
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <p
            className={cn('flex items-center gap-3 text-xl', {
              'animate-pulse': !sdkHasLoaded || shares.isLoading,
            })}
          >
            <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
              <RealIcon className="inline size-5" />
            </span>
            <span className="mb-1 text-3xl font-medium leading-none">
              <AnimatedNumber
                value={formatBalance(rewards ?? 0n)}
                decimals={2}
              />
            </span>
            <Button
              className="rounded-lg"
              onClick={() => claim.mutateAsync()}
              disabled={rewards === 0n}
              loading={claim.isPending}
            >
              Claim
            </Button>
          </p>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="stake">
          <TabsList className="w-60">
            <TabsTrigger value="stake" className="w-full text-lg font-normal">
              Stake
            </TabsTrigger>
            <TabsTrigger value="rewards" className="w-full text-lg font-normal">
              Rewards
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stake">
            <StakeComponent />
          </TabsContent>
          <TabsContent value="rewards">
            <RewardComponent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
