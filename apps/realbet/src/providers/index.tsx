import Dynamic from './dynamic';
import Wagmi from './wagmi';
import ReactQuery from './react-query';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <ReactQuery>
      <Dynamic>
        <Wagmi>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </Wagmi>
      </Dynamic>
    </ReactQuery>
  );
}
