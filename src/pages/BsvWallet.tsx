import { validate } from 'bitcoin-address-validation';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import bsvCoin from '../assets/bsv-coin.svg';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PageLoader } from '../components/PageLoader';
import { QrCode } from '../components/QrCode';
import { Taskbar } from '../components/Taskbar';
import { AppHeader } from '../components/AppHeader';
import {
  ButtonContainer,
  ConfirmContent,
  FormContainer,
  HeaderText,
  MainContent,
  ReceiveContent,
  Text,
  Warning,
} from '../components/Reusable';
import { Show } from '../components/Show';
import { useBottomMenu } from '../hooks/useBottomMenu';
import { useSnackbar } from '../hooks/useSnackbar';
import { useSocialProfile } from '../hooks/useSocialProfile';
import { useTheme } from '../hooks/useTheme';
import { WhiteLabelTheme } from '../theme.types';
import {
  BSV_DECIMAL_CONVERSION,
  HOSTED_YOURS_IMAGE,
} from '../utils/constants';
import { formatUSD, formatNumberWithCommasAndDecimals } from '../utils/format';
import { sleep } from '../utils/sleep';
import copyIcon from '../assets/copy.svg';
import { AssetRow } from '../components/AssetRow';
import lockIcon from '../assets/lock.svg';
// Router dependencies removed - this is now a standalone wallet
import { useWeb3RequestContext } from '../hooks/useWeb3RequestContext';
import { useServiceContext } from '../hooks/useServiceContext';
import { LockData } from '../services/types/bsv.types';
import { sendMessage } from '../utils/chromeHelpers';
import { YoursEventName } from '../inject';
import { InWalletBsvResponse } from '../services/types/bsv.types';
import { useQueueTracker } from '../hooks/useQueueTracker';
import { getErrorMessage, isValidEmail } from '../utils/tools';
import { UpgradeNotification } from '../components/UpgradeNotification';
import { Bsv20 } from 'yours-wallet-provider';
import { Bsv20TokensList } from '../components/Bsv20TokensList';
import { FaListAlt, FaTrash } from 'react-icons/fa';
import { FaArrowRightArrowLeft } from 'react-icons/fa6';
import { FaHistory } from 'react-icons/fa';
import { BubbleVisualization } from '../components/BubbleVisualization';
import { ManageTokens } from '../components/ManageTokens';
import { Account, ChromeStorageObject } from '../services/types/chromeStorage.types';
import { SendBsv20View } from '../components/SendBsv20View';
import { FaucetButton } from '../components/FaucetButton';
import { TxHistory } from '../components/TxHistory';
import { ViewModeToggle, ViewMode } from '../components/ViewModeToggle';
import { TokenVisualizer } from '../components/TokenVisualizer';
import { WalletShowcaseTabs } from '../components/WalletShowcaseTabs';

const AppContainer = styled.div<WhiteLabelTheme>`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
`;

const ContentContainer = styled.div<WhiteLabelTheme>`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const WalletMainContent = styled.div<WhiteLabelTheme>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  padding: 2rem 1rem;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
`;

const Sidebar = styled.div<WhiteLabelTheme>`
  width: 300px;
  background-color: ${({ theme }) => theme.color.global.row};
  border-right: 1px solid ${({ theme }) => theme.color.global.gray + '40'};
  padding: 2rem 1rem;
  overflow-y: auto;
`;

const SidebarTitle = styled.h3<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
`;

const MiddleContainer = styled.div<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  padding: 1rem 0;
`;

const ProfileImage = styled.img`
  width: 3.5rem;
  height: 3.5rem;
  margin: 0;
  border-radius: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Icon = styled.img<{ size?: string }>`
  width: ${(props) => props.size ?? '1.5rem'};
  height: ${(props) => props.size ?? '1.5rem'};
  margin: 0 0.5rem 0 0;
`;

const CopyAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 2rem 0;
`;

const StyledCopy = styled.img`
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
`;

const ManageTokenListWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  cursor: pointer;
`;

const RecipientRow = styled.div<WhiteLabelTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.color.global.gray + 80};
  border-radius: 0.5rem;
`;

