import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toBase26 } from '@/utils';
import usePrimaryAddress from './usePrimaryAddress';
import { fetchNFTs } from '@/utils/fetchNFTs';

const passGroups = [
  { title: 'Single Digit', bzrPerPass: 14_000 },
  { title: 'Double Digit', bzrPerPass: 10_500 },
  { title: 'Triple Digit', bzrPerPass: 8_750 },
] as const;

export function useRawPasses() {
  const { sdkHasLoaded } = useDynamicContext();
  const address = usePrimaryAddress();

  const nfts = useQuery({
    queryKey: ['nftList', address],
    enabled: sdkHasLoaded && !!address,
    queryFn: async () => fetchNFTs(address!),
  });

  const passes = useMemo(
    () =>
      nfts.isSuccess
        ? nfts.data.reduce(
            (acc, nft) => {
              const id = Number(nft.name?.split('#')[1]);
              if (isNaN(id)) {
                return acc;
              }
              const index = toBase26(id).length - 1;
              if (!acc[index]) {
                return acc;
              }
              acc[index].qty += 1;
              return acc;
            },
            passGroups.map((g) => ({ ...g, qty: 0 })),
          )
        : passGroups.map((g) => ({ ...g, qty: 0 })),
    [nfts.isSuccess, nfts.data],
  );

  return {
    nfts,
    passes,
  };
}
