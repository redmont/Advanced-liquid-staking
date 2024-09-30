import { networkIdExists } from '@/config/networks';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';

const defaultNetwork = '11155111';

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
