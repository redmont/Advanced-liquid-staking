import { primaryWalletAddressOverrideAtom } from '@/store/developer';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAtomValue } from 'jotai';

const usePrimaryAddress = () => {
  const primaryWalletOverride = useAtomValue(primaryWalletAddressOverrideAtom);
  const { primaryWallet } = useDynamicContext();

  return primaryWalletOverride && primaryWalletOverride.length > 0
    ? primaryWalletOverride
    : primaryWallet?.address;
};

export default usePrimaryAddress;
