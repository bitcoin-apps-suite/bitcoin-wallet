import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { AppHeader } from '../components/AppHeader';
import { FaBitcoin, FaExchangeAlt, FaUsers, FaCode } from 'react-icons/fa';

const PageContainer = styled.div<{ theme: any }>`
  min-height: 100vh;
  background: ${({ theme }) => theme.color.global.walletBackground};
  color: ${({ theme }) => theme.color.global.contrast};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section<{ theme: any }>`
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #f7931a 0%, #ff6b35 100%);
  border-radius: 16px;
  margin-bottom: 3rem;
  color: white;
`;

const TokenLogo = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const TokenTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
`;

const TokenSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.row};
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StatIcon = styled.div<{ color: string }>`
  font-size: 2.5rem;
  color: ${({ color }) => color};
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div<{ theme: any }>`
  color: ${({ theme }) => theme.color.global.gray};
  font-size: 0.9rem;
`;

const InfoSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const InfoCard = styled.div<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.row};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const InfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #f7931a;
`;

const InfoText = styled.p<{ theme: any }>`
  color: ${({ theme }) => theme.color.global.gray};
  line-height: 1.6;
  margin: 0;
`;

const TokenomicsTable = styled.table<{ theme: any }>`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.walletBackground};
  padding: 1rem;
  text-align: left;
  font-weight: bold;
`;

const TableCell = styled.td<{ theme: any }>`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.color.global.walletBackground};
`;

const ActionButton = styled.button<{ theme: any }>`
  background: linear-gradient(to right, ${({ theme }) => theme.color.component.primaryButtonLeftGradient}, ${({ theme }) => theme.color.component.primaryButtonRightGradient});
  color: ${({ theme }) => theme.color.component.primaryButtonText};
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin: 0.5rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin: 2rem 0;
`;

export const TokenPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <PageContainer theme={theme}>
      <AppHeader theme={theme} onTitleClick={() => window.location.href = '/'} />
      
      <ContentContainer>
        <HeroSection theme={theme}>
          <TokenLogo>₿</TokenLogo>
          <TokenTitle>$BWallet Token</TokenTitle>
          <TokenSubtitle>
            The native utility token powering the Bitcoin Wallet ecosystem, 
            enabling advanced features and community governance.
          </TokenSubtitle>
        </HeroSection>

        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f7931a">
              <FaBitcoin />
            </StatIcon>
            <StatValue>21,000,000</StatValue>
            <StatLabel theme={theme}>Total Supply</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#ff6b35">
              <FaExchangeAlt />
            </StatIcon>
            <StatValue>$0.0042</StatValue>
            <StatLabel theme={theme}>Current Price</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#4CAF50">
              <FaUsers />
            </StatIcon>
            <StatValue>15,234</StatValue>
            <StatLabel theme={theme}>Token Holders</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#2196F3">
              <FaCode />
            </StatIcon>
            <StatValue>BSV-20</StatValue>
            <StatLabel theme={theme}>Token Standard</StatLabel>
          </StatCard>
        </StatsGrid>

        <InfoSection>
          <SectionTitle>About $BWallet</SectionTitle>
          <InfoGrid>
            <InfoCard theme={theme}>
              <InfoTitle>Utility & Features</InfoTitle>
              <InfoText theme={theme}>
                $BWallet tokens provide access to premium wallet features including advanced 
                portfolio analytics, priority transaction processing, exclusive ordinal 
                collections, and voting rights on protocol upgrades.
              </InfoText>
            </InfoCard>

            <InfoCard theme={theme}>
              <InfoTitle>Staking Rewards</InfoTitle>
              <InfoText theme={theme}>
                Stake your $BWallet tokens to earn rewards from transaction fees, 
                participate in governance decisions, and receive airdrops of new 
                Bitcoin ecosystem tokens.
              </InfoText>
            </InfoCard>

            <InfoCard theme={theme}>
              <InfoTitle>Governance</InfoTitle>
              <InfoText theme={theme}>
                Token holders can propose and vote on wallet improvements, new feature 
                implementations, and integration with emerging Bitcoin protocols like 
                RGB, Lightning Network, and Ordinals.
              </InfoText>
            </InfoCard>

            <InfoCard theme={theme}>
              <InfoTitle>Developer Rewards</InfoTitle>
              <InfoText theme={theme}>
                Contributors to the Bitcoin Wallet ecosystem earn $BWallet tokens for 
                bug fixes, feature development, documentation, and community engagement 
                through our tasks leaderboard system.
              </InfoText>
            </InfoCard>
          </InfoGrid>
        </InfoSection>

        <InfoSection>
          <SectionTitle>Tokenomics</SectionTitle>
          <TokenomicsTable theme={theme}>
            <thead>
              <tr>
                <TableHeader theme={theme}>Allocation</TableHeader>
                <TableHeader theme={theme}>Percentage</TableHeader>
                <TableHeader theme={theme}>Amount</TableHeader>
                <TableHeader theme={theme}>Purpose</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TableCell theme={theme}>Community Rewards</TableCell>
                <TableCell theme={theme}>40%</TableCell>
                <TableCell theme={theme}>8,400,000</TableCell>
                <TableCell theme={theme}>User incentives and airdrops</TableCell>
              </tr>
              <tr>
                <TableCell theme={theme}>Developer Fund</TableCell>
                <TableCell theme={theme}>25%</TableCell>
                <TableCell theme={theme}>5,250,000</TableCell>
                <TableCell theme={theme}>Development and maintenance</TableCell>
              </tr>
              <tr>
                <TableCell theme={theme}>Staking Rewards</TableCell>
                <TableCell theme={theme}>20%</TableCell>
                <TableCell theme={theme}>4,200,000</TableCell>
                <TableCell theme={theme}>Long-term holder incentives</TableCell>
              </tr>
              <tr>
                <TableCell theme={theme}>Treasury</TableCell>
                <TableCell theme={theme}>10%</TableCell>
                <TableCell theme={theme}>2,100,000</TableCell>
                <TableCell theme={theme}>Protocol development fund</TableCell>
              </tr>
              <tr>
                <TableCell theme={theme}>Team</TableCell>
                <TableCell theme={theme}>5%</TableCell>
                <TableCell theme={theme}>1,050,000</TableCell>
                <TableCell theme={theme}>Core team allocation (vested)</TableCell>
              </tr>
            </tbody>
          </TokenomicsTable>
        </InfoSection>

        <ButtonContainer>
          <ActionButton theme={theme}>
            Buy $BWallet
          </ActionButton>
          <ActionButton theme={theme}>
            Stake Tokens
          </ActionButton>
          <ActionButton theme={theme}>
            View on Explorer
          </ActionButton>
        </ButtonContainer>
      </ContentContainer>
    </PageContainer>
  );
};