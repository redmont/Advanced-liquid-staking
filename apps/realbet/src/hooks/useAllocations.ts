import { useQuery } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
const store = getDefaultStore();

import { getScoreFromDeposit } from '../app/bonus/degenScore';
import {
  casinos,
  chains,
  allocationsAtom,
  progressMessageAtom,
  shorten,
} from '../app/bonus/utils';
import { checkUserDeposits } from '../app/bonus/depositsChecker';

const getAllAllocations = async (userWallets: string[]) => {
  store.set(allocationsAtom, (draft) => {
    draft.status = 'loading';
  });

  for (const currentCasino of casinos) {
    for (const chain of chains) {
      for (const wallet of userWallets) {
        const userWallet = wallet;
        try {
          store.set(
            progressMessageAtom,
            `Checking deposits for ${shorten(userWallet, 4)} (${chain}) on ${currentCasino}....`,
          );

          const totalDepositedInUSD = await checkUserDeposits(
            userWallet,
            chain,
            currentCasino,
          );

          store.set(allocationsAtom, (draft) => {
            if (totalDepositedInUSD > 0) {
              draft.casinoAllocations[currentCasino].chainsDepositsDetected[
                chain
              ] = true;
            }

            const prevTotalDeposited =
              draft.casinoAllocations[currentCasino].totalDeposited ?? 0;
            const newTotalDeposited = prevTotalDeposited + totalDepositedInUSD;

            draft.casinoAllocations[currentCasino].totalDeposited =
              newTotalDeposited;
            draft.casinoAllocations[currentCasino].totalScore =
              getScoreFromDeposit(newTotalDeposited);

            draft.totalDeposited += totalDepositedInUSD;
            draft.totalScore = getScoreFromDeposit(draft.totalDeposited);
          });
        } finally {
        }
      }
    }
  }

  store.set(progressMessageAtom, `Checking token interaction rewards...`);

  store.set(allocationsAtom, (draft) => {
    draft.status = 'success';
  });
  store.set(progressMessageAtom, ``);

  return store.get(allocationsAtom);
};

export const useAllocations = (userWallets: string[]) => {
  return useQuery({
    queryKey: ['allocations', userWallets],
    queryFn: () => getAllAllocations(userWallets),
    enabled: false,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
