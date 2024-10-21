import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

const FloorPriceResponseSchema = z.object({
  floorPrice: z.number().nullable(),
});

const NftListResponseSchema = z.object({
  nftNames: z.array(z.string()).optional(),
  totalCount: z.number(),
});

export function useRawPasses() {
  const { primaryWallet, sdkHasLoaded } = useDynamicContext();
  const address = primaryWallet?.address ?? '';

  const nfts = useQuery({
    enabled: sdkHasLoaded && !!address,
    queryKey: ['nftList', address],
    queryFn: async () => {
      const response = await fetch(`/api/raw-pass/list?owner=${address}`, {
        method: 'GET',
        next: { revalidate: 60 },
      });
      return NftListResponseSchema.parse(await response.json());
    },
  });

  const floorPrice = useQuery({
    enabled: sdkHasLoaded && !!address,
    queryKey: ['floorPrice', address],
    queryFn: async () => {
      const response = await fetch(`/api/raw-pass/price`, {
        method: 'GET',
        next: { revalidate: 60 },
      });
      return FloorPriceResponseSchema.parse(await response.json());
    },
  });

  return {
    floorPrice,
    nfts,
  };
}