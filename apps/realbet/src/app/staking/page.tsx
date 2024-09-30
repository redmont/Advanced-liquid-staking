'use client';

import { Card } from '@/components/ui/card';
import RealIcon from '@/assets/images/R.svg';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
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
import { useMemo, useRef } from 'react';
import useParallaxEffect from '@/hooks/useParallax';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Indicator, Progress } from '@/components/ui/progress';
import { useToken } from '@/hooks/useToken';
import { useVault } from '@/hooks/useVault';
import { formatUnits, parseUnits } from 'viem';
import AnimatedNumber from '@/components/ui/animated-number';

const durations = ['15 days', '30 days', '90 days'] as const;
const rewardRates = [1, 1.25, 1.5];
const StakeFormSchema = z.object({
  amount: z.number({ message: 'Amount must be a number' }).positive(),
  duration: z.enum(['0', '1', '2']),
});

type StakeValues = z.infer<typeof StakeFormSchema>;

const UnstakeFormSchema = z.object({
  amount: z.number({ message: 'Amount must be a number' }),
});

type UnstakeValues = z.infer<typeof UnstakeFormSchema>;

const unlockable = 5000;
const locked15 = 1000;
const locked30 = 2500;
const locked60 = 1500;

export default function Stake() {
  const isAuthenticated = useIsLoggedIn();
  const token = useToken();
  const vault = useVault();
  const { sdkHasLoaded, setShowAuthFlow } = useDynamicContext();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const parallax = useParallaxEffect(parallaxRef);

  const stakeForm = useForm<StakeValues>({
    defaultValues: {
      amount: 0,
      duration: '0',
    },
    resolver: zodResolver(StakeFormSchema),
  });

  const unstakeForm = useForm<UnstakeValues>({
    defaultValues: {
      amount: 0,
    },
    resolver: zodResolver(UnstakeFormSchema),
  });

  const [balanceFloat, stakedAmountFloat] = useMemo(
    () => [
      parseFloat(formatUnits(token.balance ?? 0n, token.decimals ?? 18)),
      parseFloat(formatUnits(vault.deposited ?? 0n, token.decimals ?? 18)),
    ],
    [token.balance, token.decimals, vault.deposited],
  );

  const onStake = async (values: StakeValues) => {
    if (!isAuthenticated) {
      setShowAuthFlow(true);
    } else {
      await vault.stake({
        amount: parseUnits(values.amount.toString(), token.decimals),
        tier: values.duration,
      });
    }
  };

  const onUnstake = async (values: UnstakeValues) => {
    if (!isAuthenticated) {
      setShowAuthFlow(true);
    } else {
      await vault.unstake({
        amount: parseUnits(values.amount.toString(), token.decimals),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
      <Card className="flex flex-col items-center justify-center gap-1 p-5">
        <h2>Total {token.symbol} Staked</h2>
        <p className="flex items-center gap-3 text-xl">
          <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
            <RealIcon className="inline size-5" />
          </span>
          {vault.isLoading ? (
            <Skeleton className="inline h-7 w-24" />
          ) : (
            <span className="mb-1 text-3xl font-medium leading-none">
              {vault.deposited.toLocaleString()}
            </span>
          )}
        </p>
      </Card>
      <Card className="flex flex-col items-center justify-center gap-1 p-5">
        <h2>{vault.shareSymbol} - Effective Voting Power</h2>
        <p className="flex items-center gap-3 text-xl">
          <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-accent bg-black p-1.5 text-accent">
            <RealIcon className="inline size-5" />
          </span>
          {vault.isLoading ? (
            <Skeleton className="inline-block h-7 w-24 text-3xl" />
          ) : (
            <span className="mb-1 text-3xl font-medium leading-none">
              {vault.shares.toLocaleString()}
            </span>
          )}
        </p>
      </Card>
      <Card className="space-y-5 p-5">
        <h2 className="text-xl">Stake {token.symbol}</h2>
        <Form {...stakeForm}>
          <form onSubmit={stakeForm.handleSubmit(onStake)}>
            <FormField
              control={stakeForm.control}
              name="amount"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>Amount to stake:</FormLabel>
                  <FormControl>
                    <Input
                      loading={
                        !sdkHasLoaded ||
                        stakeForm.formState.isSubmitting ||
                        vault.isLoading ||
                        token.isLoading
                      }
                      startAdornment={
                        <span className="inline-flex items-center gap-1 text-sm">
                          <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                            <RealIcon className="size-full" />
                          </span>
                          {token.symbol}
                        </span>
                      }
                      endAdornment={
                        <Button
                          type="button"
                          onClick={() => {
                            field.onChange(balanceFloat);
                          }}
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
                      max={balanceFloat}
                      step={1}
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.valueAsNumber;
                        if (value > balanceFloat) {
                          field.onChange(balanceFloat);
                        } else {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Stake {token.symbol} to earn {vault.shareSymbol}
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
                        {durations.map((_, index) => (
                          <Button
                            type="button"
                            key={index}
                            disabled={formState.disabled}
                            variant={
                              parseInt(field.value) === index
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => field.onChange(index.toString())}
                          >
                            {durations[index]} ({rewardRates[index]}x)
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
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-semibold">Current multiplier</h2>
          <p className="text-7xl leading-none sm:text-8xl">
            {vault.isLoading ? (
              <Skeleton className="mt-2 inline-block h-7 w-24" />
            ) : (
              <span className="mb-1 font-semibold leading-none">
                <AnimatedNumber
                  value={Number(
                    vault.deposited ? vault.shares / vault.deposited : 0,
                  )}
                  decimals={2}
                />
                x
              </span>
            )}
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
                width: `${stakedAmountFloat !== 0 && (unstakeForm.watch('amount') / stakedAmountFloat) * 100}%`,
              }}
            />
            <Indicator
              variant="primary"
              className="inline-block"
              style={{
                width: `${stakedAmountFloat !== 0 && ((unlockable - unstakeForm.watch('amount')) / stakedAmountFloat) * 100}%`,
              }}
            />
            <Indicator
              className="inline-block"
              variant="white"
              style={{
                width: `${stakedAmountFloat !== 0 && (locked15 / stakedAmountFloat) * 100}%`,
              }}
            />
            <Indicator
              className="inline-block"
              variant="lightest"
              style={{
                width: `${stakedAmountFloat !== 0 && (locked30 / stakedAmountFloat) * 100}%`,
              }}
            />
            <Indicator
              className="inline-block"
              variant="lighter"
              style={{
                width: `${stakedAmountFloat !== 0 && (locked60 / stakedAmountFloat) * 100}%`,
              }}
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
              {stakedAmountFloat &&
                ((unlockable / stakedAmountFloat) * 100).toFixed(0)}
              % Unlockable
            </span>
            <span>
              <span className="inline-block size-2 rounded-full bg-white" />{' '}
              {stakedAmountFloat &&
                ((locked15 / stakedAmountFloat) * 100).toFixed(0)}
              % Locked for 15+ days
            </span>
            <span>
              <span className="inline-block size-2 rounded-full bg-lightest" />{' '}
              {stakedAmountFloat &&
                ((locked30 / stakedAmountFloat) * 100).toFixed(0)}
              % Locked for 30+ days
            </span>
            <span>
              <span className="inline-block size-2 rounded-full bg-lighter" />{' '}
              {stakedAmountFloat &&
                ((locked60 / stakedAmountFloat) * 100).toFixed(0)}
              % Locked for 60+ days
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
