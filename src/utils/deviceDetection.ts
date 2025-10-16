/**
 * Utility functions for detecting mobile devices and their capabilities
 */

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent for mobile indicators
  const userAgent = window.navigator.userAgent;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent) || (hasTouch && isSmallScreen);
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  const tabletRegex = /iPad|Android(?!.*Mobile)/i;
  
  // Check for tablet-like screen dimensions
  const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  return tabletRegex.test(userAgent) || isTabletSize;
};

export const shouldUse3D = (): boolean => {
  // Disable 3D on mobile devices for better performance
  return !isMobileDevice();
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobileDevice()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};