'use server';

import assert from 'assert';
import { decodeUser } from '../auth';
import prisma from '@/server/prisma/client';
import { ClaimStatus } from '@prisma/client';

export const updateClaimStatus = async (
  authToken: string,
  claimId: number,
  status: typeof ClaimStatus.Claimed | typeof ClaimStatus.Error,
  reasonOrTx?: string,
) => {
  const { id: userId } = await decodeUser(authToken);
  assert(userId, 'Invalid token');
  assert(status === 'Error' || status === 'Claimed', 'Invalid status');
  const claim = await prisma.claim.findUnique({
    where: {
      id: claimId,
    },
  });
  assert(
    claim?.status === 'Signed' || claim?.status === 'Error',
    'Invalid claim status',
  );

  await prisma.claim.update({
    where: {
      id: claimId,
    },
    data:
      status === ClaimStatus.Error
        ? { status, reason: reasonOrTx }
        : {
            status,
            txHash: reasonOrTx,
          },
  });
};
