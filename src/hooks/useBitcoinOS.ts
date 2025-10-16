import { useState, useEffect, useCallback } from 'react';

export const useBitcoinOS = () => {
  const [isInOS, setIsInOS] = useState(false);

  useEffect(() => {
    // Check if we're running inside Bitcoin OS
    // Bitcoin OS opens apps in a new window, so we check various conditions
    const checkIfInOS = () => {
      try {
        // Check if we have a referrer from Bitcoin OS domain
        if (document.referrer && (
          document.referrer.includes('bitcoin-os') || 
          document.referrer.includes('localhost:3000') ||
          document.referrer.includes('localhost:3001')
        )) {
          return true;
        }

        // Check if we were opened by window.open (Bitcoin OS uses this)
        if (window.opener) {
          return true;
        }

        // Check URL parameters
        const params = new URLSearchParams(window.location.search);
        if (params.get('source') === 'bitcoin-os') {
          return true;
        }

        // Check if running in development with Bitcoin OS
        if (window.location.hostname === 'localhost' && 
            window.location.port === '1050' && 
            window.opener) {
          return true;
        }

        return false;
      } catch (e) {
        console.error('Error checking Bitcoin OS context:', e);
        return false;
      }
    };

    setIsInOS(checkIfInOS());
  }, []);

  // Function to set the window title (for Bitcoin OS window management)
  const setTitle = useCallback((title: string) => {
    if (isInOS && window.parent !== window) {
      try {
        window.parent.postMessage(
          { type: 'SET_APP_TITLE', title },
          '*'
        );
      } catch (e) {
        console.error('Error setting title:', e);
      }
    }
    document.title = title;
  }, [isInOS]);

  return {
    isInOS,
    setTitle
  };
};