import Banner from '@/components/banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToken } from '@/hooks/useToken';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React from 'react';

const Page = () => {
  const token = useToken();

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
            />
            <p className="flex items-center text-foreground">OR</p>
            <Button>Link Wallet</Button>
          </div>
        </div>
      </Banner>

      <Card className="max-w-7xl space-y-5 p-5">
        <h2 className="text-xl">Allocation for asdasdasdas</h2>
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
              <TableCell>Shuffle</TableCell>
              <TableCell>04/26/2024 ( 1 day ago )</TableCell>
              <TableCell>50,000</TableCell>
              <TableCell>200,000</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 text-primary">
          <h3 className="text-lg">Total {token.symbol} Allocation</h3>
          <span className="text-xl font-semibold leading-none">
            826,820 {token.symbol}
          </span>
        </div>

        <Button>Claim Rewards</Button>
      </Card>
    </div>
  );
};

export default Page;
