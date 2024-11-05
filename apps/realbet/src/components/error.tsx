import React from 'react';
import ded from '@/assets/images/vr-ded.webp';
import { cn } from '@/lib/utils';

const ErrorComponent: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'relative -mt-20 flex size-full grow flex-col items-center justify-center gap-5 self-stretch bg-cover p-5 lg:mt-0',
        className,
      )}
      style={{ backgroundImage: `url(${ded.src})` }}
    >
      <div className="absolute inset-0 z-10 bg-vignette" />
      <div className="relative z-20 text-center">
        <h1 className="font-monoline text-6xl text-accent sm:text-7xl">
          GAME OVER
        </h1>
        <p className="text-xl sm:text-2xl">
          Unfortunately, something went wrong. <br /> We&apos;ll get &apos;em
          next time.
        </p>
      </div>
    </div>
  );
};

export default ErrorComponent;
