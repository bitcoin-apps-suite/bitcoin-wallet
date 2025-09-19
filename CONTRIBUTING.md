# Contributing to Bitcoin Wallet

Thank you for your interest in contributing to Bitcoin Wallet! We welcome contributions from the community and are grateful for any help you can provide.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully
- Prioritize the project's best interests

## Getting Started

1. **Fork the repository**: Click the "Fork" button on the [Bitcoin Wallet repository](https://github.com/bitcoin-apps-suite/bitcoin-wallet)
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/bitcoin-wallet.git
   cd bitcoin-wallet
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/bitcoin-apps-suite/bitcoin-wallet.git
   ```

## How to Contribute

### Reporting Bugs

Before reporting a bug, please:
1. Check the [existing issues](https://github.com/bitcoin-apps-suite/bitcoin-wallet/issues) to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - System information (OS, browser, node version)

### Suggesting Features

1. Check if the feature has already been suggested
2. Use the feature request template
3. Explain:
   - The problem your feature solves
   - How you envision it working
   - Any alternative solutions you've considered

### Code Contributions

Areas where we especially welcome contributions:
- **File Type Asset Handlers**: New file type implementations
- **3D Visualization**: Improvements to the bubble interface
- **Exchange Features**: Trading and marketplace functionality
- **Security Enhancements**: Wallet security improvements
- **Performance Optimization**: Speed and efficiency improvements
- **Documentation**: Tutorials, guides, and API docs
- **Testing**: Unit tests, integration tests, and E2E tests
- **Internationalization**: Translations and locale support

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- Git
- Chrome browser (for extension testing)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Environment Setup
Create a `.env` file in the project root:
```env
PORT=1050
REACT_APP_NETWORK=mainnet
REACT_APP_EXCHANGE_URL=https://exchange.bitcoin-wallet.app
```

## Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Follow the coding standards
   - Add/update tests as needed
   - Update documentation

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Commit message format:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Test additions or changes
   - `chore:` Maintenance tasks

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template
   - Link any related issues

6. **PR Review Process**:
   - Maintainers will review your PR
   - Address any feedback
   - Once approved, your PR will be merged

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for new code
- Follow ESLint rules
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional components for React

### Styling
- Use styled-components for new components
- Follow the existing theme structure
- Ensure responsive design
- Test on multiple screen sizes

### File Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # Business logic
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Images, icons, etc.
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Writing Tests
- Write unit tests for utilities and services
- Write integration tests for components
- Test edge cases and error scenarios
- Aim for >80% code coverage

Example test:
```typescript
describe('BubbleVisualization', () => {
  it('should render bubbles for each UTXO', () => {
    const utxos = [/* test data */];
    const { container } = render(
      <BubbleVisualization utxos={utxos} />
    );
    expect(container.querySelectorAll('.bubble')).toHaveLength(utxos.length);
  });
});
```

## Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples

### README Updates
- Update README for new features
- Keep installation instructions current
- Update screenshots if UI changes

### API Documentation
- Document new endpoints
- Include request/response examples
- Update postman collections

## Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time discussions (coming soon)
- **Twitter**: Updates and announcements (coming soon)

### Getting Help
- Check the [Developer Documentation](DEVELOPERS.md)
- Search existing issues and discussions
- Ask in Discord (coming soon)
- Tag `@maintainers` for urgent issues

## Recognition

Contributors will be:
- Listed in the Contributors section
- Mentioned in release notes
- Eligible for contributor badges
- Invited to contributor meetings

## License

By contributing, you agree that your contributions will be licensed under the Open BSV License.

---

Thank you for contributing to Bitcoin Wallet! 🚀