import { atom } from 'jotai';

export const primaryWalletAddressOverrideAtom = atom<string | null>(null);
export const networkOverrideAtom = atom<number | null>(null);
