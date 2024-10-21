import { NextResponse } from 'next/server';
import { env } from '@/env';

interface GetFloorPriceResponse {
  openSea?: {
    floorPrice: number;
  };
}

export const revalidate = 60;

export async function GET() {
  try {
    const res = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getFloorPrice?contractAddress=${env.NEXT_PUBLIC_RAW_PASS_CONTRACT_ADDRESS}`,
      {
        method: 'GET',
        headers: { accept: 'application/json' },
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const response = (await res.json()) as GetFloorPriceResponse;
    const floorPrice = response.openSea?.floorPrice ?? null;

    return NextResponse.json({ floorPrice });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch floor price' + (error as Error).message },
      { status: 500 },
    );
  }
}
