'use server';

import prisma from '@/server/prisma/client';
import { getUserFromToken } from '../../auth';
import { NotFoundError } from '@/server/errors';

export const getStakingMerkleProofs = async (
  authToken: string,
  lastClaimEpoch: number,
) => {
  const user = await getUserFromToken(authToken);

  const walletAddress = user.addresses.find((address: string) =>
    address.startsWith('0x'),
  );

  if (!walletAddress) {
    throw new NotFoundError('No wallet address found');
  }

  const proofs = await prisma.stakingVoteMerkleProof.findMany({
    where: {
      walletAddress,
      tree: {
        epoch: {
          gt: lastClaimEpoch,
        },
      },
    },
    include: {
      tree: {
        select: {
          epoch: true,
        },
      },
    },
  });

  return proofs.map(({ proof, tree: { epoch } }) => ({
    proof,
    epoch,
  }));
};
