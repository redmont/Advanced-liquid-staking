'use client';

import { Input } from '@/components/ui/input';
import {
  primaryWalletAddressOverrideAtom,
  networkOverrideAtom,
} from '@/store/developer';
import { useAtom } from 'jotai';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useNetworkId from '@/hooks/useNetworkId';

const networks = {
  11155111: 'Sepolia',
  1: 'Ethereum',
} as const;

const DeveloperPage = () => {
  const [addressOverride, setAddressOverride] = useAtom(
    primaryWalletAddressOverrideAtom,
  );
  const networkId = useNetworkId();
  const [networkOverride, setNetworkOverride] = useAtom(networkOverrideAtom);

  return (
    <div className="flex flex-col gap-5 p-5">
      <h2 className="mb-3 text-[2rem] font-medium">Developer Tools</h2>
      <div className="max-w-lg space-y-5">
        <div>
          <label className="mb-2 block">Network Override</label>
          <Select
            value={networkOverride?.toString() ?? networkId.data?.toString()}
            onValueChange={(v) => setNetworkOverride(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Network override" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(networks).map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block">Primary Wallet Address Override</label>
          <Input
            placeholder="0x..."
            value={addressOverride ?? ''}
            onChange={(e) => setAddressOverride(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
