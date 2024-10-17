'use client';

import Banner from '@/components/banner';
import { Card } from '@/components/ui/card';
import brawlersPoster from '@/assets/images/brawlers-poster.png';
import brinkoPoster from '@/assets/images/brinko-poster.png';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export default function HomePage() {
  const { sdkHasLoaded } = useDynamicContext();
  return (
    <main className="relative space-y-5 p-5">
      <Banner>
        <div className="space-y-4">
          <h2 className="font-tusker text-6xl uppercase leading-none md:max-w-[66%] xl:text-7xl">
            Welcome to the Real World
          </h2>
          <p className="text-lg md:max-w-[66%] xl:text-xl">
            $REAL is the fun and financialised future of crypto gaming. See the{' '}
            <a
              className="text-primary underline"
              rel="noreferrer noopener"
              target="_blank"
              href="https://realworldgaming.gitbook.io/the-real-paper"
            >
              Real Paper
            </a>{' '}
            to learn more
          </p>
        </div>
      </Banner>
      <div className="z-20 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <Card
          loading={!sdkHasLoaded}
          className="relative aspect-[6/7] overflow-hidden bg-cover transition-transform hover:scale-105"
          style={{
            backgroundImage: sdkHasLoaded ? `url(${brawlersPoster.src})` : '',
          }}
        >
          <a
            className="inset-0 block size-full"
            href="https://brawlers.io"
            target="_blank"
            rel="noreferrer noopener"
          />
        </Card>
        <Card
          loading={!sdkHasLoaded}
          className="relative aspect-[6/7] overflow-hidden bg-cover"
          style={{
            backgroundImage: sdkHasLoaded ? `url(${brinkoPoster.src})` : '',
          }}
        >
          <div className="absolute inset-0 z-10 flex size-full items-center justify-center bg-black/40 transition-all hover:bg-black/60">
            <p className="text-2xl font-semibold">Coming soon</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
