'use client';

import ErrorComponent from '@/components/error';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="relative min-h-screen">
          <ErrorComponent className="absolute" />
        </div>
      </body>
    </html>
  );
}
