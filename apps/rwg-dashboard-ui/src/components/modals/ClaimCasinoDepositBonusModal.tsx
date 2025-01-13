import { type FC, type PropsWithChildren, useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';

const ClaimCasinoDepositBonusModal: FC<
  PropsWithChildren<{
    onConfirm: () => void;
    amount: number;
    onClick?: () => void;
  }>
> = ({ onConfirm, amount, children }) => {
  const isLoggedIn = useIsLoggedIn();
  const auth = useDynamicAuthClickHandler();
  const [open, setOpen] = useState(false);

  const _onConfirm = useCallback(() => {
    onConfirm();
    setOpen(false);
  }, [onConfirm, setOpen]);

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
        <p>
          You are about to claim <strong>{amount}</strong> RealBet credits. This
          action <strong>cannot be undone</strong>. Make sure you have all your
          wallet addresses properly connected to the account. Are you sure you
          want to claim now?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant={'outline'} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={_onConfirm}>Confirm Claim</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimCasinoDepositBonusModal;
