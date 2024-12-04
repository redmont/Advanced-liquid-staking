import { useCurrentTicketWave } from './useCurrentTicketWave';
import { WAVE_CONFIGURATIONS } from '@/config/linkToWin';
import { useWalletAddresses } from './useWalletAddresses';

export const useCurrentWaveWhiteListed = () => {
  const { data: currentWave } = useCurrentTicketWave();
  const { addresses } = useWalletAddresses();

  const whitelist =
    WAVE_CONFIGURATIONS[currentWave?.id as keyof typeof WAVE_CONFIGURATIONS]
      ?.whitelist ?? [];

  return addresses && whitelist.some((address) => addresses.includes(address));
};
