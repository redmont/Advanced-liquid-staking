import { networkOverrideAtom } from '@/store/developer';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useChainId } from 'wagmi';

const useNetworkId = () => {
  const chainId = useChainId();
  const override = useAtomValue(networkOverrideAtom);
  const { primaryWallet, sdkHasLoaded } = useDynamicContext();

  const networkId = useQuery({
    queryKey: [
      'network',
      primaryWallet?.id,
      primaryWallet?.connector?.key,
      chainId,
    ],
    enabled: sdkHasLoaded,
    queryFn: () => primaryWallet?.connector.getNetwork() ?? null,
  });

  return {
    ...networkId,
    data: override ?? networkId.data,
  };
};

export default useNetworkId;
