import { useState } from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { MobileFloatingAction } from './MobileFloatingAction';
import { MobileSwipeableView } from './MobileSwipeableView';
import { MobileFullScreenModal } from './MobileFullScreenModal';
import { formatUSD } from '../utils/format';
import { FaBitcoin, FaChevronUp } from 'react-icons/fa';

interface MobileOptimizedWalletProps {
  theme: WhiteLabelTheme;
  bsvBalance: number;
  usdBalance: number;
  address: string;
  assets: any[];
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const StatusBar = styled.div`
  height: 44px;
  background: linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #eab308;
  font-size: 0.875rem;
  font-weight: 500;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
  
  ::-webkit-scrollbar {
    display: none;
  }
`;

const BalanceCard = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  margin: 1rem;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(234, 179, 8, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(234, 179, 8, 0.05) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

const BalanceLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
`;

const BalanceAmount = styled.div`
  color: #fff;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const BalanceUSD = styled.div`
  color: rgba(234, 179, 8, 0.8);
  font-size: 1.125rem;
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem;
`;

const StatCard = styled.div`
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(234, 179, 8, 0.1);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div`
  color: #eab308;
  font-size: 1.25rem;
  font-weight: 600;
`;

const AssetList = styled.div`
  margin: 1rem;
`;

const SectionTitle = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding-left: 0.5rem;
`;

const AssetCard = styled.div`
  background: rgba(26, 26, 26, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  
  &:active {
    background: rgba(234, 179, 8, 0.1);
    border-color: rgba(234, 179, 8, 0.3);
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetName = styled.div`
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
`;

const AssetAmount = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
`;

const AssetValue = styled.div`
  color: #eab308;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PullToRefresh = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(180deg, rgba(234, 179, 8, 0.1) 0%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$show ? 1 : 0};
  transform: translateY(${props => props.$show ? '0' : '-100%'});
  transition: all 0.3s ease;
`;

export const MobileOptimizedWallet = ({
  theme,
  bsvBalance,
  usdBalance,
  address,
  assets
}: MobileOptimizedWalletProps) => {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const handleRefresh = () => {
    setIsPulling(true);
    setTimeout(() => {
      setIsPulling(false);
    }, 1000);
  };

  return (
    <Container>
      <StatusBar>
        <StatusInfo>
          <FaBitcoin />
          Bitcoin Wallet
        </StatusInfo>
        <StatusInfo>
          ${(bsvBalance * 50).toFixed(0)}/BSV
        </StatusInfo>
      </StatusBar>

      <PullToRefresh $show={isPulling}>
        <FaChevronUp style={{ color: '#eab308', animation: 'bounce 1s infinite' }} />
      </PullToRefresh>

      <MobileSwipeableView onSwipeDown={handleRefresh}>
        <MainContent>
          <BalanceCard>
            <BalanceLabel>Total Balance</BalanceLabel>
            <BalanceAmount>
              {bsvBalance.toFixed(8)} <span style={{ fontSize: '1.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>BSV</span>
            </BalanceAmount>
            <BalanceUSD>≈ {formatUSD(usdBalance)}</BalanceUSD>
          </BalanceCard>

          <QuickStats>
            <StatCard>
              <StatLabel>24h Change</StatLabel>
              <StatValue>+5.43%</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Portfolio Value</StatLabel>
              <StatValue>{formatUSD(usdBalance)}</StatValue>
            </StatCard>
          </QuickStats>

          <AssetList>
            <SectionTitle>File Type Assets</SectionTitle>
            {[
              { icon: '🖼️', name: 'JPEG Files', amount: 45, value: 112.50 },
              { icon: '📄', name: 'PDF Documents', amount: 78, value: 253.50 },
              { icon: '🎵', name: 'MP3 Audio', amount: 23, value: 201.25 },
              { icon: '🎬', name: 'MP4 Videos', amount: 12, value: 456.00 },
            ].map((asset, index) => (
              <AssetCard key={index}>
                <AssetInfo>
                  <AssetIcon>{asset.icon}</AssetIcon>
                  <AssetDetails>
                    <AssetName>{asset.name}</AssetName>
                    <AssetAmount>{asset.amount} files</AssetAmount>
                  </AssetDetails>
                </AssetInfo>
                <AssetValue>${asset.value}</AssetValue>
              </AssetCard>
            ))}
          </AssetList>
        </MainContent>
      </MobileSwipeableView>

      <MobileFloatingAction
        theme={theme}
        onSend={() => setSendModalOpen(true)}
        onReceive={() => setReceiveModalOpen(true)}
        onHistory={() => setHistoryModalOpen(true)}
        onExchange={() => setExchangeModalOpen(true)}
      />

      <MobileFullScreenModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        title="Send Bitcoin"
        onConfirm={() => console.log('Send confirmed')}
        theme={theme}
      >
        <div style={{ color: '#fff' }}>Send modal content here</div>
      </MobileFullScreenModal>

      <MobileFullScreenModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        title="Receive Bitcoin"
        theme={theme}
      >
        <div style={{ color: '#fff' }}>Receive modal content here</div>
      </MobileFullScreenModal>

      <MobileFullScreenModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Transaction History"
        theme={theme}
      >
        <div style={{ color: '#fff' }}>History content here</div>
      </MobileFullScreenModal>

      <MobileFullScreenModal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
        title="Exchange"
        theme={theme}
      >
        <div style={{ color: '#fff' }}>Exchange content here</div>
      </MobileFullScreenModal>
    </Container>
  );
};