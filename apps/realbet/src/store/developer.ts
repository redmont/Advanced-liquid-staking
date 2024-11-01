import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const primaryWalletAddressOverrideAtom = atomWithStorage<string | null>(
  'primary_wallet_address',
  null,
  undefined,
  { getOnInit: true },
);

export const networkOverrideAtom = atom<number | null>(null);
