'use client';

import React, {
  type FC,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import Logo from '@/assets/images/logo.svg';
import { Burger } from './ui/burger';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  DynamicUserProfile,
  useDynamicContext,
  useIsLoggedIn,
} from '@dynamic-labs/sdk-react-core';
import {
  House,
  PackagePlus,
  Paintbrush,
  Wallet2,
  Coins,
  UserCog,
  Box,
  // Trophy,
} from 'lucide-react';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { usePathname } from 'next/navigation';
import { env } from '@/env';
import useClickOutside from '@/hooks/useClickOutside';
import { useVault } from '@/hooks/useVault';

const NextLink: FC<PropsWithChildren<{ path: string; className?: string }>> = ({
  className,
  path,
  children,
}) => {
  const pathname = usePathname();

  return (
    <Link
      prefetch
      href={path}
      className={cn(
        'py-2 text-xl font-normal',
        pathname === path && 'text-primary',
        className,
      )}
    >
      {children}
    </Link>
  );
};

const Navbar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const isAuthenticated = useIsLoggedIn();
  const authHandler = useDynamicAuthClickHandler();
  const { primaryWallet, user } = useDynamicContext();
  const [isNavOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  useClickOutside(navRef, () => setNavOpen(false));
  const vault = useVault();

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <nav ref={navRef} className={cn('relative z-50', className)}>
      <div className="lg:flex-start fixed top-12 z-30 flex h-0 w-full items-center justify-between gap-3 px-3 sm:px-5 lg:top-5 lg:p-8 lg:py-6">
        <Burger
          className={cn('shrink-0 rounded-xl bg-light lg:hidden', {
            'shadow-dark': !isNavOpen,
          })}
          isNavOpen={isNavOpen}
          setNavOpen={setNavOpen}
        />
        <Link className="text-white hover:text-gray-300" href="/">
          <Logo
            className="w-[106px] transition-colors hover:text-primary hover:drop-shadow-primary"
            aria-label="Real World Gaming Logo"
          />
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
              variant="default"
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
                <p className="text-primary">{user?.username}</p>
              </div>
            )}
          </li>
          <hr className="mt-3 h-px border-none bg-lighter" />
          {vault.isAdmin.data && (
            <li>
              <NextLink
                className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
                path="/admin"
              >
                <UserCog />
                <span>Admin</span>
              </NextLink>
            </li>
          )}
          {env.NEXT_PUBLIC_VERCEL_ENV !== 'production' && (
            <li>
              <NextLink
                className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
                path="/styleguide"
              >
                <Paintbrush />
                <span>Styleguide</span>
              </NextLink>
            </li>
          )}
          <li>
            <NextLink
              className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
              path="/"
            >
              <House />
              <span>Home</span>
            </NextLink>
          </li>
          <li>
            <NextLink
              className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
              path="/bonus"
            >
              <Coins />
              <span>Bonus</span>
            </NextLink>
          </li>
          <li>
            <NextLink
              className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
              path="/staking-preview"
            >
              <PackagePlus />
              <span>Staking</span>
            </NextLink>
          </li>
          {/* <li>
            <NextLink
              className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
              path="/vesting"
            >
              <Trophy />
              <span>Vesting</span>
            </NextLink>
          </li> */}
          <li>
            <NextLink
              className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
              path="/airdrop"
            >
              <Box />
              <span>Airdrop</span>
            </NextLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
