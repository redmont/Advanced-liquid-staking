export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { env, isDev } from '@/env';
import { getSnapshotWeb3 } from '@/utils/snapshot/snapshot-web3';
import { privateKeyToAccount } from 'viem/accounts';
import snapshot from '@snapshot-labs/snapshot.js';
import { tokenStakingConfig } from '@/contracts/generated';
import { getNearestBlockForTimestamp } from '@/utils/getNearestBlockForTimestamp';
import { NextResponse } from 'next/server';
import {
  getProposals,
  ProposalFrontMatterSchema,
} from '@/utils/snapshot/snapshot-api';
import matter from 'gray-matter';
import { mainnet, sepolia } from 'viem/chains';
import { getPublicClient } from '@wagmi/core';
import wagmiConfig, {
  mainnetTransports,
  testnetTransports,
} from '@/config/wagmi';
import { createWalletClient } from 'viem';
import { snapshotApiUrl } from '@/config/snapshot';
import type { NextRequest } from 'next/server';
import { checkCronJobAuth } from '@/utils/checkCronJobAuth';

const chain = isDev ? sepolia : mainnet;
const transport = isDev
  ? testnetTransports[sepolia.id]
  : mainnetTransports[mainnet.id];
const contractAddress = tokenStakingConfig.address[chain.id];

const snapshotSpace = env.NEXT_PUBLIC_SNAPSHOT_SPACE;
const client = new snapshot.Client712(snapshotApiUrl);

export async function GET(request: NextRequest) {
  if (!checkCronJobAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const account = privateKeyToAccount(
    env.TESTNET_SIGNER_PRIVATE_KEY! as `0x${string}`,
  );

  const walletClient = createWalletClient({
    transport,
    account,
  });

  const publicClient = getPublicClient(wagmiConfig);
  if (!publicClient) {
    throw new Error('Public client not found');
  }

  if (!contractAddress) {
    throw new Error('Contract address not found');
  }

  const [epochDuration, epochStartTime, currentEpoch] = await Promise.all([
    publicClient.readContract({
      abi: tokenStakingConfig.abi,
      address: contractAddress,
      functionName: 'epochDuration',
    }),
    publicClient.readContract({
      abi: tokenStakingConfig.abi,
      address: contractAddress,
      functionName: 'epochStartTime',
    }),
    publicClient.readContract({
      abi: tokenStakingConfig.abi,
      address: contractAddress,
      functionName: 'getCurrentEpoch',
    }),
  ]);

  const epoch = Number(currentEpoch);

  // Get latest proposal
  const proposals = await getProposals({
    space: env.NEXT_PUBLIC_SNAPSHOT_SPACE,
    first: 1,
    skip: 0,
  });

  let proposalExists = false;
  if (proposals.length > 0 && proposals[0]) {
    const proposal = proposals[0];
    const frontMatter = ProposalFrontMatterSchema.safeParse(
      matter(proposal.body),
    );
    if (frontMatter.success) {
      if (frontMatter.data.data.epoch === epoch) {
        proposalExists = true;
      }
    }
  }

  if (proposalExists) {
    return NextResponse.json({
      success: true,
      outcome: 'Proposal already exists',
    });
  }

  const startTime =
    Number(epochStartTime) + (epoch - 1) * Number(epochDuration);
  const endTime = startTime + Number(epochDuration);
  const blockNumber = await getNearestBlockForTimestamp(
    publicClient,
    startTime,
  );

  const web3 = getSnapshotWeb3(walletClient, 'Proposal');

  await client.proposal(web3, account.address, {
    from: account.address,
    space: snapshotSpace,
    timestamp: Math.floor(new Date().getTime() / 1000),
    title: `Epoch ${epoch} proposal`,
    body: `---
epoch: ${epoch}
---


Epoch ${epoch} proposal body`,
    discussion: '',
    choices: ['Yes', 'No'],
    labels: [],
    type: 'single-choice',
    start: startTime,
    end: endTime,
    plugins: JSON.stringify({}),
    app: 'RWG Dashboard',
    snapshot: blockNumber,
  });

  return NextResponse.json({
    success: true,
  });
}
