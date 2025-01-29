import prisma from '../prisma/client';

export const upsertDynamicUser = async (
  user: {
    id: string;
    username?: string;
    email?: string;
    wallets?: {
      chain: string;
      address: string;
      name: string;
    }[];
  },
  options: {
    deleteWallets?: boolean;
  } = { deleteWallets: true },
) => {
  const wallets = user.wallets?.map((wallet) => wallet.address);

  return prisma.dynamicUser.upsert({
    where: {
      id: user.id,
    },
    update: {
      ...user,
      wallets:
        user.wallets && user.wallets.length > 0
          ? {
              deleteMany: options.deleteWallets
                ? {
                    dynamicUserId: user.id,
                    address: {
                      notIn: wallets,
                    },
                  }
                : undefined,
              createMany: {
                data:
                  user.wallets?.map((wallet) => ({
                    chain: wallet.chain,
                    address: wallet.address,
                    name: wallet.name,
                  })) ?? [],
              },
            }
          : undefined,
    },
    create: {
      ...user,
      wallets: {
        createMany: {
          data:
            user.wallets?.map((wallet) => ({
              chain: wallet.chain,
              address: wallet.address,
              name: wallet.name,
            })) ?? [],
        },
      },
    },
  });
};
