'use client';

import React, { useState } from 'react';
import { Loader2, Wallet2 } from 'lucide-react';
import Banner from '@/components/banner';
import {
  useDynamicContext,
  useIsLoggedIn,
  useDynamicModals,
} from '@dynamic-labs/sdk-react-core';

import { Button } from '@/components/ui/button';
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
import { shorten } from '@/utils';
import { casinoNames } from '@/config/walletChecker';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { useToken } from '@/hooks/useToken';
import ErrorComponent from '@/components/error';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import { useCasinoDeposits } from './hooks/useCasinoDeposits';
import { useCasinoLink } from '@/hooks/useCasinoLink';
import Link from 'next/link';
import RealIcon from '@/assets/images/R.svg';

const logos: Record<string, JSX.Element> = {
  shuffle: (
    <svg
      className="absolute inline-block size-full"
      width="22"
      height="24"
      viewBox="0 0 22 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.2273 0H5.77102C4.43258 0 3.17266 0.531836 2.22685 1.49269C1.28104 2.45531 0.759277 3.73349 0.759277 5.09322V6.65327C0.759277 8.73098 2.04537 10.5516 4.20049 11.5249L5.06079 11.883V6.7295C5.0573 6.70291 5.05556 6.67809 5.05556 6.6515V5.09145C5.05556 4.8273 5.18818 4.65534 5.26671 4.57556C5.34523 4.49579 5.5145 4.36106 5.77277 4.36106H16.229C16.489 4.36106 16.6583 4.49402 16.7368 4.57556C16.8154 4.65534 16.9462 4.8273 16.9462 5.08967V8.51293H21.2408V5.09145C21.2408 3.73172 20.719 2.45177 19.7732 1.49091C18.8239 0.530064 17.5657 0 16.2273 0Z"
        fill="#886CFF"
      />
      <path
        d="M17.7821 12.4662L16.9393 12.1152V17.3042C16.9428 17.3166 16.9428 17.3308 16.9428 17.3432V18.9032C16.9428 19.1674 16.8119 19.3411 16.7316 19.4209C16.6531 19.5007 16.4838 19.6354 16.2255 19.6354H5.77102C5.37664 19.6354 5.05556 19.3074 5.05556 18.9086V15.4853H0.759277V18.9086C0.759277 21.7167 3.00689 24 5.77102 24H16.2273C17.5657 23.9982 18.8256 23.4682 19.7715 22.5073C20.7173 21.5447 21.239 20.2647 21.239 18.905V17.345C21.239 15.2478 19.9477 13.4236 17.7821 12.468V12.4662Z"
        fill="#886CFF"
      />
      <path
        d="M9.15286 13.876C10.6536 15.4006 10.9991 17.3311 10.9991 17.3311C10.9991 17.3311 11.2242 16.0884 12.088 14.8102C12.3009 14.4947 12.5505 14.1773 12.8471 13.876C14.3478 12.3514 16.2482 11.9986 16.2482 11.9986C16.2482 11.9986 14.8138 11.7327 13.4509 10.6619C13.2467 10.5006 13.0426 10.3233 12.8454 10.123C11.3446 8.59836 10.9974 6.66602 10.9974 6.66602C10.9974 6.66602 10.7758 7.90873 9.91195 9.19046C9.69905 9.50602 9.44777 9.82335 9.15111 10.1247C7.64864 11.6493 5.74829 12.0003 5.74829 12.0003C5.74829 12.0003 7.18446 12.2663 8.54733 13.337C8.7515 13.5001 8.95567 13.6774 9.15286 13.8777V13.876Z"
        fill="#886CFF"
      />
    </svg>
  ),
  stake: (
    <svg
      className="absolute inline-block size-full"
      width="16"
      height="24"
      viewBox="0 0 16 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.62206 6.89858C3.60986 3.68881 5.67652 1.90871 9.47068 1.89537C12.201 1.88567 12.689 3.66092 12.689 4.30603C12.689 5.54167 10.9298 6.8525 10.9298 6.8525C10.9298 6.8525 11.0274 7.62251 12.5377 7.61644C14.0481 7.61038 15.5194 6.61968 15.5108 4.1399C15.5035 1.29149 12.5011 -0.0108454 9.5329 6.80034e-05C7.05022 0.00855624 0.465956 0.355361 0.489136 6.8525C0.511096 12.6233 11.469 13.1326 11.4776 16.8274C11.4922 20.8399 6.96361 21.9203 5.4313 21.9203C3.899 21.9203 3.27559 20.8423 3.27315 20.2506C3.26217 17.0008 6.51587 16.0962 6.51587 16.0962C6.51587 15.8537 6.32555 14.7732 5.06531 14.7781C1.81892 14.7842 0.525735 17.5586 0.535495 20.2676C0.544035 22.5715 2.18248 24.0097 4.65661 24C9.38772 23.983 14.7227 21.6887 14.7032 16.5934C14.6861 11.8278 3.63548 10.5837 3.62206 6.89858Z"
        fill="#F5F5F5"
      />
    </svg>
  ),
  rollbit: (
    <svg
      className="absolute inline-block size-full"
      width="29"
      height="26"
      viewBox="0 0 29 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_di_1876_2081)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M22.7703 13C22.7703 9.13397 19.6085 6 15.7083 6C15.5263 6 15.3458 6.00683 15.1673 6.02024L6 6.5L14.3464 7.40001L11.4186 7.43903C10.5501 8.09822 9.84062 8.95274 9.35685 9.93638L7.20036 10.25L9.09246 10.5462C8.80406 11.3098 8.64635 12.1366 8.64635 13C8.64635 13.8634 8.80406 14.6902 9.09246 15.4539L7.20036 15.75L9.35685 16.0636C9.84048 17.047 10.5497 17.9013 11.4178 18.5604L14.3464 18.6C11.4568 18.8148 9.7884 19.1629 6.90062 19.5L15.1673 19.9798C15.3458 19.9931 15.5263 20 15.7083 20C19.6085 20 22.7703 16.866 22.7703 13ZM13.0601 13C13.0601 14.4498 14.2457 15.625 15.7083 15.625C17.1709 15.625 18.3565 14.4498 18.3565 13C18.3565 11.5502 17.1709 10.375 15.7083 10.375C14.2457 10.375 13.0601 11.5502 13.0601 13Z"
          fill="#FFFFC1"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_1876_2081"
          x="0"
          y="0"
          width="28.7703"
          height="26"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.543599 0 0 0 0 0.0980392 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1876_2081"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1876_2081"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.989929 0 0 0 0 0.224562 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_1876_2081"
          />
        </filter>
      </defs>
    </svg>
  ),
  'bc.game': (
    <svg
      className="absolute inline-block size-full"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.6383 14.9029C22.0356 21.3315 15.5244 25.2438 9.09503 23.6407C2.66833 22.038 -1.24401 15.5265 0.359382 9.09837C1.96136 2.66903 8.47253 -1.24361 14.8999 0.359081C21.3289 1.96177 25.2411 8.47393 23.6383 14.9029Z"
        fill="#1F232F"
      />
    </svg>
  ),
};

