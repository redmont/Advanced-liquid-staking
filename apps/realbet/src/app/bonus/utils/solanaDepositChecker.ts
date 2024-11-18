import { getSolanaAssetMetadata } from './getSolanaTxMetadata';
import { fetchSolTransactions } from './fetchSolTransactions';
import { fetchCoinHistoricalPrice } from './fetchCoinHistoricalPrice';

interface SolanaBaseTransaction {
  from: string;
  to: string;
  amount: number;
  timestamp: string;
}

interface TransactionWithValue extends SolanaBaseTransaction {
  solAmount: number;
  usdValue: number;
  tokenMetadata?: {
    symbol: string;
    decimals: number;
    adjustedAmount: number;
    pricePerToken: number;
  };
}

export const SOL_CASINO_TREASURY_WALLETS = {
  Shuffle: '76iXe9yKFDjGv3HicUVVy8AYxHLC71L1wYa12zaZzHHp',
  RollBit: 'RBHdGVfDfMjfU6iUfCb1LczMJcQLx7hGnxbzRsoDNvx',
  'BC.game': '97UQvPXbadGSsVaGuJCBLRm3Mkm7A5DVJ2HktRzrnDTB',
  Betfury: '2oUVDCMTKKCDHiuMmCgZX6Vq9irR92K2vjxTxQsNNrdS',
} as const;

//Native transfers tx
const solanaNativeTransactions = async (fromAddress: string) => {
  const origin = await fetchSolTransactions(fromAddress);
  return origin.flatMap((txn) => {
    return txn.nativeTransfers
      .filter(
        (transfer) =>
          transfer.toUserAccount !== fromAddress &&
          transfer.fromUserAccount === fromAddress,
      )
      .map((transfer) => ({
        from: transfer.fromUserAccount,
        to: transfer.toUserAccount,
        amount: transfer.amount,
        timestamp: txn.timestamp,
      }));
  });
};

const findNativeTreasury = async (
  fromAddress: string,
  treasuryAddress: string,
) => {
  const alpha = await solanaNativeTransactions(fromAddress);

  const treasuryTransactions = await Promise.all(
    alpha.map(async (txn) => {
      const wallet2 = txn.to;
      const tx = await fetchSolTransactions(wallet2);

      if (!tx) {
        return [];
      }
      return tx.flatMap((txn) => {
        return txn.nativeTransfers
          .filter(
            (transfer) =>
              transfer.toUserAccount === treasuryAddress &&
              transfer.fromUserAccount === wallet2,
          )
          .map((transfer) => ({
            from: transfer.fromUserAccount,
            to: transfer.toUserAccount,
            amount: transfer.amount,
            timestamp: txn.timestamp,
          }));
      });
    }),
  );
  return treasuryTransactions.flat();
};

const traceSolanaDeposits = async (
  fromAddress: string,
  treasuryAddress: string,
) => {
  const mapTxs = await findNativeTreasury(fromAddress, treasuryAddress);

  if (!mapTxs || mapTxs.length === 0) {
    return { deposits: [], totalUsdValue: 0 };
  }

  const deposits = await Promise.all(
    mapTxs.map(async (txn) => {
      if (!txn?.amount) {
        return null;
      }

      const isoString = new Date(
        +txn.timestamp.toString() * 1000,
      ).toISOString();

      const price = await fetchCoinHistoricalPrice({
        symbol: 'SOL',
        time_start: isoString,
      });
      if (!price) {
        return null;
      }

      const solAmount = txn.amount / 10 ** 9;
      const usdValue = solAmount * price;

      return {
        ...txn,
        price,
        solAmount,
        usdValue,
        timestamp: String(txn.timestamp),
      };
    }),
  );

  const validDeposits = deposits.filter(Boolean) as TransactionWithValue[];

  const totalUsdValue = validDeposits.reduce(
    (acc, txn) => acc + txn.usdValue,
    0,
  );
  return { deposits: validDeposits, totalUsdValue };
};

