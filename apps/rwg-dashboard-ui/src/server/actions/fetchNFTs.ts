'use server';

import {
  Alchemy,
  type GetNftsForOwnerOptions,
  Network,
  type OwnedNft,
} from 'alchemy-sdk';
import { env } from '@/env.js';

const alchemy = new Alchemy({
  network: Network.ETH_MAINNET,
  apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
});

export const fetchNFTs = async (
  address: string,
  params: Partial<GetNftsForOwnerOptions> = {},
) => {
  let pageKey: undefined | string;
  let nfts: OwnedNft[] = [];

  do {
    const response = await alchemy.nft.getNftsForOwner(address, {
      contractAddresses: [env.NEXT_PUBLIC_RAW_PASS_CONTRACT_ADDRESS],
      ...params,
    });

    nfts = [...nfts, ...response.ownedNfts];

    pageKey = response.pageKey;
  } while (pageKey !== undefined);

  return nfts;
};
