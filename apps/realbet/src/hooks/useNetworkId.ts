import { networkIdExists } from '@/config/networks';
import { isDev } from '@/env';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';

const defaultNetwork = isDev ? '11155111' : '1';

const useNetworkId = () => {
  const { primaryWallet, sdkHasLoaded } = useDynamicContext();

  const networkId = useQuery({
    queryKey: ['network', primaryWallet?.id],
    enabled: sdkHasLoaded,
    queryFn: async () => {
      const network = await primaryWallet?.connector.getNetwork();
      return networkIdExists(network) ? network : defaultNetwork;
    },
  });

  return networkId;
};

export default useNetworkId;
