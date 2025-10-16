/**
 * Bitcoin OS Bridge Interface
 * 
 * This module provides a standardized interface for Bitcoin OS integration
 * while preserving local app functionality and preparing for future
 * @bitcoin-os/bridge package integration.
 */

export interface TaskbarConfig {
  title?: string;
  showDefaultApps?: boolean;
  customActions?: TaskbarAction[];
  preserveLocalLinks?: boolean;
  mobileLayout?: 'bottom' | 'top' | 'sidebar';
  theme?: 'light' | 'dark' | 'auto';
}

export interface TaskbarAction {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  href?: string;
  target?: string;
  shortcut?: string;
  primary?: boolean;
  mobile?: {
    icon: string;
    position: 'bottom' | 'menu';
  };
}

export interface BitcoinOSContext {
  isInOS: boolean;
  isMobile: boolean;
  isTablet: boolean;
  platform: 'desktop' | 'mobile' | 'tablet' | 'embedded';
  version?: string;
}

export interface BitcoinOSBridge {
  // Context detection
  getContext(): BitcoinOSContext;
  
  // Window management
  setTitle(title: string): void;
  setIcon(iconUrl: string): void;
  
  // Taskbar management
  updateTaskbar(config: TaskbarConfig): void;
  addTaskbarAction(action: TaskbarAction): void;
  removeTaskbarAction(actionId: string): void;
  
  // App integration
  registerApp(appConfig: AppConfig): void;
  unregisterApp(appId: string): void;
  
  // Communication
  sendMessage(type: string, data: any): void;
  onMessage(type: string, handler: (data: any) => void): void;
  
  // Navigation
  preserveLocalLinks: boolean;
  enhanceNavigation(originalAction: () => void): () => void;
}

export interface AppConfig {
  id: string;
  name: string;
  version: string;
  description?: string;
  icon?: string;
  color?: string;
  url?: string;
  capabilities?: string[];
  mobileSupport?: boolean;
}

/**
 * Default Bitcoin OS Bridge Implementation
 * 
 * This provides fallback functionality when the actual @bitcoin-os/bridge
 * package is not available, ensuring the app works standalone.
 */
class DefaultBitcoinOSBridge implements BitcoinOSBridge {
  public preserveLocalLinks = true;

  getContext(): BitcoinOSContext {
    return {
      isInOS: this.detectBitcoinOS(),
      isMobile: this.detectMobile(),
      isTablet: this.detectTablet(),
      platform: this.detectPlatform(),
    };
  }

  setTitle(title: string): void {
    // Use existing Bitcoin OS integration
    if (this.detectBitcoinOS() && window.parent !== window) {
      window.parent.postMessage(
        { type: 'SET_APP_TITLE', title },
        '*'
      );
    } else {
      document.title = title;
    }
  }

  setIcon(iconUrl: string): void {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || 
                 document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = iconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  updateTaskbar(config: TaskbarConfig): void {
    // Store config for adaptive taskbar to use
    (window as any).__bitcoinOSTaskbarConfig = config;
    
    // Dispatch custom event for taskbar to listen to
    window.dispatchEvent(new CustomEvent('bitcoinos:taskbar-update', {
      detail: config
    }));
  }

  addTaskbarAction(action: TaskbarAction): void {
    const currentConfig = (window as any).__bitcoinOSTaskbarConfig || {};
    const actions = currentConfig.customActions || [];
    actions.push(action);
    this.updateTaskbar({ ...currentConfig, customActions: actions });
  }

  removeTaskbarAction(actionId: string): void {
    const currentConfig = (window as any).__bitcoinOSTaskbarConfig || {};
    const actions = (currentConfig.customActions || []).filter(
      (action: TaskbarAction) => action.id !== actionId
    );
    this.updateTaskbar({ ...currentConfig, customActions: actions });
  }

  registerApp(appConfig: AppConfig): void {
    console.log('Bitcoin OS Bridge: Registering app:', appConfig);
    // Store app config for future use
    (window as any).__bitcoinOSAppConfig = appConfig;
  }

  unregisterApp(appId: string): void {
    console.log('Bitcoin OS Bridge: Unregistering app:', appId);
    delete (window as any).__bitcoinOSAppConfig;
  }

  sendMessage(type: string, data: any): void {
    if (window.parent !== window) {
      window.parent.postMessage({ type, data }, '*');
    }
  }

  onMessage(type: string, handler: (data: any) => void): void {
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === type) {
        handler(event.data.data);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Return cleanup function
    return () => window.removeEventListener('message', messageHandler);
  }

  enhanceNavigation(originalAction: () => void): () => void {
    if (this.preserveLocalLinks) {
      return originalAction;
    }
    
    // Future: Add Bitcoin OS navigation enhancements
    return () => {
      console.log('Bitcoin OS Bridge: Enhanced navigation');
      originalAction();
    };
  }

  private detectBitcoinOS(): boolean {
    return window.parent !== window && 
           window.location !== window.parent.location;
  }

  private detectMobile(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return mobileRegex.test(userAgent) || (hasTouch && isSmallScreen);
  }

  private detectTablet(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent;
    const tabletRegex = /iPad|Android(?!.*Mobile)/i;
    const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;
    
    return tabletRegex.test(userAgent) || isTabletSize;
  }

  private detectPlatform(): 'desktop' | 'mobile' | 'tablet' | 'embedded' {
    if (this.detectBitcoinOS()) return 'embedded';
    if (this.detectMobile()) return 'mobile';
    if (this.detectTablet()) return 'tablet';
    return 'desktop';
  }
}

/**
 * Bitcoin OS Bridge Instance
 * 
 * This will be replaced by the actual @bitcoin-os/bridge package
 * when it becomes available, but provides the same interface.
 */
export const bitcoinOSBridge: BitcoinOSBridge = new DefaultBitcoinOSBridge();

/**
 * Hook for using Bitcoin OS Bridge in React components
 */
export const useBitcoinOSBridge = () => {
  return bitcoinOSBridge;
};

/**
 * Initialize Bitcoin OS integration for the app
 */
export const initializeBitcoinOS = (appConfig: AppConfig) => {
  // Register the app with Bitcoin OS
  bitcoinOSBridge.registerApp(appConfig);
  
  // Set initial title and icon
  if (appConfig.name) {
    bitcoinOSBridge.setTitle(appConfig.name);
  }
  
  // Apply initial taskbar configuration
  bitcoinOSBridge.updateTaskbar({
    title: appConfig.name,
    showDefaultApps: true,
    preserveLocalLinks: true,
    mobileLayout: 'bottom',
    theme: 'dark'
  });
  
  console.log('Bitcoin OS Bridge initialized for:', appConfig.name);
};