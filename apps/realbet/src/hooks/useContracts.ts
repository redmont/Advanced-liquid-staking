import useNetworkId from './useNetworkId';
import contracts from '@bltzr-gg/realbet-evm-contracts/exports';

export const useContracts = () => {
  const networkId = useNetworkId();

  return {
    isLoading: networkId.isLoading,
    vault: networkId.data && contracts.TestStakingVault[networkId.data],
    token: networkId.data && contracts.TestToken[networkId.data],
  };
};
