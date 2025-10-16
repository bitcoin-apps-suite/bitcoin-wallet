import { useMemo } from 'react';
import { Taskbar } from './Taskbar';
import { isMobileDevice } from '../utils/deviceDetection';
import { WhiteLabelTheme } from '../theme.types';

interface AdaptiveTaskbarProps {
  theme?: WhiteLabelTheme;
  forceMode?: 'desktop' | 'mobile';
  onSend?: () => void;
  onReceive?: () => void;
  onHistory?: () => void;
  onExchange?: () => void;
}

export const AdaptiveTaskbar = ({ theme, forceMode, onSend, onReceive, onHistory, onExchange }: AdaptiveTaskbarProps) => {
  const isMobile = useMemo(() => {
    if (forceMode) return forceMode === 'mobile';
    return isMobileDevice();
  }, [forceMode]);

  if (isMobile) {
    return null;
  }

  return <Taskbar />;
};