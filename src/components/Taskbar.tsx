import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaGithub, FaTrophy } from 'react-icons/fa';

interface DropdownItem {
  label?: string;
  action?: () => void;
  href?: string;
  divider?: boolean;
  shortcut?: string;
  target?: string;
}

interface DropdownMenu {
  label: string;
  items: DropdownItem[];
}

const TaskbarContainer = styled.div`
  display: flex;
  align-items: center;
  height: 28px;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-bottom: 1px solid #1a1a1a;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  user-select: none;
  position: relative;
  z-index: 10000;
`;

const BitcoinButton = styled.button<{ $active: boolean }>`
  padding: 0 12px;
  font-size: 18px;
  font-weight: bold;
  color: #eab308;
  display: flex;
  align-items: center;
  height: 28px;
  background: ${props => props.$active ? 'rgba(234, 179, 8, 0.1)' : 'transparent'};
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
`;

const MenuButton = styled.button<{ $active: boolean }>`
  padding: 0 12px;
  height: 24px;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 28px;
  left: 0;
  min-width: 220px;
  background: #1a1a1a;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  padding: 8px 0;
  z-index: 1000;
`;

const DropdownHeader = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: #eab308;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 16px;
  color: #ffffff;
  background: transparent;
  text-decoration: none;
  font-size: 13px;
  transition: background 0.15s ease;
  cursor: pointer;
  font-weight: 400;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AppMenuItem = styled.a`
  display: flex;
  align-items: center;
  padding: 6px 16px;
  color: #ffffff;
  background: transparent;
  text-decoration: none;
  font-size: 13px;
  transition: background 0.15s ease;
  cursor: pointer;
  font-weight: 400;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatusContainer = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`;

const StatusLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;

  &:hover {
    color: #eab308;
    background: rgba(234, 179, 8, 0.1);
  }
