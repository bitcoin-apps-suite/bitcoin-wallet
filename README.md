# Bitcoin Wallet

A revolutionary Bitcoin SV wallet that treats digital assets as real-world file types and currencies, featuring an innovative 3D bubble visualization for UTXO management.

![Bitcoin Wallet Logo](bitcoin-wallet-logo.jpg)

## Features

### Core Functionality
- **Bitcoin SV (BSV) Support**: Full support for BSV transactions, including multi-recipient sends
- **3D UTXO Visualization**: Interactive bubble interface for managing your unspent transaction outputs
- **File Type Assets**: Revolutionary approach to digital assets as file types (JPEG, PNG, MP3, PDF, etc.)
- **Real-World Currency Integration**: Support for multiple fiat currencies alongside BSV
- **BSV20 Token Support**: Full integration with BSV20 token protocol
- **1Sat Ordinals**: Create, view, and manage Bitcoin ordinals

### Exchange Integration
- **Asset Trading**: List and trade your file type assets on the [Bitcoin Wallet Exchange](https://exchange.bitcoin-wallet.app)
- **NFT Packaging**: Wrap assets in .nft packages for unique ownership
- **Fractional Shares**: Issue shares in .ft wrappers containing BRC100 tokens or Ordinals
- **Decentralized Marketplace**: Peer-to-peer trading without intermediaries

### Technical Features
- **SPV Wallet**: Simplified Payment Verification for lightweight operation
- **Chrome Extension**: Seamless browser integration
- **HandCash Integration**: Connect with HandCash for enhanced functionality
- **Non-Custodial**: Your private keys are encrypted and stored locally on your device
- **Multi-Account**: Use one wallet to manage all of your different accounts/keys
- **Real-time Sync**: Automatic UTXO and balance updates

## Installation

### Prerequisites
- Node.js 16+ and npm
- Chrome browser (for extension testing)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/bitcoin-apps-suite/bitcoin-wallet.git
cd bitcoin-wallet

# Install dependencies
npm install

# Start development server on port 1050
npm start
```

### Building for Production
```bash
# Build the application
npm run build

# The build artifacts will be in the 'build' folder
```

### Installing as Chrome Extension
1. Build the project: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `build` folder

## Quick Start App

We've included a macOS app that makes restarting the wallet easy:

1. The `Bitcoin Wallet Restart.app` is in the project root
2. Drag it to your dock for quick access
3. Click it to kill port 1050 and restart the wallet

## Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **3D Visualization**: Three.js with React Three Fiber
- **Styling**: Styled Components
- **State Management**: React Context API
- **Bitcoin Library**: BSV SDK and Yours Wallet Provider
- **Build Tool**: React App Rewired

### Project Structure
```
bitcoin-wallet/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── services/       # Business logic services
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── assets/         # Images and icons
├── public/             # Static files
├── build/              # Production build output
└── docs/               # Documentation
```

## Configuration

The wallet can be configured through environment variables:

```env
# Development server port (default: 1050)
PORT=1050

# Network configuration
REACT_APP_NETWORK=mainnet  # or 'testnet'

# Exchange URL
REACT_APP_EXCHANGE_URL=https://exchange.bitcoin-wallet.app
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## Documentation

- [Developer Documentation](DEVELOPERS.md) - Technical details for developers
- [API Reference](docs/api.md) - Complete API documentation
- [Architecture Guide](docs/architecture.md) - System design and patterns
- [Wallet Provider API](https://panda-wallet.gitbook.io/provider-api/) - Integration documentation

## Security

### Reporting Security Issues
Please report security vulnerabilities to security@bitcoin-wallet.app

### Security Features
- Encrypted key storage
- Secure random number generation
- SPV validation
- No third-party key custody
- Open source and community audited

## License

This project is licensed under the Open BSV License - see the [LICENSE](LICENSE) file for details.

## Attribution

This project is based on the excellent **Yours Wallet** by **Yours.org**:
- Original Repository: [Yours Wallet](https://github.com/yours-org/yours-wallet)
- Website: [yours.org](https://yours.org)
- Twitter: [@yoursxbt](https://twitter.com/yoursxbt)
- Discord: [Yours Community](https://discord.gg/qHs6hTkmsf)

Special thanks to the Yours.org team for creating the foundation upon which this wallet is built. The original Yours Wallet is a full-featured, non-custodial web3 SPV wallet for BSV and 1Sat Ordinals.

## Community

- **GitHub**: [github.com/bitcoin-apps-suite/bitcoin-wallet](https://github.com/bitcoin-apps-suite/bitcoin-wallet)
- **Exchange**: [exchange.bitcoin-wallet.app](https://exchange.bitcoin-wallet.app)
- **Discord**: Coming Soon
- **Twitter**: Coming Soon

## Roadmap

### Q1 2025
- [ ] Mobile app (iOS/Android)
- [ ] Hardware wallet integration
- [ ] Advanced trading features
- [ ] Multi-signature support

### Q2 2025
- [ ] DeFi integrations
- [ ] Cross-chain bridges
- [ ] Enhanced privacy features
- [ ] Institutional features

## Support

For support, please:
1. Check the [Documentation](DEVELOPERS.md)
2. Search existing [GitHub Issues](https://github.com/bitcoin-apps-suite/bitcoin-wallet/issues)
3. Create a new issue if needed
4. Join our Discord community (coming soon)

### Donations
Support the continued development of Bitcoin Wallet:
- **BSV**: `1MtzWXQEYGp89bQ9U2nfrnuChFv37j6pV6`

---

Built with ❤️ for the Bitcoin SV community