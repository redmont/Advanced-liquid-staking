import { useEffect, useRef, useState } from 'react';

interface UseAnimatedNumberOptions {
  duration?: number;
  decimals?: number;
  locale?: string;
}

const parseNumber = (value: string | number | bigint) =>
  typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);

export const useAnimatedNumber = (
  value: number | bigint | string,
  options: UseAnimatedNumberOptions = {},
) => {
  const { duration = 350, decimals = 0, locale } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef<number>(0);

  useEffect(() => {
    const startValue = previousValueRef.current;
    let start: number;
    let rAF: number;

    const animate = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }
      const progress = timestamp - start;
      const progressPercentage = Math.min(progress / duration, 1);

      let currentNumber =
        startValue + progressPercentage * (parseNumber(value) - startValue);

      if (isNaN(currentNumber)) {
        currentNumber = 0;
      }

      setDisplayValue(currentNumber);

      if (progress < duration) {
        rAF = requestAnimationFrame(animate);
      }
    };

    rAF = requestAnimationFrame(animate);

    // Update the previous value reference
    const parsedValue = parseNumber(value);
    previousValueRef.current = isNaN(parsedValue) ? 0 : parsedValue;

    return () => {
      cancelAnimationFrame(rAF);
    };
  }, [value, duration]);

  const finalDisplayValue = isNaN(displayValue) ? 0 : displayValue;

  // Localize the number using Intl.NumberFormat
  const formattedValue = locale
    ? new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(finalDisplayValue)
    : finalDisplayValue.toFixed(decimals);

  return formattedValue;
};
