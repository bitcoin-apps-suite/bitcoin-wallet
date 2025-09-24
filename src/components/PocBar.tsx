import React from 'react';
import styled from 'styled-components';

interface PocBarProps {
  color?: string;
}

const PocBannerContainer = styled.div<{ color: string }>`
  position: fixed;
  top: 0; /* Above taskbar */
  left: 0;
  right: 0;
  height: 32px;
  background-color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Left aligned */
  z-index: 9999;
  font-size: 13px;
  font-weight: 500;
  color: white;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-bottom: 1px solid rgba(0,0,0,0.2);
  padding: 0 12px;
`;

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WarningIcon = styled.span`
  font-size: 12px;
`;

const ConceptLabel = styled.span`
  font-weight: 600;
`;

const ConceptText = styled.span`
  opacity: 0.9;
`;

const LinksContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-left: 16px;
  font-size: 12px;
`;

const PocLink = styled.a`
  color: white;
  text-decoration: underline;
  opacity: 0.9;
  font-weight: 400;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
`;

export const PocBar: React.FC<PocBarProps> = ({ color = '#eab308' }) => {
  const handleLeaderboardClick = () => {
    window.location.hash = '#/leaderboard';
  };

  const handleSettingsClick = () => {
    window.location.hash = '#/settings';
  };

  return (
    <PocBannerContainer color={color}>
      <ContentContainer>
        <WarningIcon>⚠️</WarningIcon>
        <ConceptLabel>PROOF OF CONCEPT:</ConceptLabel>
        <ConceptText>This is a demonstration version.</ConceptText>
        <LinksContainer>
          <PocLink onClick={handleLeaderboardClick}>
            Leaderboard
          </PocLink>
          <PocLink onClick={handleSettingsClick}>
            Settings
          </PocLink>
          <PocLink 
            href="https://exchange.bitcoin-wallet.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Exchange
          </PocLink>
          <PocLink 
            href="https://github.com/bitcoin-apps-suite/bitcoin-wallet"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </PocLink>
        </LinksContainer>
      </ContentContainer>
    </PocBannerContainer>
  );
};