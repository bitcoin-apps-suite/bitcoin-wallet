import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { FaBars, FaTimes, FaUser, FaPlus, FaGithub } from 'react-icons/fa';
import { truncate } from '../utils/format';
import copyIcon from '../assets/copy.svg';

const MenuButton = styled.button<WhiteLabelTheme>`
  display: none;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.color.global.contrast};
  padding: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MenuOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  animation: ${({ $isOpen }) => ($isOpen ? 'fadeIn 0.3s' : 'none')};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const MenuDrawer = styled.div<WhiteLabelTheme & { $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${({ $isOpen }) => ($isOpen ? '0' : '-100%')};
  width: 85%;
  max-width: 320px;
  height: 100vh;
  background: ${({ theme }) => theme.color.global.walletBackground};
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);
  z-index: 999;
  transition: right 0.3s ease;
  overflow-y: auto;
`;

const MenuHeader = styled.div<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.color.global.gray + '40'};
  background: ${({ theme }) => theme.color.global.row};
`;

const MenuTitle = styled.h3<WhiteLabelTheme>`
  margin: 0;
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 1.1rem;
`;

const CloseButton = styled.button<WhiteLabelTheme>`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.color.global.contrast};
  padding: 0.5rem;
  cursor: pointer;
`;

const MenuSection = styled.div<WhiteLabelTheme>`
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.global.gray + '20'};
`;

const SectionTitle = styled.h4<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.gray};
  font-size: 0.8rem;
  text-transform: uppercase;
  padding: 0 1.25rem;
  margin: 0 0 0.5rem 0;
`;

const MenuItem = styled.div<WhiteLabelTheme & { $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  background: ${({ $isActive, theme }) => 
    $isActive ? theme.color.global.gray + '20' : 'transparent'};
  transition: background-color 0.2s;

  &:active {
    background: ${({ theme }) => theme.color.global.gray + '30'};
  }
`;

const AccountIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const AccountInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AccountName = styled.p<WhiteLabelTheme>`
  margin: 0;
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 0.95rem;
  font-weight: 500;
`;

const AccountAddress = styled.p<WhiteLabelTheme>`
  margin: 0;
  color: ${({ theme }) => theme.color.global.gray};
  font-size: 0.8rem;
`;

const CopyButton = styled.img`
  width: 18px;
  height: 18px;
  opacity: 0.7;
  cursor: pointer;
`;

const ActionButton = styled.div<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.875rem 1.25rem;
  color: ${({ theme }) => theme.color.global.contrast};
  cursor: pointer;
  transition: background-color 0.2s;

  &:active {
    background: ${({ theme }) => theme.color.global.gray + '20'};
  }
`;

interface MobileHamburgerMenuProps {
  theme: any;
  accounts: any[];
  currentAccount: any;
  onAccountSwitch: (identityAddress: string) => void;
  onAddAccount: () => void;
  onCopyAddress: (address: string) => void;
  onGithubClick: () => void;
}

export const MobileHamburgerMenu: React.FC<MobileHamburgerMenuProps> = ({
  theme,
  accounts,
  currentAccount,
  onAccountSwitch,
  onAddAccount,
  onCopyAddress,
  onGithubClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAccountSwitch = (identityAddress: string) => {
    onAccountSwitch(identityAddress);
    setIsOpen(false);
  };

  const handleAddAccount = () => {
    onAddAccount();
    setIsOpen(false);
  };

  const handleGithubClick = () => {
    onGithubClick();
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <MenuButton theme={theme} onClick={handleToggle}>
        <FaBars size={20} />
      </MenuButton>

      <MenuOverlay $isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <MenuDrawer ref={menuRef} theme={theme} $isOpen={isOpen}>
        <MenuHeader theme={theme}>
          <MenuTitle theme={theme}>Menu</MenuTitle>
          <CloseButton theme={theme} onClick={() => setIsOpen(false)}>
            <FaTimes size={20} />
          </CloseButton>
        </MenuHeader>

        <MenuSection theme={theme}>
          <SectionTitle theme={theme}>Accounts</SectionTitle>
          
          {accounts.map((account) => (
            <MenuItem
              key={account.addresses.identityAddress}
              theme={theme}
              $isActive={account.addresses.identityAddress === currentAccount?.addresses.identityAddress}
              onClick={() => handleAccountSwitch(account.addresses.identityAddress)}
            >
              <AccountIcon src={account.icon} />
              <AccountInfo>
                <AccountName theme={theme}>{account.name}</AccountName>
                <AccountAddress theme={theme}>
                  {truncate(account.addresses.bsvAddress, 6, 4)}
                </AccountAddress>
              </AccountInfo>
              <CopyButton
                src={copyIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyAddress(account.addresses.bsvAddress);
                }}
              />
            </MenuItem>
          ))}
          
          <ActionButton theme={theme} onClick={handleAddAccount}>
            <FaPlus size={16} />
            <span>Add New Account</span>
          </ActionButton>
        </MenuSection>

        <MenuSection theme={theme}>
          <ActionButton theme={theme} onClick={handleGithubClick}>
            <FaGithub size={18} />
            <span>View on GitHub</span>
          </ActionButton>
        </MenuSection>
      </MenuDrawer>
    </>
  );
};