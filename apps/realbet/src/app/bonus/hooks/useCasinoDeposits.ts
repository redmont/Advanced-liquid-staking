import { useQuery } from '@tanstack/react-query';

import { type Casino, casinoEvmChains, casinos } from '@/config/walletChecker';
import { getUserDeposits } from '../utils/getUserDeposits';
import { flatten, mapValues } from 'lodash';
import { useMemo } from 'react';
import { isAddress } from 'viem';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { chainIdToAlchemyNetworkMap } from '@/config/walletChecker';
import { solTraceAllDeposits } from '../utils/solanaDepositChecker';

const POINTS_PER_USD_DEPOSITED = 1;
const POINT_THRESHOLD = 100;

const truncateScore = (score: number) =>
  Math.floor(score / POINT_THRESHOLD) * POINT_THRESHOLD;

const calculateDepositScore = (depositUSDValue: number) =>
  depositUSDValue * POINTS_PER_USD_DEPOSITED;

const defaultScores = casinos.reduce(
  (acc, casino) => ({
    ...acc,
    [casino.name]: { deposited: 0, score: 0 },
  }),
  {} as Record<Casino['name'], { deposited: number; score: number }>,
);

const calculateScoreFromDeposits = (
  evmDeposits: Awaited<ReturnType<typeof getUserDeposits>>,
  solanaDeposits: Record<string, { deposited: number }>,
) => {
  const evmScores = evmDeposits.reduce(
    (acc, deposit) =>
      deposit.value !== null && deposit.price !== null
        ? {
            ...acc,
            [deposit.casino.name]: {
              deposited:
                (acc[deposit.casino.name]?.deposited ?? 0) +
                deposit.value * deposit.price,
              score:
                (acc[deposit.casino.name]?.score ?? 0) +
                calculateDepositScore(deposit.value * deposit.price),
            },
          }
        : acc,
    defaultScores,
  );

  const solanaScores = Object.entries(solanaDeposits).reduce(
    (acc, [casino, { deposited }]) => ({
      ...acc,
      [casino]: {
        deposited: (acc[casino as Casino['name']]?.deposited ?? 0) + deposited,
        score:
          (acc[casino as Casino['name']]?.score ?? 0) +
          calculateDepositScore(deposited),
      },
    }),
    {} as Record<Casino['name'], { deposited: number; score: number }>,
  );

  return mapValues(
    { ...evmScores, ...solanaScores },
    (score) =>
      score && {
        deposited: score.deposited,
        score: truncateScore(score.score),
      },
  );
};

export const useCasinoDeposits = () => {
  const loggedIn = useIsLoggedIn();
  const { addresses: userWalletAddresses, solana } = useWalletAddresses();

  const evmAddresses = useMemo(
    () => userWalletAddresses.filter((addr) => isAddress(addr)),
    [userWalletAddresses],
  );

  const evmDeposits = useQuery({
    enabled: loggedIn,
    queryKey: ['casino-evm-deposits', evmAddresses],
    queryFn: async () => {
      const promises = flatten(
        evmAddresses.map((address) =>
          casinoEvmChains.map((chain) =>
            getUserDeposits(address, chainIdToAlchemyNetworkMap[chain]),
          ),
        ),
      );

      return flatten(await Promise.all(promises));
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const solanaDeposits = useQuery({
    enabled: loggedIn && solana.length > 0,
    queryKey: ['casino-solana-deposits', solana],
    queryFn: async () => {
      const solanaPromises = solana.map(
        (address) =>
          solTraceAllDeposits(address) as Promise<
            Record<string, { deposited: number }>
          >,
      );

      try {
        const results = await Promise.all(solanaPromises);
        return results.reduce<Record<string, { deposited: number }>>(
          (acc, curr) => ({
            ...acc,
            ...Object.entries(curr).reduce(
              (innerAcc, [casino, { deposited }]) => ({
                ...innerAcc,
                [casino]: {
                  deposited: (acc[casino]?.deposited ?? 0) + deposited,
                },
              }),
              {},
            ),
          }),
          {},
        );
      } catch {
        throw new Error('Something failed with the Solana request.');
        return {};
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const amounts = useMemo(() => {
    if (evmDeposits.isSuccess && solanaDeposits.isSuccess) {
      return calculateScoreFromDeposits(evmDeposits.data, solanaDeposits.data);
    }

    return defaultScores;
  }, [
    evmDeposits.data,
    evmDeposits.isSuccess,
    solanaDeposits.data,
    solanaDeposits.isSuccess,
  ]);

  const totalScore = useMemo(
    () => Object.values(amounts).reduce((acc, cur) => acc + cur.score, 0),
    [amounts],
  );

  const totalDeposited = useMemo(
    () => Object.values(amounts).reduce((acc, cur) => acc + cur.deposited, 0),
    [amounts],
  );

  return {
    amounts,
    evmDeposits,
    solanaDeposits,
    totalScore,
    totalDeposited,
  };
};
