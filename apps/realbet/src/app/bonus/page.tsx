'use client';
import React, { useState, useEffect } from 'react';
import Banner from '@/components/banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { checkUserDeposits, displayRelativeTime } from './depositsChecker';
import { ethers } from 'ethers';

const Page = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [totalDeposited, setTotalDeposited] = useState<number | null>(null);
  const [lastDeposited, setLastDeposited] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isValidWallet, setIsValidWallet] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const validateWalletAddress = (address: string) => {
    if (ethers.isAddress(address)) {
      setIsValidWallet(true);
      setError(null); // No error
    } else {
      setIsValidWallet(false);
      setError('Invalid wallet address');
    }
  };

  // This effect runs whenever walletAddress changes
  useEffect(() => {
    const fetchDeposits = async () => {
      if (walletAddress && isValidWallet) {
        setLoading(true);
        try {
          const { totalDepositedInUSD, lastDeposited } =
            await checkUserDeposits(walletAddress, 60, 'ethereum');
          setTotalDeposited(totalDepositedInUSD);
          setLastDeposited(lastDeposited ?? null);
        } finally {
          setLoading(false);
        }
      } else {
        resetTable();
      }
    };
    const resetTable = () => {
      setTotalDeposited(null);
      setLastDeposited(null);
      setLoading(false);
    };
    resetTable();

    void fetchDeposits();
  }, [walletAddress, isValidWallet]);

  return (
    <div className="flex flex-col gap-5 p-5">
      <Banner>
        <div className="space-y-4">
          <h3 className="inline rounded-md bg-[#A40505] px-2 font-monoline text-3xl text-white xl:text-4xl">
            Migrate and get bonuses
          </h3>
          <p className="text-lg md:max-w-[50%] xl:text-xl">
            Easily track your activity from competing crypto casinos and unlock
            exclusive rewards on RWG. If you&apos;ve moved your funds from a
            competitor to RWG, you&apos;re eligible for a special bonus! The
            more you switch, the bigger the rewards. It&apos;s simple, seamless,
            and pays to play!
          </p>
          <div className="flex items-center gap-5 md:max-w-2xl">
            <Input
              placeholder="Enter your wallet address"
              className="border-red-800 bg-black md:min-w-80"
              value={walletAddress}
              onChange={(e) => {
                setWalletAddress(e.target.value);
                validateWalletAddress(e.target.value);
              }}
            />
            <p className="flex items-center text-foreground">OR</p>
            <Button>Link Wallet</Button>
          </div>
          {error && <p className="text-red-500">{error}</p>}{' '}
        </div>
      </Banner>

      <Card className="max-w-7xl space-y-5 p-5">
        <h2 className="text-xl">
          Allocation for {walletAddress || 'your wallet'}
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Last Date of Transfer</TableHead>
              <TableHead>Total deposit amount</TableHead>
              <TableHead>Amount withdrawn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : ''} Shuffle
              </TableCell>
              <TableCell>
                {lastDeposited ? displayRelativeTime(lastDeposited) : '-'}
              </TableCell>
              <TableCell>
                {totalDeposited !== null
                  ? `$ ${totalDeposited.toFixed(2)}`
                  : '-'}
              </TableCell>
              <TableCell>N/A</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 text-primary">
          <h3 className="text-lg">Total $REAL Allocation</h3>
          <span className="text-xl font-semibold leading-none">
            826,820 $REAL
          </span>
        </div>

        <Button>Claim Rewards</Button>
      </Card>
    </div>
  );
};

export default Page;
