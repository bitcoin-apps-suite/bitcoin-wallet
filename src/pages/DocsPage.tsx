import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { AppHeader } from '../components/AppHeader';
import { FaCode, FaBook, FaGithub, FaTasks, FaRocket, FaBitcoin, FaUsers } from 'react-icons/fa';

const PageContainer = styled.div<{ theme: any }>`
  min-height: 100vh;
  background: ${({ theme }) => theme.color.global.walletBackground};
  color: ${({ theme }) => theme.color.global.contrast};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.nav<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const SidebarTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #f7931a;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li<{ theme: any; active?: boolean }>`
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  background: ${({ theme, active }) => active ? theme.color.global.walletBackground : 'transparent'};
  color: ${({ theme, active }) => active ? '#f7931a' : theme.color.global.gray};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.color.global.walletBackground};
    color: #f7931a;
  }

  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MainContent = styled.main<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  padding: 2rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: #f7931a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CodeBlock = styled.pre<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.walletBackground};
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  border-left: 4px solid #f7931a;
  margin: 1rem 0;
`;

const InfoBox = styled.div<{ theme: any; type: 'info' | 'warning' | 'success' }>`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid ${({ type }) => 
    type === 'info' ? '#2196F3' : 
    type === 'warning' ? '#ff9800' : 
    '#4CAF50'
  };
  background: ${({ theme, type }) => 
    type === 'info' ? 'rgba(33, 150, 243, 0.1)' : 
    type === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 
    'rgba(76, 175, 80, 0.1)'
  };
`;

const QuickStartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const QuickStartCard = styled.div<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.walletBackground};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.color.global.gray}20;
`;

const CardTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #f7931a;
`;

const CardText = styled.p<{ theme: any }>`
  color: ${({ theme }) => theme.color.global.gray};
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const Button = styled.button<{ theme: any }>`
  background: linear-gradient(to right, ${({ theme }) => theme.color.component.primaryButtonLeftGradient}, ${({ theme }) => theme.color.component.primaryButtonRightGradient});
  color: ${({ theme }) => theme.color.component.primaryButtonText};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

export const DocsPage: React.FC = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('getting-started');

  const navItems = [
    { id: 'getting-started', label: 'Getting Started', icon: <FaRocket /> },
    { id: 'api-reference', label: 'API Reference', icon: <FaCode /> },
    { id: 'bitcoin-integration', label: 'Bitcoin Integration', icon: <FaBitcoin /> },
    { id: 'contributing', label: 'Contributing', icon: <FaUsers /> },
    { id: 'tasks', label: 'Tasks & Rewards', icon: <FaTasks /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <>
            <Section>
              <SectionTitle><FaRocket /> Getting Started</SectionTitle>
              <p>Welcome to the Bitcoin Wallet development documentation. This guide will help you set up your development environment and start contributing to the project.</p>
              
              <QuickStartGrid>
                <QuickStartCard theme={theme}>
                  <CardTitle>1. Clone Repository</CardTitle>
                  <CardText theme={theme}>Get the latest source code from our GitHub repository.</CardText>
                  <Button theme={theme}>View on GitHub</Button>
                </QuickStartCard>
                
                <QuickStartCard theme={theme}>
                  <CardTitle>2. Install Dependencies</CardTitle>
                  <CardText theme={theme}>Set up your development environment with all required packages.</CardText>
                  <Button theme={theme}>View Guide</Button>
                </QuickStartCard>
                
                <QuickStartCard theme={theme}>
                  <CardTitle>3. Start Contributing</CardTitle>
                  <CardText theme={theme}>Find tasks, earn $BWallet tokens, and make your first contribution.</CardText>
                  <Button theme={theme}>Browse Tasks</Button>
                </QuickStartCard>
              </QuickStartGrid>

              <InfoBox theme={theme} type="info">
                <strong>Prerequisites:</strong> Node.js 18+, Git, and a basic understanding of React and TypeScript.
              </InfoBox>

              <CodeBlock theme={theme}>
{`# Clone the repository
git clone https://github.com/bitcoin-apps-suite/bitcoin-wallet.git
cd bitcoin-wallet

# Install dependencies
npm install

# Start development server
npm start`}
              </CodeBlock>
            </Section>
          </>
        );

      case 'api-reference':
        return (
          <>
            <Section>
              <SectionTitle><FaCode /> API Reference</SectionTitle>
              <p>Complete reference for the Bitcoin Wallet API, including wallet management, transaction handling, and token operations.</p>

              <h3>Wallet Operations</h3>
              <CodeBlock theme={theme}>
{`// Create a new wallet
const wallet = await createWallet({
  network: 'mainnet' | 'testnet',
  type: 'hd' | 'simple'
});

// Get wallet balance
const balance = await wallet.getBalance();

// Send transaction
const txid = await wallet.sendTransaction({
  to: 'bitcoin_address',
  amount: satoshis,
  feeRate: 10 // sat/byte
});`}
              </CodeBlock>

              <h3>Token Integration</h3>
              <CodeBlock theme={theme}>
{`// BSV-20 Token Operations
const token = new BSV20Token({
  tick: 'BWALLET',
  address: wallet.address
});

// Get token balance
const tokenBalance = await token.getBalance();

