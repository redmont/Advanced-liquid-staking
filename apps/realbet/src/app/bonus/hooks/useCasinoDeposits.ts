import { useQuery } from '@tanstack/react-query';

import { chains } from '../utils';
import { getUserDeposits } from '../utils';
import { useUserWallets } from '@dynamic-labs/sdk-react-core';
import { flatten } from 'lodash';
import { useMemo } from 'react';
import { isAddress } from 'viem';

export const useCasinoDeposits = () => {
  const userWalletAddresses = useUserWallets().map((wallet) => wallet.address);
  const evmAddresses = useMemo(
    () => userWalletAddresses.filter((addr) => isAddress(addr)),
    [userWalletAddresses],
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
