'use client';

import React, { type PropsWithChildren, useRef } from 'react';
import { motion } from 'framer-motion';
import backgroundImage from '@/assets/images/vr-guy.png';
import pepeAttack from '@/assets/images/pepe-attack.png';
import useParallaxEffect from '@/hooks/useParallax';
import { cn } from '@/lib/cn';

const Banner: React.FC<
  PropsWithChildren & { className?: string; frog?: boolean }
> = ({ children, className, frog = true }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const position = useParallaxEffect(bannerRef);

  return (
    <div
      ref={bannerRef}
      className={cn(
        // eslint-disable-next-line tailwindcss/no-contradicting-classname
        'relative rounded-3xl bg-[size:200%] bg-[position:center] bg-no-repeat px-4 py-8 sm:bg-[center_10%] sm:px-12',
        className,
      )}
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundPositionY: `${position}%`,
      }}
    >
      <div className="absolute inset-0 rounded-lg bg-black opacity-50"></div>
      <div className="relative z-20">{children}</div>
      {frog && (
        <motion.img
          className="pointer-events-none absolute -bottom-32 -right-32 z-10 w-80 md:w-96 xl:right-0"
          src={pepeAttack.src}
          alt="Pepe Attack"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        />
      )}
    </div>
  );
};

export default Banner;
