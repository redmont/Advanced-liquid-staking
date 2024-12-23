'use server';

import { testnetTransports } from '@/config/wagmi';
import { createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { parseEther } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { env, isDev } from '@/env';
import { tokenVestingAbi, tokenVestingAddress } from '@/contracts/generated';
import assert from 'assert';

const contractAddress = tokenVestingAddress[sepolia.id];

export const issueVestingToken = async (address: string) => {
  assert(isDev, 'Not in dev mode');
  assert(env.TESTNET_SIGNER_PRIVATE_KEY?.startsWith('0x'), 'No signer key');

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
