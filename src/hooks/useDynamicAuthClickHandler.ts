import { useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export const useDynamicAuthClickHandler = () => {
  const { setShowAuthFlow, isAuthenticated, setShowDynamicUserProfile } =
    useDynamicContext();

  return useCallback(() => {
    if (isAuthenticated) {
      setShowDynamicUserProfile(true);
    } else {
      setShowAuthFlow(true);
    }
  }, [isAuthenticated, setShowAuthFlow, setShowDynamicUserProfile]);
};
