'use client';

import React, { useState } from 'react';
import { type Tier, useStakingVault } from '@/hooks/useStakingVault';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Loading from '@/components/loading';
import youGotMe from '@/assets/images/you-got-me.webp';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

const TierRow = ({ tier, index }: { tier: Tier; index: number }) => {
  const vault = useStakingVault();
  const [lockup, setLockup] = useState(Number(tier.lockPeriod));
  const handleLockupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLockup(parseFloat(e.target.value));
  };
  const [mult, setMult] = useState(Number(tier.multiplier));
  const handleMultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMult(parseInt(e.target.value));
  };

  return (
    <React.Fragment key={index}>
      <Input
        type="number"
        value={lockup.toString()}
        onChange={handleLockupChange}
        className="w-full"
      />
      <Input
        type="number"
        value={mult}
        onChange={handleMultChange}
        className="w-full"
      />
      <Button
        type="submit"
        onClick={() =>
          vault.setTier.mutateAsync({
            tier: {
              lockPeriod: BigInt(lockup),
              multiplier: BigInt(mult),
            },
            index,
          })
        }
        loading={vault.setTier.isPending}
      >
        Set
      </Button>
    </React.Fragment>
  );
};

const AdminPage: React.FC = () => {
  const { sdkHasLoaded } = useDynamicContext();
  const vault = useStakingVault();

  if (!sdkHasLoaded || !vault.isAdmin.isSuccess) {
    return <Loading />;
  }

  if (!vault.isAdmin.data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 p-5">
        <img className="w-[480px]" src={youGotMe.src} alt="You got me" />
        <div className="flex gap-x-3">
          <Button asChild className="mt-5">
            <Link
              rel="noreferrer noopener"
              target="_blank"
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1"
            >
              Ask to put the bitcoin in a bag
            </Link>
          </Button>
          <Button variant="outline" asChild className="mt-5">
            <Link href="/">Back away slowly, confused at how you got here</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5 p-5">
      <h1 className="text-3xl font-semibold">Admin Page</h1>
      <h2 className="text-2xl">Tiers</h2>
      <div className="grid grid-cols-3 gap-3">
        <div>Lockup time</div>
        <div>Multiplier</div>
        <div></div>
        {vault.tiers.data?.map((tier, index) => (
          <TierRow key={index} tier={tier} index={index} />
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
