import { useEffect, useState } from 'react';

function calculateTimeLeft(endDate: Date) {
  const difference = +endDate - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
}

const Countdown = ({ endDate }: { endDate?: Date }) => {
  const [timeLeft, setTimeLeft] = useState(
    endDate && calculateTimeLeft(endDate),
  );

  useEffect(() => {
    const timer =
      endDate &&
      setInterval(() => {
        setTimeLeft(calculateTimeLeft(endDate));
      }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    timeLeft && (
      <span>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{' '}
        {timeLeft.seconds}s
      </span>
    )
  );
};

export default Countdown;
