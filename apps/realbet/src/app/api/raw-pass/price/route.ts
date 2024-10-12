import { NextResponse } from 'next/server';

interface GetFloorPriceResponse {
  openSea?: {
    floorPrice: number;
  };
}

export const revalidate = 60;

export async function GET() {
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  const RAW_PASS_CONTRACT_ADDRESS = process.env.RAW_PASS_CONTRACT_ADDRESS;

  if (!ALCHEMY_API_KEY || !RAW_PASS_CONTRACT_ADDRESS) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getFloorPrice?contractAddress=${RAW_PASS_CONTRACT_ADDRESS}`,
      {
        method: 'GET',
        headers: { accept: 'application/json' },
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const response = await res.json() as GetFloorPriceResponse;
    const floorPrice = response.openSea?.floorPrice ?? null;

    return NextResponse.json({ floorPrice });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch floor price' }, { status: 500 });
  }
}