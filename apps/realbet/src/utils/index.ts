import { formatUnits, parseUnits } from 'viem';
import dayjs from '@/dayjs';
import { PublicKey as SolanaPublicKey } from '@solana/web3.js';

export const formatBalance = (
  balance: bigint,
  decimals: number,
  precision = 6,
) => {
  const formatted = formatUnits(balance, decimals);

  // Identify the point position and ensure no rounding happens
  const dotIndex = formatted.indexOf('.');
  if (dotIndex !== -1) {
    // Trim to the required precision without rounding
    const neededLength = dotIndex + precision + 1;
    const trimmed =
      formatted.length > neededLength
        ? formatted.slice(0, neededLength)
        : formatted;

    return trimmed;
  }

  return formatted;
};

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

export const isSolanaAddress = (address: string) => {
  try {
    return SolanaPublicKey.isOnCurve(new SolanaPublicKey(address).toBytes());
  } catch {
    return false;
  }
};

export type ArrayElementType<T extends readonly unknown[]> =
  T extends readonly (infer U)[] ? U : never;
