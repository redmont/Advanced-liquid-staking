import { signPublicSaleClaims } from '@/server/actions/claim/signPublicSaleClaims';
import { useAuthenticatedMutation } from './useAuthenticatedMutation';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { getClaimableAmount } from '@/server/actions/claim/getClaimableAmount';
import assert from 'assert';
import { useWriteTokenMaster } from '@/contracts/generated';
import { toHex } from 'viem';
import { usePublicClient } from 'wagmi';
import { updateClaimStatus } from '@/server/actions/claim/updateClaimStatus';

export const useClaims = () => {
  const publicClient = usePublicClient();
  const claims = useAuthenticatedQuery({
    queryKey: ['claimableAmount'],
    queryFn: getClaimableAmount,
  });

  const writeTokenMaster = useWriteTokenMaster();

  const claimTokens = useAuthenticatedMutation({
    mutationFn: async (token) => {
      assert(publicClient, 'No public client');
      assert(claims.isSuccess && claims.data, 'Claims not loaded');
      assert(claims.data.claimable.length > 0, 'No claims to claim');

      const txs = [];
      for (const claim of claims.data.claimable) {
        assert(claim.bonus, 'Claim has no bonus');
        assert(
          claim.signature?.startsWith('0x') && claim.signature.length === 132,
          'Claim signature not valid',
        );
        const tx = await writeTokenMaster
          .writeContractAsync({
            functionName: 'claimToken',
            args: [
              toHex(claim.id, { size: 16 }),
              claim.amount + claim.bonus,
              claim.signature as `0x${string}`,
            ],
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            return updateClaimStatus(
              token,
              claim.id,
              'Error',
              (err as Error).message,
            );
          });

        if (tx) {
          txs.push(
            (async () => {
              await publicClient.waitForTransactionReceipt({ hash: tx });
              await updateClaimStatus(token, claim.id, 'Claimed', tx);
            })(),
          );
        }
      }

      await Promise.all(txs);
    },
    onSuccess: () => {
      // TODO: show success toast?
    },
  });

  const processClaims = useAuthenticatedMutation({
    mutationFn: signPublicSaleClaims,
    onSettled: () => {
      void claims.refetch().then(() => claimTokens.mutate());
    },
  });

  const hasClaims =
    claims.isSuccess &&
    (claims.data!.signable.length > 0 || claims.data!.claimable.length > 0);

  const hasError =
    claims.isSuccess &&
    claims.data!.claims.some((claim) => claim.status === 'Error');

  return {
    claims,
    process: processClaims,
    claim: claimTokens,
    hasClaims,
    hasError,
    errors: claims.data?.claims
      .filter((claim) => claim.status === 'Error')
      .map((claim) => claim.reason ?? 'Unkown Error'),
  };
};
