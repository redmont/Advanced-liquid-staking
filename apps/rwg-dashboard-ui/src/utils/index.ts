import { formatUnits, parseUnits } from 'viem';
import dayjs from '@/dayjs';
import { PublicKey as SolanaPublicKey } from '@solana/web3.js';
import assert from 'assert';

export const formatBalance = (
  balance: bigint,
  options?: { decimals?: number; precision?: number; locale?: string },
) => {
  const optionsWithDefaults = Object.assign(
    {
      decimals: 18,
      precision: 6,
      locale: 'en-US',
    },
    options,
  );
  const formatted = formatUnits(balance, optionsWithDefaults.decimals);
  const dotIndex = formatted.indexOf('.');

  let trimmed;
  if (dotIndex !== -1) {
    const neededLength = dotIndex + optionsWithDefaults.precision + 1;
    trimmed =
      formatted.length > neededLength
        ? formatted.slice(0, neededLength)
        : formatted;
  } else {
    trimmed = formatted;
  }

  // Use Intl.NumberFormat to localize the number
  const number = parseFloat(trimmed);
  return new Intl.NumberFormat(optionsWithDefaults.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: optionsWithDefaults.precision,
  }).format(number);
};

// Format balance, but truncate trailing zeros that are not significant
export const formatBalanceTruncated = (
  balance: bigint,
  options?: { decimals?: number; precision?: number; locale?: string },
) => formatBalance(balance, options).replace(/\.0+$/, '');

export const parseBalance = (balance: string, decimals: number) =>
  parseUnits(balance, decimals);

export const balanceToFloat = (balance: bigint, decimals: number) =>
  parseFloat(formatUnits(balance, decimals));

export const secondsToDaysOrMonths = (
  lockupTime: number,
  remainder?: boolean,
) => {
  const d = dayjs.duration(lockupTime, 'seconds');
  if (d.asMonths() < 1) {
    return `${d.asDays()} days`;
  }
  return remainder
    ? `${Math.floor(d.asMonths())} months, ${d.days()} days`
    : `${d.asMonths().toFixed(0)} months`;
};

export const toDurationSeconds = (datetime: number) =>
  datetime - new Date().getTime() / 1000;

export const formatWithSeparators = (num: number) =>
  new Intl.NumberFormat('en-US').format(num);

export const formatBigIntWithSeparators = (num: bigint, decimals: number) =>
  formatWithSeparators(parseFloat(formatUnits(num, decimals)));

export function toBase26(num: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';

  if (num < 0) {
    throw Error('Number must be positive');
  }

  if (num === 0) {
    return chars[0]!;
  }

  let result = '';

  while (num > 0) {
    result = chars[num % 26] + result;
    num = Math.floor(num / 26);
  }

  return result;
}

export const convertToReadableTime = (seconds: number) => {
  const duration = dayjs.duration(seconds, 'seconds');

  if (duration.asMinutes() < 60) {
    const minutes = Math.floor(duration.asMinutes());
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  if (duration.asHours() < 24) {
    const hours = Math.floor(duration.asHours());
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  if (duration.asDays() < 30) {
    const days = Math.floor(duration.asDays());
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  const months = Math.ceil(duration.asMonths());
  return `${months} month${months !== 1 ? 's' : ''}`;
};

export const shorten = (address: string, size = 6) =>
  address.slice(0, size) + '...' + address.slice(-size);

export const pluralize = (count: number, singular: string, plural: string) =>
  count === 1 ? singular : plural;

export const isSolanaAddress = (address: string) => {
  try {
    return SolanaPublicKey.isOnCurve(new SolanaPublicKey(address).toBytes());
  } catch {
    return false;
  }
};

export type ArrayElementType<T extends readonly unknown[]> =
  T extends readonly (infer U)[] ? U : never;

export const getRandomWeightedItem = <T>(items: T[], weights: number[]): T => {
  assert(items.length === weights.length, 'Unequal array lengths');
  assert(items.length > 0, 'Empty array');

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]!) {
      return items[i]!;
    }
    random -= weights[i]!;
  }

  return items[items.length - 1]!;
};
