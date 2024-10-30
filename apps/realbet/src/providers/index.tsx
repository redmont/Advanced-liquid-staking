import Dynamic from './dynamic';
import Wagmi from './wagmi';
import ReactQuery from './react-query';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { Provider } from 'jotai';

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <ReactQuery>
      <Dynamic>
        <Wagmi>
          <DynamicWagmiConnector>
            <Provider>{children}</Provider>
          </DynamicWagmiConnector>
        </Wagmi>
      </Dynamic>
    </ReactQuery>
  );
}