`;

export const Taskbar = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showBitcoinSuite, setShowBitcoinSuite] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menus: DropdownMenu[] = [
    {
      label: 'Bitcoin Wallet',
      items: [
        { label: 'Home', shortcut: '⌘⇧H', action: () => window.location.href = '/' },
        { divider: true },
        { label: 'About Bitcoin Wallet', action: () => alert('Bitcoin Wallet v1.0\n\nFull-featured BSV wallet with real-world currency and file type tokens\n\nBuilt with React and BSV SDK') },
        { divider: true },
        { label: '$BWallet Token', action: () => window.location.href = '/token' },
        { label: 'Preferences...', shortcut: '⌘,', action: () => console.log('Preferences') },
        { label: 'Security Settings...', action: () => console.log('Security settings') },
        { divider: true },
        { label: 'Lock Wallet', shortcut: '⌘L', action: () => console.log('Lock wallet') }
      ]
    },
    {
      label: 'Wallet',
      items: [
        { label: 'Send BSV', shortcut: '⌘S', action: () => console.log('Send BSV') },
        { label: 'Receive BSV', shortcut: '⌘R', action: () => console.log('Receive BSV') },
        { divider: true },
        { label: 'Send Currency', action: () => console.log('Send currency') },
        { label: 'Exchange Currencies', action: () => console.log('Exchange currencies') },
        { divider: true },
        { label: 'Send File Token', action: () => console.log('Send file token') },
        { label: 'Trade File Tokens', action: () => console.log('Trade file tokens') },
        { divider: true },
        { label: 'Transaction History', shortcut: '⌘H', action: () => console.log('Transaction history') },
        { label: 'Export Data', action: () => console.log('Export data') }
      ]
    },
    {
      label: 'Assets',
      items: [
        { label: 'Real Currencies', action: () => console.log('Real currencies') },
        { label: 'File Type Tokens', action: () => console.log('File type tokens') },
        { divider: true },
        { label: 'Add Custom Asset', action: () => console.log('Add custom asset') },
        { label: 'Portfolio Overview', action: () => console.log('Portfolio overview') },
        { divider: true },
        { label: 'Asset Calculator', action: () => console.log('Asset calculator') },
        { label: 'Market Data', action: () => console.log('Market data') }
      ]
    },
    {
      label: 'Tools',
      items: [
        { label: 'Address Generator', action: () => console.log('Address generator') },
        { label: 'Message Signing', action: () => console.log('Message signing') },
        { label: 'Key Management', action: () => console.log('Key management') },
        { divider: true },
        { label: 'Backup Wallet', shortcut: '⌘B', action: () => console.log('Backup wallet') },
        { label: 'Restore Wallet', action: () => console.log('Restore wallet') },
        { divider: true },
        { label: 'Verify Transaction', action: () => console.log('Verify transaction') },
        { label: 'View on Explorer', href: 'https://whatsonchain.com', target: '_blank' }
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Balance View', shortcut: '⌘1', action: () => console.log('Balance view') },
        { label: 'Transaction View', shortcut: '⌘2', action: () => console.log('Transaction view') },
        { label: 'Assets View', shortcut: '⌘3', action: () => console.log('Assets view') },
        { divider: true },
        { label: 'Toggle Sidebar', shortcut: '⌥⌘S', action: () => console.log('Toggle sidebar') },
        { label: 'Full Screen', shortcut: '⌃⌘F', action: () => document.documentElement.requestFullscreen() }
      ]
    },
    {
      label: 'Developers',
      items: [
        { label: 'Documentation', action: () => window.location.href = '/docs' },
        { label: 'Tasks Leaderboard', action: () => window.location.href = '/leaderboard' },
        { label: 'GitHub Repository', href: 'https://github.com/bitcoin-apps-suite/bitcoin-wallet', target: '_blank' },
        { divider: true },
        { label: 'API Reference', action: () => window.location.href = '/docs#api-reference' },
        { label: 'Bitcoin Integration Guide', action: () => window.location.href = '/docs#bitcoin-integration' },
        { label: 'Contributing Guide', action: () => window.location.href = '/docs#contributing' },
        { divider: true },
        { label: 'Report Bug', href: 'https://github.com/bitcoin-apps-suite/bitcoin-wallet/issues/new?template=bug_report.md', target: '_blank' },
        { label: 'Request Feature', href: 'https://github.com/bitcoin-apps-suite/bitcoin-wallet/issues/new?template=feature_request.md', target: '_blank' },
        { label: 'Submit Task Solution', href: 'https://github.com/bitcoin-apps-suite/bitcoin-wallet/pulls', target: '_blank' }
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'Bitcoin Wallet Help', shortcut: '⌘?', action: () => alert('Bitcoin Wallet v1.0\n\nA full-featured BSV wallet for real-world utility') },
        { label: 'Keyboard Shortcuts', action: () => console.log('Show shortcuts') },
        { divider: true },
        { label: 'Report Issue', href: 'https://github.com/bitcoin-apps-suite/bitcoin-wallet/issues', target: '_blank' },
        { label: 'Contact Support', href: 'https://twitter.com/b0ase', target: '_blank' }
      ]
    }
  ];

  const bitcoinApps = [
    { name: 'Bitcoin Auth', color: '#ef4444', url: '#' },
    { name: 'Bitcoin Chat', color: '#ff6500', url: '#' },
    { name: 'Bitcoin Domains', color: '#eab308', url: '#' },
    { name: 'Bitcoin Draw', color: '#f59e0b', url: '#' },
    { name: 'Bitcoin Drive', color: '#fbbf24', url: 'https://bitcoin-drive.vercel.app' },
    { name: 'Bitcoin Email', color: '#06b6d4', url: '#' },
    { name: 'Bitcoin Exchange', color: '#3b82f6', url: '#' },
    { name: 'Bitcoin Music', color: '#8b5cf6', url: '#' },
    { name: 'Bitcoin Paint', color: '#a855f7', url: '#' },
    { name: 'Bitcoin Pics', color: '#ec4899', url: '#' },
    { name: 'Bitcoin Registry', color: '#f43f5e', url: '#' },
    { name: 'Bitcoin Shares', color: '#f43f5e', url: '#' },
    { name: 'Bitcoin Spreadsheets', color: '#3b82f6', url: 'https://bitcoin-sheets.vercel.app' },
    { name: 'Bitcoin Video', color: '#fcd34d', url: '#' },
    { name: 'Bitcoin Wallet', color: '#eab308', url: '#', current: true },
    { name: 'Bitcoin Writer', color: '#ff9500', url: 'https://bitcoin-writer.vercel.app' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setShowBitcoinSuite(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <TaskbarContainer ref={menuRef}>
      {/* Bitcoin Logo */}
      <div style={{ position: 'relative' }}>
        <BitcoinButton
          $active={showBitcoinSuite}
          onClick={() => {
            setShowBitcoinSuite(!showBitcoinSuite);
            setActiveMenu(null);
          }}
          onDoubleClick={() => window.location.href = '/'}
          title="Bitcoin Suite Apps - Double-click to go home"
        >
          ₿
        </BitcoinButton>

        {/* Bitcoin Suite Dropdown */}
        {showBitcoinSuite && (
          <DropdownContainer>
            <DropdownHeader>Bitcoin Apps</DropdownHeader>
            
            {bitcoinApps.map((app) => (
              <AppMenuItem
                key={app.name}
                href={app.url}
                target={app.url.startsWith('http') ? '_blank' : undefined}
                rel={app.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={() => setShowBitcoinSuite(false)}
              >
                <span 
                  style={{ 
                    color: app.color,
                    marginRight: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ₿
                </span>
                <span>
                  {app.name}
                  {app.current && <span style={{ marginLeft: '8px', fontSize: '11px', opacity: 0.6 }}>(current)</span>}
                </span>
              </AppMenuItem>
            ))}
          </DropdownContainer>
        )}
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {menus.map((menu) => (
          <div key={menu.label} style={{ position: 'relative' }}>
            <MenuButton
              $active={activeMenu === menu.label}
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
            >
              {menu.label}
            </MenuButton>

            {/* Dropdown Menu */}
            {activeMenu === menu.label && (
              <DropdownContainer style={{ minWidth: '200px' }}>
                {menu.items.map((item, index) => (
                  item.divider ? (
                    <div 
                      key={index}
                      style={{
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        margin: '4px 0'
                      }}
                    />
                  ) : item.href ? (
                    <MenuItem
                      key={index}
                      as="a"
                      href={item.href}
                      target={item.target || '_blank'}
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span style={{ opacity: 0.6, fontSize: '12px' }}>{item.shortcut}</span>
                      )}
                    </MenuItem>
                  ) : (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        item.action?.();
                        setActiveMenu(null);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span style={{ opacity: 0.6, fontSize: '12px' }}>{item.shortcut}</span>
                      )}
                    </MenuItem>
                  )
                ))}
              </DropdownContainer>
            )}
          </div>
        ))}
      </div>

      {/* Right side - Status items */}
      <StatusContainer>
        <StatusLink href="/leaderboard" title="Contributors Leaderboard">
          <FaTrophy style={{ marginRight: '4px' }} />
          Leaderboard
        </StatusLink>
        <StatusLink href="https://github.com/bitcoin-apps-suite/bitcoin-wallet" target="_blank" rel="noopener noreferrer" title="GitHub Repository">
          <FaGithub style={{ marginRight: '4px' }} />
          GitHub
        </StatusLink>
        <span>BSV Network</span>
        <span style={{ color: '#fbbf24' }}>●</span>
      </StatusContainer>
    </TaskbarContainer>
  );
};