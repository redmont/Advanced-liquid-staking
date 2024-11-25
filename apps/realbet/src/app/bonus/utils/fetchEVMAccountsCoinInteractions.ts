import { type ChainId, coinsByChainId } from '@/config/walletChecker';
import { uniq, flatten } from 'lodash';
import limit from '@/limiter';
import { getAssetTransfers } from './getAssetTransfers';
import { chainIdToAlchemyNetworkMap } from '@/config/walletChecker';

const getEligibleMemeCoinInteractions = async (
  chain: ChainId,
  address: `0x${string}`,
) => {
  if (typeof chain !== 'number') {
    throw new Error('Chain is not EVM');
  }

  const network = chainIdToAlchemyNetworkMap[chain];
  if (!network) {
    throw new Error(`Alchemy SDK not defined for chain: ${chain}`);
  }

  const contractAddresses = coinsByChainId[chain];

  if (!contractAddresses) {
    throw new Error(`Meme coins not defined for chain: ${chain}`);
  }

  const transfers = await limit(() =>
    getAssetTransfers(network, {
      contractAddresses,
      fromAddress: address,
      toAddress: address,
    }),
  );

  return transfers
    .map((tx) => tx.rawContract.address)
    .filter((addr): addr is string => !!addr);
};

export const getEVMMemeCoinInteractions = async (
  chain: ChainId,
  addresses: `0x${string}`[],
) => {
  const interactions = await Promise.all(
    addresses.map((address) => getEligibleMemeCoinInteractions(chain, address)),
  );

  return uniq(flatten(interactions));
};
