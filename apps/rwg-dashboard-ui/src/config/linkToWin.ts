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
      '0x076b4679DDf131cf1A9c43419992Da1D22C15334',
      '0x0500faf49a467CC116BeD6fFB4F86654c089D52A',
      '0xb0a0D621DED63094F5da9045edc18c3e5d604120',
      'Ee5aiMJf7eM5fVt98r4kBoPHv49Zb5pMQbvCwUDZ62sH',
      '0x1693eEa1384E78c12f04D54D43053EbFf3dcA745',
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
        remaining: 5000,
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
