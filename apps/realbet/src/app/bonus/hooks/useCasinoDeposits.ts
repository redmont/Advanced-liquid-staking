import { useQuery } from '@tanstack/react-query';

import { chains } from '../utils';
import { getUserDeposits } from '../utils';
import { useUserWallets } from '@dynamic-labs/sdk-react-core';
import { flatten } from 'lodash';
import { useMemo } from 'react';
import { isAddress } from 'viem';
import usePrimaryAddress from '@/hooks/usePrimaryAddress';

export const useCasinoDeposits = () => {
  const userWalletAddresses = useUserWallets().map((wallet) => wallet.address);
  const primaryAddress = usePrimaryAddress();
  const evmAddresses = useMemo(
    () =>
      userWalletAddresses
        .concat(primaryAddress ?? '')
        .filter((addr) => isAddress(addr)),
    [userWalletAddresses, primaryAddress],
  );

  return useQuery({
    queryKey: ['casino-deposits', evmAddresses],
    queryFn: async () => {
      const promises = flatten(
        evmAddresses.map((address) =>
          chains.map((chain) => getUserDeposits(address, chain)),
        ),
      );

      return flatten(await Promise.all(promises));
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
