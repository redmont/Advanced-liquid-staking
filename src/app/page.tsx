import Banner from '@/components/banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import brawlersPoster from '@/assets/images/brawlers-poster.png';

export default async function HomePage() {
  return (
    <main className="relative space-y-8 p-5">
      <Banner>
        <div className="space-y-4">
          <h3 className="inline bg-accent px-2 font-monoline text-3xl text-accent-foreground xl:text-4xl">
            Always on
          </h3>
          <h2 className="font-tusker text-6xl uppercase leading-none md:max-w-[66%] xl:text-7xl">
            Real World Data-Powered Games
          </h2>
          <p className="text-lg md:max-w-[66%] xl:text-xl">
            Our missions is to build the first series of entertainment games
            based on real world data. We are building the biggest series of
            next-gen wagering games.
          </p>
          <Button className="text-xl" size="xl" variant="borderless">
            Explore now
          </Button>
        </div>
      </Banner>
      <Tabs className="relative z-20" defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="betting">Betting</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="memes">Memes</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="z-20 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <Card
          className="aspect-[6/7] overflow-hidden rounded-lg bg-cover"
          style={{ backgroundImage: `url(${brawlersPoster.src})` }}
        />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
        <Card className="aspect-[6/7]" />
      </div>
    </main>
  );
}
