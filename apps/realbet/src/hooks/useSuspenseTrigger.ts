import { useEffect } from 'react';

const useSuspenseTrigger = (trigger: boolean) => {
  throw Promise.resolve(undefined);
};

export default useSuspenseTrigger;
