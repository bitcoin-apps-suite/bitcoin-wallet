import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { handCashAuthService, HandCashProfile } from '../../services/HandCashAuth.service';

interface HandCashBalance {
  bsv: number;
  usd: number;
}

interface HandCashAsset {
  id: string;
  type: 'token' | 'nft' | 'file';
  name: string;
  ticker?: string;
  amount?: number;
  icon?: string;
  metadata?: any;
}

interface HandCashContextType {
  isAuthenticated: boolean;
  profile: HandCashProfile | null;
  balance: HandCashBalance | null;
  assets: HandCashAsset[];
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  refreshBalance: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  sendPayment: (to: string, amount: number, currency?: string) => Promise<string | null>;
}

const HandCashContext = createContext<HandCashContextType | undefined>(undefined);

export const useHandCash = () => {
  const context = useContext(HandCashContext);
  if (!context) {
    throw new Error('useHandCash must be used within HandCashProvider');
  }
  return context;
};

interface HandCashProviderProps {
  children: ReactNode;
}

export const HandCashProvider: React.FC<HandCashProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<HandCashProfile | null>(null);
  const [balance, setBalance] = useState<HandCashBalance | null>(null);
  const [assets, setAssets] = useState<HandCashAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from stored auth
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        if (handCashAuthService.isAuthenticated()) {
          const storedProfile = handCashAuthService.getProfile();
          if (storedProfile) {
            setProfile(storedProfile);
            setIsAuthenticated(true);
            await refreshBalance();
            await refreshAssets();
          }
        }
      } catch (err) {
        console.error('Error checking HandCash auth:', err);
        setError('Failed to restore HandCash session');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for authentication events
    const handleAuth = (event: CustomEvent) => {
      setProfile(event.detail);
      setIsAuthenticated(true);
      refreshBalance();
      refreshAssets();
    };

    window.addEventListener('handcash-authenticated' as any, handleAuth);
    
    return () => {
      window.removeEventListener('handcash-authenticated' as any, handleAuth);
    };
  }, []);

  const refreshBalance = async () => {
    try {
      const handCashBalance = await handCashAuthService.getBalance();
      if (handCashBalance) {
        // Convert to BSV if needed
        const bsvAmount = handCashBalance.currency === 'BSV' 
          ? handCashBalance.amount 
          : handCashBalance.amount / 100; // Assuming cents for USD
        
        setBalance({
          bsv: bsvAmount,
          usd: bsvAmount * 50 // Mock exchange rate, replace with real rate
        });
      }
    } catch (err) {
      console.error('Error fetching HandCash balance:', err);
      setError('Failed to fetch balance');
    }
  };

  const refreshAssets = async () => {
    try {
      // Mock assets for now - would be fetched from HandCash API
      const mockAssets: HandCashAsset[] = [
        {
          id: 'hc-1',
          type: 'token',
          name: 'HandCash Points',
          ticker: 'HCP',
          amount: 1000,
          icon: '🪙'
        },
        {
          id: 'hc-2', 
          type: 'nft',
          name: 'HandCash Genesis NFT',
          icon: '🎨',
          metadata: {
            collection: 'HandCash Genesis',
            number: 42
          }
        },
        {
          id: 'hc-3',
          type: 'file',
          name: 'Profile Avatar.png',
          icon: '🖼️',
          metadata: {
            size: '256KB',
            type: 'image/png'
          }
        }
      ];
      
      setAssets(mockAssets);
    } catch (err) {
      console.error('Error fetching HandCash assets:', err);
      setError('Failed to fetch assets');
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For development, use mock auth
      const result = await handCashAuthService.mockAuthenticate();
      if (result) {
        setProfile(result.profile);
        setIsAuthenticated(true);
        await refreshBalance();
        await refreshAssets();
      }
    } catch (err) {
      setError('Failed to sign in with HandCash');
      console.error('HandCash sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    handCashAuthService.clearAuth();
    setIsAuthenticated(false);
    setProfile(null);
    setBalance(null);
    setAssets([]);
    setError(null);
  };

  const sendPayment = async (to: string, amount: number, currency = 'BSV'): Promise<string | null> => {
    try {
      const result = await handCashAuthService.sendPayment(to, amount, currency);
      if (result) {
        await refreshBalance();
        return result.transactionId;
      }
      return null;
    } catch (err) {
      console.error('HandCash payment error:', err);
      setError('Failed to send payment');
      return null;
    }
  };

  const contextValue: HandCashContextType = {
    isAuthenticated,
    profile,
    balance,
    assets,
    isLoading,
    error,
    signIn,
    signOut,
    refreshBalance,
    refreshAssets,
    sendPayment
  };

  return (
    <HandCashContext.Provider value={contextValue}>
      {children}
    </HandCashContext.Provider>
  );
};