const BonusPage = () => {
  const [_showResults, setShowResults] = useState(false);
  const token = useToken();
  const {
    deposits: casinoDeposits,
    bonus,
    calculateDeposits,
    totalDeposited,
    score,
  } = useCasinoDeposits();
  const isAuthenticated = useIsLoggedIn();
  const { sdkHasLoaded, setShowDynamicUserProfile } = useDynamicContext();
  const handleDynamicAuthClick = useDynamicAuthClickHandler();
  const { addresses: userAddresses } = useWalletAddresses();
  const { setShowLinkNewWalletModal } = useDynamicModals();
  const casinoLink = useCasinoLink();

  if (casinoDeposits.error) {
    return <ErrorComponent />;
  }

  const showResults =
    _showResults || calculateDeposits.isPending || casinoDeposits.data;

  const degenScoreTooltip = (
    <PopoverContent className="z-30" align="start">
      <ul className="max-w-80 list-disc space-y-3 rounded-xl bg-light p-2 pl-5 text-left text-sm">
        <li>Only deposits from Jan 1st 2023 onwards are counted.</li>
        <li>
          If there is at least 1 txn on any supported casinos (Shuffle, BC.game,
          Stake or Rollbit) on any supported chains (ETH, BNB) then you get{' '}
          <b>100 points</b>
        </li>
        <li>
          Then you get <b>100 points</b> for every <b>100$ deposited</b> on any
          supported casino on any supported chain.
        </li>
        <li>
          For each meme coins that you have ever interacted with in the meme
          coin list you get <b>100 points</b>
        </li>
      </ul>
    </PopoverContent>
  );

  return (
    <div className="flex flex-col gap-5 p-5">
      <Banner>
        <div className="space-y-4">
          <p className="py-4 text-lg tracking-widest md:max-w-[50%]">
            {casinoNames.map((n) => n.toUpperCase()).join(' | ')}
          </p>
          <h3 className="inline rounded-md bg-accent-2 px-2 font-monoline text-3xl text-white xl:text-4xl">
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
                      {shorten(address, 4)}
                      {userAddresses[i + 1] && ','}
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
                {casinoLink.isLinked ? (
                  <>
                    <Button
                      onClick={() => setShowLinkNewWalletModal(true)}
                      variant="outline"
                      className="place-self-end"
                    >
                      + Link new wallet
                    </Button>
                    <Button
                      loading={calculateDeposits.isPending}
                      disabled={
                        bonus.claimed ||
                        casinoDeposits.data?.status === 'Pending'
                      }
                      onClick={() => {
                        setShowResults(true);
                        calculateDeposits.mutate();
                      }}
                      className="place-self-end"
                    >
                      {casinoDeposits.data &&
                      casinoDeposits.data.status === 'Success'
                        ? 'Recalculate Rewards'
                        : casinoDeposits.data?.status === 'Pending'
                          ? 'In progress'
                          : 'Calculate Rewards'}
                    </Button>
                  </>
                ) : (
                  <Button asChild className="place-self-end">
                    <Link
                      href="/link-to-win"
                      className="font-bold text-primary"
                    >
                      Link Realbet Account
                    </Link>
                  </Button>
                )}
              </div>
              {casinoDeposits.data?.status === 'Pending' &&
                casinoDeposits.data.timestamp.getTime() - Date.now() <
                  1000 * 60 && (
                  <p className="w-full text-right text-warning">
                    You can retry in{' '}
                    {(
                      (casinoDeposits.data.timestamp.getTime() +
                        1000 * 60 -
                        new Date().getTime()) /
                      1000
                    ).toFixed(0)}{' '}
                    seconds.
                  </p>
                )}
            </div>
            {showResults && (
              <>
                {calculateDeposits.isPending && (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl bg-lighter/50 px-5 py-4">
                    <Loader2 className="animate-spin" />
                    Scanning for casino deposits, this may take a while...
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 rounded-xl bg-lighter/50 px-5 py-3 sm:grid-cols-2">
                  <div className="flex flex-col items-center gap-1 rounded-xl border border-orange-100/20 bg-red-500/5 px-2 py-4">
                    <h3 className="text-md">Total Deposited</h3>
                    <h3 className="text-center text-lg">
                      <span className="flex items-center gap-2 text-xl text-primary">
                        {(casinoDeposits.isPending ||
                          calculateDeposits.isPending ||
                          bonus.claim.isPending) && (
                          <Loader2 className="inline animate-spin" />
                        )}

                        {totalDeposited.toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        }) + ' USD'}
                      </span>
                    </h3>
                  </div>
                  <div className="flex flex-col items-center justify-between gap-1 rounded-xl border border-orange-100/20 bg-red-500/5 px-2 py-4">
                    <h3 className="text-md text-center">
                      <Popover>
                        <PopoverTrigger className="hover:text-primary">
                          Total {token.symbol} Rewards
                          <QuestionMarkCircledIcon className="ml-1 inline" />
                        </PopoverTrigger>
                        {degenScoreTooltip}
                      </Popover>
                    </h3>
                    <h3 className="text-md text-center">
                      <span className="text-xl text-primary">
                        {score.toLocaleString()}
                        <span className="inline-flex items-center gap-1 text-2xl">
                          <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full border border-primary bg-black p-1.5 text-primary">
                            <RealIcon className="inline size-full" />
                          </span>
                          {bonus.claimable && (
                            <Button
                              size={'sm'}
                              disabled={!bonus.claimable}
                              loading={
                                bonus.claim.isPending ||
                                calculateDeposits.isPending
                              }
                              onClick={() => bonus.claim.mutate()}
                            >
                              Claim
                            </Button>
                          )}
                        </span>
                      </span>
                    </h3>
                  </div>
                  <p className="text-destructive empty:hidden">
                    {bonus.claim.error?.message}
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5 font-normal">Casino</TableHead>
                      <TableHead className="px-5 font-normal">Asset</TableHead>
                      <TableHead className="px-5 font-normal">
                        Total Deposited
                      </TableHead>
                      <TableHead className="px-5 text-right font-normal">
                        Score
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  {casinoDeposits.isLoading && (
                    <TableBodySkeleton rows={2} cols={4} />
                  )}
                  <TableBody>
                    {casinoDeposits.isSuccess &&
                      casinoDeposits.data?.totals.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="flex items-center gap-2 px-5 font-normal capitalize"
                          >
                            No deposits were detected.
                          </TableCell>
                        </TableRow>
                      )}
                    {casinoDeposits.data?.totals.map((deposit) => {
                      const logo = logos[deposit.casino];

                      return (
                        <TableRow
                          key={`${deposit.casino}-${deposit.blockchain}-${deposit.symbol}`}
                          className="odd:bg-lighter/1 even:bg-lighter/1 border-b-5 border border-lighter/50"
                        >
                          <TableCell className="gap-2 px-5 font-normal capitalize">
                            <span className="flex items-center gap-2">
                              <span className="relative size-8">{logo}</span>{' '}
                              <span>{deposit.casino}</span>
                            </span>
                          </TableCell>
                          <TableCell className="gap-2 px-5 font-normal">
                            <img
                              alt=""
                              width={26}
                              src={`/icons/${deposit.symbol.toLowerCase()}.png`}
                            />{' '}
                            {deposit.symbol}
                          </TableCell>
                          <TableCell className="px-5">
                            {deposit.amount.toLocaleString('en-US', {
                              maximumFractionDigits: 2,
                            })}{' '}
                            USD
                          </TableCell>
                          <TableCell className="px-5 text-right">
                            {deposit.amount > 100 ? '+' : ''}
                            {(
                              Math.floor(deposit.amount / 100) * 100
                            ).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>

                  <TableFooter className="border-b-5 border border-lighter/50 bg-lighter/20">
                    <TableRow>
                      <TableHead className="px-5 font-normal">Total</TableHead>
                      <TableHead className="px-5 font-normal"></TableHead>
                      <TableHead className="px-5 font-normal text-primary">
                        {totalDeposited.toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        })}{' '}
                        USD
                      </TableHead>
                      <TableHead className="px-5 text-right font-normal text-primary">
                        {score}
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
