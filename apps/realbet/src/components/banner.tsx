'use client';

import React, { type PropsWithChildren, useRef } from 'react';
import { motion } from 'framer-motion';
import backgroundImage from 'src/assets/images/vr-guy.png';
import pepeAttack from 'src/assets/images/pepe-attack.png';
import useParallaxEffect from '@/hooks/useParallax';

const Banner: React.FC = ({ children }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const position = useParallaxEffect(bannerRef);

  return (
    <div
      ref={bannerRef}
      // eslint-disable-next-line tailwindcss/no-contradicting-classname
      className="relative rounded-3xl bg-[size:200%] bg-[position:center] bg-no-repeat px-4 py-8 sm:bg-[center_10%] sm:px-12"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundPositionY: `${position}%`,
      }}
    >
      <div className="absolute inset-0 rounded-lg bg-black opacity-50"></div>
      <div className="relative z-10">{children}</div>
      <motion.img
        className="absolute -bottom-52 -right-32 z-10 w-80 opacity-50 md:top-10 md:block md:w-96 xl:right-0"
        src={pepeAttack.src}
        alt="Pepe Attack"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      />
    </div>
  );
};

export default Banner;
