import { useState } from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { MobileFloatingAction } from './MobileFloatingAction';
import { MobileSwipeableView } from './MobileSwipeableView';
import { MobileFullScreenModal } from './MobileFullScreenModal';
import { QrCode } from './QrCode';
import { formatUSD } from '../utils/format';
import { FaBitcoin, FaChevronUp, FaCamera, FaCopy } from 'react-icons/fa';

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
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
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
        onExchange={() => setCameraModalOpen(true)}
      />

      <MobileFullScreenModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        title="Send Bitcoin"
        onConfirm={() => console.log('Send confirmed')}
        theme={theme}
      >
        <div style={{ color: '#fff', padding: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Recipient Address
            </label>
            <input 
              type="text" 
              placeholder="Enter Bitcoin address or scan QR code"
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(234,179,8,0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Amount (BSV)
            </label>
            <input 
              type="number" 
              placeholder="0.00000000"
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(234,179,8,0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px',
            backgroundColor: 'rgba(234,179,8,0.1)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '0.9rem' }}>Available Balance:</span>
            <span style={{ color: '#eab308', fontWeight: 'bold' }}>{bsvBalance.toFixed(8)} BSV</span>
          </div>
        </div>
      </MobileFullScreenModal>

      <MobileFullScreenModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        title="Receive Bitcoin"
        theme={theme}
      >
        <div style={{ color: '#fff', padding: '1rem', textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1rem',
            display: 'inline-block'
          }}>
            <QrCode address={address} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
              Your Bitcoin Address:
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '12px', 
              borderRadius: '8px', 
              wordBreak: 'break-all',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              {address}
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(address)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(234,179,8,0.2)',
              color: '#eab308',
              border: '1px solid rgba(234,179,8,0.3)',
              padding: '12px 20px',
              borderRadius: '8px',
              margin: '0 auto',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <FaCopy /> Copy Address
          </button>
        </div>
      </MobileFullScreenModal>

      <MobileFullScreenModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Transaction History"
        theme={theme}
      >
        <div style={{ color: '#fff', padding: '1rem' }}>
          {[
            { type: 'Received', amount: '+0.00123456', date: '2025-10-16', status: 'Confirmed' },
            { type: 'Sent', amount: '-0.00098765', date: '2025-10-15', status: 'Confirmed' },
            { type: 'Received', amount: '+0.00200000', date: '2025-10-14', status: 'Confirmed' }
          ].map((tx, index) => (
            <div key={index} style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: tx.type === 'Received' ? '#22c55e' : '#ef4444' }}>
                  {tx.type}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  {tx.date}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: tx.type === 'Received' ? '#22c55e' : '#ef4444' }}>
                  {tx.amount} BSV
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  {tx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </MobileFullScreenModal>

      <MobileFullScreenModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        title="Scan QR Code"
        theme={theme}
      >
        <div style={{ color: '#fff', padding: '1rem', textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            height: '300px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1rem',
            border: '2px dashed rgba(234,179,8,0.3)'
          }}>
            <div>
              <FaCamera style={{ fontSize: '48px', color: '#eab308', marginBottom: '1rem' }} />
              <div style={{ fontSize: '16px', marginBottom: '0.5rem' }}>Camera Access</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                Point your camera at a QR code to scan
              </div>
            </div>
          </div>
          <button
            onClick={() => console.log('Activate camera')}
            style={{
              backgroundColor: '#eab308',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <FaCamera style={{ marginRight: '8px' }} />
            Activate Camera
          </button>
        </div>
      </MobileFullScreenModal>
    </Container>
  );
};