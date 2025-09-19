# Developer Documentation

This guide provides detailed technical information for developers working on Bitcoin Wallet.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Core Components](#core-components)
- [Services](#services)
- [API Reference](#api-reference)
- [File Type Assets](#file-type-assets)
- [3D Visualization](#3d-visualization)
- [Exchange Integration](#exchange-integration)
- [Security Architecture](#security-architecture)
- [Performance Optimization](#performance-optimization)
- [Debugging](#debugging)

## Architecture Overview

Bitcoin Wallet is built as a React-based Chrome extension with SPV (Simplified Payment Verification) capabilities.

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **State Management**: React Context API
- **Styling**: Styled Components
- **3D Graphics**: Three.js with React Three Fiber
- **Bitcoin Library**: BSV SDK, Yours Wallet Provider
- **Build System**: React App Rewired
- **Testing**: Jest, React Testing Library

### Application Structure
```
┌─────────────────────────────────────────┐
│           Chrome Extension              │
├─────────────────────────────────────────┤
│          React Application              │
├──────────┬──────────┬──────────────────┤
│ Services │  Hooks   │   Components     │
├──────────┴──────────┴──────────────────┤
│         BSV SDK / SPV Core             │
└─────────────────────────────────────────┘
```

## Core Components

### BsvWallet Component
The main wallet component that manages the application state.

```typescript
// src/pages/BsvWallet.tsx
interface BsvWalletProps {
  isOrdRequest: boolean;
}

// Key state variables
type PageState = 'main' | 'receive' | 'send';
type AmountType = 'bsv' | 'usd';
```

### BubbleVisualization
3D UTXO visualization using Three.js.

```typescript
// src/components/BubbleVisualization.tsx
interface BubbleVisualizationProps {
  theme: ThemeConfig;
  utxos: UTXO[];
  balance: number;
  exchangeRate: number;
  onSend: (id: string) => void;
  onReceive: (id: string) => void;
  onCombine: (ids: string[]) => void;
}
```

### AppHeader
Application header with navigation and exchange link.

```typescript
// src/components/AppHeader.tsx
interface AppHeaderProps {
  theme: any;
  onTitleClick?: () => void;
}
```

## Services

### ChromeStorageService
Manages persistent storage and account data.

```typescript
class ChromeStorageService {
  // Key methods
  async getAndSetStorage(): Promise<ChromeStorageObject>
  getCurrentAccountObject(): AccountObject
  getNetwork(): 'mainnet' | 'testnet'
  isPasswordRequired(): boolean
  async update(data: Partial<ChromeStorageObject>): Promise<void>
}
```

### BsvService
Handles Bitcoin SV transactions and balance management.

```typescript
class BsvService {
  // Key methods
  getBsvBalance(): number
  getExchangeRate(): number
  async getLockData(): Promise<LockData>
  async unlockLockedCoins(): Promise<UnlockResponse>
  async updateBsvBalance(): Promise<void>
  async sendBsv(recipients: SendRecipient[], password: string): Promise<InWalletBsvResponse>
  async sendAllBsv(address: string, type: 'address' | 'paymail', password: string): Promise<InWalletBsvResponse>
}
```

### KeysService
Manages cryptographic keys and addresses.

```typescript
class KeysService {
  bsvAddress: string
  identityAddress: string
  ordAddress: string
  
  // Key derivation and management
  deriveKeys(mnemonic: string, path: string): KeyPair
  signMessage(message: string, privateKey: string): string
  verifySignature(message: string, signature: string, publicKey: string): boolean
}
```

## API Reference

### Wallet Provider API
Integration for third-party dApps.

```typescript
// Connect to wallet
const provider = window.yoursWallet;
await provider.connect();

// Get address
const address = await provider.getAddress();

// Send BSV
const txid = await provider.sendBsv({
  address: 'recipient_address',
  satoshis: 10000
});

// Sign message
const signature = await provider.signMessage('Hello World');
```

### Chrome Extension API
Communication between content script and background service.

```typescript
// Send message
chrome.runtime.sendMessage({
  action: 'GET_BALANCE'
}, (response) => {
  console.log('Balance:', response.balance);
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'UPDATE_BALANCE') {
    updateBalance(request.balance);
  }
});
```

## File Type Assets

### Asset Structure
Each file type is treated as a tradeable asset.

```typescript
interface FileTypeAsset {
  id: string;
  type: 'JPEG' | 'PNG' | 'MP3' | 'PDF' | /* ... */;
  balance: number;
  icon: string;
  ticker: string;
  usdValue: number;
}
```

### Adding New File Types
1. Define the asset in `src/constants/fileTypes.ts`
2. Add icon to `src/assets/fileTypeIcons/`
3. Update `AssetRow` component rendering
4. Implement trading logic in Exchange service

## 3D Visualization

### Three.js Setup
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

function BubbleVisualization({ utxos }) {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {utxos.map(utxo => (
        <Bubble key={utxo.id} utxo={utxo} />
      ))}
    </Canvas>
  );
}
```

### Bubble Physics
Implements force-directed graph layout for UTXO bubbles.

```typescript
// Collision detection
function detectCollision(bubble1: Bubble, bubble2: Bubble): boolean {
  const distance = bubble1.position.distanceTo(bubble2.position);
  return distance < (bubble1.radius + bubble2.radius);
}

// Force calculation
function calculateForce(bubbles: Bubble[]): Vector3[] {
  // Implement spring force, repulsion, and gravity
}
```

## Exchange Integration

### Trading Protocol
```typescript
interface TradeOffer {
  offerId: string;
  assetType: FileTypeAsset;
  amount: number;
  price: number;
  seller: string;
  timestamp: number;
}

interface NFTPackage {
  assets: FileTypeAsset[];
  wrapper: '.nft' | '.ft';
  tokenType?: 'BRC100' | 'Ordinals';
  shares?: number;
}
```

### Smart Contract Integration
```solidity
// Pseudo-code for asset trading
contract AssetExchange {
  function listAsset(assetId, price) public
  function buyAsset(offerId) public payable
  function cancelListing(offerId) public
  function wrapAsNFT(assetIds[]) public returns (nftId)
  function fractionalizeNFT(nftId, shares) public
}
```

## Security Architecture

### Key Storage
```typescript
// Encryption using Web Crypto API
async function encryptKeys(keys: KeyPair, password: string): Promise<EncryptedKeys> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: salt },
    key,
    encoder.encode(JSON.stringify(keys))
  );
  return { encrypted, salt };
}
```

### Transaction Signing
```typescript
// Multi-signature support
interface MultiSigTransaction {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  requiredSignatures: number;
  signatures: Signature[];
}
```

## Performance Optimization

### React Optimizations
```typescript
// Memoization
const MemoizedBubble = React.memo(Bubble, (prev, next) => {
  return prev.utxo.id === next.utxo.id && 
         prev.utxo.value === next.utxo.value;
});

// Lazy loading
const TxHistory = React.lazy(() => import('./components/TxHistory'));

// Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';
```

### Web Worker Integration
```typescript
// Heavy computations in worker
// workers/utxoProcessor.worker.ts
self.addEventListener('message', (event) => {
  const { utxos } = event.data;
  const processed = processUTXOs(utxos);
  self.postMessage({ processed });
});
```

## Debugging

### Development Tools
```bash
# Enable debug mode
localStorage.setItem('DEBUG', 'bitcoin-wallet:*');

# Chrome DevTools
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Inspect views: background page"

# React DevTools
# Install React Developer Tools extension
```

### Common Issues

#### Port Conflicts
```bash
# Kill process on port 1050
lsof -ti:1050 | xargs kill -9

# Or use the provided app
open "Bitcoin Wallet Restart.app"
```

#### SPV Sync Issues
```typescript
// Force resync
await oneSatSPV.stores.txos.syncTxLogs();
await chromeStorageService.update({ lastSync: 0 });
```

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules build
npm install
npm run build
```

### Logging
```typescript
// Custom logger
class Logger {
  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
  
  static error(message: string, error: Error) {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
  }
}
```

## Testing

### Unit Tests
```typescript
// src/__tests__/services/BsvService.test.ts
describe('BsvService', () => {
  it('should calculate balance correctly', () => {
    const service = new BsvService();
    const utxos = [
      { value: 10000 },
      { value: 20000 }
    ];
    expect(service.calculateBalance(utxos)).toBe(30000);
  });
});
```

### Integration Tests
```typescript
// src/__tests__/integration/wallet.test.tsx
describe('Wallet Integration', () => {
  it('should send BSV successfully', async () => {
    render(<BsvWallet />);
    // Test sending flow
  });
});
```

### E2E Tests
```typescript
// e2e/wallet.spec.ts
describe('Wallet E2E', () => {
  it('should complete full transaction flow', async () => {
    // Load extension
    // Connect wallet
    // Send transaction
    // Verify balance
  });
});
```

## Deployment

### Build Configuration
```javascript
// config-overrides.js
module.exports = {
  webpack: (config) => {
    // Custom webpack config
    return config;
  }
};
```

### Environment Variables
```env
# .env.production
REACT_APP_NETWORK=mainnet
REACT_APP_API_URL=https://api.bitcoin-wallet.app
REACT_APP_EXCHANGE_URL=https://exchange.bitcoin-wallet.app
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run build
      - uses: actions/upload-artifact@v2
```

---

For more information, see:
- [Contributing Guide](CONTRIBUTING.md)
- [API Documentation](docs/api.md)
- [Architecture Guide](docs/architecture.md)