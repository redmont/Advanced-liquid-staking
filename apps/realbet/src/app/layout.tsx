import '@/styles/globals.css';

import { type Metadata } from 'next';
import Providers from '../providers';
import Navbar from '../components/navbar';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'RealBet.io',
  description: 'Games for the real world',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background">
        <Providers>
          <main className="flex min-h-screen max-w-full flex-col overflow-hidden lg:flex-row">
            <Navbar className="shrink-0 lg:w-64" />
            <div className="flex grow flex-col pt-20 lg:pt-0">
              <Suspense
                fallback={
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="animate-pulse py-16 font-monoline text-4xl text-accent xl:text-5xl">
                      Loading...
                    </div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
