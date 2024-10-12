interface GetFloorPriceResponse {
  openSea?: {
    floorPrice: number;
  };
}

export const revalidate = 60;

export async function GET() {
  const res = await fetch(
    `https://eth-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getFloorPrice?contractAddress=${process.env.RAW_PASS_CONTRACT_ADDRESS}`,
    {
      method: 'GET',
      headers: { accept: 'application/json' },
      next: { revalidate: 60 },
    },
  );
  const response = (await res.json()) as GetFloorPriceResponse;

  const floorPrice = response.openSea?.floorPrice ?? null;

  return Response.json({ floorPrice });
}
