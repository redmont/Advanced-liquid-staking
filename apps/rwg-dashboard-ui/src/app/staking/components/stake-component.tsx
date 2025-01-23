import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import RealIcon from '@/assets/images/R.svg';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import backgroundImage from '@/assets/images/vr-guy.png';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { formatBalance, formatBigIntWithSeparators } from '@/utils';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import DepositsIndicator from './deposits-indicator';
import { useToken } from '@/hooks/useToken';
import { useStakingVault } from '@/hooks/useStakingVault';
import useParallaxEffect from '@/hooks/useParallax';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { Wallet } from 'lucide-react';
import { PreviousStakes } from './previous-stakes';

const gradientTierButtonClasses = [
  (active: boolean) =>
    active
      ? {
          className:
            'bg-primary border-none hover:bg-primary hover:text-black focus:ring-primary',
        }
      : {
          className:
            'text-primary bg-transparent border border-primary hover:bg-primary hover:text-black focus:ring-primary',
        },
  (active: boolean) =>
    active
      ? {
          className:
            'bg-primary-intermediate-1 border-none hover:bg-primary-intermediate-1 hover:text-black focus:ring-primary-intermediate-1',
        }
      : {
          className:
            'text-primary-intermediate-1 bg-transparent border border-primary-intermediate-1 hover:bg-primary-intermediate-1 hover:text-black focus:ring-primary-intermediate-1',
        },
  (active: boolean) =>
    active
      ? {
          className:
            'bg-primary-intermediate-3 border-none hover:bg-primary-intermediate-3 hover:text-black focus:ring-primary-intermediate-3',
        }
      : {
          className:
            'text-primary-intermediate-3 bg-transparent border border-primary-intermediate-3 hover:bg-primary-intermediate-3 hover:text-black focus:ring-primary-intermediate-3',
        },
  (active: boolean) =>
    active
      ? {
          className:
            'bg-accent border-none hover:bg-accent hover:text-black focus:ring-accent',
        }
      : {
          className:
            'text-accent bg-transparent border border-accent hover:bg-accent hover:text-black focus:ring-accent',
        },
  (active: boolean) =>
    active
      ? {
          className:
            'bg-accent-2 border-none hover:bg-accent-2 hover:text-black focus:ring-accent-2',
        }
      : {
          className:
            'text-accent-2 bg-transparent border border-accent-2 hover:bg-accent-2 hover:text-black focus:ring-accent-2',
        },
];

