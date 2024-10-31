import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

interface SolanaOriTxn {
  from: string;
  to: string;
  amount: number;
  timestamp: string;
}

interface SolanaSRCTxn {
  from: string;
  to: string;
  amount: number;
  timestamp: string;
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

interface TransactionWithValue {
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  solAmount: number;
  usdValue: number;
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

export const FetchAllTransactions = (fromAddress: string) => {
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const res = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return res;
    },
    enabled: fromAddress !== '',
  });

  return data;
};

//Native transfers tx
export const useSolanaNativeTransactions = (fromAddress: string) => {
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
    }) as SolanaOriTxn[];

    return alpha;
  }
};

export const useFindNativeTreasury = (
  fromAddress: string,
  treasuryAddress: string,
) => {
  const alpha = useSolanaNativeTransactions(fromAddress);

  if (alpha !== undefined) {
    const treasuryTxns = alpha.map((txn: SolanaOriTxn) => {
      const wallet2 = txn.to;
      const tx = FetchAllTransactions(txn.to);

      if (tx) {
        const alpha: SolanaOriTxn[] = tx.flatMap((txn: Transaction) => {
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
        }) as SolanaOriTxn[];

        return alpha;
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

  if (mapTxs !== undefined) {
    const Deposits = mapTxs.flatMap((txn) => {
      return txn?.map((innerTxn: SolanaOriTxn) => {
        const price: number | undefined = useHistoricalPriceAtTime('SOL', innerTxn.timestamp);

        if (price) {
          const solAmount = innerTxn.amount / 10 ** 9;
          const usdValue = solAmount * price;
          return {
            ...innerTxn,
            solAmount,
            usdValue,
          } as TransactionWithValue;
        }
        return null;
      });
    });
    return Deposits;
  }
};

//src-20 transfers
export const useSolanaSrc20Transactions = (fromAddress: string) => {
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

  return origin;
};

export const useHistoricalPriceAtTime = (symbol: string, timestamp: string) => {
  const params = new URLSearchParams({
    symbol: symbol,
    time_start: timestamp,
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
    enabled: timestamp !== '',
  });

  if (data) {
    return data;
  }
};
