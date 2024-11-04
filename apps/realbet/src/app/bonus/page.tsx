'use client';
import React, { useState } from 'react';
import Banner from '@/components/banner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableBodySkeleton,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { shorten } from './utils';
import { memeCoins } from '@/config/memeCoins';

import {
  useDynamicContext,
  useIsLoggedIn,
  useDynamicModals,
} from '@dynamic-labs/sdk-react-core';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { Wallet2 } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { useToken } from '@/hooks/useToken';
import ErrorComponent from '@/components/error';
import useDegenScore, {
  POINTS_PER_MEME_COIN_INTERACTION,
} from './hooks/useDegenScore';
import { useAtomValue } from 'jotai';
import { progressMessageAtom, transactionsScannedAtom } from '@/store/degen';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';

const BonusPage = () => {
  const [showResults, setShowResults] = useState(false);
  const progressMessage = useAtomValue(progressMessageAtom);
  const transactionsScanned = useAtomValue(transactionsScannedAtom);
  const token = useToken();
  const degenScore = useDegenScore();
  const animatedTotalScore = useAnimatedNumber(degenScore.totalScore, {
    locale: 'en-US',
  });
  const isAuthenticated = useIsLoggedIn();
  const { sdkHasLoaded, setShowDynamicUserProfile } = useDynamicContext();
  const handleDynamicAuthClick = useDynamicAuthClickHandler();
  const userAddresses = useWalletAddresses();
  const { setShowLinkNewWalletModal } = useDynamicModals();

  if (degenScore.errors.length > 0) {
    return <ErrorComponent />;
  }

  const degenScoreTooltip = (
    <PopoverContent className="z-30" align="start">
      <ul className="max-w-80 list-disc space-y-3 rounded-xl border border-border bg-light p-2 pl-5 text-left text-sm">
        <li>
          If there is at least 1 txn on any supported casinos (Shuffle, Stake or
          Rollbit) on any supported chains (BTC ,SOL, ETH, BNB) then{' '}
          <b>points += 100</b>
        </li>
        <li>
          Calculate Total deposits on all supported casinos on all supported
          chains. Then <b>points += (Total deposit/100) * 100</b>
        </li>
        <li>
          For each meme coins that the user has ever interacted with in the meme
          coin list, <b>points += 100</b>
        </li>
      </ul>
    </PopoverContent>
  );

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
              {degenScoreTooltip}
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
      {isAuthenticated && userAddresses.length > 0 && (
        <div>
          <div className="space-y-4 md:max-w-[65%]">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-5 py-4">
              <span>
                Connected Wallets: {userAddresses.length}
                <div className="flex items-center gap-2">
                  {userAddresses.slice(0, 3).map((address, i) => (
                    <span key={`${address}-${i}`}>
                      {address && shorten(address, 4)}
                      {i !== address.length - 1 && ','}
                    </span>
                  ))}
                  {userAddresses.length > 3 && (
                    <span className="no-wrap whitespace-nowrap">
                      {'+ '}
                      <a
                        className="cursor-pointer font-semibold underline underline-offset-2 hover:text-primary"
                        onClick={() => setShowDynamicUserProfile(true)}
                      >
                        {userAddresses.length - 3} more
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
                  onClick={() => setShowResults(true)}
                  className="place-self-end"
                >
                  Calculate Rewards
                </Button>
              </div>
            </div>
            {showResults && (
              <>
                {!degenScore.isSuccess && (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl bg-lighter/50 px-5 py-4">
                    {!degenScore.isSuccess && (
                      <Loader2 className="animate-spin" />
                    )}
                    {progressMessage && <p>{progressMessage}</p>}
                    {transactionsScanned > 0 && (
                      <p>
                        {transactionsScanned.toLocaleString()} transactions
                        scanned...
                      </p>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-5 py-3">
                  <div className="grid grid-cols-1 items-center justify-between gap-3 rounded-xl border border-orange-100/20 bg-red-500/5 px-2 py-4 md:w-[48%]">
                    <h3 className="text-md flex justify-center gap-2 text-center">
                      <Popover>
                        <PopoverTrigger className="hover:text-primary">
                          Total Degen Score{' '}
                          <QuestionMarkCircledIcon className="inline" />
                        </PopoverTrigger>
                        {degenScoreTooltip}
                      </Popover>
                    </h3>
                    <h3 className="text-md text-center">
                      <span className="text-xl text-primary">
                        {animatedTotalScore}
                      </span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 items-center justify-between gap-3 rounded-xl border border-orange-100/20 bg-red-500/5 px-2 py-4 md:w-[48%]">
                    <h3 className="text-md text-center">
                      Total {token.symbol} Rewards
                    </h3>
                    <h3 className="text-md text-center">
                      <span className="text-xl text-primary">
                        {token.symbol}
                      </span>
                    </h3>
                  </div>
                </div>

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
                  {!degenScore.isSuccess ? (
                    <TableBodySkeleton rows={2} cols={3} />
                  ) : (
                    <TableBody>
                      {Object.entries(degenScore.casinoDepositScores).map(
                        ([casino, { score, deposited }]) => (
                          <TableRow
                            key={casino}
                            className="odd:bg-lighter/1 even:bg-lighter/1 border-b-5 border border-lighter/50"
                          >
                            <TableCell className="flex items-center gap-2 px-5 font-normal capitalize">
                              <span className="pr-3">{casino} </span>
                              <span className="flex gap-1"></span>
                            </TableCell>
                            <TableCell className="px-5">
                              {deposited.toLocaleString('en-US', {
                                maximumFractionDigits: 2,
                              })}{' '}
                              USD
                            </TableCell>
                            <TableCell className="px-5 text-right">
                              + {score.toFixed(0)}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  )}

                  <TableFooter className="border-b-5 border border-lighter/50 bg-lighter/20">
                    <TableRow>
                      <TableHead className="px-5 font-normal">Total</TableHead>
                      <TableHead className="px-5 font-normal">
                        {degenScore.totalDeposited.toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        })}{' '}
                        USD
                      </TableHead>
                      <TableHead className="px-5 text-right font-normal text-primary">
                        {degenScore.totalDepositScore ? '+' : ''}{' '}
                        {degenScore.totalDepositScore}
                      </TableHead>
                    </TableRow>
                  </TableFooter>
                </Table>
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
                  {!degenScore.memeInteractions.isSuccess ? (
                    <TableBodySkeleton cols={3} rows={memeCoins.length} />
                  ) : (
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
                            {degenScore.memeInteractions.interactions.includes(
                              memeCoin.contractAddress,
                            )
                              ? POINTS_PER_MEME_COIN_INTERACTION
                              : 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                  <TableFooter className="border-b-5 border border-lighter/50 bg-lighter/20">
                    <TableRow>
                      <TableHead className="px-5 font-normal">Total</TableHead>
                      <TableHead className="px-5 font-normal"></TableHead>
                      <TableHead className="px-5 text-right font-normal text-primary">
                        + {degenScore.totalMemeInteractionScore}
                      </TableHead>
                    </TableRow>
                  </TableFooter>
                </Table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusPage;
