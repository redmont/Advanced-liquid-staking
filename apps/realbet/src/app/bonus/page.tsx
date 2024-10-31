'use client';
import React from 'react';
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
import { totalDegenScore } from './degenScore';
import {
  type Casinos,
  shorten,
  progressPercentageAtom,
  allocationsAtom,
  progressMessageAtom,
} from './utils';
import {
  memeCoins,
  POINTS_PER_MEME_COIN_INTERACTION,
} from '@/config/memeCoins';

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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { useToken } from '@/hooks/useToken';
import { Network } from 'alchemy-sdk';
import useMemeCoinTracking from '@/hooks/useMemeCoinTracking';

const chains = [Network.ETH_MAINNET, Network.BNB_MAINNET];

const BonusPage = () => {
  const token = useToken();
  const memeCoinTracking = useMemeCoinTracking();
  const isAuthenticated = useIsLoggedIn();
  const [progressPercentage] = useAtom(progressPercentageAtom);
  const [allocation] = useAtom(allocationsAtom);
  const [progressMessage] = useAtom(progressMessageAtom);
  const totalTokenReward =
    memeCoinTracking.interactions.length * POINTS_PER_MEME_COIN_INTERACTION;

  const { sdkHasLoaded, setShowDynamicUserProfile } = useDynamicContext();
  const handleDynamicAuthClick = useDynamicAuthClickHandler();
  const userWallets = useUserWallets();
  const { setShowLinkNewWalletModal } = useDynamicModals();
  const wallets = userWallets.map((wallet) => wallet.address);
  const { refetch: refetchAllocations } = useAllocations(wallets);

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
            className="pl-5 text-lg md:max-w-[50%]"
            style={{ listStyleType: 'disc' }}
          >
            <li>
              Connect your wallet to see your available token sale bonus from
              participating in {token.symbol} token sale here.
            </li>
            <li>Link multiple cross-chain wallets to boost your score.</li>
          </ul>

          <div className="flex items-center gap-3 md:max-w-2xl">
            <Popover>
              <PopoverTrigger className="hover:text-primary">
                <span className="inline-flex items-center gap-1 hover:text-primary">
                  How is my bonus calculated <QuestionMarkCircledIcon />
                </span>
              </PopoverTrigger>
              <PopoverContent align="start">
                <ul
                  className="max-w-xl rounded-lg border border-border bg-light py-3 pl-8 pr-5"
                  style={{ listStyleType: 'disc' }}
                >
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
                Connected Wallets: {userWallets.length}
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

            {allocation.status !== 'notInit' && memeCoinTracking.isSuccess && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-5 py-3">
                <div className="grid grid-cols-1 items-center justify-between gap-3 rounded-xl border border-orange-100/20 bg-red-500/5 px-2 py-4 md:w-[48%]">
                  <h3 className="text-md flex justify-center gap-2 text-center">
                    <Popover>
                      <PopoverTrigger className="hover:text-primary">
                        Total Degen Score{' '}
                        <QuestionMarkCircledIcon className="inline" />
                      </PopoverTrigger>
                      <PopoverContent className="z-30" align="start">
                        <ul className="max-w-80 list-disc space-y-3 rounded-xl border border-border bg-light p-2 pl-5 text-left text-sm">
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
                        totalTokenReward,
                      )}
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 items-center justify-between gap-3 rounded-xl border border-orange-100/20 bg-red-500/5 px-2 py-4 md:w-[48%]">
                  <h3 className="text-md text-center">
                    Total {token.symbol} Rewards
                  </h3>
                  <h3 className="text-md text-center">
                    <span className="text-xl text-primary">
                      {totalDegenScore(
                        allocation.totalDeposited,
                        totalTokenReward,
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
                      Eligible Deposits
                    </TableHead>
                    <TableHead className="px-5 font-normal">
                      Deposited
                    </TableHead>
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
                            (chain) =>
                              allocation.casinoAllocations[casino as Casinos]
                                .chainsDepositsDetected[chain] && (
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
                    <TableHead className="px-5 font-normal">Total</TableHead>
                    <TableHead className="px-5 font-normal">
                      {allocation.totalDeposited} USD
                    </TableHead>
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
                  {memeCoins.map((memeCoin) => (
                    <TableRow
                      key={`${memeCoin.ticker}-${memeCoin.chainId}`}
                      className="odd:bg-lighter/1 even:bg-lighter/1 border-b-5 border border-lighter/50"
                    >
                      <TableCell className="flex items-center gap-2 px-5 font-normal capitalize">
                        <img
                          alt=""
                          width={26}
                          src={`/icons/${memeCoin.ticker.toLowerCase()}.png`}
                        />{' '}
                        {memeCoin.ticker}
                      </TableCell>
                      <TableCell className="px-5 text-right"></TableCell>
                      <TableCell className="px-5 text-right">
                        {memeCoinTracking.interactions.includes(
                          memeCoin.contractAddress,
                        )
                          ? POINTS_PER_MEME_COIN_INTERACTION
                          : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="border-b-5 border border-lighter/50 bg-lighter/20">
                  <TableRow>
                    <TableHead className="px-5 font-normal">Total</TableHead>
                    <TableHead className="px-5 font-normal"></TableHead>
                    <TableHead className="px-5 text-right font-normal text-primary">
                      {totalTokenReward ? `+ ${totalTokenReward}` : '0'}
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

export default BonusPage;
