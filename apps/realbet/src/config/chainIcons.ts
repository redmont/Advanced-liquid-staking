// SVGs are from https://cryptofonts.com/icons.html
import type React from 'react';

import Eth from '../assets/icons/chains/eth.svg';
import Bnb from '../assets/icons/chains/bnb.svg';

export const getChainIcon = (
  chain: string,
  props?: React.SVGProps<SVGSVGElement>,
) => {
  switch (chain) {
    case 'ethereum':
      return Eth({ ...props });
    case 'bsc':
      return Bnb({ ...props });
  }
};
