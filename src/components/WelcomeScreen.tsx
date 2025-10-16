import React, { useState } from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { HandCashSignInButton } from './HandCashSignInButton';
import { Button } from './Button';
import { useHandCash } from '../contexts/providers/HandCashProvider';

const Container = styled.div<WhiteLabelTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.color.global.walletBackground};
  padding: 2rem;
`;

const Logo = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.gray};
  font-size: 1.125rem;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 500px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

const Divider = styled.div<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.color.global.gray}40;
  }
  
  span {
    padding: 0 1rem;
    color: ${({ theme }) => theme.color.global.gray};
    font-size: 0.875rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  margin-top: 3rem;
`;

const FeatureItem = styled.div<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.color.global.gray}20;
`;

const FeatureIcon = styled.span`
  font-size: 1.5rem;
`;

const FeatureText = styled.span<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 0.875rem;
`;

interface WelcomeScreenProps {
  theme: WhiteLabelTheme;
  onCreateWallet: () => void;
  onImportWallet: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  theme, 
  onCreateWallet,
  onImportWallet
}) => {
  const { signIn } = useHandCash();
  const [isLoading, setIsLoading] = useState(false);

  const handleHandCashSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn();
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: '₿', text: 'Bitcoin SV' },
    { icon: '🖼️', text: 'File Assets' },
    { icon: '🪙', text: 'BSV20 Tokens' },
    { icon: '🎨', text: '1Sat Ordinals' },
    { icon: '💱', text: 'Multi-Currency' },
    { icon: '🔒', text: 'Non-Custodial' }
  ];

  return (
    <Container theme={theme}>
      <Logo>💼</Logo>
      
      <Title theme={theme}>Bitcoin Wallet</Title>
      <Subtitle theme={theme}>
        The reference wallet for the Bitcoin ecosystem. 
        Manage BSV, tokens, and file-type assets in one place.
      </Subtitle>

      <ButtonContainer>
        <HandCashSignInButton 
          theme={theme}
          onSuccess={() => window.location.reload()}
          useMockAuth={true}
        />
        
        <Divider theme={theme}>
          <span>OR</span>
        </Divider>
        
        <Button
          theme={theme.theme}
          type="primary"
          label="Create New Wallet"
          onClick={onCreateWallet}
          disabled={isLoading}
        />
        
        <Button
          theme={theme.theme}
          type="secondary"
          label="Import Existing Wallet"
          onClick={onImportWallet}
          disabled={isLoading}
        />
      </ButtonContainer>

      <FeatureGrid>
        {features.map((feature, index) => (
          <FeatureItem key={index} theme={theme}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureText theme={theme}>{feature.text}</FeatureText>
          </FeatureItem>
        ))}
      </FeatureGrid>
    </Container>
  );
};