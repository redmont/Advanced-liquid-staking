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
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { useCasinoLink } from '@/hooks/useCasinoLink';

const ClaimWarningModal: FC<
  PropsWithChildren<{
    onConfirm: () => void;
    amount: bigint;
    onClick?: () => void;
  }>
> = ({ onConfirm, amount, children }) => {
  const isLoggedIn = useIsLoggedIn();
  const auth = useDynamicAuthClickHandler();
  const [open, setOpen] = useState(false);
  const token = useToken();
  const link = useCasinoLink();

  const _onConfirm = useCallback(() => {
    onConfirm();
    setOpen(false);
  }, [onConfirm, setOpen]);
  const membership = useCurrentWaveMembership();
  const showLinkToWinReminder = membership.canSubscribe || !link.isLinked;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="bg-black-800/30" />
      <DialogTrigger
        onClick={(e) => {
          if (!isLoggedIn) {
            e.preventDefault();
            return auth();
          }
          setOpen(true);
        }}
        asChild
      >
        {children}
      </DialogTrigger>
      <DialogContent className="border-transparent bg-card px-5 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal">
            Confirm Token Claim
          </DialogTitle>
        </DialogHeader>
        {showLinkToWinReminder && (
          <p className="flex items-center gap-3 text-warning">
            <OctagonAlert className="inline size-12" />{' '}
            <span>
              It is highly advisable you link your Realbet account and play{' '}
              <Link href="/link-to-win" className="font-bold">
                Link to Win
              </Link>{' '}
              first which could contain Token Bonuses.
            </span>{' '}
          </p>
        )}
        {membership.hasTicketsRemaining && (
          <p className="flex items-center gap-3 text-warning">
            <OctagonAlert className="inline size-12" />{' '}
            <span>
              You still have{' '}
              <strong>{membership.data?.reedeemableTickets} tickets</strong>{' '}
              remaining in{' '}
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
            {formatBalance(amount)} {token.symbol}
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
