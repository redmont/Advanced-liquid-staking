import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 350,
  className,
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start: number;
    let rAF: number;

    const animate = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }
      const progress = timestamp - start;
      const progressPercentage = Math.min(progress / duration, 1);

      const currentNumber = progressPercentage * value;
      setDisplayValue(currentNumber);

      if (progress < duration) {
        rAF = requestAnimationFrame(animate);
      }
    };

    rAF = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rAF);
    };
  }, [value, duration]);

  return <span className={className}>{displayValue.toFixed(decimals)}</span>;
};

export default AnimatedNumber;
