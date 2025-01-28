import type { TypedData, TypedDataDomain, WalletClient } from 'viem';
import snapshot from '@snapshot-labs/snapshot.js';

export type PrimaryType = 'Vote' | 'Proposal';

type Web3Provider = Parameters<typeof snapshot.Client.prototype.sign>[0];

export const getSnapshotWeb3 = (
  walletClient: WalletClient,
  primaryType: PrimaryType,
) =>
  ({
    getSigner: () => {
      return {
        _signTypedData: (
          domain: TypedDataDomain,
          types: TypedData,
          message: Record<string, unknown>,
        ) => {
          return walletClient.signTypedData({
            account: walletClient.account!,
            domain,
            types,
            message,
            primaryType,
          });
        },
      };
    },

    // this is supposed to be of an ethers.js type
    // but we're using viem, so we have to perform this cast
  }) as unknown as Web3Provider;
