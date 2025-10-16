import React from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { useHandCash } from '../contexts/providers/HandCashProvider';
import { AssetRow } from './AssetRow';
import { formatUSD } from '../utils/format';

const Container = styled.div<WhiteLabelTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${({ theme }) => theme.color.global.walletBackground};
`;

const BalanceSection = styled.div<WhiteLabelTheme>`
  padding: 2rem;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.color.global.contrast}20 0%, 
    ${({ theme }) => theme.color.global.gray}10 100%);
  border-radius: 1rem;
  margin-bottom: 2rem;
`;

const TotalBalance = styled.div<WhiteLabelTheme>`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.color.global.contrast};
  margin-bottom: 1rem;
`;

const BalanceBreakdown = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
`;

const BalanceItem = styled.div<WhiteLabelTheme & { source?: 'native' | 'handcash' }>`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 0.5rem;
  border-left: 3px solid ${({ source }) => 
    source === 'handcash' ? '#38CC77' : '#eab308'};
`;

const BalanceLabel = styled.span<WhiteLabelTheme>`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.global.gray};
  margin-bottom: 0.25rem;
`;

const BalanceValue = styled.span<WhiteLabelTheme>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.global.contrast};
`;

const AssetsSection = styled.div<WhiteLabelTheme>`
  padding: 0 2rem;
`;

const SectionTitle = styled.h3<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SourceBadge = styled.span<{ source: 'native' | 'handcash' }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: ${({ source }) => 
    source === 'handcash' ? '#38CC77' : '#eab308'};
  color: white;
  font-weight: 600;
`;

const AssetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

interface UnifiedWalletViewProps {
  theme: WhiteLabelTheme;
  nativeBsvBalance: number;
  nativeExchangeRate: number;
}

export const UnifiedWalletView: React.FC<UnifiedWalletViewProps> = ({
  theme,
  nativeBsvBalance,
  nativeExchangeRate
}) => {
  const { isAuthenticated, balance: handCashBalance, assets: handCashAssets, profile } = useHandCash();

  const totalBsv = nativeBsvBalance + (handCashBalance?.bsv || 0);
  const totalUsd = (nativeBsvBalance * nativeExchangeRate) + (handCashBalance?.usd || 0);

  return (
    <Container theme={theme}>
      <BalanceSection theme={theme}>
        <TotalBalance theme={theme}>
          {totalBsv.toFixed(8)} BSV
        </TotalBalance>
        <BalanceLabel theme={theme}>
          ≈ {formatUSD(totalUsd)}
        </BalanceLabel>
        
        <BalanceBreakdown>
          <BalanceItem theme={theme} source="native">
            <BalanceLabel theme={theme}>Native Wallet</BalanceLabel>
            <BalanceValue theme={theme}>
              {nativeBsvBalance.toFixed(8)} BSV
            </BalanceValue>
          </BalanceItem>
          
          {isAuthenticated && handCashBalance && (
            <BalanceItem theme={theme} source="handcash">
              <BalanceLabel theme={theme}>
                HandCash (@{profile?.publicProfile.handle})
              </BalanceLabel>
              <BalanceValue theme={theme}>
                {handCashBalance.bsv.toFixed(8)} BSV
              </BalanceValue>
            </BalanceItem>
          )}
        </BalanceBreakdown>
      </BalanceSection>

      <AssetsSection theme={theme}>
        <SectionTitle theme={theme}>
          File Type Assets <SourceBadge source="native">Native</SourceBadge>
        </SectionTitle>
        <AssetsList>
          <AssetRow
            balance={45}
            icon="🖼️"
            ticker="JPEG"
            usdBalance={45 * 2.50}
            showPointer={true}
          />
          <AssetRow
            balance={78}
            icon="🖼️"
            ticker="PNG"
            usdBalance={78 * 4.20}
            showPointer={true}
          />
          <AssetRow
            balance={156}
            icon="📄"
            ticker="PDF"
            usdBalance={156 * 3.25}
            showPointer={true}
          />
          <AssetRow
            balance={89}
            icon="🎵"
            ticker="MP3"
            usdBalance={89 * 8.75}
            showPointer={true}
          />
        </AssetsList>

        {isAuthenticated && handCashAssets.length > 0 && (
          <>
            <SectionTitle theme={theme}>
              HandCash Assets <SourceBadge source="handcash">HandCash</SourceBadge>
            </SectionTitle>
            <AssetsList>
              {handCashAssets.map(asset => (
                <AssetRow
                  key={asset.id}
                  balance={asset.amount || 1}
                  icon={asset.icon || '🪙'}
                  ticker={asset.ticker || asset.name}
                  usdBalance={0}
                  showPointer={true}
                />
              ))}
            </AssetsList>
          </>
        )}
      </AssetsSection>
    </Container>
  );
};