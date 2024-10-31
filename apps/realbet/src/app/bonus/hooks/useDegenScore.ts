import { useMemo } from 'react';
import { useCasinoDeposits } from './useCasinoDeposits';
import { useMemeCoinTracking } from './useMemeCoinTracking';
import { POINTS_PER_MEME_COIN_INTERACTION } from '@/config/memeCoins';

const POINTS_PER_USD_DEPOSITED = 1;
const POINT_THRESHOLD = 100;

const calculateDepositScore = (depositUSDValue: number) =>
  Math.floor(depositUSDValue / POINT_THRESHOLD) *
  POINT_THRESHOLD *
  POINTS_PER_USD_DEPOSITED;

const useDegenScore = () => {
  const memeInteractions = useMemeCoinTracking();
  const deposits = useCasinoDeposits();

  const totalMemeInteractionScore = useMemo(
    () =>
      memeInteractions.isSuccess && memeInteractions.interactions.length > 0
        ? memeInteractions.interactions.length *
          POINTS_PER_MEME_COIN_INTERACTION
        : 0,
    [memeInteractions.interactions.length, memeInteractions.isSuccess],
  );

  const casinoDeposits = useMemo(
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

  const totalDepositScore = useMemo(
    () =>
      Object.values(casinoDeposits).reduce((acc, cur) => acc + cur.score, 0),
    [casinoDeposits],
  );

  const totalDeposited = useMemo(
    () =>
      Object.values(casinoDeposits).reduce(
        (acc, cur) => acc + cur.deposited,
        0,
      ),
    [casinoDeposits],
  );

  const calls = [memeInteractions, deposits];

  return {
    isSuccess: calls.every((call) => call.isSuccess),
    errors: calls.map((call) => call.error).filter(Boolean),
    totalMemeInteractionScore,
    totalDepositScore,
    memeInteractions,
    totalDeposited,
    casinoDepositScores: casinoDeposits,
  };
};

export default useDegenScore;
