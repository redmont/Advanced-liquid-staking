import { type FC, type PropsWithChildren, useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { formatBalance } from '@/utils';
import { useToken } from '@/hooks/useToken';
import { useCurrentWaveMembership } from '@/hooks/useCurrentWaveMembership';
import { OctagonAlert } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

const ClaimWarningModal: FC<
  PropsWithChildren<{ onConfirm: () => void; amount: bigint }>
> = ({ onConfirm, amount, children }) => {
  const [open, setOpen] = useState(false);
  const token = useToken();

  const _onConfirm = useCallback(() => {
    onConfirm();
    setOpen(false);
  }, [onConfirm, setOpen]);

  const membership = useCurrentWaveMembership();
  const hasTicketsRemaining =
    membership?.data?.reedeemableTickets !== undefined &&
    membership.data.reedeemableTickets > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="bg-black-800/30" />
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="border-transparent bg-card px-5 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal">
            Confirm Token Claim
          </DialogTitle>
        </DialogHeader>
        {hasTicketsRemaining && (
          <p className="flex items-center gap-2 text-warning">
            <OctagonAlert className="inline" />{' '}
            <span>
              You still have tickets remaining in{' '}
              <Link href="/link-to-win" className="font-bold">
                Link to Win
              </Link>{' '}
              which could contain Token Bonuses.
            </span>{' '}
          </p>
        )}
        <p>
          You are about to claim{' '}
          <strong>
            {formatBalance(amount)}{' '}
            <span className="text-muted">{token.symbol}</span>
          </strong>{' '}
          tokens. This action cannot be undone and will require gas fees. Are
          you sure you want to claim now?
        </p>
        <div className="mt-5 text-right">
          <Button onClick={_onConfirm}>Confirm Claim</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimWarningModal;
