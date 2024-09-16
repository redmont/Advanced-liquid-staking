'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from '@/components/ui/table';

import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function Styleguide() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

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
      <div>
        <h2 className="mb-2 text-xl">Button States</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              onCheckedChange={(checked) => setIsLoading(!!checked)}
              checked={isLoading}
              id="loading"
            />
            <label
              htmlFor="loading"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Loading
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              onCheckedChange={(checked) => setIsDisabled(!!checked)}
              checked={isDisabled}
              id="disabled"
            />
            <label
              htmlFor="disabled"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Disabled
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button loading={isLoading} disabled={isDisabled}>
          Default
        </Button>
        <Button loading={isLoading} disabled={isDisabled} variant="neutral">
          Neutral
        </Button>
        <Button loading={isLoading} disabled={isDisabled} variant="outline">
          Outline
        </Button>
        <Button loading={isLoading} disabled={isDisabled} variant="borderless">
          Borderless
        </Button>
        <Button loading={isLoading} disabled={isDisabled} variant="ghost">
          Ghost
        </Button>
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
        <h2 className="mb-4 text-xl">Skeleton</h2>
        <div className="flex gap-3">
          <Skeleton className="size-20 rounded-full"></Skeleton>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-64" variant="primary"></Skeleton>
            <Skeleton className="h-4 w-48"></Skeleton>
            <Skeleton className="h-4 w-48"></Skeleton>
          </div>
        </div>
      </div>
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
      <div>
        <h3 className="mb-2 text-xl">Table State</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              onCheckedChange={(checked) => setTableLoading(!!checked)}
              checked={tableLoading}
              id="table-loading"
            />
            <label
              htmlFor="table-loading"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Loading
            </label>
          </div>
        </div>
      </div>
      {tableLoading ? (
        <TableSkeleton cols={4} rows={4} />
      ) : (
        <Table>
          <TableCaption>Table of a list of invoices</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV002</TableCell>
              <TableCell>Unpaid</TableCell>
              <TableCell>PayPal</TableCell>
              <TableCell className="text-right">$500.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV003</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$750.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV004</TableCell>
              <TableCell>Unpaid</TableCell>
              <TableCell>PayPal</TableCell>
              <TableCell className="text-right">$1,000.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}
