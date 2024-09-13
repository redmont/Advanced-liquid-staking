'use client';

import React, { type PropsWithChildren, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import backgroundImage from 'src/assets/images/vr-guy.png';
import pepeAttack from 'src/assets/images/pepe-attack.png';

const useParallaxEffect = (ref: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const scrollPosition =
          (window.scrollY / window.innerHeight) * 100 * 0.25;

        ref.current.style.backgroundPositionY = `${scrollPosition + 10}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);
};

const Banner: React.FC<PropsWithChildren> = ({ children }) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useParallaxEffect(bannerRef);

  return (
    <div
      ref={bannerRef}
      // eslint-disable-next-line tailwindcss/no-contradicting-classname
      className="relative rounded-lg bg-[size:200%] bg-[position:center] bg-no-repeat px-12 py-8 sm:bg-[center_10%]"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
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
