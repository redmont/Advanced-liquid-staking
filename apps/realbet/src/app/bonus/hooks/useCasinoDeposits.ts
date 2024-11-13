import { useQuery } from '@tanstack/react-query';

import { type Casino, casinoEvmChains, casinos } from '@/config/walletChecker';
import { getUserDeposits } from '../utils/getUserDeposits';
import { flatten, mapValues } from 'lodash';
import { useMemo } from 'react';
import { isAddress } from 'viem';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { chainIdToAlchemyNetworkMap } from '@/config/walletChecker';

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
  deposits: Awaited<ReturnType<typeof getUserDeposits>>,
) => {
  const scores = deposits.reduce(
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

  return mapValues(
    scores,
    (score) =>
      score && {
        deposited: score.deposited,
        score: truncateScore(score.score),
      },
  );
};

export const useCasinoDeposits = () => {
  const loggedIn = useIsLoggedIn();
  const { addresses: userWalletAddresses } = useWalletAddresses();

  const evmAddresses = useMemo(
    () => userWalletAddresses.filter((addr) => isAddress(addr)),
    [userWalletAddresses],
  );

  const deposits = useQuery({
    enabled: loggedIn,
    queryKey: ['casino-deposits', evmAddresses],
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

  const amounts = useMemo(() => {
    return deposits.isSuccess && deposits.data.length > 0
      ? calculateScoreFromDeposits(deposits.data)
      : defaultScores;
  }, [deposits.data, deposits.isSuccess]);

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
    deposits,
    totalScore,
    totalDeposited,
  };
};
