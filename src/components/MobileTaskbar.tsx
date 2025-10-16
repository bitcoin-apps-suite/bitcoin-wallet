import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaHome, FaPaperPlane, FaDownload, FaEllipsisH, FaBitcoin, FaTimes, FaGithub, FaTrophy } from 'react-icons/fa';
import { WhiteLabelTheme } from '../theme.types';

interface MobileTaskbarProps {
  theme?: WhiteLabelTheme;
}

const MobileTaskbarContainer = styled.div<{ theme?: WhiteLabelTheme['theme'] }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 88px;
  background: ${({ theme }) => theme?.color.global.row || 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)'};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 8px 20px;
  z-index: 10000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  
  /* Safe area handling for newer phones */
  padding-bottom: max(8px, env(safe-area-inset-bottom));

  @media (max-width: 480px) {
    height: 82px;
    padding: 6px 16px;
    padding-bottom: max(6px, env(safe-area-inset-bottom));
  }
  
  @media (max-width: 360px) {
    height: 78px;
    padding: 4px 12px;
    padding-bottom: max(4px, env(safe-area-inset-bottom));
  }
`;

const MobileTaskbarButton = styled.button<{ $active?: boolean; $primary?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ $active, $primary }) => 
    $primary ? 'linear-gradient(135deg, #eab308, #ca8a04)' :
    $active ? 'rgba(234, 179, 8, 0.2)' : 'transparent'};
  border: none;
  border-radius: 16px;
  padding: 12px;
  min-width: 68px;
  height: 68px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${({ $primary }) => $primary ? '#000' : '#ffffff'};
  position: relative;
  
  /* Larger touch target for better accessibility */
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border-radius: 20px;
  }
  
  &:active {
    transform: scale(0.92);
    background: ${({ $primary }) => 
      $primary ? 'linear-gradient(135deg, #ca8a04, #a16207)' :
      'rgba(234, 179, 8, 0.3)'};
  }

  @media (max-width: 480px) {
    min-width: 62px;
    height: 62px;
    padding: 10px;
    border-radius: 14px;
    
    &::before {
      top: -6px;
      left: -6px;
      right: -6px;
      bottom: -6px;
    }
  }
  
  @media (max-width: 360px) {
    min-width: 56px;
    height: 56px;
    padding: 8px;
    border-radius: 12px;
  }
`;

const ButtonIcon = styled.div<{ $primary?: boolean }>`
  font-size: 22px;
  margin-bottom: 6px;
  color: ${({ $primary }) => $primary ? '#000' : '#eab308'};
  transition: all 0.2s ease;

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  @media (max-width: 360px) {
    font-size: 18px;
    margin-bottom: 3px;
  }
`;

const ButtonLabel = styled.span<{ $primary?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $primary }) => $primary ? '#000' : 'rgba(255, 255, 255, 0.9)'};
  text-align: center;
  line-height: 1.1;
  letter-spacing: 0.02em;

  @media (max-width: 480px) {
    font-size: 10px;
  }
  
  @media (max-width: 360px) {
    font-size: 9px;
  }
`;

const MobileMenuOverlay = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 20000;
  opacity: ${({ $show }) => $show ? 1 : 0};
  visibility: ${({ $show }) => $show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const MobileMenuPanel = styled.div<{ $show: boolean; theme?: WhiteLabelTheme['theme'] }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme?.color.global.row || '#1a1a1a'};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  transform: translateY(${({ $show }) => $show ? '0' : '100%'});
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 75vh;
  overflow-y: auto;
  
  /* Smooth scrolling for iOS */
  -webkit-overflow-scrolling: touch;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(234, 179, 8, 0.3);
    border-radius: 2px;
  }
  
  /* Pull indicator */
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const MenuTitle = styled.h3`
  color: #eab308;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MenuSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  color: #ffffff;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.8;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(234, 179, 8, 0.3);
  }
`;

const AppItem = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(234, 179, 8, 0.3);
  }
`;

const AppIcon = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 16px;
  font-weight: bold;
  width: 20px;
  text-align: center;
