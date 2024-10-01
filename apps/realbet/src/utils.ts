import { formatUnits, parseUnits } from 'viem';

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
