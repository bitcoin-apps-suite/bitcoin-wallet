import { useTheme } from './hooks/useTheme';
import { useBitcoinOS } from './hooks/useBitcoinOS';
import styled from 'styled-components';
import { BsvWallet } from './pages/BsvWallet';
import { WhiteLabelTheme } from './theme.types';
import { BlockHeightProvider } from './contexts/providers/BlockHeightProvider';
import { QueueProvider } from './contexts/providers/QueueProvider';
import { BottomMenuProvider } from './contexts/providers/BottomMenuProvider';
import { SnackbarProvider } from './contexts/providers/SnackbarProvider';
import { HandCashProvider } from './contexts/providers/HandCashProvider';
import { NetWork } from 'yours-wallet-provider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PocBar } from './components/PocBar';
import { HandCashCallback } from './components/HandCashCallback';
import { useEffect } from 'react';

const AppContainer = styled.div<WhiteLabelTheme & { hasBar: boolean }>`
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
  padding-top: ${({ hasBar }) => hasBar ? '32px' : '0'};

  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    overflow-x: hidden;
  }
`;

export const App = () => {
  const { theme } = useTheme();
  const { isInOS, setTitle } = useBitcoinOS();

  useEffect(() => {
    // Set the window title when running in Bitcoin OS
    if (isInOS) {
      setTitle('Bitcoin Wallet');
    }
  }, [isInOS, setTitle]);

  return (
    <BrowserRouter>
      {!isInOS && <PocBar color="#eab308" />}
      <AppContainer theme={theme} hasBar={!isInOS}>
        <HandCashProvider>
          <BlockHeightProvider>
            <QueueProvider>
              <BottomMenuProvider network={NetWork.Mainnet}>
                <SnackbarProvider>
                  <Routes>
                    <Route path="/handcash-callback" element={<HandCashCallback />} />
                    <Route path="*" element={<BsvWallet isOrdRequest={false} />} />
                  </Routes>
                </SnackbarProvider>
              </BottomMenuProvider>
            </QueueProvider>
          </BlockHeightProvider>
        </HandCashProvider>
      </AppContainer>
    </BrowserRouter>
  );
};