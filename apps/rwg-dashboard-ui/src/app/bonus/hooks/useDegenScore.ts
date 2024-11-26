import { useCasinoDeposits } from './useCasinoDeposits';
import { useMemeCoinTracking } from './useMemeCoinTracking';
export { POINTS_PER_MEME_COIN_INTERACTION } from './useMemeCoinTracking';

const useDegenScore = () => {
  const memeInteractions = useMemeCoinTracking();
  const { solanaDeposits, amounts, totalScore, totalDeposited, evmDeposits } =
    useCasinoDeposits();

  const calls = [memeInteractions, evmDeposits, solanaDeposits];

  return {
    isSuccess: calls.every((call) => call.isSuccess),
    errors: calls.map((call) => call.error).filter(Boolean),
    totalScore: totalScore + memeInteractions.totalMemeInteractionScore,
    totalMemeInteractionScore: memeInteractions.totalMemeInteractionScore,
    totalDepositScore: totalScore,
    memeInteractions,
    totalDeposited,
    casinoDepositScores: amounts,
  };
};

export default useDegenScore;
