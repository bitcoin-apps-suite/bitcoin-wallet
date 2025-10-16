import { ReactNode, useState, useEffect } from 'react';
import { NetWork } from 'yours-wallet-provider';
import { BottomMenu } from '../../components/BottomMenu';
import { MobileMenuDropdown } from '../../components/MobileMenuDropdown';
import { useTheme } from '../../hooks/useTheme';
import { BottomMenuContext, MenuItems } from '../BottomMenuContext';

interface BottomMenuProviderProps {
  network: NetWork;
  children: ReactNode;
}

export const BottomMenuProvider = (props: BottomMenuProviderProps) => {
  const { children, network } = props;
  const { theme } = useTheme();
  const [selected, setSelected] = useState<MenuItems | null>(null);
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelect = (item: MenuItems, pageQuery?: string) => {
    setSelected(item);
    if (pageQuery) setQuery(pageQuery);
  };

  const showMenu = () => {
    setIsVisible(true);
  };

  const hideMenu = () => {
    setIsVisible(false);
  };

  return (
    <BottomMenuContext.Provider
      value={{
        selected,
        handleSelect,
        isVisible,
        showMenu,
        hideMenu,
        query,
      }}
    >
      {isVisible && !isMobile && (
        <BottomMenu theme={theme} network={network} handleSelect={handleSelect} selected={selected} />
      )}
      {isVisible && isMobile && (
        <MobileMenuDropdown 
          theme={theme} 
          network={network} 
          onMenuSelect={handleSelect} 
          selected={selected}
          showOrdinals={theme.settings.services.ordinals}
        />
      )}
      {children}
    </BottomMenuContext.Provider>
  );
};
