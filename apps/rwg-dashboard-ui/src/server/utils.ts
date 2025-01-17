import { type CasinoDepositTotal } from '@prisma/client';

export const calculateDepositsScore = (deposits: CasinoDepositTotal[]) =>
  deposits.reduce(
    (acc, t) => acc + Math.floor(Number(t.amount) / 100) * 100,
    deposits?.length > 0 ? 100 : 0,
  );
