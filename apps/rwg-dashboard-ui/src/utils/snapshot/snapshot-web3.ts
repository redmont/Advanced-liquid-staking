import type { TypedData, TypedDataDomain, WalletClient } from 'viem';

export type PrimaryType = 'Vote' | 'Proposal';

export const getSnapshotWeb3 = (
  walletClient: WalletClient,
  primaryType: PrimaryType,
) => ({
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
});
