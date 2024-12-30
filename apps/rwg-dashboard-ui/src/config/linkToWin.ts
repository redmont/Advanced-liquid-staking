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
      '0x4F0Dd261f02620A391BF68a15C267257C1f557fE',
    ] as string[],
    availableSeats: 5000,
    ticketsPerMember: 15,
    rewardPresets: [
      {
        prize: 0,
        remaining: 25000,
        type: RewardType.None,
      },
      {
        prize: 10000,
        remaining: 51,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 5000,
        remaining: 949,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 2500,
        remaining: 3000,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 1000,
        remaining: 9000,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 500,
        remaining: 12000,
        type: RewardType.RealBetCredit,
      },
      {
        prize: 250000,
        remaining: 1,
        type: RewardType.TokenBonus,
      },
      {
        prize: 10000,
        remaining: 50,
        type: RewardType.TokenBonus,
      },
      {
        prize: 2500,
        remaining: 949,
        type: RewardType.TokenBonus,
      },
      {
        prize: 1000,
        remaining: 3000,
        type: RewardType.TokenBonus,
      },
      {
        prize: 100,
        remaining: 9000,
        type: RewardType.TokenBonus,
      },
      {
        prize: 50,
        remaining: 12000,
        type: RewardType.TokenBonus,
      },
    ],
  },
} as const;

export const TWITTER_BONUS_TICKETS = 2;
