import { useTheme } from './hooks/useTheme';
import styled from 'styled-components';
import { BsvWallet } from './pages/BsvWallet';
import { WhiteLabelTheme } from './theme.types';
import { BlockHeightProvider } from './contexts/providers/BlockHeightProvider';
import { QueueProvider } from './contexts/providers/QueueProvider';
import { BottomMenuProvider } from './contexts/providers/BottomMenuProvider';
import { SnackbarProvider } from './contexts/providers/SnackbarProvider';
import { NetWork } from 'yours-wallet-provider';
import { BrowserRouter } from 'react-router-dom';

const AppContainer = styled.div<WhiteLabelTheme>`
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
`;

export const App = () => {
  const { theme } = useTheme();

  return (
    <BrowserRouter>
      <AppContainer theme={theme}>
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
