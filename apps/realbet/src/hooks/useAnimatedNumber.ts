import { useEffect, useRef, useState } from 'react';

interface UseAnimatedNumberOptions {
  duration?: number;
  decimals?: number;
}

export const useAnimatedNumber = (
  value: number | bigint | string,
  options: UseAnimatedNumberOptions = {},
) => {
  const { duration = 350, decimals = 0 } = options;
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
        startValue + progressPercentage * (Number(value) - startValue);

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
    previousValueRef.current = isNaN(Number(value)) ? 0 : Number(value);

    return () => {
      cancelAnimationFrame(rAF);
    };
  }, [value, duration]);

  const finalDisplayValue = isNaN(displayValue) ? 0 : displayValue;

  return finalDisplayValue.toFixed(decimals);
};
