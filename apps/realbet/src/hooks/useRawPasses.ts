import { useMemo } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';

interface FloorPriceResponse {
  floorPrice: number | null;
}

interface NftListResponse {
  nftNames: string[];
  totalCount: number;
}

async function fetchNftList(address: string): Promise<NftListResponse> {
  const searchParams = new URLSearchParams({ owner: address });
  const response = await fetch(`/api/raw-pass/list?${searchParams}`, {
    method: 'GET',
    next: { revalidate: 60 },
  });
  return response.json() as Promise<NftListResponse>;
}

async function fetchFloorPrice(): Promise<FloorPriceResponse> {
  const response = await fetch(`/api/raw-pass/price`, {
    method: 'GET',
    next: { revalidate: 60 },
  });
  return response.json() as Promise<FloorPriceResponse>;
}

export function useRawPasses() {
  const { primaryWallet, sdkHasLoaded: isConnected } = useDynamicContext();
  const address = primaryWallet?.address ?? '';

  const { data: nftListResponse, isLoading: areNftsLoading } =
    useQuery<NftListResponse>({
      queryKey: ['nftList', address],
      queryFn: () => fetchNftList(address),
      enabled: isConnected && !!address,
      staleTime: 10 * 1000, // 1 minute
    });

  const { data: floorPriceResponse } = useQuery<FloorPriceResponse>({
    queryKey: ['floorPrice'],
    queryFn: fetchFloorPrice,
    staleTime: 60 * 1000, // 1 minute
  });

  const { totalCount = 0, nftNames = [] } = nftListResponse ?? {};

  const ordinalsEligibility = useMemo(
    () => Math.floor(totalCount / 3),
    [totalCount],
  );

  const nftsToNextOrdinal = useMemo(() => 3 - (totalCount % 3), [totalCount]);

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
