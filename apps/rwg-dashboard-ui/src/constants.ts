export const TIERS = [
  { status: 'Bronze', rakeback: 0, tier: 0 },
  { status: 'Silver', rakeback: 1, tier: 100 },
  { status: 'Gold', rakeback: 2, tier: 1000 },
  { status: 'Platinum', rakeback: 3, tier: 2500 },
  { status: 'Emerald', rakeback: 4, tier: 5000 },
  { status: 'Diamond', rakeback: 5, tier: 10000 },
  { status: 'Diamond+', rakeback: 6, tier: 25000 },
  { status: 'Saphire', rakeback: 7, tier: 50000 },
  { status: 'Saphire+', rakeback: 8, tier: 100000 },
  { status: 'Black', rakeback: 9, tier: 250000 },
  { status: 'Black+', rakeback: 10, tier: 500000 },
] as const;
