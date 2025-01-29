import { z } from 'zod';

export const EventTypeEnum = z.enum([
  'ping',
  'user.created',
  'user.updated',
  'user.deleted',
  'user.passkeyRecovery.started',
  'user.passkeyRecovery.completed',
  'user.session.created',
  'user.session.revoked',
  'user.social.linked',
  'user.social.unlinked',
  'wallet.created',
  'wallet.linked',
  'wallet.unlinked',
  'wallet.exported',
  'wallet.transferred',
  'visit.created',
]);

export const TestEventSchema = z.object({
  eventName: z.literal('ping'),
});

export const WalletTransferredEventSchema = z.object({
  eventName: z.literal('wallet.transferred'),
  eventId: z.string().uuid(),
  webhookId: z.string().uuid(),
  environmentId: z.string().uuid(),
  data: z.object({
    publicKey: z.string(),
    chain: z.string(),
    userId: z.string().uuid(),
    walletAdditionalAddresses: z.array(z.unknown()), // TODO: define
  }),
  environmentName: z.string(),
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid timestamp',
  }),
});

export const UserDeletedEventSchema = z.object({
  eventName: z.literal('user.deleted'),
  eventId: z.string().uuid(),
  webhookId: z.string().uuid(),
  environmentId: z.string().uuid(),
  data: z.object({
    deletedReason: z.string().nullable(),
    deletedById: z.string().uuid().nullable(),
    id: z.string().uuid(),
    email: z.string().nullable(),
    deletedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid timestamp for deletedAt',
    }),
    phoneNumber: z.string().nullable(),
    username: z.string().nullable(),
  }),
  environmentName: z.string(),
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid timestamp',
  }),
});

export const UserCreatedEventSchema = z.object({
  eventName: z.literal('user.created'),
  eventId: z.string().uuid(),
  webhookId: z.string().uuid(),
  environmentId: z.string().uuid(),
  data: z.object({
    projectEnvironmentId: z.string().uuid(),
    newUser: z.boolean(),
    verifiedCredentials: z.array(
      z.object({
        chain: z.string(),
        address: z.string(),
        walletName: z.string(),
        format: z.string(),
        id: z.string().uuid(),
      }),
    ),
    id: z.string().uuid(),
    sessionId: z.string().uuid(),
    firstVisit: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid timestamp for firstVisit',
    }),
  }),
  environmentName: z.string(),
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid timestamp',
  }),
});

export const WalletLinkedEventSchema = z.object({
  eventName: z.literal('wallet.linked'),
  eventId: z.string().uuid(),
  webhookId: z.string().uuid(),
  environmentId: z.string().uuid(),
  data: z.object({
    chain: z.string(),
    publicKey: z.string(),
    userId: z.string().uuid(),
    createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid timestamp for createdAt',
    }),
    name: z.string(),
    id: z.string().uuid(),
  }),
  environmentName: z.string(),
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid timestamp',
  }),
});
