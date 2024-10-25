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
import { Tooltip } from '../../components/Tooltip';
import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
  useDynamicModals,
} from '@dynamic-labs/sdk-react-core';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { Wallet2 } from 'lucide-react';
import { getChainIcon } from '@/config/chainIcons';

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

const Page = () => {
  const [allocation, setAllocation] = useState<Allocations>(allocations);
  const [progressMessage, setProgressMessage] = useState('');
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const isAuthenticated = useIsLoggedIn();
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
      <Banner>
        <div className="space-y-4">
          <p className="py-4 text-lg tracking-widest md:max-w-[50%]">
            SHUFFLE | STAKE | ROLLBIT
          </p>
          <h3 className="inline rounded-md bg-[#A40505] px-2 font-monoline text-3xl text-white xl:text-4xl">
            Check your Real Bonus
          </h3>
          <p className="text-lg md:max-w-[50%]">
            <li>
              Connect your wallet to see your available token sale bonus from
              participating in REAL token sale here.
            </li>
            <li>Link multiple cross-chain wallets to boost your score.</li>
          </p>
          <div className="flex items-center gap-3 md:max-w-2xl">
            <p className="text-lg md:max-w-[50%]">
              How is my bonus calculated ?{' '}
            </p>
            <Tooltip
              content={
                <p className="max-w-80 rounded-xl border border-[#F0AC5D] bg-black p-2 text-left text-sm">
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
                </p>
              }
            >
              <div>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.50016 0.581787C12.8733 0.581787 16.4184 4.12687 16.4184 8.50004C16.4184 12.8724 12.8733 16.4167 8.50016 16.4167C4.127 16.4167 0.583496 12.8724 0.583496 8.50004C0.582705 4.12687 4.127 0.581787 8.50016 0.581787ZM8.50016 1.76929C7.61018 1.75963 6.72712 1.92659 5.90209 2.26049C5.07706 2.5944 4.32644 3.08862 3.69369 3.71454C3.06093 4.34047 2.5586 5.08568 2.21577 5.90705C1.87294 6.72841 1.69642 7.60961 1.69642 8.49964C1.69642 9.38968 1.87294 10.2709 2.21577 11.0922C2.5586 11.9136 3.06093 12.6588 3.69369 13.2847C4.32644 13.9107 5.07706 14.4049 5.90209 14.7388C6.72712 15.0727 7.61018 15.2397 8.50016 15.23C10.2725 15.2108 11.9658 14.4932 13.2123 13.2331C14.4588 11.973 15.1579 10.2721 15.1579 8.49964C15.1579 6.72718 14.4588 5.02626 13.2123 3.76616C11.9658 2.50606 10.2725 1.78851 8.50016 1.76929ZM8.497 7.31096C8.64061 7.31077 8.77943 7.36264 8.88773 7.45697C8.99603 7.55129 9.06647 7.68167 9.086 7.82396L9.09154 7.90471L9.09471 12.2605C9.09625 12.412 9.03981 12.5583 8.93695 12.6696C8.83409 12.7808 8.69259 12.8485 8.54143 12.8589C8.39027 12.8692 8.24088 12.8213 8.12385 12.7251C8.00683 12.6289 7.93102 12.4915 7.91196 12.3412L7.90721 12.2612L7.90404 7.9055C7.90404 7.74802 7.96659 7.597 8.07794 7.48565C8.18929 7.3743 8.34032 7.31175 8.49779 7.31175M8.50175 4.54329C8.60766 4.53994 8.71317 4.5579 8.812 4.59612C8.91083 4.63434 9.00098 4.69202 9.07708 4.76576C9.15319 4.83949 9.2137 4.92777 9.25502 5.02534C9.29635 5.12292 9.31764 5.2278 9.31764 5.33377C9.31764 5.43973 9.29635 5.54462 9.25502 5.64219C9.2137 5.73977 9.15319 5.82804 9.07708 5.90178C9.00098 5.97551 8.91083 6.0332 8.812 6.07142C8.71317 6.10963 8.60766 6.1276 8.50175 6.12425C8.29643 6.11775 8.1017 6.03162 7.95876 5.88408C7.81582 5.73655 7.73589 5.53919 7.73589 5.33377C7.73589 5.12835 7.81582 4.93098 7.95876 4.78345C8.1017 4.63592 8.29643 4.54979 8.50175 4.54329Z"
                    fill="#FEFEFE"
                    fill-opacity="0.6"
                  />
                </svg>
              </div>
            </Tooltip>
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
                    <span>Total Degen Score</span>
                    <Tooltip
                      content={
                        <p className="max-w-80 rounded-xl border border-[#F0AC5D] bg-black p-2 text-left text-sm">
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
                        </p>
                      }
                    >
                      <div className="place-self-center">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 17 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.50016 0.581787C12.8733 0.581787 16.4184 4.12687 16.4184 8.50004C16.4184 12.8724 12.8733 16.4167 8.50016 16.4167C4.127 16.4167 0.583496 12.8724 0.583496 8.50004C0.582705 4.12687 4.127 0.581787 8.50016 0.581787ZM8.50016 1.76929C7.61018 1.75963 6.72712 1.92659 5.90209 2.26049C5.07706 2.5944 4.32644 3.08862 3.69369 3.71454C3.06093 4.34047 2.5586 5.08568 2.21577 5.90705C1.87294 6.72841 1.69642 7.60961 1.69642 8.49964C1.69642 9.38968 1.87294 10.2709 2.21577 11.0922C2.5586 11.9136 3.06093 12.6588 3.69369 13.2847C4.32644 13.9107 5.07706 14.4049 5.90209 14.7388C6.72712 15.0727 7.61018 15.2397 8.50016 15.23C10.2725 15.2108 11.9658 14.4932 13.2123 13.2331C14.4588 11.973 15.1579 10.2721 15.1579 8.49964C15.1579 6.72718 14.4588 5.02626 13.2123 3.76616C11.9658 2.50606 10.2725 1.78851 8.50016 1.76929ZM8.497 7.31096C8.64061 7.31077 8.77943 7.36264 8.88773 7.45697C8.99603 7.55129 9.06647 7.68167 9.086 7.82396L9.09154 7.90471L9.09471 12.2605C9.09625 12.412 9.03981 12.5583 8.93695 12.6696C8.83409 12.7808 8.69259 12.8485 8.54143 12.8589C8.39027 12.8692 8.24088 12.8213 8.12385 12.7251C8.00683 12.6289 7.93102 12.4915 7.91196 12.3412L7.90721 12.2612L7.90404 7.9055C7.90404 7.74802 7.96659 7.597 8.07794 7.48565C8.18929 7.3743 8.34032 7.31175 8.49779 7.31175M8.50175 4.54329C8.60766 4.53994 8.71317 4.5579 8.812 4.59612C8.91083 4.63434 9.00098 4.69202 9.07708 4.76576C9.15319 4.83949 9.2137 4.92777 9.25502 5.02534C9.29635 5.12292 9.31764 5.2278 9.31764 5.33377C9.31764 5.43973 9.29635 5.54462 9.25502 5.64219C9.2137 5.73977 9.15319 5.82804 9.07708 5.90178C9.00098 5.97551 8.91083 6.0332 8.812 6.07142C8.71317 6.10963 8.60766 6.1276 8.50175 6.12425C8.29643 6.11775 8.1017 6.03162 7.95876 5.88408C7.81582 5.73655 7.73589 5.53919 7.73589 5.33377C7.73589 5.12835 7.81582 4.93098 7.95876 4.78345C8.1017 4.63592 8.29643 4.54979 8.50175 4.54329Z"
                            fill="#FEFEFE"
                            fill-opacity="0.6"
                          />
                        </svg>
                      </div>
                    </Tooltip>{' '}
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
                  <h3 className="text-md text-center">Total $REAL Rewards</h3>
                  <h3 className="text-md text-center">
                    <span className="text-xl text-primary">
                      {totalDegenScore(
                        allocation.totalDeposited,
                        allocation.totalTokenRewards,
                      )}{' '}
                      REAL
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

export default Page;
