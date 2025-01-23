import type { PublicClient } from 'viem';

export const getNearestBlockForTimestamp = async (
  publicClient: PublicClient,
  targetTimestamp: number,
) => {
  const tolerance = 10 * 60; // 10 minute tolerance
  const blockTime = 12;
  let block = await publicClient.getBlock();

  // If the target timestamp is after the current block timestamp, throw an error
  if (targetTimestamp > Number(block.timestamp)) {
    throw new Error('Target timestamp is in the future');
  }

  const timeDiff = Number(block.timestamp) - targetTimestamp;
  let blockNumber =
    Number(block.number) - Math.abs(Math.floor(timeDiff / blockTime));

  while (true) {
    block = await publicClient.getBlock({
      blockNumber: BigInt(blockNumber),
    });

    // If the block timestamp is within the tolerance, we can return the block number
    const diff = Number(block.timestamp) - targetTimestamp;
    if (diff >= 0 && diff <= tolerance) {
      return blockNumber;
    }

    let offset = Math.floor(Math.abs(diff) / 2 / blockTime);
    if (offset === 0) {
      offset = 1;
    }

    if (diff < 0) {
      blockNumber += offset;
    } else {
      blockNumber -= offset;
    }
  }
};
