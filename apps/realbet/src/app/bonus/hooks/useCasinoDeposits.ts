import { useQuery } from '@tanstack/react-query';

import { chains } from '@/config/walletChecker';
import { getUserDeposits } from '../utils/getUserDeposits';
import { flatten } from 'lodash';
import { useMemo } from 'react';
import { isAddress } from 'viem';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';

const POINTS_PER_USD_DEPOSITED = 1;
const POINT_THRESHOLD = 100;

const calculateDepositScore = (depositUSDValue: number) =>
  Math.floor(depositUSDValue / POINT_THRESHOLD) *
  POINT_THRESHOLD *
  POINTS_PER_USD_DEPOSITED;

export const useCasinoDeposits = () => {
  const { addresses: userWalletAddresses } = useWalletAddresses();

  const evmAddresses = useMemo(
    () => userWalletAddresses.filter((addr) => isAddress(addr)),
    [userWalletAddresses],
  );

  const deposits = useQuery({
    queryKey: ['casino-deposits', evmAddresses],
    queryFn: async () => {
      const promises = flatten(
        evmAddresses.map((address) =>
          chains.map((chain) => getUserDeposits(address, chain)),
        ),
      );

      return flatten(await Promise.all(promises));
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const amounts = useMemo(
    () =>
      deposits.isSuccess && deposits.data.length > 0
        ? deposits.data.reduce(
            (acc, deposit) =>
              deposit.value !== null && deposit.price !== null
                ? {
                    ...acc,
                    [deposit.casino]: {
                      deposited:
                        acc[deposit.casino].deposited +
                        deposit.value * deposit.price,
                      score:
                        acc[deposit.casino].score +
                        calculateDepositScore(deposit.value * deposit.price),
                    },
                  }
                : acc,
            {
              rollbit: { deposited: 0, score: 0 },
              shuffle: { deposited: 0, score: 0 },
            },
          )
        : {
            rollbit: { deposited: 0, score: 0 },
            shuffle: { deposited: 0, score: 0 },
          },
    [deposits.data, deposits.isSuccess],
  );

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
