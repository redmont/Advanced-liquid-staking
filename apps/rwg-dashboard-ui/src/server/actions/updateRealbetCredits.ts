import { MAX_CLAIM } from '@/config/realbetApi';
import { env } from '@/env';
import { ApiClient, Bonus } from '@bltzr-gg/realbet-api';

const realbetApi = new ApiClient({
  secret: env.REALBET_API_SECRET_KEY,
  apiUrl: env.REALBET_API_URL,
});

export const rewardToBonusId: Record<number, number> = {
  10_000: 142,
  5_000: 168,
  2_500: 169,
  1_000: 170,
};

export const creditUserBonus = async (
  realbetUserId: number,
  bonus:
    | {
        id: number;
      }
    | {
        name: string;
        amount: number;
        description: string;
      },
) => {
  if ('id' in bonus) {
    return Bonus.creditUserBonus(realbetApi, {
      userId: realbetUserId,
      bonusId: bonus.id,
    });
  } else if ('name' in bonus) {
    return Bonus.creditUserBonus(realbetApi, {
      userId: realbetUserId,
      bonusDetail: {
        amount: bonus.amount,
        name: bonus.name,
        description: bonus.description,
        maxClaim: MAX_CLAIM,
      },
    });
  }

  throw new Error('Invalid bonus object provided');
};
