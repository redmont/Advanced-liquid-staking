import { useQuery } from '@tanstack/react-query';

import { chains } from '@/config/walletChecker';
import { getUserDeposits } from '../utils/getUserDeposits';
import { flatten } from 'lodash';
import { useMemo } from 'react';
import { isAddress } from 'viem';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import { useSolsDeposits } from '../utils/solanaDepositChecker';

const POINTS_PER_USD_DEPOSITED = 1;
const POINT_THRESHOLD = 100;
type Casino = 'rollbit' | 'shuffle' | 'bcgame' | 'betfury';

const calculateDepositScore = (depositUSDValue: number) =>
  Math.floor(depositUSDValue / POINT_THRESHOLD) *
  POINT_THRESHOLD *
  POINTS_PER_USD_DEPOSITED;

export const useCasinoDeposits = () => {
  const { addresses: userWalletAddresses } = useWalletAddresses();
  const solanaDeposits = useSolsDeposits();

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

  const amounts = useMemo(() => {
    const initialAmounts: Record<Casino, { deposited: number; score: number }> = {
      rollbit: { deposited: 0, score: 0 },
      shuffle: { deposited: 0, score: 0 },
      bcgame: { deposited: 0, score: 0 },
      betfury: { deposited: 0, score: 0 },
    };

    Object.entries(solanaDeposits).forEach(([casino, solData]) => {
      const casinoKey = casino as Casino;
      initialAmounts[casinoKey].deposited += solData.deposited;
      initialAmounts[casinoKey].score += calculateDepositScore(solData.deposited);
    });

    if (deposits.isSuccess && deposits.data.length > 0) {
      return deposits.data.reduce((acc, deposit) => {
        if (deposit.value !== null && deposit.price !== null) {
          const usdValue = deposit.value * deposit.price;
          acc[deposit.casino].deposited += usdValue;
          acc[deposit.casino].score += calculateDepositScore(usdValue);
        }
        return acc;
      }, initialAmounts);
    }

    return initialAmounts;
  }, [deposits.data, deposits.isSuccess, solanaDeposits]);

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
