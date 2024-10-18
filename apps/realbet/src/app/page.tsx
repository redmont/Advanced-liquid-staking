'use client';

import Banner from '@/components/banner';
import { CircleAlert } from 'lucide-react';
import RealIcon from '@/assets/images/R.svg';
import badge from '@/assets/images/progress/badge.png';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import brawlersPoster from '@/assets/images/brawlers-poster.png';
import brinkoPoster from '@/assets/images/brinko-poster.png';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToken } from '@/hooks/useToken';
import { Button } from '@/components/ui/button';
import { formatUnits } from 'viem';
import TokenTiers from '@/components/modals/TokenTiersModal';
import { LinkPreview } from '@/components/ui/link-preview';

const rank = 'Bronze';
const rakebackTier = '-%';
const xp = 0;
const claimable = 0n;

export default function HomePage() {
  const token = useToken();
  const { sdkHasLoaded } = useDynamicContext();

  return (
    <main className="relative space-y-5 p-5">
      <Banner>
        <div className="space-y-4">
          <h2 className="font-tusker text-6xl uppercase leading-none md:max-w-[66%] xl:text-7xl">
            Welcome to the Real World
          </h2>
          <p className="pb-8 text-lg md:max-w-[66%] xl:text-xl">
            $REAL is the fun and financialised future of crypto gaming.
            <br />
            See the{' '}
            <Link
              href="https://realworldgaming.gitbook.io/the-real-paper"
              target="_blank"
              className="text-primary underline"
            >
              Real Paper
            </Link>{' '}
            to learn more.
          </p>
        </div>
      </Banner>

      <Card>
        <CardHeader>
          <CardTitle className="uppercase">
            <Link
              href="https://x.com/rwg_official"
              target="_blank"
              className="underline underline-offset-4"
            >
              REALBET.IO
            </Link>{' '}
            Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-5 lg:grid-cols-3">
            <div className="flex gap-5 sm:col-span-4">
              <img className="size-20" src={badge.src} alt="RWGAMING Badge" />
              <div>
                {!sdkHasLoaded ? (
                  <Skeleton className="mb-2 inline-block h-4 w-32" />
                ) : (
                  <div className="flex items-center gap-3">
                    <h3 className="mb-1 text-xl">{rank}</h3>
                    <TokenTiers>
                      <CircleAlert className="inline size-6 cursor-pointer" />
                    </TokenTiers>
                  </div>
                )}
                <div>
                  {!sdkHasLoaded ? (
                    <Skeleton
                      variant="primary"
                      className="inline-block h-6 w-28"
                    />
                  ) : (
                    <span className="flex items-center gap-2 text-3xl font-medium text-primary">
                      {xp.toLocaleString()}
                      <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
                        <RealIcon className="inline size-full" />
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg">Rakeback Tier</h3>
              {!sdkHasLoaded ? (
                <Skeleton className="inline-block h-4 w-16" />
              ) : (
                <span className="text-xl">{rakebackTier}</span>
              )}
            </div>
            <div>
              <h3 className="text-md mb-2">Total Rakeback:</h3>
              <span className="inline-flex items-center gap-1 text-2xl">
                <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
                  <RealIcon className="size-full" />
                </span>
                {token.isLoading ? (
                  <Skeleton className="inline-block h-4 w-24" />
                ) : (
                  <span className="">{formatUnits(0n, token.decimals)}</span>
                )}
              </span>
            </div>
            <div>
              <h3 className="text-md mb-2">Available to Claim</h3>
              <span className="inline-flex items-center gap-5">
                <span className="inline-flex items-center gap-1 text-2xl">
                  <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
                    <RealIcon className="size-full" />
                  </span>
                  {token.isLoading ? (
                    <Skeleton className="inline-block h-4 w-24" />
                  ) : (
                    <span className="">{formatUnits(0n, token.decimals)}</span>
                  )}
                </span>
                <Button
                  disabled={claimable <= 0}
                  loading={!sdkHasLoaded}
                  size="sm"
                >
                  Claim
                </Button>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {false && (
        <Tabs className="relative z-20" defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="betting">Betting</TabsTrigger>
            <TabsTrigger value="sports">Sports</TabsTrigger>
            <TabsTrigger value="memes">Memes</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      <div className="z-20 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <LinkPreview
          url="https://brawl3rs.ai/"
          className="duration-300 ease-in-out hover:scale-90"
        >
          <Card
            loading={!sdkHasLoaded}
            className="aspect-[6/7] overflow-hidden bg-cover"
            style={{
              backgroundImage: sdkHasLoaded ? `url(${brawlersPoster.src})` : '',
            }}
          />
        </LinkPreview>
        {false && (
          <div>
            <Card
              loading={!sdkHasLoaded}
              className="aspect-[6/7] overflow-hidden bg-cover"
              style={{
                backgroundImage: sdkHasLoaded ? `url(${brinkoPoster.src})` : '',
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
