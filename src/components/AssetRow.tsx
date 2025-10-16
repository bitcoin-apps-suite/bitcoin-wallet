import { styled } from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { WhiteLabelTheme } from '../theme.types';
import { HeaderText, Text } from './Reusable';
import { formatLargeNumber, formatUSD } from '../utils/format';
import { Show } from './Show';
import { BSV_DECIMAL_CONVERSION } from '../utils/constants';
import { FileAsset } from '../types/FileAsset.types';

const Container = styled.div<WhiteLabelTheme & { $animate: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.color.global.row};
  padding: 1rem 0;
  width: 90%;
  border-radius: 0.5rem;
  margin: 0.25rem;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: ${({ $animate }) => ($animate ? 'scale(1.02)' : 'none')};
  }

  @media (max-width: 768px) {
    width: 95%;
    padding: 0.75rem 0;
    margin: 0.125rem;
    touch-action: manipulation;
    min-height: 3.5rem;
  }
`;

const IconContainer = styled.div<{ isEmoji?: boolean }>`
  width: 2.25rem;
  height: 2.25rem;
  margin-left: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ isEmoji }) => isEmoji ? '1.5rem' : '1rem'};
  background: ${({ isEmoji }) => isEmoji ? 'transparent' : '#f3f4f6'};
`;

const Icon = styled.img<{ size?: string }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const TickerWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const TickerTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 1rem;
`;

const BalanceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 1rem;
  width: 40%;

  @media (max-width: 768px) {
    width: 45%;
    margin-right: 0.5rem;
  }
`;

const GradientButton = styled.button<WhiteLabelTheme>`
  background: linear-gradient(135deg, #de973f, #f9dd63);
  color: ${({ theme }) => theme.color.global.row};
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: bold;
  border-radius: 0.25rem;
  width: 10rem;
  margin-right: 1rem;
  cursor: pointer;
  transition:
    transform 0.2s ease-in-out,
    opacity 0.2s;
  outline: none;

  &:hover {
    transform: scale(1.05);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export type AssetRowProps = {
  icon: string;
  ticker: string;
  balance: number;
  usdBalance: number;
  showPointer: boolean;
  isMNEE?: boolean;
  animate?: boolean;
  isLock?: boolean;
  nextUnlock?: number;
  onGetMneeClick?: () => void;
  onClick?: () => void;
  // File asset support
  fileAsset?: FileAsset;
  isFileAsset?: boolean;
};

export const AssetRow = (props: AssetRowProps) => {
  const {
    icon,
    ticker,
    balance,
    usdBalance,
    isLock,
    nextUnlock,
    onClick,
    isMNEE,
    showPointer,
    onGetMneeClick,
    animate = false,
    fileAsset,
    isFileAsset = false,
  } = props;
  const { theme } = useTheme();
  const isDisplaySat = isLock && balance < 0.0001;
  const isMneeBalanceZero = !!isMNEE && usdBalance === 0;
  
  // File asset display logic
  const displayTicker = isFileAsset && fileAsset ? fileAsset.filename : ticker;
  const displayBalance = isFileAsset && fileAsset ? (fileAsset.displayAmount || 1) : balance;
  const displayValue = isFileAsset && fileAsset ? (fileAsset.value || 0) : usdBalance;
  const isEmoji = /^\p{Emoji}/u.test(icon);
  const balanceLabel = isFileAsset 
    ? (fileAsset?.type === 'nft' ? 'NFT' : 'Shares')
    : (isLock ? 'Next unlock' : 'Balance');
  
  return (
    <Container
      style={{ cursor: showPointer ? 'pointer' : undefined }}
      onClick={onClick}
      theme={theme}
      $animate={animate}
    >
      <TickerWrapper>
        <Show when={!!icon && icon.length > 0}>
          <IconContainer isEmoji={isEmoji}>
            {isEmoji ? icon : <Icon src={icon} />}
          </IconContainer>
        </Show>
        <TickerTextWrapper>
          <HeaderText style={{ fontSize: '1rem' }} theme={theme}>
            {displayTicker}
          </HeaderText>
          <Text style={{ margin: '0', textAlign: 'left', color: theme.color.global.gray }} theme={theme}>
            {balanceLabel}
            {isFileAsset && fileAsset?.pending && (
              <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>• Pending</span>
            )}
          </Text>
        </TickerTextWrapper>
      </TickerWrapper>
      <Show
        when={isMneeBalanceZero}
        whenFalseContent={
          <BalanceWrapper>
            <HeaderText style={{ textAlign: 'right', fontSize: '1rem' }} theme={theme}>
              {isFileAsset 
                ? fileAsset?.type === 'nft' 
                  ? '1 NFT'
                  : formatLargeNumber(displayBalance, 0)
                : `${formatLargeNumber(
                    isDisplaySat ? balance * BSV_DECIMAL_CONVERSION : balance,
                    isDisplaySat ? 0 : 3,
                  )}${isLock ? (isDisplaySat ? `${balance === 0.00000001 ? ' SAT' : ' SATS'}` : ' BSV') : ''}`
              }
            </HeaderText>
            <Text style={{ textAlign: 'right', margin: '0', color: theme.color.global.gray }} theme={theme}>
              {isLock 
                ? `Block ${nextUnlock}` 
                : isFileAsset 
                  ? fileAsset?.ticker || 'Asset'
                  : formatUSD(displayValue)
              }
            </Text>
          </BalanceWrapper>
        }
      >
        <GradientButton theme={theme} onClick={onGetMneeClick}>
          Get MNEE
        </GradientButton>
      </Show>
    </Container>
  );
};
