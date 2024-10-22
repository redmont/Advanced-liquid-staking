import useNetworkId from './useNetworkId';
import vaultContracts from '@bltzr-gg/realbet-evm-contracts/exports';
import vestingContracts from '@bltzr-gg/realbet-vesting-contracts/exports';

export const useContracts = () => {
  const networkId = useNetworkId();

  return {
    isLoading: networkId.isLoading,
    vault: networkId.data && vaultContracts.TestStakingVault[networkId.data],
    token: networkId.data && vaultContracts.TestToken[networkId.data],
    vesting: networkId.data && vestingContracts.TokenVesting[networkId.data],
  };
};