const StakeComponent = () => {
  const [stakingStatus, setStakingStatus] = useState('');
  const isAuthenticated = useIsLoggedIn();
  const token = useToken();
  const {
    stake,
    increaseAllowance,
    tiers,
    allowance,
    shares,
    stakedBalance,
    deposits,
    currentEpoch,
    shareSymbol,
    lastEpochRewards,
    totalStaked,
  } = useStakingVault();
  const { sdkHasLoaded, setShowAuthFlow } = useDynamicContext();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const parallax = useParallaxEffect(parallaxRef);

  const StakeFormSchema = z.object({
    amount: z.string({ message: 'Amount is required' }),
    duration: z
      .string()
      .refine(
        (d) => !!tiers.data?.[parseInt(d)],
        'Something went wrong selecting the tier.',
      ),
  });

  type StakeValues = z.infer<typeof StakeFormSchema>;

  const stakeForm = useForm<StakeValues>({
    defaultValues: {
      amount: '0',
      duration: '0',
    },
    resolver: zodResolver(StakeFormSchema),
  });

  const currentMultiplier = useAnimatedNumber(
    shares.isSuccess && totalStaked.isSuccess
      ? Number(
          shares.data.reduce(
            (amount, item) => item.effectiveAmount + amount,
            0n,
          ),
        ) / Number(stakedBalance ?? 0n)
      : 0,
    { decimals: 2, duration: 750 },
  );

  const duration = stakeForm.watch('duration');
  const durationIndex = useMemo(() => parseInt(duration || '0'), [duration]);

  const selectedTier = useMemo(
    () => tiers.data?.[durationIndex],
    [durationIndex, tiers.data],
  );

  const amount = stakeForm.watch('amount');

  const calculateUnlockTime = useCallback(
    (lockupTimeSeconds: number | bigint | undefined) => {
      if (!lockupTimeSeconds) {
        return undefined;
      }
      return dayjs().add(Number(lockupTimeSeconds), 'seconds').unix();
    },
    [],
  );

  const onStake = useCallback(
    async (values: StakeValues) => {
      if (!isAuthenticated) {
        return setShowAuthFlow(true);
      }

      const amount = parseUnits(values.amount, token.decimals);

      if (amount === 0n) {
        return stakeForm.setError('amount', { message: 'Amount required' });
      }

      if (amount > token.balance) {
        stakeForm.setError('amount', { message: 'Insufficient balance' });
        return;
      }

      if (!allowance.isSuccess) {
        throw new Error('Something went wrong fetching allowance');
      }

      if (amount > allowance.data) {
        setStakingStatus('Approving allowance...');
        try {
          await increaseAllowance.mutateAsync(amount);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setStakingStatus('');
          stakeForm.setError('amount', {
            message: 'Error when attempting to increase allowance',
          });
          return;
        }
      }

      if (amount > token.balance) {
        stakeForm.setError('amount', { message: 'Insufficient balance' });
        return;
      }

      setStakingStatus(`Staking ${shareSymbol}...`);
      await stake
        .mutateAsync({
          amount,
          tier: parseInt(values.duration),
        })
        .finally(() => {
          setStakingStatus('');
        });
    },
    [
      isAuthenticated,
      setShowAuthFlow,
      stakeForm,
      token.balance,
      allowance.data,
      allowance.isSuccess,
      increaseAllowance,
      shareSymbol,
      stake,
      token.decimals,
    ],
  );

  const anticipatedMonthlyReward = useMemo(() => {
    if (!selectedTier) {
      return 0;
    }

    const lastEpochRewardsData = lastEpochRewards.data;
    if (!lastEpochRewardsData) {
      return 0;
    }

    const numberAmount = parseUnits(amount, token.decimals);

    if (numberAmount === 0n) {
      return 0;
    }

    const mult = selectedTier?.decimalMult ?? 0.1;

    const multedAmount = (numberAmount * BigInt(mult * 10)) / 10n;

    // If totalEffectiveSupply is 0, no one has staked,
    // so this is the first potential staker
    const totalEffectiveSupply =
      lastEpochRewardsData.totalEffectiveSupply <= 0
        ? multedAmount
        : BigInt(lastEpochRewardsData.totalEffectiveSupply);

    // Multiply by 10^2 for 2 decimal place precision
    const reward =
      (((lastEpochRewardsData.rewards * 10n ** 2n) / totalEffectiveSupply) *
        multedAmount) /
      10n ** 2n;

    // 4.2 weeks (1 month)
    const monthlyReward = (reward * 42n) / 10n;

    return Number(monthlyReward / 10n ** 18n);
  }, [lastEpochRewards.data, selectedTier, amount, token.decimals]);

  const anticipatedMonthlyRewardAnimated = useAnimatedNumber(
    anticipatedMonthlyReward,
    {
      decimals: 2,
      duration: 300,
      locale: 'en-US',
    },
  );

  // Simple APY calculation, as we don't have compounding
  const apy = useMemo(
    () => (((anticipatedMonthlyReward * 12) / Number(amount)) * 100).toFixed(2),
    [anticipatedMonthlyReward, amount],
  );

  const animatedAPY = useAnimatedNumber(apy, {
    decimals: 2,
    duration: 300,
  });

  const stakeFormLoading =
    !sdkHasLoaded ||
    stakeForm.formState.isSubmitting ||
    allowance.isLoading ||
    deposits.isLoading ||
    token.isLoading;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 py-3 sm:gap-5 md:grid-cols-3 md:py-5">
        <Card className="col-span-2 space-y-5 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl">Stake {token.symbol}</h2>

            {!currentEpoch ? (
              <Skeleton className="h-4 w-24 rounded-lg bg-muted" />
            ) : (
              <span className="rounded-lg bg-muted px-1 text-sm">
                Epoch {currentEpoch.epoch} (ends in{' '}
                {dayjs
                  .duration(Date.now() - currentEpoch.endDate * 1000)
                  .humanize()}
                )
              </span>
            )}
          </div>
          <h3 className="text-primary empty:hidden">{stakingStatus}</h3>
          <Form {...stakeForm}>
            <form onSubmit={stakeForm.handleSubmit(onStake)}>
              <FormField
                control={stakeForm.control}
                name="amount"
                render={({ field, formState }) => (
                  <FormItem>
                    <FormLabel
                      className={cn('block', {
                        'text-muted': stakeFormLoading,
                      })}
                    >
                      <Wallet className="mr-2 inline size-5" />
                      Stakeable balance:{' '}
                      {formatBigIntWithSeparators(
                        token.balance,
                        token.decimals,
                      )}{' '}
                      {token.symbol}
                      {allowance.isSuccess && allowance.data > 0n && (
                        <>
                          {', '}
                          Allowance: {formatBalance(allowance.data)}{' '}
                          {token.symbol}
                        </>
                      )}
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
                                formatUnits(
                                  token.balance ?? 0n,
                                  token.decimals,
                                ),
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
                        {...field}
                        value={Number(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
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
                        className={cn(
                          { 'text-muted': stakeFormLoading },
                          'flex justify-between py-2',
                        )}
                      >
                        Choose staking lock duration:
                        <p>
                          Unlocks at{' '}
                          {selectedTier?.lockPeriod
                            ? dayjs
                                .unix(
                                  calculateUnlockTime(
                                    selectedTier.lockPeriod,
                                  ) ?? 0,
                                )
                                .format('MMM DD, YYYY')
                            : ''}
                        </p>
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          <p className="text-destructive empty:hidden">
                            {tiers.error?.message}
                          </p>
                          {tiers.isLoading ? (
                            <>
                              <Skeleton className="h-8 w-24 rounded-lg bg-primary" />
                              <Skeleton className="h-8 w-24 rounded-lg bg-primary-intermediate-1" />
                              <Skeleton className="h-8 w-24 rounded-lg bg-primary-intermediate-2" />
                              <Skeleton className="h-8 w-24 rounded-lg bg-primary-intermediate-3" />
                              <Skeleton className="h-8 w-24 rounded-lg bg-accent" />
                            </>
                          ) : (
                            tiers.data?.map((tier, index) => (
                              <Button
                                type="button"
                                key={index}
                                loading={stakeFormLoading}
                                size="sm"
                                onClick={() => {
                                  field.onChange(index.toString());
                                  stakeForm.setValue(
                                    'duration',
                                    index.toString(),
                                  );
                                }}
                                {...gradientTierButtonClasses[index]?.(
                                  parseInt(field.value) === index,
                                )}
                              >
                                {dayjs
                                  .duration(Number(tier.lockPeriod), 'seconds')
                                  .humanize()}{' '}
                                ({tier.decimalMult}x)
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
            <h2 className="flex flex-col gap-3 text-2xl font-medium">
              {selectedTier && (
                <div className="text-xl font-medium">
                  <span>You&apos;ll get </span>
                  <span
                    className={cn('rounded-lg bg-black/50 px-2', {
                      'border border-primary text-primary': durationIndex === 0,
                      'border border-primary-intermediate-1 text-primary-intermediate-1':
                        durationIndex === 1,
                      'border border-primary-intermediate-2 text-primary-intermediate-2':
                        durationIndex === 2,
                      'border border-primary-intermediate-3 text-primary-intermediate-3':
                        durationIndex === 3,
                      'border border-accent text-accent': durationIndex === 4,
                    })}
                  >
                    {selectedTier.decimalMult}x
                  </span>{' '}
                  <span>the rewards</span>
                </div>
              )}
              <div className="text-[2rem] font-medium">{animatedAPY}% APY</div>
              <div className="text-xl">
                ~{anticipatedMonthlyRewardAnimated}
                <span className="inline-flex items-center gap-1">
                  <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                    <RealIcon className="size-full" />
                  </span>
                  {token.symbol}
                </span>
                <br />
                per month
              </div>
            </h2>
          </div>
        </div>
      </div>
      <Card className="space-y-5 p-5 md:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">{shareSymbol} Balances</h2>

          <h2 className="text-xl">
            Current multiplier:{' '}
            <span
              className={cn('font-semibold', {
                'text-primary': parseFloat(currentMultiplier) >= 1,
                'text-primary-intermediate-1':
                  parseFloat(currentMultiplier) >= 1.25,
                'text-primary-intermediate-2':
                  parseFloat(currentMultiplier) >= 1.5,
                'text-primary-intermediate-3':
                  parseFloat(currentMultiplier) >= 1.75,
                'text-accent': parseFloat(currentMultiplier) >= 2,
              })}
            >
              {currentMultiplier}x
            </span>
          </h2>
        </div>
        <div>
          <DepositsIndicator />
        </div>
      </Card>

      <PreviousStakes />
    </div>
  );
};

export default StakeComponent;
