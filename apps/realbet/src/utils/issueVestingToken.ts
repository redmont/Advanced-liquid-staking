'use server';

import { testnetTransports } from '@/config/wagmi';
import { tokenVestingAbi, tokenVestingAddress } from '@/contracts/generated';
import { createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { parseEther } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { env } from '@/env';

const contractAddress = tokenVestingAddress[sepolia.id];

export const issueVestingToken = async (address: string) => {
  if (env.NODE_ENV === 'production') {
    throw new Error('Not available in this environment');
  }

  if (!env.TESTNET_SIGNER_PRIVATE_KEY) {
    throw new Error('TESTNET_SIGNER_PRIVATE_KEY is not set');
  }

  let account;
  try {
    account = privateKeyToAccount(
      env.TESTNET_SIGNER_PRIVATE_KEY as `0x${string}`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid testnet signer private key: ${msg}`);
  }

  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: testnetTransports[sepolia.id],
  });

  const startTime = BigInt(Math.floor(new Date().getTime() / 1000));
  const cliff = 0n;
  const duration = 300n;
  const slicePeriodSeconds = 1n;
  const revocable = true;
  const amount = parseEther('100');

  const tx = await client.writeContract({
    address: contractAddress,
    abi: tokenVestingAbi,
    functionName: 'createVestingSchedule',
    args: [
      address as `0x${string}`,
      startTime,
      cliff,
      duration,
      slicePeriodSeconds,
      revocable,
      amount,
    ],
  });

  await waitForTransactionReceipt(client, { hash: tx, confirmations: 1 });

  return tx;
};
