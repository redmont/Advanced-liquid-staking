import { useQuery } from '@tanstack/react-query';

import { chains } from '../utils';
import { getUserDeposits } from '../utils';
import { flatten } from 'lodash';
import { useMemo } from 'react';
import { isAddress } from 'viem';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';

export const useCasinoDeposits = () => {
  const { addresses: userWalletAddresses } = useWalletAddresses();

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
