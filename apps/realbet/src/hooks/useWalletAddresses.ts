import { connectedAddressesOverrideAtom } from '@/store/developer';
import { useUserWallets } from '@dynamic-labs/sdk-react-core';
import { useAtomValue } from 'jotai';
import usePrimaryAddress from './usePrimaryAddress';
import { uniq } from 'lodash';

export const useWalletAddresses = () => {
  const primaryAddress = usePrimaryAddress();
  const walletAddresses = useUserWallets();
  const walletAddressesOverride = useAtomValue(connectedAddressesOverrideAtom);
  return walletAddressesOverride
    ? uniq(
        walletAddressesOverride
          .split(',')
          .concat(primaryAddress ?? '')
          .filter(Boolean),
      )
    : uniq(
        walletAddresses
          .map((w) => [
            w.address,
            ...w.additionalAddresses.map((a) => a.address),
          ])
          .flat()
          .concat(primaryAddress ?? '')
          .filter(Boolean),
      );
};