`;

export const MobileTaskbar = ({ theme }: MobileTaskbarProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const primaryActions = [
    {
      icon: FaHome,
      label: 'Home',
      action: () => window.location.href = '/',
      primary: false
    },
    {
      icon: FaPaperPlane,
      label: 'Send',
      action: () => console.log('Send BSV'),
      primary: true
    },
    {
      icon: FaDownload,
      label: 'Receive',
      action: () => console.log('Receive BSV'),
      primary: false
    },
    {
      icon: FaEllipsisH,
      label: 'More',
      action: () => setShowMenu(true),
      primary: false
    }
  ];

  const bitcoinApps = [
    { name: 'Bitcoin Auth', color: '#ef4444', url: '#' },
    { name: 'Bitcoin Chat', color: '#ff6500', url: '#' },
    { name: 'Bitcoin Domains', color: '#eab308', url: '#' },
    { name: 'Bitcoin Drive', color: '#fbbf24', url: 'https://bitcoin-drive.vercel.app' },
    { name: 'Bitcoin Email', color: '#06b6d4', url: '#' },
    { name: 'Bitcoin Exchange', color: '#3b82f6', url: '#' },
    { name: 'Bitcoin Music', color: '#8b5cf6', url: '#' },
    { name: 'Bitcoin Pics', color: '#ec4899', url: '#' },
    { name: 'Bitcoin Spreadsheets', color: '#3b82f6', url: 'https://bitcoin-sheets.vercel.app' },
    { name: 'Bitcoin Writer', color: '#ff9500', url: 'https://bitcoin-writer.vercel.app' }
  ];

  const walletActions = [
    { label: 'Send BSV', action: () => console.log('Send BSV') },
    { label: 'Receive BSV', action: () => console.log('Receive BSV') },
    { label: 'Transaction History', action: () => console.log('Transaction history') },
    { label: '$BWallet Token', action: () => window.location.href = '/token' },
    { label: 'Exchange Currencies', action: () => console.log('Exchange currencies') },
    { label: 'Portfolio Overview', action: () => console.log('Portfolio overview') }
  ];

  const toolsActions = [
    { label: 'Backup Wallet', action: () => console.log('Backup wallet') },
    { label: 'Security Settings', action: () => console.log('Security settings') },
    { label: 'Address Generator', action: () => console.log('Address generator') },
    { label: 'Message Signing', action: () => console.log('Message signing') }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showMenu]);

  return (
    <>
      <MobileTaskbarContainer theme={theme?.theme}>
        {primaryActions.map((action, index) => (
          <MobileTaskbarButton
            key={index}
            onClick={action.action}
            $primary={action.primary}
            $active={action.label === 'More' && showMenu}
          >
            <ButtonIcon $primary={action.primary}>
              <action.icon />
            </ButtonIcon>
            <ButtonLabel $primary={action.primary}>{action.label}</ButtonLabel>
          </MobileTaskbarButton>
        ))}
      </MobileTaskbarContainer>

      <MobileMenuOverlay $show={showMenu} onClick={() => setShowMenu(false)} />
      
      <MobileMenuPanel $show={showMenu} theme={theme?.theme} ref={menuRef}>
        <MenuHeader>
          <MenuTitle>Bitcoin Wallet</MenuTitle>
          <CloseButton onClick={() => setShowMenu(false)}>
            <FaTimes />
          </CloseButton>
        </MenuHeader>

        <MenuSection>
          <SectionTitle>Wallet Actions</SectionTitle>
          <MenuGrid>
            {walletActions.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  item.action();
                  setShowMenu(false);
                }}
              >
                <FaBitcoin style={{ color: '#eab308' }} />
                {item.label}
              </MenuItem>
            ))}
          </MenuGrid>
        </MenuSection>

        <MenuSection>
          <SectionTitle>Bitcoin Apps</SectionTitle>
          <MenuGrid>
            {bitcoinApps.map((app, index) => (
              <AppItem
                key={index}
                href={app.url}
                target={app.url.startsWith('http') ? '_blank' : undefined}
                rel={app.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={() => setShowMenu(false)}
              >
                <AppIcon color={app.color}>₿</AppIcon>
                {app.name.replace('Bitcoin ', '')}
              </AppItem>
            ))}
          </MenuGrid>
        </MenuSection>

        <MenuSection>
          <SectionTitle>Tools & Settings</SectionTitle>
          <MenuGrid>
            {toolsActions.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  item.action();
                  setShowMenu(false);
                }}
              >
                <FaBitcoin style={{ color: '#eab308' }} />
                {item.label}
              </MenuItem>
            ))}
          </MenuGrid>
        </MenuSection>

        <MenuSection>
          <SectionTitle>Links</SectionTitle>
          <MenuGrid>
            <AppItem href="/leaderboard" onClick={() => setShowMenu(false)}>
              <FaTrophy style={{ color: '#eab308' }} />
              Leaderboard
            </AppItem>
            <AppItem href="https://github.com/bitcoin-apps-suite/bitcoin-wallet" target="_blank" rel="noopener noreferrer" onClick={() => setShowMenu(false)}>
              <FaGithub style={{ color: '#eab308' }} />
              GitHub
            </AppItem>
          </MenuGrid>
        </MenuSection>
      </MobileMenuPanel>
    </>
  );
};