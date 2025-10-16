import React from 'react';
import styled from 'styled-components';
import { FaDatabase, FaCube, FaNetworkWired } from 'react-icons/fa';
import { WhiteLabelTheme } from '../theme.types';
import { isMobileDevice } from '../utils/deviceDetection';

export type ViewMode = 'data' | 'visual' | 'network';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  theme: WhiteLabelTheme;
}

const ToggleContainer = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  display: flex;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
  border-radius: 12px;
  padding: 4px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button<{ theme: WhiteLabelTheme['theme']; isActive: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: ${({ theme, isActive }) =>
    isActive ? `linear-gradient(to right, ${theme.color.component.primaryButtonLeftGradient}, ${theme.color.component.primaryButtonRightGradient})` : 'transparent'};
  background: ${({ theme, isActive }) =>
    isActive ? `linear-gradient(to right, ${theme.color.component.primaryButtonLeftGradient}, ${theme.color.component.primaryButtonRightGradient})` : 'transparent'};
  color: ${({ theme, isActive }) =>
    isActive ? theme.color.component.primaryButtonText : theme.color.global.gray};
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme, isActive }) =>
      isActive ? `linear-gradient(to right, ${theme.color.component.primaryButtonLeftGradient}, ${theme.color.component.primaryButtonRightGradient})` : theme.color.global.row};
  }

  svg {
    font-size: 1.1rem;
  }
`;

const ModeDescription = styled.p<{ theme: WhiteLabelTheme['theme'] }>`
  color: ${({ theme }) => theme.color.global.gray};
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0;
  padding: 0 0.5rem;
  line-height: 1.4;
`;

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  currentMode,
  onModeChange,
  theme: whiteLabelTheme,
}) => {
  const theme = whiteLabelTheme.theme;
  return (
    <div>
      <ToggleContainer theme={theme}>
        <ToggleButton
          theme={theme}
          isActive={currentMode === 'data'}
          onClick={() => onModeChange('data')}
          title="View token metadata and raw data"
        >
          <FaDatabase />
          Data
        </ToggleButton>
        <ToggleButton
          theme={theme}
          isActive={currentMode === 'visual'}
          onClick={() => onModeChange('visual')}
          title="View rendered content (3D models, images, etc)"
        >
          <FaCube />
          Visual
        </ToggleButton>
        <ToggleButton
          theme={theme}
          isActive={currentMode === 'network'}
          onClick={() => onModeChange('network')}
          title="View token relationships and address connections"
        >
          <FaNetworkWired />
          Network
        </ToggleButton>
      </ToggleContainer>
      <ModeDescription theme={theme}>
        {currentMode === 'data' && 
          'View addresses, tokens, and their embedded data in a structured format'}
        {currentMode === 'visual' && 
          (isMobileDevice() 
            ? 'View tokens and assets in a mobile-optimized card layout'
            : 'See 3D models, images, and other media as they actually appear')}
        {currentMode === 'network' && 
          (isMobileDevice()
            ? 'Browse network connections in a mobile-friendly list view'
            : 'Explore relationships between addresses and tokens in context')}
      </ModeDescription>
    </div>
  );
};