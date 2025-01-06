import Dynamic from './dynamic';
import Wagmi from './wagmi';
import ReactQuery from './react-query';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import JotaiProvider from './jotai';
import { NetworkGuard } from './network-guard';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <ReactQuery>
      <Dynamic>
        <Wagmi>
          <DynamicWagmiConnector>
            <JotaiProvider>
              <NetworkGuard>{children}</NetworkGuard>
            </JotaiProvider>
          </DynamicWagmiConnector>
        </Wagmi>
      </Dynamic>
    </ReactQuery>
  );
}
