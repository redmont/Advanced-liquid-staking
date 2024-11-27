import { Gift } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useMemo, useState } from 'react';
import useSound from 'use-sound';
import balloonPop from '@/assets/sounds/balloon-pop.mp3';
import riser from '@/assets/sounds/riser.mp3';
import assert from 'assert';
import { awardRandomReward } from '@/server/actions/rewards-account/awardRandomReward';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ArrayElementType } from '@/utils';
import { RewardType } from '@prisma/client';
import { useToken } from '@/hooks/useToken';

type AwardedReward = Awaited<ReturnType<typeof awardRandomReward>>;

const GiftBox = ({
  onClick,
  state,
  reward,
}: {
  onClick: () => void;
  state: BoxState;
  reward?:
    | AwardedReward['reward']
    | ArrayElementType<AwardedReward['nearWins']>;
}) => {
  const token = useToken();
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex aspect-square size-full flex-col items-center justify-center rounded-md border border-primary bg-primary/10 transition-all',
        state === 'idle' && 'hover:bg-primary/20',
        state === 'reveal-loss' &&
          'border-muted bg-transparent transition-colors duration-500',
        state === 'reveal-prize' &&
          'border-primary bg-transparent transition-colors duration-500',
        state === 'waiting' && 'cursor-not-allowed border-muted bg-white/10',
      )}
    >
      {reward && state.startsWith('reveal') && (
        <div>
          {reward.type === 'None' ? (
            <h3 className="text-3xl">You lose</h3>
          ) : (
            <>
              {state === 'reveal-prize' && (
                <h3 className="text-2xl font-medium text-primary">You win</h3>
              )}
              {reward.type === RewardType.RealBetCredit && (
                <>
                  <h3 className="text-[2rem]">RealbetCredit</h3>{' '}
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      state === 'reveal-prize' && 'text-primary',
                    )}
                  >
                    {reward.amount} {token.symbol}
                  </p>
                </>
              )}
              {reward.type === RewardType.TokenBonus && (
                <>
                  <h3 className="text-3xl">TokenBonus </h3>{' '}
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      state === 'reveal-prize' && 'text-primary',
                    )}
                  >
                    {reward.amount}
                    {'% '}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
      <Gift
        className={cn(
          'size-1/3 text-primary transition-all',
          state === 'idle' && 'group-hover:scale-125',
          state === 'popping' && 'animate-shake',
          state.startsWith('reveal') && 'hidden',
          state === 'waiting' && 'text-muted',
        )}
      />
    </button>
  );
};

type BoxState = 'idle' | 'waiting' | 'popping' | 'reveal-loss' | 'reveal-prize';
type GiftBoxesState = [BoxState, BoxState, BoxState];

const initialState: GiftBoxesState = ['idle', 'idle', 'idle'] as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GiftBoxes = () => {
  const queryClient = useQueryClient();
  const [playRiser] = useSound(riser, { playbackRate: 1.85 });
  const [playBalloonPop] = useSound(balloonPop, { volume: 0.35 });
  const [states, setState] = useState<GiftBoxesState>(initialState);
  const [indexClicked, setIndexClicked] = useState<number | null>(null);

  const awardReward = useMutation({
    mutationFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No token');
      }
      return awardRandomReward(authToken, 2);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rewardsAccount'] });
    },
  });

  const rewardArray = useMemo(() => {
    const copied = awardReward.data?.nearWins.slice() ?? [];
    return Array.from({ length: states.length }).map((_, index) => {
      if (index === indexClicked) {
        return awardReward.data?.reward;
      }

      return copied.pop();
    });
  }, [awardReward.data, indexClicked, states.length]);

  const makeHandler = (boxIndex: number) => async () => {
    if (states[boxIndex] !== 'idle') {
      return;
    }
    void wait(1100).then(() => playBalloonPop());
    assert(boxIndex < states.length, 'Invalid box index');
    setIndexClicked(boxIndex);
    playRiser();
    setState(() => {
      const newState = ['waiting', 'waiting', 'waiting'];
      newState[boxIndex] = 'popping';
      return newState as GiftBoxesState;
    });
    const [{ reward }] = await Promise.all([
      awardReward.mutateAsync(),
      wait(1100),
    ]);
    void queryClient.invalidateQueries({
      queryKey: ['rewardsAccount', 'current-wave'],
    });
    setState((state) => {
      const newState = [...state];
      newState[boxIndex] =
        reward.type === 'None' ? 'reveal-loss' : 'reveal-prize';
      return newState as GiftBoxesState;
    });
    await wait(2000);
    setState(
      (state) =>
        state.map((gift) =>
          gift.startsWith('reveal') ? gift : 'reveal-loss',
        ) as GiftBoxesState,
    );
    await wait(3000);
    setState(initialState);
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      <GiftBox
        onClick={makeHandler(0)}
        state={states[0]}
        reward={rewardArray[0]}
      />
      <GiftBox
        onClick={makeHandler(1)}
        state={states[1]}
        reward={rewardArray[1]}
      />
      <GiftBox
        onClick={makeHandler(2)}
        state={states[2]}
        reward={rewardArray[2]}
      />
    </div>
  );
};

export default GiftBoxes;
