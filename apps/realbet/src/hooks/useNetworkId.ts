import { networkIdExists } from '@/config/networks';
import { isDev } from '@/env';
import { networkOverrideAtom } from '@/store/developer';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

const defaultNetwork = isDev ? '11155111' : '1';

const useNetworkId = () => {
  const override = useAtomValue(networkOverrideAtom);
  const { primaryWallet, sdkHasLoaded } = useDynamicContext();

  const networkId = useQuery({
    queryKey: ['network', primaryWallet?.id],
    enabled: sdkHasLoaded,
    queryFn: async () => {
      const network = await primaryWallet?.connector.getNetwork();
      return networkIdExists(network) ? network : defaultNetwork;
    },
  });

  return {
    ...networkId,
    data: override ?? networkId.data,
  };
};

export default useNetworkId;
