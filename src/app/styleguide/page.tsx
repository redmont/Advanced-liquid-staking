import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function Styleguide() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-wrap gap-3">
        <h2 className="border border-border bg-background p-2 text-foreground">
          Background
        </h2>
        <h2 className="bg-foreground p-2 text-background">Foreground</h2>
        <h2 className="bg-light p-2 text-foreground">Light</h2>
        <h2 className="bg-lighter p-2 text-light-foreground">Lighter</h2>
        <h2 className="bg-lightest p-2 text-lightest-foreground">Lightest</h2>
        <h2 className="bg-primary p-2 text-primary-foreground">Primary</h2>
        <h2 className="bg-muted p-2 text-muted-foreground">Muted</h2>
        <h2 className="bg-accent p-2 text-background">Accent</h2>
        <h2 className="bg-destructive p-2 text-background">Destructive</h2>
      </div>
      <div className="flex gap-3">
        <Button>Default</Button>
        <Button variant="light">Light</Button>
        <Button variant="dark">Dark</Button>
        <Button variant="bordeless">Borderless</Button>
        <Button disabled>Disabled</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
      <div>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex gap-8">
        <div className="space-y-2">
          <h2 className="font-tusker text-7xl uppercase">Tusker 7xl</h2>
          <h2 className="font-tusker text-6xl uppercase">Tusker 6xl</h2>
          <h2 className="font-tusker text-5xl uppercase">Tusker 5xl</h2>
          <h2 className="font-tusker text-4xl uppercase">Tusker 4xl</h2>
          <h2 className="font-tusker text-3xl uppercase">Tusker 3xl</h2>
          <h2 className="font-tusker text-2xl uppercase">Tusker 2xl</h2>
          <h2 className="font-tusker text-xl uppercase">Tusker xl</h2>
          <h2 className="font-tusker text-lg uppercase">Tusker lg</h2>
          <h2 className="font-tusker text-base uppercase">Tusker base</h2>
          <h2 className="font-tusker text-sm uppercase">Tusker sm</h2>
          <h2 className="font-tusker text-xs uppercase">Tusker xs</h2>
        </div>
        <div>
          <p className="text-4xl font-black">Inter Black</p>
          <p className="text-4xl font-bold">Inter Bold</p>
          <p className="text-4xl font-extrabold">Inter Extrabold</p>
          <p className="text-4xl font-semibold">Inter Semibold</p>
          <p className="text-4xl font-medium">Inter Medium</p>
          <p className="text-4xl font-normal">Inter Normal</p>
          <p className="text-4xl font-light">Inter Light</p>
          <p className="text-4xl font-thin">Inter Thin</p>
        </div>
      </div>
    </div>
  );
}
