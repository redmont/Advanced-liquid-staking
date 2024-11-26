import { getCasinoLink } from './getCasinoLink';
import { getUserIdFromToken } from '../auth';

export const getLinkingDetails = async (authToken: string) => {
  const userId = await getUserIdFromToken(authToken);

  if (!userId) {
    return null;
  }

  const data = await getCasinoLink(userId);
  if (!data) {
    return null;
  }

  const { realbetUserId, realbetUsername } = data;

  return {
    realbetUserId,
    realbetUsername,
  };
};
