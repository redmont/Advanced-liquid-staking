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

export const EventSchema = z.object({
  eventId: z.string().uuid(),
  webhookId: z.string().uuid(),
  environmentId: z.string().uuid(),
  data: z.unknown(),
  environmentName: z.string(),
  messageId: z.string().uuid(),
  eventName: z.string(),
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid timestamp',
  }),
});