const RecipientInputs = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  width: 100%;
`;

const ScrollableConfirmContent = styled(ConfirmContent)`
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

const UnitSwitcher = styled.div<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.gray};
  position: absolute;
  display: flex;
  align-items: center;
  right: 2.25rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

const GetMneeContainer = styled(ReceiveContent)<WhiteLabelTheme>`
  height: 100%;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
  z-index: 9999;
`;

type PageState = 'main' | 'receive' | 'send';
type AmountType = 'bsv' | 'usd';

export type BsvWalletProps = {
  isOrdRequest: boolean;
};

export type Recipient = {
  id: string;
  address: string;
  satSendAmount: number | null;
  usdSendAmount: number | null;
  amountType: AmountType;
  error?: string;
};

export const BsvWallet = (props: BsvWalletProps) => {
  const { isOrdRequest } = props;
  const { theme } = useTheme();
  const { updateBalance, isSyncing } = useQueueTracker();
  const { handleSelect, query } = useBottomMenu();
  const isReload = query === 'reload';
  const [pageState, setPageState] = useState<PageState>('main');
  const [satSendAmount, setSatSendAmount] = useState<number | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { addSnackbar } = useSnackbar();
  const { chromeStorageService, keysService, bsvService, ordinalService, oneSatSPV } = useServiceContext();
  const { socialProfile } = useSocialProfile(chromeStorageService);
  const [unlockAttempted, setUnlockAttempted] = useState(false);
  const { connectRequest } = useWeb3RequestContext();
  const isPasswordRequired = chromeStorageService?.isPasswordRequired() || false;
  const [isProcessing, setIsProcessing] = useState(false);
  const { bsvAddress, identityAddress } = keysService || {};
  const { getBsvBalance, getExchangeRate, getLockData, unlockLockedCoins, updateBsvBalance, sendBsv, sendAllBsv } =
    bsvService || {};
  const [bsvBalance, setBsvBalance] = useState<number>(getBsvBalance?.() || 0);
  const [exchangeRate, setExchangeRate] = useState<number>(getExchangeRate?.() || 0);
  const [lockData, setLockData] = useState<LockData>();
  const [isSendAllBsv, setIsSendAllBsv] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [bsv20s, setBsv20s] = useState<Bsv20[]>([]);
  const [manageFavorites, setManageFavorites] = useState(false);
  const [historyTx, setHistoryTx] = useState(false);
  const [account, setAccount] = useState<Account>();
  const [token, setToken] = useState<{ isConfirmed: boolean; info: Bsv20 } | null>(null);
  const services = theme.settings.services;
  const [filteredTokens, setFilteredTokens] = useState<Bsv20[]>([]);
  const [randomKey, setRandomKey] = useState(Math.random());
  const isTestnet = chromeStorageService?.getNetwork() === 'testnet' ? true : false;
  const [viewMode, setViewMode] = useState<ViewMode>('visual');

  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: crypto.randomUUID(), address: '', satSendAmount: null, usdSendAmount: null, amountType: 'bsv' },
  ]);

  const addRecipient = () => {
    setRecipients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), address: '', satSendAmount: null, usdSendAmount: null, amountType: 'bsv' },
    ]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients((prev) => [...prev.filter((r) => r.id !== id)]);
    }
  };

  const updateRecipient = (
    id: string,
    field: 'address' | 'satSendAmount' | 'usdSendAmount' | 'amountType' | 'error',
    value: string | number | null,
  ) => {
    setRecipients((prev) => [
      ...prev.map((r) => {
        if (r.id === id) {
          // If we're updating amountType, reset both amounts
          if (field === 'amountType') {
            return {
              ...r,
              [field]: value as AmountType,
              satSendAmount: null,
              usdSendAmount: null,
            };
          }
          // Otherwise just update the specified field
          return { ...r, [field]: value };
        }
        return r;
      }),
    ]);
  };

  const toggleRecipientAmountType = (id: string) => {
    updateRecipient(id, 'amountType', recipients.find((r) => r.id === id)?.amountType === 'bsv' ? 'usd' : 'bsv');
  };

  const resetRecipients = () => {
    setRecipients([
      { id: crypto.randomUUID(), address: '', satSendAmount: null, usdSendAmount: null, amountType: 'bsv' },
    ]);
    setIsProcessing(false);
  };

  const computeTotalAmount = () => {
    const totalBsv = recipients.reduce((acc, r) => acc + (r.satSendAmount ?? 0), 0);
    const totalUsd = recipients.reduce((acc, r) => acc + (r.usdSendAmount ?? 0), 0);
    return { totalBsv, totalUsd };
  };

  // MNEE functions removed - focusing on BSV utility

  const resetRecipientErrors = () => {
    setRecipients((prev) => [...prev.map((r) => ({ ...r, error: undefined }))]);
  };

  const getAndSetAccountAndBsv20s = async () => {
    const res = await ordinalService?.getBsv20s();
    setBsv20s(res);
    setAccount(chromeStorageService?.getCurrentAccountObject()?.account);
  };

  useEffect(() => {
    if (!bsv20s || !account) return;
    const filtered = bsv20s.filter((t) => t.id && account?.settings?.favoriteTokens?.includes(t.id));
    setFilteredTokens(filtered);
  }, [bsv20s, account]);

  useEffect(() => {
    (async () => {
      const obj = await chromeStorageService?.getAndSetStorage();
      obj && !obj.hasUpgradedToSPV ? setShowUpgrade(true) : setShowUpgrade(false);
      if (obj?.selectedAccount) {
        oneSatSPV.stores.txos?.syncTxLogs();
        if (!ordinalService) return;
        await getAndSetAccountAndBsv20s();
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const bsvBalanceInSats = bsvBalance * BSV_DECIMAL_CONVERSION;
    setIsSendAllBsv(satSendAmount === bsvBalanceInSats);
  }, [satSendAmount, bsvBalance]);

  const getAndSetBsvBalance = async () => {
    await updateBsvBalance();
    setBsvBalance(getBsvBalance());
  };

  useEffect(() => {
    if (updateBalance) {
      getAndSetBsvBalance();
      loadLocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateBalance]);

  useEffect(() => {
    if (isReload) window.location.reload();
  }, [isReload]);

  const loadLocks = async () => {
    if (!bsvService) return;
    const lockData = await getLockData();
    setLockData(lockData);
  };

  useEffect(() => {
    if (!identityAddress) return;
    loadLocks && loadLocks();
    getAndSetBsvBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityAddress]);

  const refreshUtxos = async (showLoad = false) => {
    showLoad && setIsProcessing(true);
    await updateBsvBalance();
    setBsvBalance(getBsvBalance());
    setExchangeRate(getExchangeRate());
    loadLocks && loadLocks();

    sendMessage({ action: YoursEventName.SYNC_UTXOS });

    showLoad && setIsProcessing(false);
  };

  // Connect request handling removed - standalone wallet app

  useEffect(() => {
    if (!identityAddress || isSyncing) return;
    getAndSetBsvBalance();
    if (!unlockAttempted && lockData?.unlockable) {
      (async () => {
        const res = await unlockLockedCoins();
        setUnlockAttempted(true);
        if (res) {
          if (res.error) addSnackbar('Error unlocking coins!', 'error');
          if (res.txid) {
            await refreshUtxos();
            await unlockLockedCoins();
            await sleep(1000);
            addSnackbar('Successfully unlocked coins!', 'success');
          }
        }
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityAddress, isSyncing, lockData]);

  useEffect(() => {
    if (isOrdRequest) {
      handleSelect('ords');
    }
  }, [isOrdRequest, handleSelect]);

  const resetSendState = () => {
    setPasswordConfirm('');
    setIsProcessing(false);
    resetRecipients();
    setIsSendAllBsv(false);
    setSatSendAmount(null);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(bsvAddress).then(() => {
      addSnackbar('Copied!', 'success');
    });
  };

  // MNEE send function removed - BSV-focused wallet

  const handleSendBsv = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetRecipientErrors();
    setIsProcessing(true);
    await sleep(25);

    //? multi-send validate all recipients
    for (const recipient of recipients) {
      if (!isValidEmail(recipient.address) && !validate(recipient.address)) {
        updateRecipient(recipient.id, 'error', 'Provide a valid BSV or Paymail address.');
        addSnackbar('All recipients must have valid BSV or Paymail addresses.', 'info');
        setIsProcessing(false);
        return;
      }

      if (!recipient.satSendAmount && !recipient.usdSendAmount) {
        updateRecipient(recipient.id, 'error', 'Provide an amount.');
        addSnackbar('All recipients must have an amount.', 'info');
        setIsProcessing(false);
        return;
      }
    }

    if (!passwordConfirm && isPasswordRequired) {
      addSnackbar('You must enter a password!', 'error');
      setIsProcessing(false);
      return;
    }

    //? multi-send calculate all amounts
    const sendRecipients = recipients.map((r) => {
      let satoshis = r.satSendAmount ?? 0;
      if (r.amountType === 'usd' && r.usdSendAmount) {
        satoshis = Math.ceil((r.usdSendAmount / exchangeRate) * BSV_DECIMAL_CONVERSION);
      }
      return isValidEmail(r.address) ? { paymail: r.address, satoshis } : { address: r.address, satoshis };
    });

    let sendRes: InWalletBsvResponse;
    if (isSendAllBsv) {
      const r = sendRecipients[0];
      sendRes = await sendAllBsv(r.address ?? r.paymail, r.address ? 'address' : 'paymail', passwordConfirm);
    } else {
      sendRes = await sendBsv(sendRecipients, passwordConfirm);
    }

    if (!sendRes.txid || sendRes.error) {
      addSnackbar(getErrorMessage(sendRes.error), 'error');
      setPasswordConfirm('');
      setIsProcessing(false);
      return;
    }

    resetSendState();
    setPageState('main');
    setTimeout(() => refreshUtxos(), 1000);
    addSnackbar('Transaction Successful!', 'success');
    setIsProcessing(false);
  };

  const fillInputWithAllBsv = () => {
    setSatSendAmount(Math.round(bsvBalance * BSV_DECIMAL_CONVERSION));
    setRecipients([
      {
        id: crypto.randomUUID(),
        address: '',
        satSendAmount: Math.round(bsvBalance * BSV_DECIMAL_CONVERSION),
        usdSendAmount: null,
        amountType: 'bsv',
      },
    ]);
  };

  const getLabel = () => {
    let satAmount = 0;
    recipients.forEach((r) => {
      const usdAmountInSats = r.usdSendAmount
        ? Math.ceil((r.usdSendAmount / exchangeRate) * BSV_DECIMAL_CONVERSION)
        : 0;
      satAmount += r.satSendAmount ?? usdAmountInSats;
    });
    const sendAmount = satAmount ? satAmount / BSV_DECIMAL_CONVERSION : 0;
    const overBalance = sendAmount > bsvBalance;
    return sendAmount
      ? overBalance
        ? 'Insufficient Balance'
        : `Send ${satAmount / BSV_DECIMAL_CONVERSION}`
      : 'Enter Send Details';
  };

  const handleSync = async () => {
    await refreshUtxos();
    await chromeStorageService?.update({ hasUpgradedToSPV: true });
    window.location.reload();
  };

  const handleBsv20TokenClick = (token: Bsv20) => {
    if (token.all.pending > 0n) {
      addSnackbar('Pending tokens cannot be sent!', 'error', 2000);
      return;
    }
    setToken({
      isConfirmed: true,
      info: token,
    });
  };

  const handleTestNetFaucetConfirmation = () => {
    addSnackbar('Testnet coins sent! It may take one block confirmation for them to appear in your wallet.', 'success');
    refreshUtxos();
  };

  const receive = (
    <ReceiveContent>
      <HeaderText style={{ marginTop: '1rem' }} theme={theme}>
        Receive Assets
      </HeaderText>
      <Show
        when={services.ordinals || services.bsv20}
        whenFalseContent={
          <Text style={{ marginBottom: '1.25rem' }} theme={theme}>
            You may safely send <Warning theme={theme}>Bitcoin SV (BSV)</Warning> to this address.
          </Text>
        }
      >
        <Text style={{ marginBottom: '1.25rem' }} theme={theme}>
          You may safely send <Warning theme={theme}>BSV and Ordinals</Warning> to this address.
        </Text>
      </Show>

      <QrCode address={bsvAddress} onClick={handleCopyToClipboard} />
      <Text theme={theme} style={{ margin: '1rem 0 -1.25rem 0', fontWeight: 700 }}>
        Scan or copy the address
      </Text>
      <CopyAddressWrapper onClick={handleCopyToClipboard}>
        <StyledCopy src={copyIcon} />
        <Text
          theme={theme}
          style={{
            margin: '0',
            color: theme.color.global.contrast,
            fontSize: '0.75rem',
          }}
        >
          {bsvAddress}
        </Text>
      </CopyAddressWrapper>
      <Button
        label="Go back"
        theme={theme}
        type="secondary"
        onClick={() => {
          setPageState('main');
          updateBsvBalance();
        }}
      />
    </ReceiveContent>
  );

  const main = (
    <AppContainer theme={theme}>
      <Taskbar />
      <AppHeader theme={theme} onTitleClick={() => setPageState('main')} />
      <WalletShowcaseTabs onTabChange={(tabId) => console.log('Tab changed to:', tabId)} />
      <ContentContainer theme={theme}>
        {/* File Types Sidebar - moved to left */}
        <Sidebar theme={theme}>
          <SidebarTitle theme={theme}>File Type Assets</SidebarTitle>
          
          {/* View Mode Toggle */}
          <ViewModeToggle
            currentMode={viewMode}
            onModeChange={setViewMode}
            theme={{ theme }}
          />
          
          {/* Media Files */}
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
            balance={45}
            icon="🎨"
            ticker="SVG"
            usdBalance={45 * 6.50}
            showPointer={true}
          />
          <AssetRow
            balance={23}
            icon="🎵"
            ticker="WAV"
            usdBalance={23 * 15.25}
            showPointer={true}
          />
          <AssetRow
            balance={89}
            icon="🎶"
            ticker="MP3"
            usdBalance={89 * 8.75}
            showPointer={true}
          />
          <AssetRow
            balance={12}
            icon="🎬"
            ticker="MOV"
            usdBalance={12 * 125.00}
            showPointer={true}
          />
          <AssetRow
            balance={67}
            icon="📹"
            ticker="MP4"
            usdBalance={67 * 85.50}
            showPointer={true}
          />
          <AssetRow
            balance={23}
            icon="🎞️"
            ticker="AVI"
            usdBalance={23 * 95.00}
            showPointer={true}
          />
          
          {/* Document Files */}
          <AssetRow
            balance={156}
            icon="📄"
            ticker="PDF"
            usdBalance={156 * 3.25}
            showPointer={true}
          />
          <AssetRow
            balance={234}
            icon="📝"
            ticker="DOC"
            usdBalance={234 * 1.80}
            showPointer={true}
          />
          <AssetRow
            balance={123}
            icon="📊"
            ticker="XLS"
            usdBalance={123 * 2.15}
            showPointer={true}
          />
          <AssetRow
            balance={34}
            icon="🔤"
            ticker="TXT"
            usdBalance={34 * 0.85}
            showPointer={true}
          />
          
          {/* Code & Web Files */}
          <AssetRow
            balance={56}
            icon="🌐"
            ticker="HTML"
            usdBalance={56 * 3.75}
            showPointer={true}
          />
          <AssetRow
            balance={78}
            icon="⚙️"
            ticker="JSON"
            usdBalance={78 * 1.25}
            showPointer={true}
          />
          <AssetRow
            balance={89}
            icon="💻"
            ticker="ZIP"
            usdBalance={89 * 12.50}
            showPointer={true}
          />
          <AssetRow
            balance={67}
            icon="📱"
            ticker="APP"
            usdBalance={67 * 45.50}
            showPointer={true}
          />
        </Sidebar>
        
        <WalletMainContent theme={theme}>
          {/* Token Visualizer with multiple view modes */}
          <TokenVisualizer
            theme={{ theme }}
            viewMode={viewMode}
            tokens={[
              // Bitcoin blockchain token/asset representations
              {
                address: bsvAddress || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                tokenId: 'ord-424242',
                contentType: 'image/png',
                data: 'QmPK1s3pNYLi9ERiq3BDxKa1XosgWwFRQUydHUtz4YgpqB', // IPFS hash example
                metadata: {
                  name: 'Bitcoin Punk #424242',
                  description: 'Ordinal inscription on Bitcoin',
                  block: 823456,
                  txid: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                  vout: 0,
                  satoshi: 100000000,
                  inscription_number: 424242
                }
              },
              {
                address: '1CounterpartyXXXXXXXXXXXXXXXUWLpVr',
                tokenId: 'PEPECASH',
                contentType: 'token/counterparty',
                data: {
                  supply: '1000000000',
                  divisible: true,
                  locked: true
                },
                metadata: {
                  name: 'PEPECASH',
                  description: 'Rare Pepe trading card currency',
                  asset_id: 'A11451804412046674500',
                  block: 428919,
                  txid: '4a60a05c3023e24398b3c653b8531b3f38b23dc50a6dc1823b89fab06e58f10f'
                }
              },
              {
                address: bsvAddress || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                tokenId: 'bsv20-ordi',
                contentType: 'application/bsv-20',
                data: {
                  p: 'bsv-20',
                  op: 'deploy',
                  tick: 'ORDI',
                  max: '21000000',
                  lim: '1000'
                },
                metadata: {
                  name: 'BSV-20 ORDI Token',
                  description: 'BSV-20 fungible token standard',
                  deployed_at: 783968,
                  txid: '9b1125c15aa6a89f8a0de935c1533c098e55b4ebf66e5b50ae0da45bb0add812',
                  current_supply: '15234000'
                }
              },
              {
                address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
                tokenId: 'rgb-asset-001',
                contentType: 'application/rgb',
                data: {
                  schema: 'RGB20',
                  contract_id: 'rgb:2WBwJZV-Q5t8G5Pqt-v3vMRVi3n-M3BVC3jBc-Mpq5NTqKe-2NyysCS',
                  ticker: 'USDT',
                  name: 'Tether USD (RGB)',
                  precision: 8
                },
                metadata: {
                  name: 'RGB USDT',
                  description: 'RGB smart contract for USDT on Bitcoin',
                  genesis_txid: 'c1d3b2a1e8f9c8b7a6d5e4c3b2a1f0e9d8c7b6a5d4c3b2a1e0f9d8c7b6a5d4c3',
                  utxo: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy:1',
                  amount: '1000000000'
                }
              }
            ]}
          />
        </WalletMainContent>
      </ContentContainer>
    </AppContainer>
  );


  // MNEE components removed - this is a BSV-focused wallet

  const send = (
    <>
      <ScrollableConfirmContent>
        <HeaderText theme={theme}>Send BSV</HeaderText>
        <Text
          theme={theme}
          style={{ cursor: 'pointer' }}
          onClick={fillInputWithAllBsv}
        >{`Balance: ${bsvBalance}`}</Text>
        <FormContainer noValidate onSubmit={(e) => handleSendBsv(e)}>
          {recipients.map((recipient) => (
            <RecipientRow key={recipient.id} theme={theme}>
              <RecipientInputs>
                <InputWrapper>
                  <Input
                    theme={theme}
                    placeholder="Enter Address or Paymail"
                    type="text"
                    onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                    value={recipient.address}
                  />
                  {recipients.length > 1 && (
                    <FaTrash
                      size="1rem"
                      color={theme.color.global.gray}
                      style={{
                        position: 'absolute',
                        right: '2.25rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                      }}
                      onClick={() => removeRecipient(recipient.id)}
                    />
                  )}
                </InputWrapper>
                <InputWrapper>
                  <Input
                    theme={theme}
                    placeholder={recipient.amountType === 'bsv' ? 'Enter BSV Amount' : 'Enter USD Amount'}
                    type="number"
                    step="0.00000001"
                    value={
                      recipient.satSendAmount !== null && recipient.satSendAmount !== undefined
                        ? recipient.satSendAmount / BSV_DECIMAL_CONVERSION
                        : recipient.usdSendAmount !== null && recipient.usdSendAmount !== undefined
                          ? recipient.usdSendAmount
                          : ''
                    }
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') {
                        updateRecipient(recipient.id, 'satSendAmount', null);
                        updateRecipient(recipient.id, 'usdSendAmount', null);
                      } else {
                        if (recipient.amountType === 'bsv') {
                          updateRecipient(
                            recipient.id,
                            'satSendAmount',
                            Math.round(Number(inputValue) * BSV_DECIMAL_CONVERSION),
                          );
                        } else {
                          updateRecipient(recipient.id, 'usdSendAmount', Number(inputValue));
                        }
                      }
                    }}
                  />
                  <UnitSwitcher theme={theme}>
                    {recipient.amountType === 'bsv' ? 'BSV' : 'USD'}
                    <FaArrowRightArrowLeft
                      size="1rem"
                      style={{ marginLeft: '0.5rem' }}
                      color={theme.color.global.gray}
                      onClick={() => toggleRecipientAmountType(recipient.id)}
                    />
                  </UnitSwitcher>
                </InputWrapper>
              </RecipientInputs>
            </RecipientRow>
          ))}
          <Show when={!isSendAllBsv}>
            <Button type="secondary-outline" label="+ Add Recipient" onClick={addRecipient} theme={theme} />
          </Show>
          <Show when={isPasswordRequired}>
            <Input
              theme={theme}
              placeholder="Enter Wallet Password"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </Show>
          <Button
            theme={theme}
            type="primary"
            label={getLabel()}
            disabled={
              isProcessing ||
              getLabel() === 'Insufficient Balance' ||
              (!computeTotalAmount().totalBsv && !computeTotalAmount().totalUsd)
            }
            isSubmit
          />
        </FormContainer>

        <Button
          label="Go back"
          theme={theme}
          type="secondary"
          onClick={() => {
            setPageState('main');
            resetRecipients();
            resetSendState();
          }}
        />
      </ScrollableConfirmContent>
    </>
  );

  if (token) {
    return <SendBsv20View token={token} onBack={() => setToken(null)} />;
  }

  if (showUpgrade) {
    return <UpgradeNotification onSync={handleSync} />;
  }

  if (!chromeStorageService || !keysService || !bsvService) {
    return <div>Loading wallet...</div>;
  }

  return (
    <>
      <Show when={manageFavorites}>
        <ManageTokens
          onBack={() => {
            setManageFavorites(false);
            getAndSetAccountAndBsv20s();
            setRandomKey(Math.random());
          }}
          bsv20s={bsv20s}
          theme={theme}
        />
      </Show>
      <Show when={historyTx}>
        <TxHistory
          onBack={() => {
            setHistoryTx(false);
            getAndSetAccountAndBsv20s();
            setRandomKey(Math.random());
          }}
          theme={theme}
        />
      </Show>
      <Show when={isProcessing && pageState === 'main'}>
        <PageLoader theme={theme} message="Loading wallet..." />
      </Show>
      <Show when={isProcessing && pageState === 'send'}>
        <PageLoader theme={theme} message="Sending BSV..." />
      </Show>
      <Show when={!isProcessing && pageState === 'main'}>{main}</Show>
      <Show when={!isProcessing && pageState === 'receive'}>{receive}</Show>
      <Show when={!isProcessing && pageState === 'send'}>{send}</Show>
    </>
  );
};
