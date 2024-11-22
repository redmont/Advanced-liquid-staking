/* eslint-disable no-console */
'use client';

import { Button } from '@/components/ui/button';
import { getAuthToken, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { generateHash } from '../api/casino-link-callback/validateSignature';
import { getCasinoLink } from '@/server/actions/casino-token/getCasinoLink';
import Link from 'next/link';

export default function CasinoTestLinkerPage() {
  const params = useSearchParams();
  const loggedIn = useIsLoggedIn();

  const existingLink = useQuery({
    queryKey: ['casinoLink'],
    enabled: loggedIn,
    queryFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No token');
      }
      return getCasinoLink(authToken);
    },
  });

  const linkMutation = useMutation({
    mutationFn: async ({
      userId,
      ts,
      token,
    }: {
      userId: string;
      ts: string;
      token: string;
    }) => {
      const realbetId = Math.floor(
        Math.random() * Number.MAX_SAFE_INTEGER,
      ).toString();
      const body = JSON.stringify({
        userId,
        ts: parseInt(ts),
        token,
        username: `Realbet user #${realbetId}`,
        extUserId: realbetId,
      });
      const signature = generateHash(body, 'dummy');
      const response = await fetch('/api/casino-link-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Processing-Signature': signature,
        },
        body,
      });

      if (!response.ok) {
        throw new Error('Failed to link account');
      }

      console.log('Account linked successfully');
    },
  });

  const linkAccount = async () => {
    const userId = params.get('extUserId');
    const ts = params.get('ts');
    const token = params.get('token');

    if (!userId || !ts || !token) {
      throw new Error('Missing parameters');
    }

    console.log('Linking user', userId);
    console.log('Token', token);

    linkMutation.mutate({ userId, ts, token });
  };

  return (
    <div className="space-y-5 p-3 sm:p-5">
      <h2 className="mb-3 text-xl font-semibold">Realbet Test Linker</h2>
      <p className="mb-8 text-xl font-medium leading-tight text-white/80">
        Normally this would be on realbet.io, but we are testing what it&apos;s
        supposed to do here.
      </p>
      <p className="text-destructive empty:hidden">
        {linkMutation.error?.message}
      </p>
      {existingLink.data ? (
        <>
          <p className="text-primary empty:hidden">
            {existingLink.data?.realbetUsername} linked.&nbsp;
            <Button asChild>
              <Link className="font-bold text-primary" href="/link-to-win">
                Go Back
              </Link>
            </Button>
          </p>
        </>
      ) : (
        <Button onClick={linkAccount}>Link casino account</Button>
      )}
    </div>
  );
}
