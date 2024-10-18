'use client';
import React, { useState, useReducer } from 'react';
import Banner from '@/components/banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { checkUserDeposits, displayRelativeTime } from './depositsChecker';

import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
  useDynamicModals,
} from '@dynamic-labs/sdk-react-core';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { Wallet2 } from 'lucide-react';

type Casinos = 'shuffle' | 'rollbit';
type Status = 'notInit' | 'loading' | 'success' | 'error';

interface Casino {
  name: Casinos;
  status: Status;
  lastDeposited: string | null;
  totalDeposited: number | null;
}

interface Wallet {
  status: Status;
  walletAddress: string;
  casinos: Casino[];
}

interface Allocations {
  refresh: number;
  status: Status;
  wallets: Wallet[];
}

const casinos: Casinos[] = ['shuffle', 'rollbit'];
const allocations: Allocations = {
  refresh: 0,
  status: 'notInit',
  wallets: [],
};

const shorten = (address: string, size = 6) =>
  address.slice(0, size) + '...' + address.slice(-size);

const Page = () => {
  const [allocation, setAllocation] = useState<Allocations>(allocations);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const isAuthenticated = useIsLoggedIn();
  const { sdkHasLoaded, setShowDynamicUserProfile } = useDynamicContext();
  const handleDynamicAuthClick = useDynamicAuthClickHandler();
  const userWallets = useUserWallets();
  const { setShowLinkNewWalletModal } = useDynamicModals();

  const connectedWalletList = (
    <div className="flex items-center gap-2">
      {userWallets.slice(0, 3).map((wallet) => (
        <span key={wallet.address}>
          {wallet.address && shorten(wallet.address, 4)},
        </span>
      ))}
      {userWallets.length > 3 && (
        <span className="no-wrap whitespace-nowrap">
          {'+ '}
          <a
            className="cursor-pointer font-semibold underline underline-offset-2 hover:text-primary"
            onClick={() => setShowDynamicUserProfile(true)}
          >
            {userWallets.length - 3} more
          </a>
        </span>
      )}
    </div>
  );

  const calculateRewards = async () => {
    const allocation: Allocations = {
      refresh: Date.now(),
      status: 'loading',
      wallets: userWallets.map((wallet) => ({
        status: 'loading',
        walletAddress: wallet.address,
        casinos: casinos.map((casino) => ({
          name: casino,
          status: 'loading',
          lastDeposited: null,
          totalDeposited: null,
        })),
      })),
    };
    setAllocation(allocation);

    for (const wallet of userWallets) {
      const userWallet = wallet.address;
      try {
        // random number between 20 and 50
        const randomNumber = Math.floor(Math.random() * (50 - 20) + 20);
        const { totalDepositedInUSD, lastDeposited } = await checkUserDeposits(
          //userWallet,
          '0x93D39b56FA20Dc8F0E153958D73F0F5dC88F013f',
          randomNumber,
          'ethereum',
        );
        const walletIndex =
          allocation.wallets.findIndex(
            (wallet) => wallet.walletAddress === userWallet,
          ) || 0;
        if (!allocation.wallets[walletIndex]) {
          continue;
        }
        allocation.wallets[walletIndex].status = 'success';
        allocation.wallets[walletIndex]?.casinos
          .filter((casino) => casino.name === 'shuffle')
          .forEach((casino) => {
            casino.totalDeposited = totalDepositedInUSD;
            casino.lastDeposited = lastDeposited ?? null;
          });
        setAllocation(allocation);
        forceUpdate();
      } finally {
      }
    }
    allocation.status = 'success';
    allocation.refresh = Date.now();
    setAllocation(allocation);
    forceUpdate();
  };

  const calculateTotalAllocation = () => {
    let totalAllocation = 0;
    allocation.wallets.forEach((wallet) => {
      wallet.casinos.forEach((casino) => {
        if (casino.totalDeposited === null) {
          return;
        }
        totalAllocation += casino.totalDeposited;
      });
    });
    return Math.floor(totalAllocation);
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      <Banner>
        <div className="space-y-4">
          <h3 className="inline rounded-md bg-[#A40505] px-2 font-monoline text-3xl text-white xl:text-4xl">
            Migrate and get bonuses
          </h3>
          <p className="text-lg md:max-w-[50%] xl:text-xl">
            Easily track your activity from competing crypto casinos and unlock
            exclusive rewards on RWG. If you&apos;ve moved your funds from a
            competitor to RWG, you&apos;re eligible for a special bonus! The
            more you switch, the bigger the rewards. It&apos;s simple, seamless,
            and pays to play!
          </p>
          <div className="flex items-center gap-5 md:max-w-2xl">
            {sdkHasLoaded && !isAuthenticated && (
              <div className="space-between no-wrap flex flex-row items-center justify-center gap-5">
                <h3 className="text-m">
                  Connect your wallets to calculate and claim rewards
                </h3>
                <Button onClick={handleDynamicAuthClick}>
                  Connect Wallet <Wallet2 className="ml-2" />
                </Button>
              </div>
            )}

            {isAuthenticated && userWallets.length > 0 && (
              <span>
                Connected Wallets: {userWallets.length} {connectedWalletList}
              </span>
            )}
            {isAuthenticated && userWallets.length > 0 && (
              <Button
                onClick={() => setShowLinkNewWalletModal(true)}
                variant="outline"
                className="place-self-end"
              >
                + Link new wallets
              </Button>
            )}
            {isAuthenticated && userWallets.length > 0 && (
              <Button
                onClick={() => calculateRewards()}
                className="place-self-end"
              >
                {allocation.status === 'loading' ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Calculate Rewards'
                )}
              </Button>
            )}
          </div>
        </div>
      </Banner>
      {isAuthenticated && allocation.status !== 'notInit' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 text-primary">
          <span className="text-xl leading-none">
            <h3 className="text-lg">
              Total $REAL Allocation:{' '}
              <span className="px-5 font-semibold">
                {calculateTotalAllocation()} $REAL
              </span>
              {allocation.status === 'success' && (
                <Button className="place-self-end">Claim Rewards</Button>
              )}
              <span>{/* <Button>Claim Rewards</Button> */}</span>
            </h3>
          </span>
        </div>
      )}

      {isAuthenticated &&
        allocation.wallets.length > 0 &&
        allocation.wallets.map((wallet) => (
          <Card key={wallet.walletAddress} className="max-w-7xl space-y-5 p-5">
            <h2 className="text-xl">
              <span className="flex flex-wrap items-center justify-start gap-3">
                Allocation for {shorten(wallet.walletAddress, 6)}{' '}
                {wallet.status === 'loading' ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  ''
                )}
              </span>
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Date of Transfer</TableHead>
                  <TableHead>Total deposit amount</TableHead>
                  <TableHead>Amount withdrawn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallet.casinos.map((casino) => (
                  <TableRow key={casino.name}>
                    <TableCell className="flex items-center gap-2">
                      {casino.name}
                    </TableCell>
                    <TableCell>
                      {casino.lastDeposited
                        ? displayRelativeTime(casino.lastDeposited)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {casino.totalDeposited !== null
                        ? `$ ${casino.totalDeposited.toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell>N/A</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ))}
    </div>
  );
};

export default Page;
