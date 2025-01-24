import { isDev } from '@/env';

export const snapshotApiUrl = isDev
  ? 'https://testnet.hub.snapshot.org'
  : 'https://hub.snapshot.org';
