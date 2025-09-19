export interface HandCashProfile {
  publicProfile: {
    id: string;
    handle: string;
    paymail: string;
    displayName: string;
    avatarUrl: string;
    localCurrencyCode: string;
  };
  privateProfile?: {
    email: string;
    phoneNumber: string;
  };
}

export interface HandCashAuthResponse {
  authToken: string;
  profile: HandCashProfile;
}

export class HandCashAuthService {
  private static APP_ID = 'bitcoin-wallet-bapp';
  private static AUTH_BASE_URL = 'https://app.handcash.io/api/connect/v1';
  private authToken: string | null = null;
  private profile: HandCashProfile | null = null;

  constructor() {
    this.loadAuthData();
  }

  private loadAuthData(): void {
    const storedToken = localStorage.getItem('handcash_auth_token');
    const storedProfile = localStorage.getItem('handcash_profile');
    
    if (storedToken) {
      this.authToken = storedToken;
    }
    
    if (storedProfile) {
      try {
        this.profile = JSON.parse(storedProfile);
      } catch (e) {
        console.error('Failed to parse stored HandCash profile:', e);
      }
    }
  }

  private saveAuthData(token: string, profile: HandCashProfile): void {
    this.authToken = token;
    this.profile = profile;
    localStorage.setItem('handcash_auth_token', token);
    localStorage.setItem('handcash_profile', JSON.stringify(profile));
  }

  public clearAuth(): void {
    this.authToken = null;
    this.profile = null;
    localStorage.removeItem('handcash_auth_token');
    localStorage.removeItem('handcash_profile');
  }

  public getOAuthUrl(): string {
    const redirectUri = encodeURIComponent(window.location.origin + '/handcash-callback');
    const permissions = encodeURIComponent('USER_PUBLIC_PROFILE,USER_PRIVATE_PROFILE,PAY,BALANCE');
    
    return `https://app.handcash.io/oauth/authorize?app_id=${HandCashAuthService.APP_ID}&redirect_uri=${redirectUri}&permissions=${permissions}`;
  }

  public async handleOAuthCallback(code: string): Promise<HandCashAuthResponse | null> {
    try {
      const response = await fetch(`${HandCashAuthService.AUTH_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: HandCashAuthService.APP_ID,
          code,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      const { authToken } = data;

      const profileResponse = await fetch(`${HandCashAuthService.AUTH_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await profileResponse.json();
      
      this.saveAuthData(authToken, profile);
      
      return { authToken, profile };
    } catch (error) {
      console.error('HandCash OAuth error:', error);
      return null;
    }
  }

  public async mockAuthenticate(mockData?: Partial<HandCashProfile>): Promise<HandCashAuthResponse> {
    const mockProfile: HandCashProfile = {
      publicProfile: {
        id: mockData?.publicProfile?.id || 'mock-user-123',
        handle: mockData?.publicProfile?.handle || 'mockuser',
        paymail: mockData?.publicProfile?.paymail || 'mockuser@handcash.me',
        displayName: mockData?.publicProfile?.displayName || 'Mock User',
        avatarUrl: mockData?.publicProfile?.avatarUrl || 'https://images.unsplash.com/photo-1494790108755-2616b332446c?w=150&h=150&fit=crop&crop=face',
        localCurrencyCode: mockData?.publicProfile?.localCurrencyCode || 'USD',
      },
      privateProfile: mockData?.privateProfile || {
        email: 'mock@example.com',
        phoneNumber: '+1234567890',
      },
    };

    const mockToken = 'mock-auth-token-' + Date.now();
    
    // Create a mock wallet account that integrates with the existing wallet
    await this.createMockWalletAccount(mockProfile);
    
    this.saveAuthData(mockToken, mockProfile);
    
    return { authToken: mockToken, profile: mockProfile };
  }

  private async createMockWalletAccount(profile: HandCashProfile): Promise<void> {
    // Create mock wallet data that would normally come from HandCash
    const mockWalletData = {
      accounts: {
        'handcash-mock-identity-address': {
          name: `${profile.publicProfile.displayName} (HandCash)`,
          network: 'mainnet',
          addresses: {
            bsvAddress: '1HandCashMockBsvAddress123456',
            ordAddress: '1HandCashMockOrdAddress123456', 
            identityAddress: 'handcash-mock-identity-address',
          },
          balance: {
            bsv: 0.05,
            satoshis: 5000000,
            usdInCents: 2500,
          },
          settings: {
            favoriteTokens: [],
          },
          isHandCash: true,
          handCashProfile: profile.publicProfile,
        },
      },
      selectedAccount: 'handcash-mock-identity-address',
      hasUpgradedToSPV: true,
      network: 'mainnet',
    };

    // Store the mock wallet data
    localStorage.setItem('handcash-mock-wallet', JSON.stringify(mockWalletData));
    
    // Trigger a wallet refresh (you may need to implement this)
    window.dispatchEvent(new CustomEvent('handcash-wallet-created', { detail: mockWalletData }));
  }

  public getProfile(): HandCashProfile | null {
    return this.profile;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  public isAuthenticated(): boolean {
    return this.authToken !== null && this.profile !== null;
  }

  public async getBalance(): Promise<{ amount: number; currency: string } | null> {
    if (!this.authToken) {
      return null;
    }

    try {
      const response = await fetch(`${HandCashAuthService.AUTH_BASE_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      return {
        amount: data.spendable.amount,
        currency: data.spendable.currency,
      };
    } catch (error) {
      console.error('Failed to fetch HandCash balance:', error);
      return { amount: 0, currency: 'BSV' };
    }
  }

  public async sendPayment(
    to: string,
    amount: number,
    currency = 'BSV',
    description?: string
  ): Promise<{ transactionId: string } | null> {
    if (!this.authToken) {
      return null;
    }

    try {
      const response = await fetch(`${HandCashAuthService.AUTH_BASE_URL}/wallet/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payments: [{ to, amount, currency }],
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send payment');
      }

      const data = await response.json();
      return { transactionId: data.transactionId };
    } catch (error) {
      console.error('Failed to send HandCash payment:', error);
      return null;
    }
  }
}

export const handCashAuthService = new HandCashAuthService();