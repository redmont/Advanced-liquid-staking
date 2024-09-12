import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Styleguide() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex gap-3">
        <Button>Default</Button>
        <Button variant="light">Light</Button>
        <Button variant="dark">Dark</Button>
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
        <p className="text-3xl font-black">Black</p>
        <p className="text-3xl font-bold">Bold</p>
        <p className="text-3xl font-extrabold">Extrabold</p>
        <p className="text-3xl font-semibold">Semibold</p>
        <p className="text-3xl font-medium">Medium</p>
        <p className="text-3xl font-normal">Normal</p>
        <p className="text-3xl font-light">Light</p>
        <p className="text-3xl font-thin">Thin</p>
      </div>
    </div>
  );
}
