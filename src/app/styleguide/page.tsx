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
        <h2 className="bg-accent p-2 text-accent-foreground">Accent</h2>
        <h2 className="bg-destructive p-2 text-destructive-foreground">
          Destructive
        </h2>
      </div>
      <div className="flex gap-3">
        <Button>Default</Button>
        <Button variant="neutral">Neutral</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="borderless">Borderless</Button>
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
          <h2 className="font-tusker text-7xl uppercase leading-tight">
            Tusker
          </h2>
        </div>
        <div>
          <h2 className="text-4xl font-bold">Aonik Bold</h2>
          <h2 className="text-4xl font-medium">Aonik Medium</h2>
          <h2 className="text-4xl font-normal">Aonik Normal</h2>
        </div>
        <div>
          <h2 className="font-monoline text-4xl">Monoline</h2>
        </div>
      </div>
    </div>
  );
}
