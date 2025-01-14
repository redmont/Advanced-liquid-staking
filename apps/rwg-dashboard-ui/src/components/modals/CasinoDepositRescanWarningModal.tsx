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

const CasinoDepositRescanWarningModal: FC<
  PropsWithChildren<{
    onConfirm: () => void;
  }>
> = ({ onConfirm, children }) => {
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
            Confirm Casino Deposits Rescan
          </DialogTitle>
        </DialogHeader>
        <p>
          We&apos;re already scanning your casino deposits. Rescanning now will
          reset your previous scan and start from the beginning. Are you sure
          you want to rescan now?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant={'outline'} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={_onConfirm}>Confirm Rescan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CasinoDepositRescanWarningModal;
