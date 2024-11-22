'use client';

import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { useRewardsAccount } from './useRewardsAccount';
import { awardRandomReward as redeem } from '@/server/actions/rewards-account/awardRandomReward';
import { useCallback } from 'react';

export const useRedeemableTickets = () => {
  const rewardsAccount = useRewardsAccount();
  const redeemableTickets = rewardsAccount.data?.reedeemableTickets ?? 0;

  const redeemTicket = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token');
    }

    return redeem(token);
  }, []);

  return {
    redeemableTickets,
    redeemTicket,
  };
};
