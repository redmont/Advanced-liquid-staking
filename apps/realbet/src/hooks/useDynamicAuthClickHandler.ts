import { useCallback } from 'react';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

export const useDynamicAuthClickHandler = () => {
  const isAuthenticated = useIsLoggedIn();
  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();

  return useCallback(() => {
    if (isAuthenticated) {
      setShowDynamicUserProfile(true);
    } else {
      setShowAuthFlow(true);
    }
  }, [isAuthenticated, setShowAuthFlow, setShowDynamicUserProfile]);
};
