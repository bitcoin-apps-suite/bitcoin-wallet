# @bitcoin-os/bridge

Official Bitcoin OS Bridge for seamless integration between Bitcoin OS and embedded applications, with mobile support and uniform taskbar formatting.

## Features

- 🖥️ **Desktop & Mobile Support**: Automatically adapts taskbar for different devices
- 🔗 **Preserve Local Links**: Maintains your app's navigation while providing Bitcoin OS integration
- 📱 **Mobile-First Design**: Touch-friendly interface with bottom navigation
- ⚡ **Performance Optimized**: Lightweight bridge with minimal overhead
- 🎨 **Customizable Themes**: Support for light/dark themes and custom styling
- 🔧 **TypeScript Ready**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @bitcoin-os/bridge
```

## Quick Start

### Basic Integration

```typescript
import { initializeBitcoinOS, AdaptiveTaskbar } from '@bitcoin-os/bridge';

// Initialize Bitcoin OS integration
initializeBitcoinOS({
  id: 'my-bitcoin-app',
  name: 'My Bitcoin App',
  version: '1.0.0',
  description: 'A Bitcoin application',
  mobileSupport: true
});

// Use adaptive taskbar in your React component
function App() {
  return (
    <div>
      <AdaptiveTaskbar />
      {/* Your app content */}
    </div>
  );
}
```

### Advanced Configuration

```typescript
import { useBitcoinOSBridge } from '@bitcoin-os/bridge';

function MyApp() {
  const bridge = useBitcoinOSBridge();
  
  // Configure taskbar
  bridge.updateTaskbar({
    title: 'My App',
    preserveLocalLinks: true,
    mobileLayout: 'bottom',
    theme: 'dark',
    customActions: [
      {
        id: 'send',
        label: 'Send',
        icon: '📤',
        action: () => console.log('Send action'),
        primary: true,
        mobile: {
          icon: '📤',
          position: 'bottom'
        }
      }
    ]
  });

  return <AdaptiveTaskbar />;
}
```

## Components

### AdaptiveTaskbar

Automatically switches between desktop and mobile taskbar based on device detection.

```typescript
import { AdaptiveTaskbar } from '@bitcoin-os/bridge';

<AdaptiveTaskbar 
  theme={myTheme}
  forceMode="mobile" // Optional: force mobile or desktop mode
/>
```

### MobileTaskbar

Mobile-optimized taskbar with bottom navigation and slide-up menu.

```typescript
import { MobileTaskbar } from '@bitcoin-os/bridge';

<MobileTaskbar theme={myTheme} />
```

## API Reference

### BitcoinOSBridge

Main bridge interface for Bitcoin OS integration.

#### Methods

- `getContext()`: Get current Bitcoin OS context (platform, mobile detection, etc.)
- `setTitle(title)`: Set window title (works in Bitcoin OS and standalone)
- `updateTaskbar(config)`: Update taskbar configuration
- `addTaskbarAction(action)`: Add custom action to taskbar
- `registerApp(config)`: Register app with Bitcoin OS
- `sendMessage(type, data)`: Send message to Bitcoin OS
- `onMessage(type, handler)`: Listen for messages from Bitcoin OS

### Device Detection

```typescript
import { isMobileDevice, shouldUse3D, getDeviceType } from '@bitcoin-os/bridge';

const isMobile = isMobileDevice();
const deviceType = getDeviceType(); // 'mobile' | 'tablet' | 'desktop'
const canUse3D = shouldUse3D(); // Automatically disables 3D on mobile
```

## Mobile Optimization

The bridge automatically provides mobile-optimized experiences:

- **Touch-friendly targets**: 48px+ minimum touch targets
- **Bottom navigation**: Primary actions in easy-to-reach bottom bar
- **Slide-up menus**: Secondary actions in organized slide-up panels
- **Performance**: Disables 3D rendering on mobile devices

## Bitcoin OS Integration

When running inside Bitcoin OS, the bridge provides:

- **Window management**: Title setting and icon management
- **Inter-app communication**: Message passing between apps
- **Unified navigation**: Integration with Bitcoin OS app switcher
- **Context awareness**: Automatic detection of Bitcoin OS environment

## Preserving Local Links

The bridge is designed to enhance, not replace, your existing navigation:

```typescript
// Your existing navigation works unchanged
const goHome = () => window.location.href = '/';
const goToSettings = () => window.location.href = '/settings';

// Bridge enhances without breaking
bridge.enhanceNavigation(goHome); // Still works exactly the same
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type { 
  TaskbarConfig, 
  TaskbarAction, 
  AppConfig, 
  BitcoinOSContext 
} from '@bitcoin-os/bridge';
```

## Examples

### Bitcoin Wallet Integration

```typescript
import { initializeBitcoinOS, AdaptiveTaskbar } from '@bitcoin-os/bridge';

// Initialize with wallet-specific config
initializeBitcoinOS({
  id: 'bitcoin-wallet',
  name: 'Bitcoin Wallet',
  version: '4.5.0',
  capabilities: ['send', 'receive', 'tokens', 'files'],
  mobileSupport: true
});

function BitcoinWallet() {
  return (
    <>
      <AdaptiveTaskbar />
      {/* Desktop: Shows full menu bar */}
      {/* Mobile: Shows bottom navigation with Send/Receive */}
      <WalletContent />
    </>
  );
}
```

### Custom App Integration

```typescript
import { useBitcoinOSBridge } from '@bitcoin-os/bridge';

function CustomApp() {
  const bridge = useBitcoinOSBridge();
  
  useEffect(() => {
    // Add custom actions to taskbar
    bridge.addTaskbarAction({
      id: 'custom-action',
      label: 'My Action',
      action: () => handleCustomAction(),
      mobile: {
        icon: '⚡',
        position: 'bottom'
      }
    });
  }, []);

  return <AdaptiveTaskbar />;
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.bitcoin-os.org/bridge)
- 🐛 [Report Issues](https://github.com/bitcoin-os/bridge/issues)
- 💬 [Discussions](https://github.com/bitcoin-os/bridge/discussions)
- 🔗 [Bitcoin OS](https://bitcoin-os.org)