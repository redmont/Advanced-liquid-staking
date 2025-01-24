export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { tokenStakingConfig } from '@/contracts/generated';
import { env, isDev } from '@/env';
import { privateKeyToAccount } from 'viem/accounts';
import { type NextRequest, NextResponse } from 'next/server';
import { setStakingEpochMerkleTree } from '@/server/actions/staking/setStakingEpochMerkleTree';
import {
  getProposals,
  ProposalFrontMatterSchema,
} from '@/utils/snapshot/snapshot-api';
import matter from 'gray-matter';
import { mainnet, sepolia } from 'viem/chains';
import { getPublicClient, readContract } from '@wagmi/core';
import { createWalletClient } from 'viem';
import wagmiConfig, {
  mainnetTransports,
  testnetTransports,
} from '@/config/wagmi';
import { checkCronJobAuth } from '@/utils/checkCronJobAuth';

const voidEpochMerkleRoot =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const chain = isDev ? sepolia : mainnet;
const transport = isDev
  ? testnetTransports[sepolia.id]
  : mainnetTransports[mainnet.id];
const snapshotSpace = env.NEXT_PUBLIC_SNAPSHOT_SPACE;
const contractAddress = tokenStakingConfig.address[chain.id];

export async function GET(request: NextRequest) {
  if (!checkCronJobAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get epoch from query string
  const epoch = Number(new URL(request.url).searchParams.get('epoch'));

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

  const currentEpoch = await readContract(wagmiConfig, {
    abi: tokenStakingConfig.abi,
    address: contractAddress,
    functionName: 'getCurrentEpoch',
  });

  const previousEpoch = epoch === 0 ? currentEpoch - 1n : BigInt(epoch);

  const epochMerkleRoot = await readContract(wagmiConfig, {
    abi: tokenStakingConfig.abi,
    address: contractAddress,
    functionName: 'epochMerkleRoots',
    args: [previousEpoch],
  });

  if (epochMerkleRoot !== voidEpochMerkleRoot) {
    return NextResponse.json({
      success: true,
      outcome: 'Merkle root already set',
    });
  }

  const proposals = await getProposals({
    space: snapshotSpace,
    first: 5,
    skip: 0,
  });

  const proposalsWithFrontMatter = proposals.map((proposal) => ({
    ...proposal,
    frontMatter: ProposalFrontMatterSchema.safeParse(matter(proposal.body)),
  }));

  const epochProposal = proposalsWithFrontMatter.find(
    (proposal) =>
      proposal.frontMatter.success &&
      proposal.frontMatter.data.data.epoch === Number(previousEpoch),
  );

  if (!epochProposal) {
    return NextResponse.json({
      success: false,
      outcome: 'Proposal not found',
    });
  }

  if (epochProposal.votes < 2) {
    return NextResponse.json({
      success: false,
      outcome: 'Proposal has insufficient votes',
    });
  }

  const proposalId = epochProposal.id;

  const root = await setStakingEpochMerkleTree(
    proposalId,
    Number(previousEpoch),
  );

  const txHash = await walletClient.writeContract({
    chain,
    abi: tokenStakingConfig.abi,
    address: contractAddress,
    functionName: 'setMerkleRoot',
    args: [previousEpoch, root],
  });

  return NextResponse.json({
    success: true,
    txHash,
  });
}
