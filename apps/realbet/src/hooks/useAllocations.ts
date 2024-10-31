import { useQuery } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
const store = getDefaultStore();

import { getTokenBalances, getScoreFromDeposit } from '../app/bonus/degenScore';
import {
  CHAIN_RPC_URLS,
  casinos,
  chains,
  allocationsAtom,
  progressMessageAtom,
  shorten,
} from '../app/bonus/utils';
import { checkUserDeposits } from '../app/bonus/depositsChecker';
import { memeCoins } from '../app/bonus/memeCoins';

const getTokenRewards = async (userWallets: string[]) => {
  const memeCoinScore: Record<string, number> = {};
  for (const wallet of userWallets) {
    const userWallet = wallet;
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

const getAllAllocations = async (userWallets: string[]) => {
  store.set(allocationsAtom, (draft) => {
    draft.status = 'loading';
    draft.totalDeposited = 0;
    draft.totalScore = 0;
    draft.tokenRewards = {};
    draft.totalTokenRewards = 0;
    draft.casinoAllocations = {
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
    };
  });
  // userWallets = [
  //   '0x93D39b56FA20Dc8F0E153958D73F0F5dC88F013f',
  //   '0x75AA2060d1ac0193b7c0741224CAf700b6DCd6BD',
  //   '0x93D39b56FA20Dc8F0E153958D73F0F5dC88F013f',
  // ];
  for (const currentCasino of casinos) {
    for (const chain of chains) {
      for (const wallet of userWallets) {
        const userWallet = wallet;
        try {
          store.set(
            progressMessageAtom,
            `Checking deposits for ${shorten(userWallet, 4)} (${chain}) on ${currentCasino}....`,
          );
          const daysBefore = 365;
          const totalDepositedInUSD = await checkUserDeposits(
            userWallet,
            daysBefore,
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
  // Fetch token rewards and update the atom
  const tokenRewards = await getTokenRewards(userWallets);

  store.set(allocationsAtom, (draft) => {
    draft.tokenRewards = tokenRewards;
    draft.totalTokenRewards = Object.values(tokenRewards).reduce(
      (sum, reward) => sum + reward,
      0,
    );
    draft.status = 'success';
  });
  store.set(progressMessageAtom, ``);

  return store.get(allocationsAtom);
};

export const useAllocations = (userWallets: string[]) => {
  const { data, refetch } = useQuery({
    queryKey: ['allocations', userWallets],
    queryFn: () => getAllAllocations(userWallets),
    enabled: false,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { allocations: data, refetch };
};
