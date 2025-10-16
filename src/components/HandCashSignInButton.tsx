import React from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { handCashAuthService } from '../services/HandCashAuth.service';

const StyledButton = styled.button<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #38CC77 0%, #2BA85E 100%);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(56, 204, 119, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(56, 204, 119, 0.3);
    background: linear-gradient(135deg, #45D584 0%, #38CC77 100%);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HandCashLogo = styled.div`
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #38CC77;
  font-size: 14px;
`;

interface HandCashSignInButtonProps {
  theme: WhiteLabelTheme;
  onSuccess?: (profile: any) => void;
  onError?: (error: Error) => void;
  useMockAuth?: boolean;
}

export const HandCashSignInButton: React.FC<HandCashSignInButtonProps> = ({ 
  theme, 
  onSuccess, 
  onError,
  useMockAuth = true // For development
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    
    try {
      if (useMockAuth) {
        // Use mock authentication for development
        const result = await handCashAuthService.mockAuthenticate({
          publicProfile: {
            handle: 'satoshi',
            displayName: 'Satoshi Nakamoto',
            paymail: 'satoshi@handcash.me',
            avatarUrl: 'https://handcash.io/avatar-placeholder.png',
            localCurrencyCode: 'USD',
            id: 'mock-' + Date.now()
          }
        });
        
        if (result && onSuccess) {
          onSuccess(result.profile);
        }
      } else {
        // Real OAuth flow
        const authUrl = handCashAuthService.getOAuthUrl();
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('HandCash sign-in error:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledButton 
      theme={theme} 
      onClick={handleSignIn}
      disabled={isLoading}
    >
      <HandCashLogo>H</HandCashLogo>
      <span>{isLoading ? 'Signing in...' : 'Sign in with HandCash'}</span>
    </StyledButton>
  );
};