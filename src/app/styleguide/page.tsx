import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Styleguide() {
  return (
    <main className="space-y-3 p-5">
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

      <h1>H1</h1>
      <h2>H2</h2>
    </main>
  );
}
