import { type NextRequest, NextResponse } from 'next/server';

export const revalidate = 60;

interface NftInfo {
  name: string;
}

interface GetNFTsForOwnerResponse {
  ownedNfts: NftInfo[];
  totalCount: number;
  pageKey?: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get('owner');

  if (!owner) {
    return NextResponse.json(
      { error: 'Owner must be specified' },
      { status: 400 },
    );
  }

  let totalCount = 0;
  let pageKey = '';
  const nftNames: string[] = [];

  do {
    const alchemyParams = new URLSearchParams({
      owner,
      orderBy: 'transferTime',
      ...(pageKey && {
        pageKey,
      }),
    });

    alchemyParams.append('contractAddresses[]', process.env.RAW_PASS_CONTRACT_ADDRESS!);

    const response = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner?${alchemyParams}`,
      {
        method: 'GET',
        headers: { accept: 'application/json' },
        next: { revalidate: 60 },
      },
    );

    const respData = (await response.json()) as GetNFTsForOwnerResponse;

    pageKey = respData.pageKey ?? '';
    totalCount = respData.totalCount;

    nftNames.push(...(respData.ownedNfts?.map((nft) => nft.name) || []));
  } while (pageKey);

  return Response.json({ nftNames, totalCount });
}
