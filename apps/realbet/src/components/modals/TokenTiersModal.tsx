import { type FC, type PropsWithChildren, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Scrollable } from '../ui/scrollable';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';
import { TiersData } from '@/constants';
import { formatWithSeparators } from '@/utils';

interface TokenTiersProps extends PropsWithChildren {
  currentRank?: string;
}

const TokenTiers: FC<TokenTiersProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="bg-black-800/30" />
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="border-transparent bg-zinc-950 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-normal">RWG TOKENS TIERS</DialogTitle>
        </DialogHeader>
        <Scrollable className="h-80 w-full overflow-hidden md:h-[30rem]">
          <div className="mb-4 flex w-full flex-col gap-4">
            <p>
              All players receive a <span className="font-semibold">%</span> of
              a house hedge rakeback as per below table.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Total Amount Wagered</TableHead>
                  <TableHead>Token rewards per $ wagered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>$100+</TableCell>
                  <TableCell>5% of house hedge returned to player</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p>
              The following table outlines the RWG rewards program. All players
              are welcome to join the membership. Players are rewarded with a
              percentage rakeback of the house edge based on total tokens
              vesting and staked.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">
                  RWG tokens tiers (vested + staked) in USD
                </TableHead>
                <TableHead>Status tier</TableHead>
                <TableHead>Rakeback of house edge</TableHead>
              </TableRow>
            </TableHeader>
            {TiersData.map((item, index) => (
              <TableBody key={index}>
                <TableRow>
                  <TableCell>${formatWithSeparators(item.tier)}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>+{item.rakeback}% rakeback</TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </Scrollable>
      </DialogContent>
    </Dialog>
  );
};

export default TokenTiers;
