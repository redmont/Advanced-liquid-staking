'use client';

import { Card } from '@/components/ui/card';
import RealIcon from '@/assets/images/R.svg';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import backgroundImage from '@/assets/images/vr-guy.png';
import { useRef } from 'react';
import useParallaxEffect from '@/hooks/useParallax';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Indicator, Progress } from '@/components/ui/progress';

const durations = ['15 days', '30 days', '90 days'] as const;
type Duration = (typeof durations)[number];
const rewardRate: Record<Duration, number> = {
  '15 days': 1,
  '30 days': 1.25,
  '90 days': 1.5,
};

const StakeFormSchema = z.object({
  amount: z.number({ message: 'Amount must be a number' }),
  duration: z.enum(durations),
});

type StakeValues = z.infer<typeof StakeFormSchema>;

const UnstakeFormSchema = z.object({
  amount: z.number({ message: 'Amount must be a number' }),
});

type UnstakeValues = z.infer<typeof UnstakeFormSchema>;

const staked = 10000;
const unlockable = 5000;
const sReal = 2500;
const locked15 = 1000;
const locked30 = 2500;
const locked60 = 1500;

export default function Stake() {
  const { sdkHasLoaded } = useDynamicContext();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const parallax = useParallaxEffect(parallaxRef);

  const stakeForm = useForm<StakeValues>({
    defaultValues: {
      amount: 0,
      duration: '15 days',
    },
    resolver: zodResolver(StakeFormSchema),
  });

  const unstakeForm = useForm<UnstakeValues>({
    defaultValues: {
      amount: 0,
    },
    resolver: zodResolver(UnstakeFormSchema),
  });

  return (
    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
      <Card className="flex flex-col items-center justify-center gap-1 p-5">
        <h2>Total REAL Staked</h2>
        <p className="flex items-center gap-3 text-xl">
          <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
            <RealIcon className="inline size-5" />
          </span>
          {!sdkHasLoaded ? (
            <Skeleton className="inline h-7 w-24" />
          ) : (
            <span className="mb-1 text-3xl font-medium leading-none">
              {staked.toLocaleString()}
            </span>
          )}
        </p>
      </Card>
      <Card className="flex flex-col items-center justify-center gap-1 p-5">
        <h2>sREAL - Effective Voting Power</h2>
        <p className="flex items-center gap-3 text-xl">
          <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-accent bg-black p-1.5 text-accent">
            <RealIcon className="inline size-5" />
          </span>
          {!sdkHasLoaded ? (
            <Skeleton className="inline-block h-7 w-24 text-3xl" />
          ) : (
            <span className="mb-1 text-3xl font-medium leading-none">
              {sReal.toLocaleString()}
            </span>
          )}
        </p>
      </Card>
      <Card className="space-y-5 p-5">
        <h2 className="text-xl">Stake REAL</h2>
        <Form {...stakeForm}>
          <form className="space-y-5">
            <FormField
              control={stakeForm.control}
              name="amount"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>Amount to stake:</FormLabel>
                  <FormControl>
                    <Input
                      startAdornment={
                        <span className="inline-flex items-center gap-1 text-sm">
                          <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                            <RealIcon className="size-full" />
                          </span>
                          REAL
                        </span>
                      }
                      endAdornment={
                        <Button
                          type="button"
                          onClick={() => field.onChange(staked)}
                          variant="ghost"
                          size="sm"
                          className="mr-1 text-sm"
                        >
                          Max
                        </Button>
                      }
                      className={cn({
                        'border-destructive': formState.errors.amount,
                      })}
                      type="number"
                      min={0}
                      max={staked}
                      step={1}
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.valueAsNumber;
                        if (value > staked) {
                          field.onChange(staked);
                        } else {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Stake REAL to earn sREAL and voting power
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormField
                control={stakeForm.control}
                name="duration"
                render={({ field, formState }) => (
                  <FormItem>
                    <FormLabel>Choose staking duration:</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {durations.map((duration) => (
                          <Button
                            type="button"
                            key={duration}
                            disabled={formState.disabled}
                            variant={
                              field.value === duration ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => field.onChange(duration)}
                          >
                            {duration} ({rewardRate[duration]}x)
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="mt-5 w-full"
              size="lg"
              variant="default"
            >
              Stake
              <span className="ml-2 inline-flex flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                <RealIcon className="inline-block size-4" />
              </span>
            </Button>
          </form>
        </Form>
      </Card>
      <div
        ref={parallaxRef}
        // eslint-disable-next-line tailwindcss/no-contradicting-classname
        className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[size:300%] bg-[position:center] bg-no-repeat px-4 py-8 sm:bg-[center_10%] sm:px-12"
        style={{
          backgroundImage: `url(${backgroundImage.src})`,
          backgroundPositionY: `${parallax}%`,
        }}
      >
        <div className="absolute inset-0 z-10 bg-black opacity-50" />
        <div className="relative z-10 space-y-5 text-center">
          <h2 className="text-2xl font-semibold">sReal Rate</h2>
          <p className="text-3xl">
            +{' '}
            {!sdkHasLoaded ? (
              <Skeleton className="mt-2 inline-block h-7 w-24 text-3xl" />
            ) : (
              <span className="mb-1 font-semibold leading-none">
                {(sReal / 365).toLocaleString()}
              </span>
            )}{' '}
            <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-accent bg-black p-1.5 text-accent">
              <RealIcon className="inline size-5" />
            </span>{' '}
            / day
          </p>
          <p>
            1
            <span className="m-1.5 inline-flex size-6 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1 text-primary">
              <RealIcon className="size-full" />
            </span>{' '}
            REAL staked = {(1 / 365).toFixed(6)} sREAL / day
          </p>
        </div>
      </div>
      <Card className="space-y-5 p-5 md:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Locked REAL</h2>
        </div>
        <div>
          <Progress className="leading-[0]">
            <Indicator
              variant="accent"
              className="inline-block"
              style={{
                width: `${(unstakeForm.watch('amount') / staked) * 100}%`,
              }}
            />
            <Indicator
              variant="primary"
              className="inline-block"
              style={{
                width: `${((unlockable - unstakeForm.watch('amount')) / staked) * 100}%`,
              }}
            />
            <Indicator
              className="inline-block"
              variant="white"
              style={{ width: `${(locked15 / staked) * 100}%` }}
            />
            <Indicator
              className="inline-block"
              variant="lightest"
              style={{ width: `${(locked30 / staked) * 100}%` }}
            />
            <Indicator
              className="inline-block"
              variant="lighter"
              style={{ width: `${(locked60 / staked) * 100}%` }}
            />
          </Progress>
          <p className="mt-1 flex flex-wrap gap-x-2 text-xs">
            {unstakeForm.watch('amount') > 0 && (
              <span>
                <span className="inline-block size-2 rounded-full bg-accent" />{' '}
                To unstake
              </span>
            )}
            <span>
              <span className="inline-block size-2 rounded-full bg-primary" />{' '}
              {((unlockable / staked) * 100).toFixed(0)}% Unlockable
            </span>
            <span>
              <span className="inline-block size-2 rounded-full bg-white" />{' '}
              {((locked15 / staked) * 100).toFixed(0)}% Locked for 15+ days
            </span>
            <span>
              <span className="inline-block size-2 rounded-full bg-lightest" />{' '}
              {((locked30 / staked) * 100).toFixed(0)}% Locked for 30+ days
            </span>
            <span>
              <span className="inline-block size-2 rounded-full bg-lighter" />{' '}
              {((locked60 / staked) * 100).toFixed(0)}% Locked for 60+ days
            </span>
          </p>
        </div>
        <Form {...unstakeForm}>
          <form className="space-y-5">
            <FormField
              control={unstakeForm.control}
              name="amount"
              disabled={!sdkHasLoaded}
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>Amount to unstake:</FormLabel>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <FormControl className="grow">
                      <Input
                        startAdornment={
                          <span className="inline-flex items-center gap-1 text-sm">
                            <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                              <RealIcon className="size-full" />
                            </span>
                            REAL
                          </span>
                        }
                        endAdornment={
                          <Button
                            type="button"
                            onClick={() => field.onChange(unlockable)}
                            variant="ghost"
                            size="sm"
                            className="mr-1 text-sm"
                          >
                            Max
                          </Button>
                        }
                        className={cn({
                          'border-destructive': formState.errors.amount,
                        })}
                        type="number"
                        min={0}
                        max={unlockable}
                        step={1}
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber;
                          if (value > unlockable) {
                            field.onChange(unlockable);
                          } else {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <Button type="submit" loading={!sdkHasLoaded} size="xl">
                      Unstake
                    </Button>
                  </div>
                  <FormDescription>
                    Unstake REAL to withdraw your staked REAL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Card>
    </div>
  );
}
