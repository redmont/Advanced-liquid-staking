'use client';

import { Card } from '@/components/ui/card';
import RealIcon from '@/assets/images/R.svg';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { Button, ButtonProps } from '@/components/ui/button';
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
import { useMemo, useRef, useState } from 'react';
import useParallaxEffect from '@/hooks/useParallax';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Indicator, Progress } from '@/components/ui/progress';
import { useToken } from '@/hooks/useToken';
import { useVault } from '@/hooks/useVault';
import { formatUnits, parseUnits } from 'viem';
import AnimatedNumber from '@/components/ui/animated-number';
import { formatBalance } from '@/utils';
import { waitForTransactionReceipt } from '@wagmi/core';
import config from '@/config/wagmi';
import dayjs from '@/dayjs';
import React from 'react';

const unlockable = 5000;
const locked15 = 1000;
const locked30 = 2500;
const locked60 = 1500;

const colorGrade = [
  'primary',
  'primary-intermediate-1',
  'primary-intermediate-2',
  'primary-intermediate-3',
  'accent',
] as const;

const gradientTierButtonClasses: ((active: boolean) => Partial<ButtonProps>)[] =
  new Array(colorGrade.length).fill(0).map(
    (_, index) => (active: boolean) =>
      active
        ? {
            className: `bg-${colorGrade[index]} border-none hover:bg-${colorGrade[index]} hover:text-black focus:ring-${colorGrade[index]}`,
          }
        : {
            className: `text-${colorGrade[index]} bg-transparent border border-${colorGrade[index]} hover:bg-${colorGrade[index]} hover:text-black focus:ring-${colorGrade[index]}`,
          },
  );

const toDaysOrMonths = (lockupTime: number) => {
  const d = dayjs.duration(lockupTime, 'seconds');
  if (d.asMonths() < 1) {
    return `${d.asDays().toFixed(0)} days`;
  }
  return `${d.asMonths().toFixed(0)} months`;
};

export default function Stake() {
  const [stakingStatus, setStakingStatus] = useState('');
  const isAuthenticated = useIsLoggedIn();
  const token = useToken();
  const vault = useVault();
  const { sdkHasLoaded, setShowAuthFlow } = useDynamicContext();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const parallax = useParallaxEffect(parallaxRef);

  const StakeFormSchema = z.object({
    amount: z
      .string({ message: 'Amount is required' })
      .transform((number) => parseUnits(number, token.decimals)),
    duration: z
      .string()
      .refine(
        (d) => !!vault.tiers.data?.[parseInt(d)],
        'Something went wrong selecting the tier.',
      ),
  });

  type StakeValues = z.infer<typeof StakeFormSchema>;

  const UnstakeFormSchema = z.object({
    amount: z.number({ message: 'Amount must be a number' }),
  });

  type UnstakeValues = z.infer<typeof UnstakeFormSchema>;

  const stakeForm = useForm<StakeValues>({
    defaultValues: {
      amount: 0n,
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

  const stakedAmountFloat = useMemo(
    () => parseFloat(formatBalance(vault.deposited ?? 0n, token.decimals)),
    [vault.deposited, token.decimals],
  );

  const onStake = async (values: StakeValues) => {
    if (!isAuthenticated) {
      return setShowAuthFlow(true);
    }

    if (values.amount > vault.allowance) {
      setStakingStatus('Approving allowance...');
      try {
        const tx = await vault.increaseAllowance.mutateAsync(values.amount);
        if (!tx) {
          stakeForm.setError('amount', { message: 'Insufficient allowance' });
          return;
        }
        await waitForTransactionReceipt(config, { hash: tx });
      } catch (error) {
        setStakingStatus('');
        stakeForm.setError('amount', {
          message: 'Error when attempting to increase allowance',
        });
        return;
      }
    }

    if (values.amount > token.balance) {
      stakeForm.setError('amount', { message: 'Insufficient balance' });
      return;
    }

    setStakingStatus('Staking REAL...');
    await vault.stake.mutateAsync({
      amount: values.amount,
      tier: values.duration,
    });

    setStakingStatus('');
  };

  const onUnstake = async (values: UnstakeValues) => {
    if (!isAuthenticated) {
      return setShowAuthFlow(true);
    }

    await vault.unstake.mutateAsync({
      amount: parseUnits(values.amount.toString(), token.decimals),
    });
  };

  const stakeFormLoading =
    !sdkHasLoaded ||
    stakeForm.formState.isSubmitting ||
    vault.isLoading ||
    token.isLoading;

  return (
    <div className="grid grid-cols-1 gap-3 p-3 sm:gap-5 sm:p-5 md:grid-cols-2">
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
              {formatBalance(vault.deposited, token.decimals)}
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
              {formatBalance(vault.shares, token.decimals)}
            </span>
          )}
        </p>
      </Card>
      <Card className="space-y-5 p-5">
        <h2 className="text-xl">Stake {token.symbol}</h2>
        <h3 className="text-primary empty:hidden">{stakingStatus}</h3>
        <Form {...stakeForm}>
          <form onSubmit={stakeForm.handleSubmit(onStake)}>
            <FormField
              control={stakeForm.control}
              name="amount"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel
                    className={cn('block', { 'text-muted': stakeFormLoading })}
                  >
                    Stakeable Balance:{' '}
                    {formatBalance(token.balance, token.decimals)}{' '}
                    {token.symbol}
                  </FormLabel>
                  <FormControl>
                    <Input
                      loading={stakeFormLoading}
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
                            field.onChange(
                              formatUnits(token.balance, token.decimals),
                            );
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
                      placeholder="0"
                      value={field.value.toString()}
                      onChange={(e) => {
                        try {
                          const value = parseUnits(
                            e.target.value,
                            token.decimals,
                          );
                          if (value > token.balance) {
                            field.onChange(
                              formatUnits(token.balance, token.decimals),
                            );
                          } else {
                            field.onChange(e.target.value);
                          }
                        } catch (error) {
                          field.onChange(field.value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Stake {token.symbol} to earn {vault.shareSymbol}
                  </FormDescription>
                </FormItem>
              )}
            />
            <div>
              <FormField
                control={stakeForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={cn({ 'text-muted': stakeFormLoading })}
                    >
                      Choose staking duration:
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {!vault.tiers.data ? (
                          <>
                            <Skeleton className="h-8 w-24 rounded-lg bg-primary" />
                            <Skeleton className="h-8 w-24 rounded-lg bg-primary-intermediate-1" />
                            <Skeleton className="h-8 w-24 rounded-lg bg-primary-intermediate-2" />
                            <Skeleton className="h-8 w-24 rounded-lg bg-primary-intermediate-3" />
                            <Skeleton className="h-8 w-24 rounded-lg bg-accent" />
                          </>
                        ) : (
                          vault.tiers.data?.map((tier, index) => (
                            <Button
                              type="button"
                              key={index}
                              loading={stakeFormLoading}
                              size="sm"
                              onClick={() => field.onChange(index.toString())}
                              {...gradientTierButtonClasses[index]?.(
                                parseInt(field.value) === index,
                              )}
                            >
                              {toDaysOrMonths(tier.lockupTime)} (
                              {tier.multiplier}
                              x)
                            </Button>
                          ))
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              loading={stakeFormLoading}
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
              <Skeleton className="mt-4 inline-block h-20 w-48 rounded-full" />
            ) : (
              <span className="mb-1 font-semibold leading-none">
                <AnimatedNumber
                  value={Number(
                    vault.deposited
                      ? parseFloat(vault.shares.toString()) /
                          parseFloat(vault.deposited.toString())
                      : 0,
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
