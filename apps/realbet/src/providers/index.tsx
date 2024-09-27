import Dynamic from './dynamic';
import Wagmi from './wagmi';
import ReactQuery from './react-query';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <Dynamic>
      <Wagmi>
        <ReactQuery>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </ReactQuery>
      </Wagmi>
    </Dynamic>
  );
}
