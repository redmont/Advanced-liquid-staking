import { useEffect, useState, useMemo } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface FloorPriceResponse {
  floorPrice: number | null;
}

interface NftListResponse {
  nftNames: string[];
  totalCount: number;
}

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
      .then((data: NftListResponse) => setNftListResponse(data))
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
      .then((data: FloorPriceResponse) => setFloorPriceResponse(data));
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
