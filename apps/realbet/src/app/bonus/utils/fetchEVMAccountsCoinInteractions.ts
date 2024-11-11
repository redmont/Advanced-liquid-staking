import { type ChainId, coinsByChainId } from '@/config/walletChecker';
import { uniq, flatten } from 'lodash';
import { mainnet, bsc, base } from 'viem/chains';
import limit from '@/limiter';
import { getAssetTransfers } from './getAssetTransfers';
import { Network } from 'alchemy-sdk';

const chainIdToAlchemyNetworkMap: Record<ChainId, Network | null> = {
  [mainnet.id]: Network.ETH_MAINNET,
  [bsc.id]: Network.BNB_MAINNET,
  [base.id]: Network.BASE_MAINNET,
  mainnet: null, // Solana mainnet does not exist for alchemy sdk yet
};

const getEligibleMemeCoinInteractions = async (
  chain: ChainId,
  fromAddress: `0x${string}`,
) => {
  const network = chainIdToAlchemyNetworkMap[chain];
  if (!network) {
    throw new Error(`Alchemy SDK not defined for chain: ${chain}`);
  }

  const contractAddresses = coinsByChainId[chain];

  if (!contractAddresses) {
    throw new Error(`Meme coins not defined for chain: ${chain}`);
  }

  const transfers = await limit(() =>
    getAssetTransfers(network, fromAddress, { contractAddresses }),
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
