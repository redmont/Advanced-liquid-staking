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
import { cn } from '@/lib/cn';
import {
  DynamicUserProfile,
  useDynamicContext,
  useIsLoggedIn,
} from '@dynamic-labs/sdk-react-core';
import {
  House,
  PackagePlus,
  Paintbrush,
  UserCog,
  Box,
  Code,
  Rocket,
  HandCoins,
  // Trophy,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { env, isDev } from '@/env';
import useClickOutside from '@/hooks/useClickOutside';
import { useVault } from '@/hooks/useVault';
import {
  connectedAddressesOverrideAtom,
  primaryWalletAddressOverrideAtom,
} from '@/store/developer';
import { useAtom } from 'jotai';
import ConnectWallet from './connect-wallet';

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
  const [addressOverride, setAddressOverride] = useAtom(
    primaryWalletAddressOverrideAtom,
  );
  const [connectedAddressesOverride, setConnectedAddressesOverride] = useAtom(
    connectedAddressesOverrideAtom,
  );
  const [hasOverride, setHasOverride] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = useIsLoggedIn();
  const { user } = useDynamicContext();
  const [isNavOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  useClickOutside(navRef, () => setNavOpen(false));
  const vault = useVault();

  // address override is in localstorage which the backend is not aware of,
  // so we need to set this variable on mount to avoid hydration issues
  useEffect(() => {
    setHasOverride(!!addressOverride || !!connectedAddressesOverride);
  }, [addressOverride, connectedAddressesOverride]);

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
            <ConnectWallet />
            {hasOverride && (
              <button
                className="text-accent"
                onClick={() => {
                  setAddressOverride(null);
                  setConnectedAddressesOverride(null);
                }}
              >
                clear overrides?
              </button>
            )}
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
              <svg
                className="w-6"
                viewBox="0 0 18 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 13.2638H3.395C3.689 13.2638 3.979 13.3298 4.242 13.4578L6.284 14.4458C6.547 14.5728 6.837 14.6388 7.132 14.6388H8.174C9.182 14.6388 10 15.4298 10 16.4058C10 16.4458 9.973 16.4798 9.934 16.4908L7.393 17.1938C6.93705 17.3197 6.45087 17.2757 6.025 17.0698L3.842 16.0138M6 6.81078C6 4.82378 7.685 2.85978 8.868 1.72578C9.17064 1.43015 9.57693 1.26465 10 1.26465C10.4231 1.26465 10.8294 1.43015 11.132 1.72578C12.315 2.85978 14 4.82378 14 6.81078C14 8.75978 12.485 10.7638 10 10.7638C7.515 10.7638 6 8.75978 6 6.81078Z"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10 15.764L14.593 14.353C14.9929 14.2303 15.4213 14.237 15.817 14.3722C16.2128 14.5075 16.5558 14.7642 16.797 15.106C17.166 15.616 17.016 16.348 16.478 16.658L8.963 20.995C8.72802 21.1309 8.46781 21.2176 8.19824 21.2498C7.92866 21.2819 7.65537 21.2588 7.395 21.182L1 19.284"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Vampire Bonus</span>
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
          <li>
            <NextLink
              className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
              path="/link-to-win"
            >
              <Rocket />
              <span>Link to Win</span>
            </NextLink>
          </li>
          <li>
            <NextLink
              className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
              path="/airdrop"
            >
              <Box />
              <span>Airdrop</span>
            </NextLink>
          </li>
          <li>
            <NextLink
              className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
              path="/token-claim"
            >
              <HandCoins />
              <span>Token Claim</span>
            </NextLink>
          </li>
          {isDev && (
            <li>
              <NextLink
                className="flex items-center gap-3 leading-none hover:text-primary hover:drop-shadow-primary"
                path="/developer"
              >
                <Code />
                <span>Developer</span>
              </NextLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
