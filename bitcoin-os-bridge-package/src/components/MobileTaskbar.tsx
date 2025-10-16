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
  height: 80px;
  background: ${({ theme }) => theme?.color.global.row || 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)'};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px;
  z-index: 10000;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);

  @media (max-width: 480px) {
    height: 70px;
    padding: 0 8px;
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
  border-radius: 12px;
  padding: 8px 12px;
  min-width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ $primary }) => $primary ? '#000' : '#ffffff'};
  
  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 480px) {
    min-width: 50px;
    height: 50px;
    padding: 6px 8px;
  }
`;

const ButtonIcon = styled.div<{ $primary?: boolean }>`
  font-size: 20px;
  margin-bottom: 4px;
  color: ${({ $primary }) => $primary ? '#000' : '#eab308'};

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 2px;
  }
`;

const ButtonLabel = styled.span<{ $primary?: boolean }>`
  font-size: 10px;
  font-weight: 500;
  color: ${({ $primary }) => $primary ? '#000' : '#ffffff'};
  text-align: center;
  line-height: 1;

  @media (max-width: 480px) {
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
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 24px;
  transform: translateY(${({ $show }) => $show ? '0' : '100%'});
  transition: transform 0.3s ease;
  max-height: 70vh;
  overflow-y: auto;
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