// Transfer tokens
await token.transfer({
  to: 'recipient_address',
  amount: '1000'
});`}
              </CodeBlock>

              <InfoBox theme={theme} type="warning">
                <strong>Rate Limits:</strong> API calls are limited to 100 requests per minute per IP address.
              </InfoBox>
            </Section>
          </>
        );

      case 'bitcoin-integration':
        return (
          <>
            <Section>
              <SectionTitle><FaBitcoin /> Bitcoin Integration</SectionTitle>
              <p>Learn how to integrate with various Bitcoin protocols and standards supported by our wallet.</p>

              <h3>Supported Standards</h3>
              <ul>
                <li><strong>Ordinals:</strong> Bitcoin NFTs and inscriptions</li>
                <li><strong>BSV-20:</strong> Fungible tokens on Bitcoin SV</li>
                <li><strong>RGB:</strong> Smart contracts on Bitcoin</li>
                <li><strong>Lightning Network:</strong> Layer 2 payments</li>
                <li><strong>Counterparty:</strong> Asset issuance protocol</li>
              </ul>

              <h3>Ordinals Integration</h3>
              <CodeBlock theme={theme}>
{`// Inscribe data on Bitcoin
const inscription = await inscribeData({
  data: 'Hello, Bitcoin!',
  contentType: 'text/plain',
  wallet: wallet
});

// Get ordinal information
const ordinal = await getOrdinal(inscriptionId);`}
              </CodeBlock>

              <h3>Lightning Network</h3>
              <CodeBlock theme={theme}>
{`// Create Lightning invoice
const invoice = await lightning.createInvoice({
  amount: 1000, // millisatoshis
  description: 'Payment for services'
});

// Pay Lightning invoice
await lightning.payInvoice(invoice.payment_request);`}
              </CodeBlock>
            </Section>
          </>
        );

      case 'contributing':
        return (
          <>
            <Section>
              <SectionTitle><FaUsers /> Contributing Guide</SectionTitle>
              <p>Join our community of developers and help build the future of Bitcoin wallets. Earn $BWallet tokens for your contributions!</p>

              <h3>How to Contribute</h3>
              <ol>
                <li>Browse available tasks in our leaderboard</li>
                <li>Fork the repository and create a feature branch</li>
                <li>Make your changes and write tests</li>
                <li>Submit a pull request with detailed description</li>
                <li>Earn $BWallet tokens upon merge</li>
              </ol>

              <InfoBox theme={theme} type="success">
                <strong>Reward System:</strong> Contributors earn $BWallet tokens based on the complexity and impact of their contributions.
              </InfoBox>

              <h3>Development Guidelines</h3>
              <ul>
                <li>Follow TypeScript best practices</li>
                <li>Write comprehensive tests for new features</li>
                <li>Update documentation for API changes</li>
                <li>Follow our code style guidelines</li>
                <li>Ensure security best practices</li>
              </ul>

              <CodeBlock theme={theme}>
{`# Run tests
npm test

# Check code style
npm run lint

# Build for production
npm run build`}
              </CodeBlock>
            </Section>
          </>
        );

      case 'tasks':
        return (
          <>
            <Section>
              <SectionTitle><FaTasks /> Tasks & Rewards</SectionTitle>
              <p>Contribute to the Bitcoin Wallet ecosystem and earn $BWallet tokens. Tasks are categorized by difficulty and reward amount.</p>

              <h3>Task Categories</h3>
              <QuickStartGrid>
                <QuickStartCard theme={theme}>
                  <CardTitle>🐛 Bug Fixes</CardTitle>
                  <CardText theme={theme}>Find and fix bugs in the codebase. Rewards: 50-200 $BWallet</CardText>
                  <Button theme={theme}>View Bug Reports</Button>
                </QuickStartCard>
                
                <QuickStartCard theme={theme}>
                  <CardTitle>✨ New Features</CardTitle>
                  <CardText theme={theme}>Implement new wallet features. Rewards: 200-1000 $BWallet</CardText>
                  <Button theme={theme}>View Feature Requests</Button>
                </QuickStartCard>
                
                <QuickStartCard theme={theme}>
                  <CardTitle>📚 Documentation</CardTitle>
                  <CardText theme={theme}>Improve docs and guides. Rewards: 25-100 $BWallet</CardText>
                  <Button theme={theme}>View Docs Tasks</Button>
                </QuickStartCard>
              </QuickStartGrid>

              <h3>Current Leaderboard</h3>
              <InfoBox theme={theme} type="info">
                Check out our live leaderboard to see top contributors and available tasks with their reward amounts.
              </InfoBox>

              <Button theme={theme}>View Full Leaderboard</Button>
            </Section>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer theme={theme}>
      <AppHeader theme={theme} onTitleClick={() => window.location.href = '/'} />
      
      <ContentContainer>
        <Sidebar theme={theme}>
          <SidebarTitle>Documentation</SidebarTitle>
          <NavList>
            {navItems.map(item => (
              <NavItem
                key={item.id}
                theme={theme}
                active={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}
                {item.label}
              </NavItem>
            ))}
          </NavList>
        </Sidebar>

        <MainContent theme={theme}>
          {renderContent()}
        </MainContent>
      </ContentContainer>
    </PageContainer>
  );
};