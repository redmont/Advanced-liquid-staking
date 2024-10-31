'use client';
import { Provider } from 'jotai';
import { store } from '@/store';

export default function JotaiProvider({ children }: React.PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}
