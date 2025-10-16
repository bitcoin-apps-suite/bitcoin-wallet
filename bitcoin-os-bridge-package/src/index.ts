/**
 * @bitcoin-os/bridge
 * 
 * Official Bitcoin OS Bridge for seamless integration between Bitcoin OS
 * and embedded applications, with mobile support and uniform taskbar formatting.
 */

export * from './types';
export * from './bridge';
export * from './components/AdaptiveTaskbar';
export * from './components/MobileTaskbar';
export * from './utils/deviceDetection';

// Re-export for convenience
export { bitcoinOSBridge, useBitcoinOSBridge, initializeBitcoinOS } from './bridge';