import { formatUnits, parseUnits } from 'viem';
import dayjs from '@/dayjs';

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
