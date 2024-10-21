import { useEffect, useState, useMemo } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { z } from 'zod';

const FloorPriceResponseSchema = z.object({
  floorPrice: z.number().nullable(),
});

const NftListResponseSchema = z.object({
  nftNames: z.array(z.string()),
  totalCount: z.number(),
});

type FloorPriceResponse = z.infer<typeof FloorPriceResponseSchema>;
type NftListResponse = z.infer<typeof NftListResponseSchema>;

export function useRawPasses() {
  const { primaryWallet, sdkHasLoaded: isConnected } = useDynamicContext();
  const address = primaryWallet?.address ?? '';
  const [areNftsLoading, setNftsLoading] = useState<boolean>(false);

  const [nftListResponse, setNftListResponse] =
    useState<NftListResponse | null>(null);

  const [floorPriceResponse, setFloorPriceResponse] =
    useState<FloorPriceResponse | null>(null);

  useEffect(() => {
    if (!isConnected) {
      return setNftsLoading(false);
    }

    setNftsLoading(true);

    const searchParams = new URLSearchParams({
      owner: address,
    });

    void fetch(`/api/raw-pass/list?${searchParams}`, {
      method: 'GET',
      next: { revalidate: 60 },
    })
      .then((response) => response.json())
      .then((data) => {
        const validatedData = NftListResponseSchema.parse(data);
        setNftListResponse(validatedData);
      })
      .finally(() => setNftsLoading(false));
  }, [address, isConnected]);

  const { totalCount = 0, nftNames = [] } = nftListResponse ?? {};

  const ordinalsEligibility = useMemo(
    () => Math.floor(totalCount / 3),
    [totalCount],
  );

  const nftsToNextOrdinal = useMemo(() => 3 - (totalCount % 3), [totalCount]);

  useEffect(() => {
    void fetch(`/api/raw-pass/price`, {
      method: 'GET',
      next: { revalidate: 60 },
    })
      .then((response) => response.json())
      .then((data) => {
        const validatedData = FloorPriceResponseSchema.parse(data);
        setFloorPriceResponse(validatedData);
      });
  }, []);

  const { floorPrice = 0 } = floorPriceResponse ?? {};

  return {
    floorPrice: floorPrice ? floorPrice.toFixed(4) : '',
    totalCount,
    nftNames,
    ordinalsEligibility,
    nftsToNextOrdinal,
    areNftsLoading,
  };
}
