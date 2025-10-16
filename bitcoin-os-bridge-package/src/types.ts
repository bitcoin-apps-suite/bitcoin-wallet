/**
 * TypeScript definitions for Bitcoin OS Bridge
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

export interface WhiteLabelTheme {
  theme: {
    color: {
      global: {
        row: string;
        contrast: string;
        gray: string;
        walletBackground: string;
      };
      component: {
        primaryButtonLeftGradient: string;
        primaryButtonRightGradient: string;
        primaryButtonText: string;
      };
    };
  };
}