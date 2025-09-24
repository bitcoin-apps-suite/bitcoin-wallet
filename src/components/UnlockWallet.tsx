import { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { useViewport } from '../hooks/useViewport';
import { WhiteLabelTheme } from '../theme.types';
import { sleep } from '../utils/sleep';
import { Button } from './Button';
import { Input } from './Input';
import { FormContainer, HeaderText, Text } from './Reusable';
import { useServiceContext } from '../hooks/useServiceContext';
import { YoursIcon } from './YoursIcon';
import { setDerivationTags } from '../services/serviceHelpers';
import { Keys } from '../utils/keys';
import { useSnackbar } from '../hooks/useSnackbar';

const Container = styled.div<WhiteLabelTheme & { $isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: ${(props) => (props.$isMobile ? '100vw' : '22.5rem')};
  height: ${(props) => (props.$isMobile ? '100vh' : '33.75rem')};
  margin: 0;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
  color: ${({ theme }) => theme.color.global.contrast};
  z-index: 100;
`;

export type UnlockWalletProps = {
  onUnlock: () => void;
};

export const UnlockWallet = (props: UnlockWalletProps) => {
  const { onUnlock } = props;
  const { theme } = useTheme();
  const { addSnackbar } = useSnackbar();
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { isMobile } = useViewport();
  const { keysService, chromeStorageService, oneSatSPV } = useServiceContext();

  const handleUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    
    if (!password.trim()) {
      addSnackbar('Please enter your password', 'error');
      return;
    }
    
    setIsProcessing(true);
    await sleep(25);

    try {
      const isVerified = await keysService.verifyPassword(password);
      if (isVerified) {
        setVerificationFailed(false);
        setAttemptCount(0);
        
        const timestamp = Date.now();
        await chromeStorageService.update({ lastActiveTime: timestamp });
        
        const keys = (await keysService.retrieveKeys(password)) as Keys;
        await setDerivationTags(keys, oneSatSPV, chromeStorageService);
        
        addSnackbar('Wallet unlocked successfully', 'success');
        onUnlock();
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        setVerificationFailed(true);
        
        if (newAttemptCount >= 3) {
          addSnackbar('Multiple failed attempts. Please check your password carefully.', 'error');
        } else {
          addSnackbar('Incorrect password. Please try again.', 'error');
        }
        
        setTimeout(() => {
          setVerificationFailed(false);
          setIsProcessing(false);
        }, 900);
      }
    } catch (error) {
      console.error('Unlock error:', error);
      addSnackbar('Failed to unlock wallet. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <Container $isMobile={isMobile} theme={theme}>
      <YoursIcon width="4rem" />
      <HeaderText style={{ fontSize: '1.75rem' }} theme={theme}>
        Unlock Wallet
      </HeaderText>
      <Text theme={theme}>Use password to unlock your wallet.</Text>
      <FormContainer onSubmit={handleUnlock}>
        <Input
          theme={theme}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          shake={verificationFailed ? 'true' : 'false'}
          autoFocus
          onKeyDown={(e) => e.stopPropagation()}
          disabled={isProcessing}
        />
        <Button
          theme={theme}
          type="secondary-outline"
          label={isProcessing ? 'Unlocking...' : 'Unlock'}
          disabled={isProcessing || password === ''}
          isSubmit
        />
      </FormContainer>
    </Container>
  );
};
