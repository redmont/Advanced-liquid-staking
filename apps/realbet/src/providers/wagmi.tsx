'use client';

import { WagmiProvider } from 'wagmi';
import config from '@/config/wagmi';

export default function WagmiProviderWrapper({
  children,
}: React.PropsWithChildren) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
