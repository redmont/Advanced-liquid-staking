import { Diamond, Gift, Rocket } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSound from 'use-sound';
import balloonPop from '@/assets/sounds/balloon-pop.mp3';
import riser from '@/assets/sounds/riser.mp3';
import assert from 'assert';
import { awardRandomReward } from '@/server/actions/rewards/awardRandomReward';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ArrayElementType } from '@/utils';
import { RewardType } from '@prisma/client';
import { useToken } from '@/hooks/useToken';
import { Button } from '@/components/ui/button';

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
            <h3 className="text-md md:text-2xl">You lose</h3>
          ) : (
            <>
              {state === 'reveal-prize' && (
                <h3 className="text-md font-medium text-primary md:text-xl">
                  You win!
                </h3>
              )}
              {reward.type === RewardType.RealBetCredit && (
                <Rocket className="inline size-6 text-primary md:size-12 xl:size-6" />
              )}
              {reward.type === RewardType.TokenBonus && (
                <Diamond className="inline size-6 text-primary md:size-12 xl:size-6" />
              )}
              {reward.type === RewardType.RealBetCredit && (
                <>
                  <h3 className="text-sm md:text-xl">RealbetCredit</h3>{' '}
                  <p
                    className={cn(
                      'text-sm font-bold md:text-xl',
                      state === 'reveal-prize' && 'text-primary',
                    )}
                  >
                    {reward.amount} {token.symbol}
                  </p>
                </>
              )}
              {reward.type === RewardType.TokenBonus && (
                <>
                  <h3 className="text-sm md:text-xl">TokenBonus </h3>{' '}
                  <p
                    className={cn(
                      'text-sm font-bold md:text-xl',
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
  const [autoMode, setAutoMode] = useState(false);
  const [boxCounter, setBoxCounter] = useState(0);

  const awardReward = useMutation({
    mutationFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No token');
      }
      return awardRandomReward(authToken, 2);
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

  const openBox = useCallback(
    async (boxIndex: number) => {
      if (states[boxIndex] !== 'idle') {
        return;
      }
      const timings = {
        buildup: 1100,
        revealWin: autoMode ? 1000 : 2000,
        revealNearMisses: autoMode ? 1500 : 3000,
      };
      const awarded = awardReward.mutateAsync();
      assert(boxIndex < states.length, 'Invalid box index');
      setIndexClicked(boxIndex);
      playRiser();
      setState(() => {
        const newState = ['waiting', 'waiting', 'waiting'];
        newState[boxIndex] = 'popping';
        return newState as GiftBoxesState;
      });
      const [{ reward }] = await Promise.all([awarded, wait(timings.buildup)]);
      playBalloonPop();
      setState((state) => {
        const newState = [...state];
        newState[boxIndex] =
          reward.type === 'None' ? 'reveal-loss' : 'reveal-prize';
        return newState as GiftBoxesState;
      });
      await wait(timings.revealWin);
      setState(
        (state) =>
          state.map((gift) =>
            gift.startsWith('reveal') ? gift : 'reveal-loss',
          ) as GiftBoxesState,
      );
      await wait(timings.revealNearMisses);
      setState(initialState);
      setBoxCounter((c) => c + 1);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['rewardsAccount'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['currentWave'],
        }),
      ]);
    },
    [states, playRiser, awardReward, queryClient, playBalloonPop, autoMode],
  );

  useEffect(() => {
    if (autoMode) {
      void openBox(Math.floor(Math.random() * 3));
    }
  }, [boxCounter, autoMode, openBox]);

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-5 lg:gap-8 xl:gap-3 2xl:gap-5">
      <GiftBox
        onClick={() => openBox(0)}
        state={states[0]}
        reward={rewardArray[0]}
      />
      <GiftBox
        onClick={() => openBox(1)}
        state={states[1]}
        reward={rewardArray[1]}
      />
      <GiftBox
        onClick={() => openBox(2)}
        state={states[2]}
        reward={rewardArray[2]}
      />
      <div className="col-span-3">
        {autoMode ? (
          <Button
            variant="neutral"
            className="w-full"
            size="lg"
            onClick={() => setAutoMode(false)}
          >
            Stop Auto Mode
          </Button>
        ) : (
          <Button
            onClick={() => {
              setAutoMode(true);
            }}
            className="w-full"
            size="lg"
            variant="outline"
          >
            Start Auto Mode
          </Button>
        )}
      </div>
    </div>
  );
};

export default GiftBoxes;
