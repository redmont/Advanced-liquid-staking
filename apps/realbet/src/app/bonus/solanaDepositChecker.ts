import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';
import { getSolanaAssetMetadata } from './utils/getSolanaTxMetadata';

interface SolanaBaseTransaction {
  from: string;
  to: string;
  amount: number;
  timestamp: string;
}

interface SolanaSRCTxn extends SolanaBaseTransaction {
  mint: string;
  toUserAccount: string;
  tokenStandard: string;
  fromUserAccount: string;
  tokenAmount: string;
}

interface Transaction {
  timestamp: string;
  tokenTransfers: SolanaSRCTxn[];
  nativeTransfers: {
    toUserAccount: string;
    fromUserAccount: string;
    amount: number;
  }[];
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

const CoinDataResponseSchema = z.object({
  data: z.record(
    z.array(
      z.object({
        quotes: z.array(
          z.object({
            quote: z.object({
              USD: z.object({
                price: z.number(),
              }),
            }),
          }),
        ),
      }),
    ),
  ),
});

export const SHUFFLE_SOL_TREASURY_WALLET =
  '76iXe9yKFDjGv3HicUVVy8AYxHLC71L1wYa12zaZzHHp';

export const ROLLBIT_SOL_TREASURY_WALLET =
  'RBHdGVfDfMjfU6iUfCb1LczMJcQLx7hGnxbzRsoDNvx';

export const BCGAME_SOL_TREASURY_WALLET =
  '97UQvPXbadGSsVaGuJCBLRm3Mkm7A5DVJ2HktRzrnDTB';

export const BETFURY_SOL_TREASURY_WALLET =
  '2oUVDCMTKKCDHiuMmCgZX6Vq9irR92K2vjxTxQsNNrdS';

export type Casinos = 'shuffle' | 'rollbit' | 'bcgame' | 'betfury';

const Cas = ['shuffle', 'rollbit', 'bcgame', 'betfury'] as const;

export const getSolCasinoTreasuryWallet = (casino: Casinos) => {
  switch (casino) {
    case 'shuffle':
      return SHUFFLE_SOL_TREASURY_WALLET;
    case 'rollbit':
      return ROLLBIT_SOL_TREASURY_WALLET;
    case 'bcgame':
      return BCGAME_SOL_TREASURY_WALLET;
    case 'betfury':
      return BETFURY_SOL_TREASURY_WALLET;
    default:
      return SHUFFLE_SOL_TREASURY_WALLET;
  }
};

const GetHistoricalPriceAtTime = (symbol: string, timestamp: string) => {
  const isoString = new Date(+timestamp * 1000).toISOString();
  const params = new URLSearchParams({
    symbol: symbol,
    time_start: isoString,
    count: '1',
    convert: 'USD',
  });

  const { data }: { data?: number } = useQuery({
    queryKey: ['price', timestamp, symbol],
    queryFn: async () => {
      const response = await fetch(`/api/coinHistoricalData?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const res = CoinDataResponseSchema.parse(await response.json());
      const quotes = res.data[symbol]?.[0]?.quotes;
      if (quotes && quotes.length > 0) {
        const price = quotes[0]?.quote.USD.price;
        return price;
      }
    },
    enabled: Boolean(timestamp),
  });

  if (data) {
    return data;
  }
};

const FetchAllTransactions = (fromAddress: string) => {
  const { data }: { data?: Transaction[] } = useQuery({
    queryKey: ['address', fromAddress],
    queryFn: async () => {
      const response = await fetch('/api/solanaTx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromAddress: fromAddress,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const res = (await response.json()) as Promise<Transaction[]>;
      return res;
    },
    enabled: fromAddress !== '',
  });

  return data;
};

//Native transfers tx
const SolanaNativeTransactions = (fromAddress: string) => {
  const origin = FetchAllTransactions(fromAddress);

  if (origin) {
    const alpha = origin.flatMap((txn: Transaction) => {
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
    return alpha;
  }
};

const FindNativeTreasury = (
  fromAddress: string,
  treasuryAddress: string,
) => {
  const alpha = SolanaNativeTransactions(fromAddress);

  if (alpha !== undefined) {
    const treasuryTxns = alpha.flatMap((txn) => {
      const wallet2 = txn.to;
      const tx = FetchAllTransactions(txn.to);

      if (!tx) {
        return [];
      }
      if (tx) {
        return tx.flatMap((txn: Transaction) => {
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
      }
    });
    return treasuryTxns;
  }
};

const TraceSolanaDeposits = (fromAddress: string, treasuryAddress: string) => {
  const mapTxs = FindNativeTreasury(fromAddress, treasuryAddress);

  if (!mapTxs) {
    return { deposits: [], totalUsdValue: 0 };
  }

  const deposits = mapTxs
    .map((txn) => {
      const price = GetHistoricalPriceAtTime('SOL', txn?.timestamp ?? '');

      if (!price) {
        return null;
      }

      if (!txn) {
        return null;
      }

      const solAmount = txn?.amount / 10 ** 9;
      const usdValue = solAmount * price;

      return {
        ...txn,
        price,
        solAmount,
        usdValue,
      } as TransactionWithValue;
    })
    .filter(Boolean) as TransactionWithValue[];
  const totalUsdValue = deposits.reduce((acc, txn) => acc + txn.usdValue, 0);

  return { deposits, totalUsdValue };
};

//SPL token transfers
const SolanaSrc20Transactions = (fromAddress: string) => {
  const origin = FetchAllTransactions(fromAddress);

  if (origin) {
    const beta = origin.flatMap((txn: Transaction) => {
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
    return beta;
  }
};

const FindSPLTreasury = (fromAddress: string, treasuryAddress: string) => {
  const alpha = SolanaSrc20Transactions(fromAddress);

  if (alpha !== undefined) {
    const treasuryTxns = alpha.flatMap((txn) => {
      const wallet2 = txn.to;
      const tx = FetchAllTransactions(txn.to);

      if (!tx) {
        return [];
      }
      if (tx) {
        return tx.flatMap((txn: Transaction) => {
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
      }
    });
    return treasuryTxns;
  }
};

const TraceSPLDeposits = (fromAddress: string, treasuryAddress: string) => {
  const mapTxs = FindSPLTreasury(fromAddress, treasuryAddress);

  if (!mapTxs) {
    return { deposits: [], totalUsdValue: 0 };
  }

  const deposits = mapTxs
    .map((txn) => {
      if (!txn) {
        return null;
      }
      const tokenMetadata = GetSolanaTokenMetadata(txn.mint);

      if (!tokenMetadata) {
        return null;
      }

      const { pricePerToken } = tokenMetadata.priceInfo;
      const usdValue = +txn.amount * pricePerToken;

      return {
        ...txn,
        price: pricePerToken,
        usdValue,
      };
    })
    .filter(Boolean) as Array<{
    from: string;
    to: string;
    amount: number;
    timestamp: number;
    mint: string;
    price: number;
    amountInTokens: number;
    usdValue: number;
  } | null>;
  const totalUsdValue = deposits.reduce(
    (acc, txn) => acc + (txn?.usdValue ?? 1),
    0,
  );

  return { deposits, totalUsdValue };
};

export const GetSolanaTokenMetadata = (mintAddress: string) => {
  const { data } = useQuery({
    queryKey: ['tokenMetadata', mintAddress],
    queryFn: async () => getSolanaAssetMetadata(mintAddress),
    enabled: Boolean(mintAddress),
    staleTime: 5 * 60 * 1000,
  });

  return data;
};

export const SolTraceAllDeposits = (userWallet: string) => {
  return Cas.map((casino) => {
    const treasuryWallet = getSolCasinoTreasuryWallet(casino);
    const solDeposits = TraceSolanaDeposits(userWallet, treasuryWallet);
    const splDeposits = TraceSPLDeposits(userWallet, treasuryWallet);
    const combinedUsdValue =
      solDeposits.totalUsdValue + splDeposits.totalUsdValue;

    return { casino, usdDeposit: combinedUsdValue };
  });
};

export const useSolsDeposits = () => {
  const userWalletAddresses = useWalletAddresses();
  const nonEvmAddresses = useMemo(
    () => userWalletAddresses.filter((addr) => !addr.startsWith('0x')),
    [userWalletAddresses],
  );
  if (nonEvmAddresses.length === 0) {
    return [];
  }

  return nonEvmAddresses.flatMap((address) => SolTraceAllDeposits(address));
};
