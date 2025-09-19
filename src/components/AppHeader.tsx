import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';

const HeaderContainer = styled.div<WhiteLabelTheme>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: ${({ theme }) => theme.color.global.row};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 96px;
  position: relative;
`;

const CenterSection = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BitcoinIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #000000;
  box-shadow: 0 4px 8px rgba(234, 179, 8, 0.3);
`;

const TitleContainer = styled.div`
  text-align: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 300;
  letter-spacing: -0.03em;
  margin: 0;
  margin-bottom: 4px;
`;

const BitcoinText = styled.span`
  color: #eab308;
`;

const WalletText = styled.span`
  color: #ffffff;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.02em;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #00ff88;
`;

const ExchangeLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #000000;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
  }
`;

interface AppHeaderProps {
  theme: any;
  onTitleClick?: () => void;
}

export const AppHeader = ({ theme, onTitleClick }: AppHeaderProps) => {
  return (
    <HeaderContainer theme={theme}>
      {/* Left section - placeholder for future controls */}
      <LeftSection>
        {/* Could add view toggles or other controls here */}
      </LeftSection>
      
      {/* Center section - Bitcoin Wallet Title */}
      <CenterSection>
        <BitcoinIcon>
          ₿
        </BitcoinIcon>
        <TitleContainer onClick={onTitleClick}>
          <Title>
            <BitcoinText>Bitcoin</BitcoinText>
            <WalletText> Wallet</WalletText>
          </Title>
          <Subtitle>
            Real-World Currencies & File Type Assets
          </Subtitle>
        </TitleContainer>
      </CenterSection>

      {/* Right section - Status and Exchange */}
      <RightSection>
        <ExchangeLink href="https://exchange.bitcoin-wallet.app" target="_blank" rel="noopener noreferrer">
          <span>🏦</span>
          <span>Exchange</span>
        </ExchangeLink>
        <StatusIndicator>
          <span style={{ color: '#00ff88', fontSize: '10px' }}>●</span>
          <span>Connected</span>
        </StatusIndicator>
      </RightSection>
    </HeaderContainer>
  );
};