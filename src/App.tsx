import { useTheme } from './hooks/useTheme';
import { useBitcoinOS } from './hooks/useBitcoinOS';
import styled from 'styled-components';
import { BsvWallet } from './pages/BsvWallet';
import { WhiteLabelTheme } from './theme.types';
import { BlockHeightProvider } from './contexts/providers/BlockHeightProvider';
import { QueueProvider } from './contexts/providers/QueueProvider';
import { BottomMenuProvider } from './contexts/providers/BottomMenuProvider';
import { SnackbarProvider } from './contexts/providers/SnackbarProvider';
import { NetWork } from 'yours-wallet-provider';
import { BrowserRouter } from 'react-router-dom';
import { PocBar } from './components/PocBar';
import { useEffect } from 'react';

const AppContainer = styled.div<WhiteLabelTheme & { hasBar: boolean }>`
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
  padding-top: ${({ hasBar }) => hasBar ? '32px' : '0'};
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
        <BlockHeightProvider>
          <QueueProvider>
            <BottomMenuProvider network={NetWork.Mainnet}>
              <SnackbarProvider>
                <BsvWallet isOrdRequest={false} />
              </SnackbarProvider>
            </BottomMenuProvider>
          </QueueProvider>
        </BlockHeightProvider>
      </AppContainer>
    </BrowserRouter>
  );
};
