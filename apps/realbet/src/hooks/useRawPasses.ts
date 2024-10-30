import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAlchemy } from './useAlchemy';
import { type OwnedNftsResponse } from 'alchemy-sdk';
import { env } from '@/env';
import { useEffect, useMemo } from 'react';
import { toBase26 } from '@/utils';
import usePrimaryAddress from './usePrimaryAddress';

const passGroups = [
  { title: 'Single Digit', bzrPerPass: 14_000 },
  { title: 'Double Digit', bzrPerPass: 10_500 },
  { title: 'Triple Digit', bzrPerPass: 8_750 },
] as const;

export function useRawPasses() {
  const { sdkHasLoaded } = useDynamicContext();
  const { data: alchemy } = useAlchemy();
  const primaryAddress = usePrimaryAddress();

  const nfts = useInfiniteQuery({
    initialPageParam: undefined,
    queryKey: ['nftList', primaryAddress],
    enabled: sdkHasLoaded && !!primaryAddress && !!alchemy,
    queryFn: async (params) => {
      return alchemy!.nft.getNftsForOwner(primaryAddress!, {
        pageKey: params.pageParam,
        contractAddresses: [env.NEXT_PUBLIC_RAW_PASS_CONTRACT_ADDRESS],
      });
    },
    getNextPageParam: (lastPage: OwnedNftsResponse) => lastPage.pageKey,
  });

  useEffect(() => {
    if (nfts.isSuccess && nfts.hasNextPage) {
      void nfts.fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts.isSuccess, nfts.hasNextPage]);

  const passes = useMemo(
    () =>
      nfts.isSuccess && !nfts.hasNextPage
        ? nfts.data.pages.reduce(
            (result, response) => {
              return response.ownedNfts
                .map((nft) => nft.name)
                .reduce((result, name) => {
                  const id = Number(name?.split('#')[1]);
                  if (isNaN(id)) {
                    return result;
                  }
                  const index = toBase26(id).length - 1;
                  if (!result[index]) {
                    return result;
                  }
                  result[index].qty += 1;
                  return result;
                }, result);
            },
            passGroups.map((g) => ({ ...g, qty: 0 })),
          )
        : passGroups.map((g) => ({ ...g, qty: 0 })),
    [nfts.isSuccess, nfts.hasNextPage, nfts.data],
  );

  return {
    nfts,
    passes,
  };
}
