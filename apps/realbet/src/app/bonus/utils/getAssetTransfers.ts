'use server';

import {
  Alchemy,
  AssetTransfersCategory,
  type AssetTransfersWithMetadataParams,
  type AssetTransfersWithMetadataResult,
  type Network,
} from 'alchemy-sdk';
import { env } from '@/env';
import limit from '@/limiter';

export async function getAssetTransfers(
  network: Network,
  fromAddress: `0x${string}`,
  options: Partial<AssetTransfersWithMetadataParams> & { pages?: number } = {},
) {
  const alchemy = new Alchemy({
    network,
    apiKey: env.ALCHEMY_API_KEY,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  });

  let transfers: AssetTransfersWithMetadataResult[] = [];
  let pageKey: string | undefined;
  let currentPage = 0;

  do {
    const txs = await limit(() =>
      alchemy.core.getAssetTransfers({
        fromAddress,
        category: [AssetTransfersCategory.ERC20],
        withMetadata: true,
        ...options,
        pageKey,
      }),
    );

    transfers = transfers.concat(txs.transfers);

    pageKey = txs.pageKey;
    currentPage++;
  } while (
    pageKey !== undefined &&
    (!options.pages || currentPage < options.pages)
  );

  return transfers;
}
