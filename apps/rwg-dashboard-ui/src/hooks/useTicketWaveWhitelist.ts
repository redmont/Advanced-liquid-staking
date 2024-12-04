import { useCurrentTicketWave } from './useCurrentTicketWave';
import { useWalletAddresses } from './useWalletAddresses';

export const useCurrentWaveWhiteListed = () => {
  const { data: currentWave, status } = useCurrentTicketWave();
  const { addresses } = useWalletAddresses();

  return (
    status === 'success' &&
    currentWave &&
    (!currentWave.whitelist ||
      currentWave.whitelist.some((address) => addresses.includes(address)))
  );
};
