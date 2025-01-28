import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import config from '@/config/wagmi';
import { useWriteContract } from 'wagmi';
import { useMemo } from 'react';
import { useToken } from './useToken';
import useNetworkId from './useNetworkId';
import usePrimaryAddress from './usePrimaryAddress';
import { testTokenAbi, tokenStakingConfig } from '@/contracts/generated';
import { erc20Abi, formatEther } from 'viem';
import assert from 'assert';
import { isDev } from '@/env';
import { mainnet, sepolia } from 'viem/chains';
import { tokenAddress } from '@/config/realToken';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { getStakingMerkleProofs } from '@/server/actions/staking/getStakingMerkleProofs';

const chainId = isDev ? sepolia.id : mainnet.id;
const contractAddress = tokenStakingConfig.address[chainId];

export type Tier = {
  lockPeriod: bigint;
  multiplier: bigint;
};

export const useStakingVault = () => {
  const { isSuccess } = useNetworkId();
  const {
    queries: { balance },
  } = useToken();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { writeContractAsync } = useWriteContract();
  const primaryAddress = usePrimaryAddress();

  const tiers = useQuery({
    enabled: isSuccess && !!contractAddress,
    queryKey: ['tiers', contractAddress],
    queryFn: async () => {
      assert(contractAddress, 'Contract address not found');

      const tiers = await readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'getTiers',
      });

      return tiers.map((tier) => ({
        ...tier,
        decimalMult: parseFloat(formatEther(tier.multiplier)),
      }));
    },
  });

  const deposits = useQuery({
    enabled: !!primaryWallet && isSuccess && !!tiers.data && !!contractAddress,
    queryKey: ['getDeposits', contractAddress, primaryAddress],
    queryFn: async () => {
      assert(tiers.data, 'Tiers not loaded');
      assert(contractAddress, 'Contract address not found');

      const amounts = await readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'getUserStakes',
        args: [primaryAddress as `0x${string}`],
      });

      return amounts
        .slice()
        .map((deposit) => ({
          ...deposit,
          tier: tiers.data[deposit.tierIndex],
          unlockTime:
            deposit.startTime +
            Number(tiers.data[deposit.tierIndex]?.lockPeriod ?? 0n),
        }))
        .sort((a, b) => a.unlockTime - b.unlockTime);
    },
  });

  const totalStaked = useQuery({
    enabled: !!primaryWallet && isSuccess && !!contractAddress,
    queryKey: ['stakedBalance', contractAddress, primaryAddress],
    queryFn: () => {
      assert(contractAddress, 'Contract address not found');

      return readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'balanceOf',
        args: [primaryWallet!.address as `0x${string}`],
      });
    },
  });

  const stakedBalance = useMemo(
    () => totalStaked.data ?? 0n,
    [totalStaked.data],
  );

  const isAdmin = useQuery({
    enabled:
      isSuccess && !!primaryAddress?.startsWith('0x') && !!contractAddress,
    queryKey: ['admin', contractAddress, primaryAddress],
    queryFn: () => {
      assert(contractAddress, 'Contract address not found');

      return readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'hasRole',
        args: [
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          primaryWallet!.address as `0x${string}`,
        ],
      });
    },
  });

  const setTier = useMutation({
    mutationFn: async ({ tier, index }: { tier: Tier; index: number }) => {
      if (!primaryWallet) {
        throw new Error('Wallet required');
      }
      if (isAdmin.isLoading || isAdmin.data === false) {
        throw new Error('Not admin');
      }
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: tokenStakingConfig.abi,
        functionName: 'setTier',
        args: [BigInt(index), tier.lockPeriod, tier.multiplier],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: () => tiers.refetch(),
  });

  const unlockable = useMemo(
    () =>
      deposits.data
        ? deposits.data.reduce(
            (a, b) =>
              b.unlockTime - new Date().getTime() / 1000 <= 0
                ? a + b.amount
                : a,
            0n,
          )
        : undefined,
    [deposits.data],
  );

  const shares = useQuery({
    enabled: !!primaryWallet && isSuccess && !!contractAddress,
    queryKey: ['shares', contractAddress, primaryAddress],
    queryFn: () => {
      assert(contractAddress, 'Contract address not found');

      return readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'getUserStakes',
        args: [primaryWallet!.address as `0x${string}`],
      });
    },
  });

  const epochDuration = useQuery({
    enabled: isSuccess && !!contractAddress,
    queryKey: ['epochDuration'],
    queryFn: () => {
      assert(contractAddress, 'Contract address not found');

      return readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'epochDuration',
      });
    },
  });

  const epochStartTime = useQuery({
    enabled: isSuccess && !!contractAddress,
    queryKey: ['epochStartTime'],
    queryFn: () => {
      assert(contractAddress, 'Contract address not found');

      return readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'epochStartTime',
      });
    },
  });

  const currentEpoch = useMemo(() => {
    if (!epochDuration.data || !epochStartTime.data) {
      return null;
    }

    const startTime = Number(epochStartTime.data);

    const epoch =
      Math.floor((Date.now() / 1000 - startTime) / Number(epochDuration.data)) +
      1;
    const endDate = epoch * Number(epochDuration.data) + startTime;

    return {
      epoch,
      endDate,
    };
  }, [epochDuration.data, epochStartTime.data]);

  const allowance = useQuery({
    enabled:
      !!primaryAddress && isSuccess && !!tokenAddress && !!contractAddress,
    queryKey: ['allowance', contractAddress, primaryAddress],
    queryFn: () => {
      assert(contractAddress, 'Contract address not found');

      return readContract(config, {
        abi: testTokenAbi,
        address: tokenAddress,
        functionName: 'allowance',
        args: [primaryAddress as `0x${string}`, contractAddress],
      });
    },
  });

  const getRewardsForEpoch = (epoch: number) => {
    if (!contractAddress) {
      throw new Error('Contract address not found');
    }

    return readContract(config, {
      abi: tokenStakingConfig.abi,
      address: contractAddress,
      functionName: 'getRewardsForEpoch',
      args: [BigInt(epoch)],
    });
  };

  const setRewardForEpoch = useMutation({
    mutationFn: ({ epoch, reward }: { epoch: number; reward: bigint }) => {
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }

      return writeContractAsync({
        address: contractAddress,
        abi: tokenStakingConfig.abi,
        functionName: 'setRewardForEpoch',
        args: [BigInt(epoch), reward],
      });
    },
  });

  const calculateRewards = (stakeIndex: bigint, epochs: bigint[]) => {
    if (!contractAddress) {
      throw new Error('Contract address not found');
    }

    return readContract(config, {
      abi: tokenStakingConfig.abi,
      address: contractAddress,
      functionName: 'calculateRewardsWithVoting',
      args: [stakeIndex, epochs],
      account: primaryWallet!.address as `0x${string}`,
    });
  };

  const stake = useMutation({
    mutationFn: async ({ amount, tier }: { amount: bigint; tier: number }) => {
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: tokenStakingConfig.abi,
        functionName: 'stake',
        args: [amount, tier],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: () =>
      Promise.all([
        deposits.refetch(),
        shares.refetch(),
        balance.refetch(),
        allowance.refetch(),
        totalStaked.refetch(),
      ]),
  });

  const increaseAllowance = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!primaryWallet) {
        setShowAuthFlow(true);
        return;
      }
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }

      const tx = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [contractAddress, amount],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: async () => allowance.refetch(),
  });

  const unstake = useMutation({
    mutationFn: async ({ stakeIndex }: { stakeIndex: bigint }) => {
      if (!primaryWallet) {
        throw new Error('Wallet required');
      }
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: tokenStakingConfig.abi,
        functionName: 'unstake',
        args: [stakeIndex],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: () =>
      Promise.all([
        deposits.refetch(),
        shares.refetch(),
        balance.refetch(),
        totalStaked.refetch(),
      ]),
  });

  const claimRewards = useMutation({
    mutationFn: async ({
      stakeIndex,
      epochs,
      merkleProofs,
    }: {
      stakeIndex: bigint;
      epochs: number[];
      merkleProofs: `0x${string}`[][];
    }) => {
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: tokenStakingConfig.abi,
        functionName: 'claimRewards',
        args: [stakeIndex, epochs, merkleProofs],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
  });

  const lastEpochRewards = useQuery({
    queryKey: ['getLastEpochRewards', currentEpoch?.epoch],
    queryFn: async () => {
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }

      const epoch = currentEpoch?.epoch ?? 0;
      const rewardEpoch = epoch > 0 ? epoch - 1 : 0;

      // Get total effective supply for the epoch
      const totalEffectiveSupply = await readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'getTotalEffectiveSupplyAtEpoch',
        args: [BigInt(rewardEpoch)],
      });

      const rewards = await readContract(config, {
        abi: tokenStakingConfig.abi,
        address: contractAddress,
        functionName: 'getRewardsForEpoch',
        args: [BigInt(epoch)],
      });

      return {
        totalEffectiveSupply,
        rewards,
      };
    },
  });

  const minLastClaimEpoch = useMemo(() => {
    if (!deposits?.data || deposits.data.length === 0 || !deposits.data[0]) {
      return 0;
    }

    return deposits.data.reduce(
      (min, deposit) => Math.min(min, deposit.lastClaimEpoch),
      deposits.data[0].lastClaimEpoch,
    );
  }, [deposits.data]);

  const merkleProofs = useAuthenticatedQuery({
    queryKey: ['merkleProofs', minLastClaimEpoch],
    queryFn: (token) => {
      return getStakingMerkleProofs(token, minLastClaimEpoch);
    },
  });

  return {
    errors: [shares.error, allowance.error, deposits.error].filter((e) => !!e),
    shares,
    allowance,
    isAdmin,
    deposits,
    stakedBalance,
    unlockable: unlockable ?? 0n,
    setTier,
    tiers,
    stake,
    unstake,
    increaseAllowance,
    currentEpoch,
    epochDuration,
    getRewardsForEpoch,
    setRewardForEpoch,
    calculateRewards,
    claimRewards,
    lastEpochRewards,
    merkleProofs,
    totalStaked,
    shareSymbol: 'sREAL',
  };
};
