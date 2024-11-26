import { atom } from 'jotai';

export const progressMessageAtom = atom<string>('');
export const transactionsScannedAtom = atom(0);
