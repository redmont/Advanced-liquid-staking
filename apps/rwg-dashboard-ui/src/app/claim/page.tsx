'use client';

import ClaimWarningModal from '@/components/modals/ClaimWarningModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useClaimableAmount } from '@/hooks/useClaimableAmount';
import { useToken } from '@/hooks/useToken';
import { formatBalance } from '@/utils';
import { HandCoins } from 'lucide-react';

const ClaimPage = () => {
  const claimableAmount = useClaimableAmount();
  const token = useToken();

  return (
    <div className="space-y-8 p-3 sm:p-5">
      <div>
        <h2 className="mb-3 text-[2rem] font-medium">
          <HandCoins className="mb-1 inline size-9" /> Claim
        </h2>
        <p className="mb-4 text-xl font-medium leading-tight text-white/80">
          Claim your tokens from the public sale here.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-normal">
              Claimable Public Sale Tokens
            </CardTitle>
            <ClaimWarningModal
              amount={claimableAmount.data?.total ?? 0n}
              // eslint-disable-next-line no-console
              onConfirm={() => console.log('confirm')}
            >
              <Button loading={claimableAmount.isLoading}>Claim</Button>
            </ClaimWarningModal>
          </div>
        </CardHeader>
        <CardContent>
          {claimableAmount.isLoading || token.isLoading ? (
            <>
              <Skeleton className="mb-4 h-6 w-full rounded-full" />
              <Skeleton className="h-6 w-full rounded-full" />
            </>
          ) : (
            <div>
              <div className="flex justify-between">
                <h3 className="mb-2 text-lg">Purchased Amount</h3>
                <h3 className="mb-2 text-right text-xl font-medium">
                  {formatBalance(claimableAmount.data?.claimable ?? 0n, 18)}{' '}
                  <span className="text-lg font-bold text-muted">
                    {token.symbol}
                  </span>
                </h3>
              </div>
              <div className="flex justify-between">
                <h3 className="mb-2 text-lg">
                  Bonus Amount ({claimableAmount.data?.bonusPercent}%)
                </h3>
                <h3 className="mb-2 text-right text-xl font-medium">
                  {formatBalance(claimableAmount.data?.bonus ?? 0n, 18)}{' '}
                  <span className="text-lg font-bold text-muted">
                    {token.symbol}
                  </span>
                </h3>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimPage;
