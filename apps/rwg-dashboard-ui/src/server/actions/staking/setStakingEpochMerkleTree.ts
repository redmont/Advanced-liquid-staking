'use server';

import prisma from '@/server/prisma/client';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { getVotes } from '@/utils/snapshot/snapshot-api';

export const setStakingEpochMerkleTree = async (
  proposalId: string,
  epoch: number,
) => {
  // Get votes until none are returned
  const votes = [];
  while (true) {
    const nextVotes = await getVotes({
      queryKey: [proposalId, { proposal: proposalId, skip: votes.length }],
    });
    if (nextVotes.length === 0) {
      break;
    }
    votes.push(...nextVotes);
  }

  const voterAddresses =
    votes.length === 1
      ? // We have to supply the sole voter address twice
        // to get the tree to work
        [[votes[0]!.voter], [votes[0]!.voter]]
      : votes.map((vote) => [vote.voter]);

  const tree = StandardMerkleTree.of(voterAddresses, ['address']);

  const treeEntry = await prisma.stakingVoteMerkleTree.create({
    data: {
      epoch,
      proposalId,
      root: tree.root,
    },
  });

  const inserts: {
    treeId: number;
    walletAddress: string;
    proof: string;
  }[] = [];
  for (const [i, [v]] of tree.entries()) {
    if (!v) {
      continue;
    }

    inserts.push({
      treeId: treeEntry.id,
      walletAddress: v,
      proof: tree.getProof(i).join(','),
    });
  }

  // Insert in batches
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < inserts.length; i += 100) {
      await tx.stakingVoteMerkleProof.createMany({
        data: inserts.slice(i, i + 100),
      });
    }
  });

  return tree.root as `0x${string}`;
};
