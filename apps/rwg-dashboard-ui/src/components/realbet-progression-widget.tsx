import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCasinoLink } from '@/hooks/useCasinoLink';
import { useRealbetProgression } from '@/hooks/useRealbetProgression';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import RealbetVipTiersModal from './modals/RealbetVipTiersModal';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';

const RealbetProgressionWidget = () => {
  const progression = useRealbetProgression();
  const link = useCasinoLink();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="">
          <span className="h-8">
            <Link
              target="_blank"
              href="https://realbet.io"
              className="text-primary underline"
            >
              REALBET.IO
            </Link>{' '}
            Reward Tiers
          </span>
          {link.isSuccess && link.data?.realbetUsername && (
            <>
              <span className="inline-block w-12" />
              <span className="inline-block h-8 text-lg">
                {link.data.realbetUsername}{' '}
                <span className="text-primary">
                  Linked <Check className="mb-1 inline-block size-6" />
                </span>
              </span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-destructive">{progression.error?.message}</p>
        <div className="flex gap-3">
          <div className="shrink-0">
            {!progression.isSuccess && !progression.error ? (
              <Skeleton className="size-24" />
            ) : (
              <img
                className="w-24"
                alt={`Level icon for the ${progression.data?.level.data?.levelName} tier`}
                src={progression.data?.level.data?.levelIcon}
              />
            )}
          </div>
          <div className="w-full justify-between">
            <div className="flex justify-between">
              <h2 className="mb-1.5 leading-none">
                <RealbetVipTiersModal
                  currentRank={progression.data?.level.data?.vipLevel}
                >
                  <button className="hover:text-primary active:text-primary">
                    VIP Status
                    <QuestionMarkCircledIcon className="ml-1 inline-block" />
                  </button>
                </RealbetVipTiersModal>
              </h2>
              <p className="text-sm">
                {!progression.isSuccess && !progression.error ? (
                  <Skeleton className="inline-block h-3 w-24" />
                ) : (
                  <>
                    $
                    {progression.data?.level.data?.currentWager.toLocaleString()}{' '}
                    / $
                    {progression.data?.level.data?.nextLevelWager.toLocaleString()}
                  </>
                )}
              </p>
            </div>
            <Progress
              variant="accent"
              value={(progression.data?.level.data?.percentage ?? 0) * 100}
            />
            <div className="mt-1 flex justify-between">
              {!progression.isSuccess && !progression.error ? (
                <>
                  <Skeleton className="mt-0.5 inline-block h-3 w-24" />
                  <Skeleton className="mt-0.5 inline-block h-3 w-24" />
                </>
              ) : (
                <>
                  <p className="text-sm">
                    {progression.data?.level.data?.levelName} |{' '}
                    {(
                      (progression.data?.level.vipTier?.cashback ?? 0) * 100
                    ).toFixed(0)}
                    % Cashback
                  </p>
                  {progression.data?.level.nextVipTier && (
                    <p className="text-sm">
                      {progression.data?.level.nextVipTier?.name}% |{' '}
                      {(
                        (progression.data?.level.nextVipTier?.cashback ?? 0) *
                        100
                      ).toFixed(0)}
                      % Cashback
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealbetProgressionWidget;
