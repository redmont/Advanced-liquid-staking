import Dynamic from './dynamic';
import Wagmi from './wagmi';
import ReactQuery from './react-query';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import JotaiProvider from './jotai';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <ReactQuery>
      <Dynamic>
        <Wagmi>
          <DynamicWagmiConnector>
            <JotaiProvider>{children}</JotaiProvider>
          </DynamicWagmiConnector>
        </Wagmi>
      </Dynamic>
    </ReactQuery>
  );
}
