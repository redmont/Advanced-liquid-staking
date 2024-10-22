import useNetworkId from './useNetworkId';
import contracts from '@bltzr-gg/realbet-evm-contracts/exports';

export const useContracts = () => {
  const networkId = useNetworkId();

  return {
    isLoading: networkId.isLoading,
    vault: networkId.data && contracts.TestStakingVault['11155111'],
    token: networkId.data && contracts.TestToken['11155111'],
  };
};
