import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const DropdownContainer = styled.div<WhiteLabelTheme>`
  position: relative;
  width: 100%;
  margin: 1rem 0;
  z-index: 50;

  @media (min-width: 769px) {
    display: none;
  }
`;

const DropdownButton = styled.button<WhiteLabelTheme>`
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: ${({ theme }) => theme.color.global.row};
  border: 1px solid ${({ theme }) => theme.color.global.gray + '40'};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;

  &:hover {
    background-color: ${({ theme }) => theme.color.global.gray + '10'};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const DropdownMenu = styled.div<WhiteLabelTheme & { $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.color.global.row};
  border: 1px solid ${({ theme }) => theme.color.global.gray + '40'};
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: ${({ $isOpen }) => ($isOpen ? '400px' : '0')};
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.3s ease;
  z-index: 51;
`;

const CategoryItem = styled.button<WhiteLabelTheme & { $isSelected?: boolean }>`
  width: 100%;
  padding: 1rem 1.5rem;
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

  &:hover {
    background-color: ${({ theme }) => theme.color.global.gray + '10'};
  }

  &:active {
    background-color: ${({ theme }) => theme.color.global.gray + '20'};
  }

  &:first-child {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  &:last-child {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
`;

const CategoryIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.2rem;
`;

export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

interface MobileCategoryDropdownProps {
  theme: any;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export const MobileCategoryDropdown: React.FC<MobileCategoryDropdownProps> = ({
  theme,
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory) || categories[0];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
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
      <DropdownButton theme={theme} onClick={handleToggle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon>{selectedCategoryData.icon}</CategoryIcon>
          {selectedCategoryData.name}
          {selectedCategoryData.count && (
            <span style={{ 
              marginLeft: '0.5rem', 
              fontSize: '0.8rem', 
              color: theme.color.global.gray 
            }}>
              ({selectedCategoryData.count})
            </span>
          )}
        </div>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </DropdownButton>
      
      <DropdownMenu theme={theme} $isOpen={isOpen}>
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            theme={theme}
            $isSelected={category.id === selectedCategory}
            onClick={() => handleCategorySelect(category.id)}
          >
            <CategoryIcon>{category.icon}</CategoryIcon>
            {category.name}
            {category.count && (
              <span style={{ 
                marginLeft: 'auto', 
                fontSize: '0.8rem', 
                color: theme.color.global.gray 
              }}>
                {category.count}
              </span>
            )}
          </CategoryItem>
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
};