//SPL token transfers
const solanaSplTransactions = async (fromAddress: string) => {
  const origin = await fetchSolTransactions(fromAddress);

  return origin.flatMap((txn) => {
    return txn.tokenTransfers
      .filter(
        (transfer) =>
          transfer.toUserAccount !== fromAddress &&
          transfer.tokenStandard === 'Fungible' &&
          transfer.fromUserAccount === fromAddress,
      )
      .map((transfer) => ({
        from: transfer.fromUserAccount,
        to: transfer.toUserAccount,
        amount: transfer.tokenAmount,
        timestamp: txn.timestamp,
        mint: transfer.mint,
      }));
  });
};

const findSPLTreasury = async (
  fromAddress: string,
  treasuryAddress: string,
) => {
  const alpha = await solanaSplTransactions(fromAddress);

  if (!alpha || alpha.length === 0) {
    return [];
  }

  const mapTxs = await Promise.all(
    alpha.map(async (txn) => {
      const wallet2 = txn.to;
      const tx = await fetchSolTransactions(wallet2);

      if (!tx) {
        return [];
      }
      return tx.flatMap((txn) => {
        return txn.tokenTransfers
          .filter(
            (transfer) =>
              transfer.toUserAccount === treasuryAddress &&
              transfer.fromUserAccount === wallet2,
          )
          .map((transfer) => ({
            from: transfer.fromUserAccount,
            to: transfer.toUserAccount,
            amount: transfer.tokenAmount,
            timestamp: txn.timestamp,
            mint: transfer.mint,
          }));
      });
    }),
  );

  return mapTxs.flat();
};

const traceSPLDeposits = async (
  fromAddress: string,
  treasuryAddress: string,
) => {
  const mapTxs = await findSPLTreasury(fromAddress, treasuryAddress);

  if (!mapTxs || mapTxs.length === 0) {
    return { deposits: [], totalUsdValue: 0 };
  }

  const resolvedTxs = await Promise.all(mapTxs);

  const deposits = await Promise.all(
    resolvedTxs.flat().map(async (txn) => {
      if (!txn?.mint || !txn.amount) {
        return null;
      }

      const tokenMetadata = await getSolanaAssetMetadata(String(txn.mint));
      if (!tokenMetadata?.priceInfo) {
        return null;
      }

      const { pricePerToken } = tokenMetadata.priceInfo;
      const usdValue = (txn.amount ?? 0) * pricePerToken;

      return {
        ...txn,
        price: pricePerToken,
        usdValue,
        amountInTokens: txn.amount,
      };
    }),
  );

  const validDeposits = deposits.filter(
    (deposit): deposit is NonNullable<typeof deposit> => Boolean(deposit),
  );

  const totalUsdValue = validDeposits.reduce(
    (acc, txn) => acc + txn.usdValue,
    0,
  );

  return { deposits: validDeposits, totalUsdValue };
};

export const solTraceAllDeposits = async (
  userWallet: string,
): Promise<Record<string, { deposited: number }>> => {
  const casinoDepositPromises = Object.keys(SOL_CASINO_TREASURY_WALLETS).map(
    async (casino) => {
      const treasuryWallet =
        SOL_CASINO_TREASURY_WALLETS[
          casino as keyof typeof SOL_CASINO_TREASURY_WALLETS
        ];

      const [solDeposits, splDeposits] = await Promise.all([
        traceSolanaDeposits(userWallet, treasuryWallet),
        traceSPLDeposits(userWallet, treasuryWallet),
      ]);

      const combinedUsdValue =
        solDeposits.totalUsdValue + splDeposits.totalUsdValue;

      return {
        casino,
        deposited: combinedUsdValue,
      };
    },
  );

  const results = await Promise.all(casinoDepositPromises);

  return results.reduce(
    (acc, { casino, deposited }) => ({
      ...acc,
      [casino]: { deposited },
    }),
    {} as Record<string, { deposited: number }>,
  );
};
