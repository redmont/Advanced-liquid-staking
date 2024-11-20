import { getSolanaAssetMetadata } from './getSolanaTxMetadata';
import { fetchSolTransactions } from './fetchSolTransactions';
import { fetchCoinHistoricalPrice } from './fetchCoinHistoricalPrice';
import { type ArrayElementType } from '@/utils';
import { solanaCasinos } from '@/config/walletChecker';

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

  type Deposit = NonNullable<ArrayElementType<typeof deposits>>;
  const validDeposits = deposits.filter((dep): dep is Deposit => !!dep);

  const totalUsdValue = validDeposits.reduce(
    (acc, txn) => acc + txn.usdValue,
    0,
  );
  return { deposits: validDeposits, totalUsdValue };
};

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
  const casinoDepositPromises = solanaCasinos.map(async (casino) => {
    const [solDeposits, splDeposits] = await Promise.all([
      traceSolanaDeposits(userWallet, casino.treasury),
      traceSPLDeposits(userWallet, casino.treasury),
    ]);

    const combinedUsdValue =
      solDeposits.totalUsdValue + splDeposits.totalUsdValue;

    return {
      casino,
      deposited: combinedUsdValue,
    };
  });

  const results = await Promise.all(casinoDepositPromises);

  return results.reduce(
    (acc, { casino, deposited }) => ({
      ...acc,
      [casino.name]: { deposited },
    }),
    {} as Record<string, { deposited: number }>,
  );
};
