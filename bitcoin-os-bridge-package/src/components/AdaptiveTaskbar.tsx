import { useMemo } from 'react';
import { Taskbar } from './Taskbar';
import { MobileTaskbar } from './MobileTaskbar';
import { isMobileDevice } from '../utils/deviceDetection';
import { WhiteLabelTheme } from '../theme.types';

interface AdaptiveTaskbarProps {
  theme?: WhiteLabelTheme;
  forceMode?: 'desktop' | 'mobile';
}

export const AdaptiveTaskbar = ({ theme, forceMode }: AdaptiveTaskbarProps) => {
  const isMobile = useMemo(() => {
    if (forceMode) return forceMode === 'mobile';
    return isMobileDevice();
  }, [forceMode]);

  if (isMobile) {
    return <MobileTaskbar theme={theme} />;
  }

  return <Taskbar />;
};