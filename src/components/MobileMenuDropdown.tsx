import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { FaChevronDown, FaChevronUp, FaCoins, FaList, FaTools, FaCog, FaBars } from 'react-icons/fa';
import { MenuItems } from '../contexts/BottomMenuContext';
import { NetWork } from 'yours-wallet-provider';

const DropdownContainer = styled.div<WhiteLabelTheme>`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 200;

  @media (min-width: 769px) {
    display: none;
  }
`;

const MenuButton = styled.button<WhiteLabelTheme & { $isOpen: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme, $isOpen }) => 
    $isOpen 
      ? `linear-gradient(135deg, ${theme.color.component.primaryButtonLeftGradient}, ${theme.color.component.primaryButtonRightGradient})`
      : theme.color.global.row
  };
  border: 1px solid ${({ theme }) => theme.color.global.gray + '40'};
  color: ${({ theme, $isOpen }) => 
    $isOpen ? theme.color.component.primaryButtonText : theme.color.global.contrast
  };
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  touch-action: manipulation;

  &:active {
    transform: scale(0.95);
  }
`;

const DropdownMenu = styled.div<WhiteLabelTheme & { $isOpen: boolean }>`
  position: absolute;
  bottom: 70px;
  right: 0;
  background-color: ${({ theme }) => theme.color.global.row};
  border: 1px solid ${({ theme }) => theme.color.global.gray + '40'};
  border-radius: 0.75rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
  max-height: ${({ $isOpen }) => ($isOpen ? '320px' : '0')};
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 199;
  min-width: 200px;
`;

const MenuItem = styled.button<WhiteLabelTheme & { $isSelected?: boolean }>`
  width: 100%;
  padding: 1rem 1.25rem;
  background-color: ${({ theme, $isSelected }) => 
    $isSelected ? theme.color.global.gray + '20' : 'transparent'};
  border: none;
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  touch-action: manipulation;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    background-color: ${({ theme }) => theme.color.global.gray + '10'};
  }

  &:active {
    background-color: ${({ theme }) => theme.color.global.gray + '20'};
  }

  &:first-child {
    border-top-left-radius: 0.75rem;
    border-top-right-radius: 0.75rem;
  }

  &:last-child {
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }
`;

const MenuIcon = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  color: ${({ $color }) => $color || 'currentColor'};
`;

const BadgeText = styled.span<WhiteLabelTheme>`
  font-size: 0.65rem;
  padding: 2px 6px;
  background: ${({ theme }) => theme.color.component.warningButton};
  color: ${({ theme }) => theme.color.component.warningButtonText};
  border-radius: 4px;
  margin-left: auto;
`;

interface MobileMenuDropdownProps {
  theme: any;
  selected: MenuItems | null;
  onMenuSelect: (item: MenuItems) => void;
  network: NetWork;
  showOrdinals?: boolean;
}

export const MobileMenuDropdown: React.FC<MobileMenuDropdownProps> = ({
  theme,
  selected,
  onMenuSelect,
  network,
  showOrdinals = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    {
      id: 'bsv' as MenuItems,
      label: 'Coins',
      icon: FaCoins,
    },
    ...(showOrdinals ? [{
      id: 'ords' as MenuItems,
      label: 'Ordinals',
      icon: FaList,
    }] : []),
    {
      id: 'tools' as MenuItems,
      label: 'Tools',
      icon: FaTools,
    },
    {
      id: 'settings' as MenuItems,
      label: 'Settings',
      icon: FaCog,
      badge: network === 'testnet' ? 'testnet' : undefined,
    },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuSelect = (menuId: MenuItems) => {
    onMenuSelect(menuId);
    setIsOpen(false);
  };

  const handleClickOutside = (event: Event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownContainer ref={dropdownRef} theme={theme}>
      <DropdownMenu theme={theme} $isOpen={isOpen}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <MenuItem
              key={item.id}
              theme={theme}
              $isSelected={item.id === selected}
              onClick={() => handleMenuSelect(item.id)}
            >
              <MenuIcon $color={theme.color.component.bottomMenuText}>
                <IconComponent size="18" />
              </MenuIcon>
              {item.label}
              {item.badge && (
                <BadgeText theme={theme}>{item.badge}</BadgeText>
              )}
            </MenuItem>
          );
        })}
      </DropdownMenu>
      
      <MenuButton theme={theme} onClick={handleToggle} $isOpen={isOpen}>
        {isOpen ? <FaChevronDown size="20" /> : <FaBars size="20" />}
      </MenuButton>
    </DropdownContainer>
  );
};