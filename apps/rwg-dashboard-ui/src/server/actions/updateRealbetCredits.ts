import { MAX_CLAIM } from '@/config/realbetApi';
import { env } from '@/env';
import { ApiClient, Bonus } from '@bltzr-gg/realbet-api';

const realbetApi = new ApiClient({
  secret: env.REALBET_API_SECRET_KEY,
  apiUrl: env.REALBET_API_URL,
});

type Params = Parameters<typeof Bonus.creditUserBonus>[1];

export const creditUserBonus = async (
  realbetUserId: number,
  bonus: {
    id: number;
    name: string;
    amount: number;
    description: string;
  },
) => {
  const allParams: Params = {
    userId: realbetUserId,
    bonusId: bonus.id,
    bonusDetail: {
      amount: bonus.amount,
      name: bonus.name,
      description: bonus.description,
      maxClaim: MAX_CLAIM,
    },
  };

  return Bonus.creditUserBonus(realbetApi, allParams);
};
