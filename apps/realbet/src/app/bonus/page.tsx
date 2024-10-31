'use client';
import React, { useState, useEffect } from 'react';
import Banner from '@/components/banner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAtom } from 'jotai';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToken } from '@/hooks/useToken';
import { totalDegenScore } from './degenScore';
import {
  shorten,
  chains,
  getBulkTokenLogos,
  progressPercentageAtom,
  allocationsAtom,
  progressMessageAtom,
} from './utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { InfoCircledIcon } from '@radix-ui/react-icons';

import type { Chains, Casinos } from './utils';

import { memeCoins } from './memeCoins';
import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
  useDynamicModals,
} from '@dynamic-labs/sdk-react-core';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { Wallet2 } from 'lucide-react';
import { getChainIcon } from '@/config/chainIcons';
import { useAllocations } from '../../hooks/useAllocations';

const Page = () => {
  const token = useToken();
  const [memeCoinsLogos, setMemeCoinsLogos] = useState<string[]>([]);
  const [progressPercentage] = useAtom(progressPercentageAtom);
  const [allocation] = useAtom(allocationsAtom);
  const [progressMessage] = useAtom(progressMessageAtom);
  const isAuthenticated = useIsLoggedIn();
  const { sdkHasLoaded, setShowDynamicUserProfile } = useDynamicContext();
  const handleDynamicAuthClick = useDynamicAuthClickHandler();
  const userWallets = useUserWallets();
  const { setShowLinkNewWalletModal } = useDynamicModals();
  const wallets = userWallets.map((wallet) => wallet.address);
  const { refetch: refetchAllocations } = useAllocations(wallets);

  const connectedWalletList = (
    <div className="flex items-center gap-2">
      {userWallets.slice(0, 3).map((wallet, i) => (
        <span key={wallet.address}>
          {wallet.address && shorten(wallet.address, 4)}
          {i !== userWallets.length - 1 && ','}
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

  const getTokenLogos = async () => {
    const contractAddresses = memeCoins.map((token) => token.address);
    const tokenLogos = await getBulkTokenLogos(contractAddresses);
    return tokenLogos;
  };
  useEffect(() => {
    void (async () => {
      const tokenLogos = await getTokenLogos();
      setMemeCoinsLogos(tokenLogos);
    })();
  }, []);

  return (
    <div className="flex flex-col gap-5 p-5">
      <Banner>
        <div className="space-y-4">
          <p className="py-4 text-lg tracking-widest md:max-w-[50%]">
            SHUFFLE | STAKE | ROLLBIT
          </p>
          <h3 className="inline rounded-md bg-accent2 px-2 font-monoline text-3xl text-white xl:text-4xl">
            Check your {token.symbol} Bonus
          </h3>

          <ul
            className="text-lg md:max-w-[50%]"
            style={{ listStyleType: 'disc' }}
          >
            <li>
              Connect your wallet to see your available token sale bonus from
              participating in {token.symbol} token sale here.
            </li>
            <li>Link multiple cross-chain wallets to boost your score.</li>
          </ul>

          <div className="flex items-center gap-3 md:max-w-2xl">
            <p className="text-lg md:max-w-[50%]">
              How is my bonus calculated ?{' '}
            </p>
            <Popover>
              <PopoverTrigger className="hover:text-primary">
                <span className="inline-flex items-center gap-1 hover:text-primary">
                  <InfoCircledIcon />
                </span>
              </PopoverTrigger>
              <PopoverContent align="start">
                <ul className="px-3 py-1" style={{ listStyleType: 'disc' }}>
                  <li>
                    If there is at least 1 txn on any supported casinos
                    (Shuffle, Stake or Rollbit) on any supported chains (BTC
                    ,SOL, ETH, BNB) then <b>points += 100</b>
                  </li>
                  <li>
                    Calculate Total deposits on all supported casinos on all
                    supported chains. Then{' '}
                    <b>points += (Total deposit/100) * 100</b>
                  </li>
                  <li>
                    For each meme coins that the user currently holds from our
                    supported meme coin list, <b>points += 100</b>
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-5 md:max-w-2xl">
            {sdkHasLoaded && !isAuthenticated && (
              <div className="space-between no-wrap flex flex-row items-center justify-center gap-5">
                <Button onClick={handleDynamicAuthClick}>
                  Connect Wallet <Wallet2 className="ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Banner>
      {isAuthenticated && userWallets.length > 0 && (
        <div>
          <div className="space-y-4 md:max-w-[65%]">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-5 py-4">
              <span>
                Connected Wallets: {userWallets.length} {connectedWalletList}
              </span>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowLinkNewWalletModal(true)}
                  variant="outline"
                  className="place-self-end"
                >
                  + Link new wallet
                </Button>

                <Button
                  onClick={() => refetchAllocations()}
                  className="place-self-end"
                  disabled={allocation.status === 'loading'}
                >
                  Calculate Rewards
                </Button>
              </div>
            </div>
            {progressMessage && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-lighter/50 px-5 py-4">
                <Loader2 className="animate-spin" /> {progressMessage}{' '}
                {progressPercentage < 100 ? `(${progressPercentage}%)` : ''}
              </div>
            )}

            {allocation.status !== 'notInit' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-5 py-3">
                <div className="grid grid-cols-1 items-center justify-between gap-3 rounded-xl border border-orange-100/20 bg-red-500/5 px-2 py-4 md:w-[48%]">
                  <h3 className="text-md flex justify-center gap-2 text-center">
                    <span>Total Degen Score</span>
                    <Popover>
                      <PopoverTrigger className="hover:text-primary">
                        <span className="inline-flex items-center gap-1 hover:text-primary">
                          <InfoCircledIcon />
                        </span>
                      </PopoverTrigger>
                      <PopoverContent align="start">
                        <ul
                          className="px-3 py-1"
                          style={{ listStyleType: 'disc' }}
                        >
                          <li>
                            If there is at least 1 txn on any supported casinos
                            (Shuffle, Stake or Rollbit) on any supported chains
                            (BTC ,SOL, ETH, BNB) then <b>points += 100</b>
                          </li>
                          <li>
                            Calculate Total deposits on all supported casinos on
                            all supported chains. Then{' '}
                            <b>points += (Total deposit/100) * 100</b>
                          </li>
                          <li>
                            For each meme coins that the user currently holds
                            from our supported meme coin list,{' '}
                            <b>points += 100</b>
                          </li>
                        </ul>
                      </PopoverContent>
                    </Popover>
                  </h3>
                  <h3 className="text-md text-center">
                    <span className="text-xl text-primary">
                      {totalDegenScore(
                        allocation.totalDeposited,
                        allocation.totalTokenRewards,
                      )}
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 items-center justify-between gap-3 rounded-xl border border-orange-100/20 bg-red-500/5 px-2 py-4 md:w-[48%]">
                  <h3 className="text-md text-center">
                    Total ${token.symbol} Rewards
                  </h3>
                  <h3 className="text-md text-center">
                    <span className="text-xl text-primary">
                      {totalDegenScore(
                        allocation.totalDeposited,
                        allocation.totalTokenRewards,
                      )}{' '}
                      {token.symbol}
                    </span>
                  </h3>
                </div>
              </div>
            )}

            {allocation.status !== 'notInit' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-5 font-normal">
                      Eligible deposits
                    </TableHead>
                    <TableHead className="px-5 font-normal">Deposit</TableHead>
                    <TableHead className="px-5 text-right font-normal">
                      Score
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(allocation.casinoAllocations).map((casino) => (
                    <TableRow
                      key={casino}
                      className="odd:bg-lighter/1 even:bg-lighter/1 border-b-5 border border-lighter/50"
                    >
                      <TableCell className="flex items-center gap-2 px-5 font-normal capitalize">
                        <span className="pr-3">{casino} </span>
                        <span className="flex gap-1">
                          {chains.map(
                            (chain: string) =>
                              allocation.casinoAllocations[casino as Casinos]
                                .chainsDepositsDetected[chain as Chains] && (
                                <div key={chain}>
                                  {getChainIcon(chain, {
                                    height: 20,
                                    width: 20,
                                  })}
                                </div>
                              ),
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="px-5">
                        {Math.floor(
                          allocation.casinoAllocations[casino as Casinos]
                            .totalDeposited ?? 0,
                        ).toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        })}{' '}
                        USD
                      </TableCell>
                      <TableCell className="px-5 text-right">
                        {allocation.casinoAllocations[casino as Casinos]
                          .totalScore !== null
                          ? `+ ${
                              allocation.casinoAllocations[casino as Casinos]
                                .totalScore
                            }`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="border-b-5 border border-lighter/50 bg-lighter/20">
                  <TableRow>
                    <TableHead className="px-5"></TableHead>
                    <TableHead className="px-5 font-normal">Total</TableHead>
                    <TableHead className="px-5 text-right font-normal text-primary">
                      {allocation.totalScore ? '+' : ''} {allocation.totalScore}
                    </TableHead>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
            {allocation.status !== 'notInit' && memeCoins.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-3/6 px-5 font-normal">
                      Eligible Token Interactions
                    </TableHead>
                    <TableHead className="px-5 font-normal"></TableHead>
                    <TableHead className="px-5 text-right font-normal">
                      Score
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memeCoins.map((memeCoin, index) => (
                    <TableRow
                      key={memeCoin.symbol}
                      className="odd:bg-lighter/1 even:bg-lighter/1 border-b-5 border border-lighter/50"
                    >
                      <TableCell className="flex items-center gap-2 px-5 font-normal capitalize">
                        <img alt="" width={26} src={memeCoinsLogos[index]} />{' '}
                        {memeCoin.symbol}
                      </TableCell>
                      <TableCell className="px-5 text-right"></TableCell>
                      <TableCell className="px-5 text-right">
                        {allocation.tokenRewards[memeCoin.address]
                          ? `+ ${allocation.tokenRewards[memeCoin.address]}`
                          : '0'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="border-b-5 border border-lighter/50 bg-lighter/20">
                  <TableRow>
                    <TableHead className="px-5 font-normal"></TableHead>
                    <TableHead className="px-5 font-normal">Total</TableHead>
                    <TableHead className="px-5 text-right font-normal text-primary">
                      {allocation.totalTokenRewards
                        ? `+ ${allocation.totalTokenRewards}`
                        : '0'}
                    </TableHead>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
