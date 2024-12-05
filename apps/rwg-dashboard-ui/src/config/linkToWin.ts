import { RewardType } from '@prisma/client';

export const WAVE_CONFIGURATIONS = {
  1: {
    id: 1,
    label: 'VIPs Wave 1',
    description: 'Limited VIP spots this wave',
    startTime: new Date('2024-11-20T00:00:00.000Z'),
    endTime: new Date('2034-11-20T00:00:00.000Z'),
    whitelist: [
      '0xB6b7cE10a5Aaf0B9dB80bdB8aAAc01237CB78103',
      '0x9f6530CbEe3c606C5eaE2a5F4fd9865bb0745CB2',
      '0x2c4854bFF00865d1B83c6C1D58e0ae382C07a96d',
    ] as string[],
    availableSeats: 500,
    ticketsPerMember: 50,
    rewardPresets: [
      {
        prize: 0,
        remaining: 8500,
        type: RewardType.None,
      },
      {
        prize: 5000,
        remaining: 1,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 1000,
        remaining: 5,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 250,
        remaining: 20,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 50,
        remaining: 100,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 10,
        remaining: 500,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 2.5,
        remaining: 2000,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 1,
        remaining: 5624,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 2,
        remaining: 150,
        type: RewardType.TokenBonus,
      },
      {
        prize: 1.5,
        remaining: 325,
        type: RewardType.TokenBonus,
      },
      {
        prize: 0.75,
        remaining: 1050,
        type: RewardType.TokenBonus,
      },
      {
        prize: 0.5,
        remaining: 3200,
        type: RewardType.TokenBonus,
      },
      {
        prize: 0.25,
        remaining: 3525,
        type: RewardType.TokenBonus,
      },
    ],
  },
} as const;

export const TWITTER_BONUS_TICKETS = 5;
