import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuthToken } from '@/lib/dynamic';
import { generateLinkingToken } from '@/server/actions/casino-token/generateLinkingToken';
import { useMutation } from '@tanstack/react-query';
import { env } from '@/env';
import { useCasinoLink } from '@/hooks/useCasinoLink';

export const CasinoLink = () => {
  const casinoLink = useCasinoLink();

  const linkAccount = useMutation({
    mutationFn: async () => {
      const authToken = getAuthToken();

      if (!authToken) {
        throw new Error('No token');
      }
      const linkingData = await generateLinkingToken(authToken);

      if (!linkingData) {
        throw new Error('Error generating linking token');
      }

      const { userId, ts, token } = linkingData;

      let url;
      if (env.NEXT_PUBLIC_CASINO_URL.startsWith('/')) {
        url = new URL(env.NEXT_PUBLIC_CASINO_URL, window.location.origin);
      } else {
        url = new URL(env.NEXT_PUBLIC_CASINO_URL);
      }
      url.searchParams.append('extUserId', userId);
      url.searchParams.append('ts', ts.toString());
      url.searchParams.append('token', token);

      window.location.href = url.toString();
    },
  });

  return casinoLink.isLoading || casinoLink.data === undefined ? (
    <Skeleton className="h-6 w-48 rounded-full" />
  ) : (
    ((casinoLink.data && (
      <>
        <span className="mr-5 inline-block font-semibold">
          Linked to account{' '}
          <span className="font-semibold">
            {casinoLink.data.realbetUsername}
          </span>
        </span>
      </>
    )) ?? (
      <Button
        onClick={() => linkAccount.mutateAsync()}
        loading={linkAccount.isPending}
        disabled={linkAccount.isPending}
      >
        Link your account
      </Button>
    ))
  );
};
