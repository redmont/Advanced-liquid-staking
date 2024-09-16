'use client';

import React, { type FC, type PropsWithChildren, useState } from 'react';
import Link from 'next/link';
import Logo from '@/assets/images/logo.svg';
import { Burger } from './ui/burger';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  DynamicUserProfile,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import { Gem, House, Paintbrush, Wallet2 } from 'lucide-react';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { usePathname } from 'next/navigation';
import { env } from '@/env';

const NextLink: FC<PropsWithChildren<{ path: string; className?: string }>> = ({
  className,
  path,
  children,
}) => {
  const pathname = usePathname();

  return (
    <Link
      href={path}
      className={cn(
        'py-2 text-xl',
        pathname === path && 'text-primary',
        className,
      )}
    >
      {children}
    </Link>
  );
};

const Navbar: React.FC<{ className?: string }> = ({ className }) => {
  const authHandler = useDynamicAuthClickHandler();
  const { primaryWallet, isAuthenticated, user } = useDynamicContext();
  const [isNavOpen, setNavOpen] = useState(false);

  return (
    <nav className={cn('relative z-50', className)}>
      <div className="lg:flex-start fixed z-30 flex w-full items-center justify-between gap-3 px-5 py-6 lg:p-8">
        <Burger
          className={cn('shrink-0 rounded-xl bg-light shadow-dark lg:hidden')}
          isNavOpen={isNavOpen}
          setNavOpen={setNavOpen}
        />
        <Link className="text-white hover:text-gray-300" href="/">
          <Logo aria-label="Real World Gaming Logo" />
        </Link>
      </div>
      <div
        className={cn(
          'fixed left-0 top-0 h-screen w-full bg-light px-8 py-6 pt-24 transition-transform sm:w-64',
          {
            'translate-x-0': isNavOpen,
            '-translate-x-full lg:translate-x-0': !isNavOpen,
          },
        )}
      >
        <ul className="flex flex-col gap-3">
          <hr className="hidden h-px border-none bg-lighter lg:block" />
          <li>
            <Button
              onClick={authHandler}
              variant="outline"
              className="w-full max-w-64"
            >
              {isAuthenticated ? (
                <>
                  <Wallet2 className="size-4 shrink-0" />
                  <span className="truncate">
                    {primaryWallet?.address.slice(
                      0,
                      primaryWallet?.address.length - 4,
                    )}
                  </span>
                  <span className="-ml-1">
                    {primaryWallet?.address.slice(-4)}
                  </span>
                </>
              ) : (
                <>Connect Wallet</>
              )}
            </Button>
            <DynamicUserProfile />
            {isAuthenticated && (
              <div className="font-regular space-y-1 py-3 text-xl">
                <p>{user?.username}</p>
                <p className="text-primary">53,000 XP</p>
              </div>
            )}
          </li>
          <hr className="mt-3 h-px border-none bg-lighter" />
          <li>
            <NextLink className="flex items-center gap-3 leading-none" path="/">
              <House />
              <span>Home</span>
            </NextLink>
          </li>
          {env.NEXT_PUBLIC_VERCEL_ENV !== 'production' && (
            <li>
              <NextLink
                className="flex items-center gap-3 leading-none"
                path="/styleguide"
              >
                <Paintbrush />
                <span>Styleguide</span>
              </NextLink>
            </li>
          )}
          <li>
            <NextLink
              className="flex items-center gap-3 leading-none"
              path="/token"
            >
              <Gem />
              <span>Token</span>
            </NextLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
