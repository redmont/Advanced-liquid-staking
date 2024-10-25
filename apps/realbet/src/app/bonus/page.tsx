'use client';
import React, { useState, useReducer } from 'react';
import Banner from '@/components/banner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { checkUserDeposits } from './depositsChecker';
import {
  getScoreFromDeposit,
  totalDegenScore,
  getTokenBalances,
} from './degenScore';
import {
  CHAIN_RPC_URLS,
  type Chains,
  type Casinos,
  type Allocations,
  shorten,
  casinos,
  chains,
} from './utils';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { useToken } from '@/hooks/useToken';

const createInitialAllocations = (): Allocations => {
  return {
    totalDeposited: 0,
    totalScore: 0,
    tokenRewards: {},
    totalTokenRewards: 0,
    status: 'notInit',
    casinoAllocations: {
      shuffle: {
        totalDeposited: null,
        totalScore: null,
        chainsDepositsDetected: {
          ethereum: false,
          bsc: false,
        },
      },
      rollbit: {
        totalDeposited: null,
        totalScore: null,
        chainsDepositsDetected: {
          ethereum: false,
          bsc: false,
        },
      },
    },
  };
};

let allocations: Allocations = createInitialAllocations();

const BonusPage = () => {
  const token = useToken();
  const isAuthenticated = useIsLoggedIn();
  const [allocation, setAllocation] = useState<Allocations>(allocations);
  const [progressMessage, setProgressMessage] = useState('');
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const { sdkHasLoaded, setShowDynamicUserProfile } = useDynamicContext();
  const handleDynamicAuthClick = useDynamicAuthClickHandler();
  const userWallets = useUserWallets();
  const { setShowLinkNewWalletModal } = useDynamicModals();

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

  const getTokenRewards = async () => {
    const memeCoinScore: Record<string, number> = {};
    for (const wallet of userWallets) {
      const userWallet = wallet.address;
      const chains = Object.keys(CHAIN_RPC_URLS);
      for (const chain of chains) {
        const tokenBalances = await getTokenBalances(userWallet, chain);
        for (const { contractAddress } of tokenBalances) {
          const tokenIndex = memeCoins.findIndex(
            (token) => token.address === contractAddress,
          );
          if (tokenIndex > -1) {
            memeCoinScore[contractAddress] = 100;
          }
        }
      }
    }
    return memeCoinScore;
  };

  const calculateRewards = async () => {
    allocations = createInitialAllocations();
    allocations.status = 'loading';
    setAllocation(allocations);
    forceUpdate();

    const chains = Object.keys(CHAIN_RPC_URLS);
    for (const currentCasino of casinos) {
      for (const chain of chains) {
        for (const wallet of userWallets) {
          if (wallet.chain !== 'EVM') {
            continue;
          }
          const userWallet = wallet.address;
          try {
            setProgressMessage(
              `Checking deposits for ${shorten(userWallet, 4)} (${chain}) on ${currentCasino}....`,
            );
            // random number between 20 and 50
            const randomNumber = Math.floor(Math.random() * (50 - 20) + 20);
            const { totalDepositedInUSD } = await checkUserDeposits(
              wallet.address, //'0x93D39b56FA20Dc8F0E153958D73F0F5dC88F013f',
              randomNumber,
              chain,
              currentCasino,
            );
            if (totalDepositedInUSD > 0) {
              allocations.casinoAllocations[
                currentCasino
              ].chainsDepositsDetected[chain as Chains] = true;
            }
            if (
              allocations.casinoAllocations[currentCasino].totalDeposited ===
              null
            ) {
              allocations.casinoAllocations[currentCasino].totalDeposited =
                totalDepositedInUSD;
              allocations.casinoAllocations[currentCasino].totalScore =
                getScoreFromDeposit(totalDepositedInUSD);
            } else {
              allocations.casinoAllocations[currentCasino].totalDeposited +=
                totalDepositedInUSD;
              allocations.casinoAllocations[currentCasino].totalScore =
                getScoreFromDeposit(
                  allocations.casinoAllocations[currentCasino].totalDeposited,
                );
            }
            allocations.totalDeposited += totalDepositedInUSD;
            allocations.totalScore = getScoreFromDeposit(
              allocations.totalDeposited,
            );
            setAllocation(allocations);
            forceUpdate();
          } finally {
          }
        }
      }
      setAllocation(allocations);
      forceUpdate();
    }

    setProgressMessage(`Checking token interaction rewards...`);
    await getTokenRewards().then((tokenRewards) => {
      allocations.tokenRewards = tokenRewards;
      for (const tokenReward of Object.values(tokenRewards)) {
        allocations.totalTokenRewards += tokenReward;
      }
      setAllocation(allocations);
      forceUpdate();
    });

    allocations.status = 'success';
    setProgressMessage(``);
    setAllocation(allocations);
    forceUpdate();
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      <Banner className="flex flex-col justify-center xl:min-h-[26rem]">
        <h2 className="mb-3 text-xl font-medium tracking-widest md:max-w-[50%]">
          SHUFFLE | STAKE | ROLLBIT
        </h2>
        <div className="mb-3 inline-block rounded-md bg-destructive px-4 py-2 font-monoline text-3xl text-accent-foreground xl:text-4xl">
          Check your {token.symbol} Bonus
        </div>
        <ul className="mb-3 list-disc pl-5 text-lg md:max-w-[50%]">
          <li>
            Enter your wallet to see your available token sale bonus from
            participating in {token.symbol} token sale here.
          </li>
          <li>Link multiple cross-chain wallets to boost your score.</li>
        </ul>
        <div className="mb-3 flex items-center gap-3 md:max-w-2xl">
          <div className="text-lg md:max-w-[50%]">
            <Popover>
              <PopoverTrigger className="hover:text-primary">
                <span className="inline-flex items-center gap-1 hover:text-primary">
                  How is my bonus calculated
                  <QuestionMarkCircledIcon />
                </span>
              </PopoverTrigger>
              <PopoverContent align="start">
                <div className="max-w-80 rounded-xl border border-border bg-black p-2 text-left text-sm">
                  <ul className="list-disc space-y-2 pl-5">
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
                </div>
              </PopoverContent>
            </Popover>
          </div>
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
                  onClick={() => calculateRewards()}
                  className="place-self-end"
                  disabled={allocation.status === 'loading'}
                >
                  Calculate Rewards
                </Button>
              </div>
            </div>
            {progressMessage && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-lighter/50 px-5 py-4">
                <Loader2 className="animate-spin" /> {progressMessage}
              </div>
            )}

            {allocation.status !== 'notInit' && (
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
                        allocation.totalTokenRewards,
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
                  {memeCoins.map((memeCoin) => (
                    <TableRow
                      key={memeCoin.symbol}
                      className="odd:bg-lighter/1 even:bg-lighter/1 border-b-5 border border-lighter/50"
                    >
                      <TableCell className="flex items-center gap-2 px-5 font-normal capitalize">
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

export default BonusPage;
