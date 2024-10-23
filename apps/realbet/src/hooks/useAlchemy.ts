// import { type NetworkId } from '@/config/networks';
import { Network, type AlchemySettings } from 'alchemy-sdk';
import useNetworkId from './useNetworkId';
import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';

// const appNetworkIdToAlchemyNetworkMap: Record<NetworkId, Network> = {
//   11155111: Network.ETH_SEPOLIA,
//   1: Network.ETH_MAINNET,
// };

const alchemySettings: AlchemySettings = {
  apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY, // Insert your Alchemy API key here
};

export const useAlchemy = () => {
  const network = useNetworkId();

  return useQuery({
    enabled: network.isSuccess,
    queryKey: ['alchemy', network.data],
    queryFn: async () => {
      const { Alchemy } = await import('alchemy-sdk');

      const settings = {
        ...alchemySettings,
        network: Network.ETH_MAINNET,
      };

      const alchemy = new Alchemy(settings);
      return alchemy;
    },
  });
};
