'use client';

import useMemeCoinTracking from '@/hooks/useMemeCoinTracking';

export default function TestPage() {
  const { progress, interactions, errors } = useMemeCoinTracking();
  return (
    <div className="space-y-8 p-3 sm:p-5">
      {JSON.stringify({ errors, progress, interactions })}
    </div>
  );
}
