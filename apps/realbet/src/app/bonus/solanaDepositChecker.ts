import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

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

// interface TokenPriceInfo {
//   price_per_token: number;
//   currency: string;
// }

// interface TokenMetadata {
//   symbol: string;
//   supply: number;
//   decimals: number;
//   token_program: string;
//   price_info: TokenPriceInfo;
// }

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

export const useHistoricalPriceAtTime = (symbol: string, timestamp: string) => {
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

export const useFetchAllTransactions = (fromAddress: string) => {
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
const useSolanaNativeTransactions = (fromAddress: string) => {
  const origin = useFetchAllTransactions(fromAddress);

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
    }) as SolanaSRCTxn[];

    return alpha;
  }
};

const useFindNativeTreasury = (
  fromAddress: string,
  treasuryAddress: string,
) => {
  const alpha = useSolanaNativeTransactions(fromAddress);

  if (alpha !== undefined) {
    const treasuryTxns = alpha.flatMap((txn: SolanaSRCTxn) => {
      const wallet2 = txn.to;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const tx = useFetchAllTransactions(txn.to);

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

export const useTraceSolanaDeposits = (
  fromAddress: string,
  treasuryAddress: string,
) => {
  const mapTxs = useFindNativeTreasury(fromAddress, treasuryAddress);

  if (!mapTxs) {
    return { deposits: [], totalUsdValue: 0 };
  }

  const deposits = mapTxs
    .map((txn) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const price = useHistoricalPriceAtTime('SOL', txn?.timestamp ?? '');

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

//src-20 transfers
export const useSolanaSrc20Transactions = (fromAddress: string) => {
  const origin = useFetchAllTransactions(fromAddress);

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

  return origin;
};

// const useTokenMetadata = (mintAddress: string) => {
//   return useQuery({
//     queryKey: ['tokenMetadata', mintAddress],
//     queryFn: async () => {
//       const response = await fetch('/api/splMetadata', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ mintAddress }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch metadata for token ${mintAddress}`);
//       }

//       return response.json() as Promise<TokenMetadata>;
//     },
//     enabled: Boolean(mintAddress),
//     staleTime: 5 * 60 * 1000,
//   });
// };
