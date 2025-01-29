import { env } from '@/env';
import * as crypto from 'crypto';
import { type z } from 'zod';
import {
  EventsSchema,
  type TestEventSchema,
  type UserCreatedEventSchema,
  type UserUpdatedEventSchema,
  type UserDeletedEventSchema,
  type WalletCreatedEventSchema,
  type WalletLinkedEventSchema,
  type WalletUnlinkedEventSchema,
} from './schemas';
import { upsertDynamicUser } from '@/server/clientUnsafe/upsertDynamicUser';
import prisma from '@/server/prisma/client';

const verifySignature = ({
  secret,
  signature,
  payload,
}: {
  secret: string;
  signature: string;
  payload: string;
}) => {
  const payloadSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  const trusted = Buffer.from(`sha256=${payloadSignature}`, 'ascii');
  const untrusted = Buffer.from(signature, 'ascii');
  return crypto.timingSafeEqual(trusted, untrusted);
};

const handlePingEvent = (_event: z.infer<typeof TestEventSchema>) =>
  Response.json({
    message: 'pong',
  });

const handleUserCreatedEvent = async (
  event: z.infer<typeof UserCreatedEventSchema>,
) => {
  await upsertDynamicUser({
    id: event.userId,
    email: event.data.email,
    wallets: event.data.verifiedCredentials.map((vc) => ({
      chain: vc.chain,
      address: vc.address,
      name: vc.walletName,
      id: vc.id,
    })),
  });

  return Response.json({
    success: true,
    message: 'User created event processed',
  });
};

const handleUserUpdatedEvent = async (
  event: z.infer<typeof UserUpdatedEventSchema>,
) => {
  await upsertDynamicUser({
    id: event.userId,
    username: event.data.username,
    wallets: event.data.verifiedCredentials.map((vc) => ({
      chain: vc.chain,
      address: vc.address,
      name: vc.walletName,
      id: vc.id,
    })),
  });

  return Response.json({
    success: true,
    message: 'User updated event processed',
  });
};
// Logic for handling 'user.updated' event

const handleUserDeletedEvent = async (
  event: z.infer<typeof UserDeletedEventSchema>,
) => {
  await prisma.dynamicUser.update({
    where: {
      id: event.userId,
    },
    data: {
      deleted: true,
    },
  });
  return Response.json({
    success: true,
    message: 'User deleted event processed',
  });
};

const handleWalletCreatedEvent = async (
  event: z.infer<typeof WalletCreatedEventSchema>,
) => {
  await upsertDynamicUser(
    {
      id: event.userId,
      wallets: [
        {
          chain: event.data.chain,
          address: event.data.publicKey,
          name: event.data.name,
        },
      ],
    },
    { deleteWallets: false },
  );
  Response.json({
    success: true,
    message: 'Wallet created event processed',
  });
};

const handleWalletLinkedEvent = async (
  event: z.infer<typeof WalletLinkedEventSchema>,
) => {
  await upsertDynamicUser(
    {
      id: event.userId,
      wallets: [
        {
          chain: event.data.chain,
          address: event.data.publicKey,
          name: event.data.name,
        },
      ],
    },
    { deleteWallets: false },
  );

  return Response.json({
    success: true,
    message: 'Wallet linked event processed',
  });
};

const handleWalletUnlinkedEvent = async (
  event: z.infer<typeof WalletUnlinkedEventSchema>,
) => {
  await prisma.linkedWallet.delete({
    where: {
      dynamicUserId: event.userId,
      chain: event.data.chain,
      address: event.data.address,
    },
  });

  return Response.json({
    success: true,
    message: 'Wallet unlinked event processed',
  });
};

export async function POST(request: Request) {
  const signature = request.headers.get('x-dynamic-signature-256');
  const rawBody = await request.text();

  if (
    !signature ||
    !verifySignature({
      secret: env.DYNAMIC_WEBHOOK_SECRET,
      signature,
      payload: rawBody,
    })
  ) {
    return Response.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
      },
      {
        status: 401,
      },
    );
  }

  const event = EventsSchema.safeParse(JSON.parse(rawBody));

  if (!event.success) {
    return Response.json(
      {
        success: false,
        error: 'Unrecognized event',
      },
      {
        status: 400,
      },
    );
  }

  switch (event.data.eventName) {
    case 'ping':
      return handlePingEvent(event.data);
    case 'user.created':
      return handleUserCreatedEvent(event.data);
    case 'user.updated':
      return handleUserUpdatedEvent(event.data);
    case 'user.deleted':
      return handleUserDeletedEvent(event.data);
    case 'wallet.created':
      return handleWalletCreatedEvent(event.data);
    case 'wallet.linked':
      return handleWalletLinkedEvent(event.data);
    case 'wallet.unlinked':
      return handleWalletUnlinkedEvent(event.data);
    default:
      return Response.json(
        {
          success: false,
          error: 'We forgot to include handlers for this event.',
        },
        {
          status: 500,
        },
      );
  }
}
