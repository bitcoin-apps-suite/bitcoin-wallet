# Product Requirements Document (PRD)
# Bitcoin Wallet with HandCash Integration

## Executive Summary

Bitcoin Wallet is positioned to become the reference client wallet for the Bitcoin Corporation's bApps suite and the default open-source wallet for the BSV ecosystem's ordinals and token management. This PRD outlines the strategic integration of HandCash authentication to enhance user experience while maintaining the wallet's decentralized, non-custodial nature.

## Product Vision

Transform Bitcoin Wallet into a comprehensive digital asset management platform that bridges traditional file-type assets with blockchain-based tokens, while providing seamless authentication options through HandCash integration for users who prefer a simplified onboarding experience.

## Strategic Rationale for HandCash Integration

### 1. **User Acquisition & Onboarding**
- **Problem**: Complex seed phrase management deters mainstream users
- **Solution**: Optional HandCash SSO provides familiar OAuth-like experience
- **Impact**: Reduced friction for new users while maintaining power user options

### 2. **Ecosystem Synergy**
- **HandCash Market Presence**: Large existing user base in BSV ecosystem
- **Cross-Wallet Portability**: Users can access their HandCash assets alongside Bitcoin Wallet assets
- **Network Effects**: Each wallet strengthens the other's value proposition

### 3. **Technical Benefits**
- **Simplified Key Management**: HandCash handles secure key storage for opted-in users
- **Social Features**: Leverage HandCash's $handle system for human-readable addresses
- **Payment Rails**: Access to HandCash Connect's payment infrastructure

## Core Product Features

### 1. Current Capabilities (Baseline)

#### Asset Management
- BSV native currency support
- BSV20 token protocol
- 1Sat Ordinals creation and management
- File-type asset representation (JPEG, PNG, MP3, PDF, etc.)
- Multi-recipient transaction support

#### Technical Infrastructure
- SPV (Simplified Payment Verification) wallet
- Non-custodial architecture
- Chrome extension deployment
- React-based responsive web app
- 3D UTXO visualization with Three.js
- Bitcoin OS integration for bApps ecosystem

### 2. Proposed HandCash Integration Features

#### A. Authentication Layer

**Sign In with HandCash** (Primary Feature)
```
User Flow:
1. Landing page shows two options:
   - "Create/Import Wallet" (traditional flow)
   - "Sign in with HandCash" (new flow)
   
2. HandCash OAuth Flow:
   - Redirect to HandCash authorization
   - Request permissions: profile, balance, transactions
   - Return with access token
   - Store encrypted token locally

3. Dual-Wallet View:
   - Native Bitcoin Wallet assets (left panel)
   - HandCash imported assets (right panel)
   - Unified transaction interface
```

**Implementation Requirements:**
- HandCash Connect SDK integration (@handcash/handcash-connect)
- OAuth 2.0 flow implementation
- Secure token storage mechanism
- Session management system
- Fallback for HandCash service unavailability

#### B. Asset Unification

**Unified Balance Display**
- Combined BSV balance (native + HandCash)
- Aggregated token listings
- Consolidated NFT/Ordinals gallery
- Real-time sync with both sources

**Smart Routing for Transactions**
```
Transaction Decision Engine:
- If sending BSV → Check both balances
- If insufficient in native → Prompt to use HandCash balance
- If sending to $handle → Route through HandCash
- If sending to address → Use native wallet
```

#### C. Enhanced Features via HandCash

**Social Features**
- Display HandCash profile (avatar, handle, bio)
- Send to $handles without address lookup
- Contact list synchronization
- Transaction history with social context

**Payment Features**
- HandCash Pay integration for merchants
- Subscription management
- Recurring payments
- Multi-currency display (via HandCash rates)

## User Experience Design

### 1. Authentication States

#### State 1: Anonymous User
```
┌─────────────────────────────────────┐
│        Bitcoin Wallet               │
│                                     │
│   ┌───────────┐  ┌───────────┐    │
│   │  Create   │  │  Sign in  │    │
│   │  Wallet   │  │   with    │    │
│   │           │  │ HandCash  │    │
│   └───────────┘  └───────────┘    │
│                                     │
│   Already have a wallet?           │
│   [Import with seed phrase]        │
└─────────────────────────────────────┘
```

#### State 2: HandCash Authenticated
```
┌─────────────────────────────────────┐
│  👤 @username | Bitcoin Wallet      │
├─────────────────────────────────────┤
│ Total Balance: 10.5 BSV            │
│ ├─ Native Wallet: 3.2 BSV          │
│ └─ HandCash: 7.3 BSV               │
├─────────────────────────────────────┤
│ [Receive] [Send] [Swap] [History]  │
└─────────────────────────────────────┘
```

#### State 3: Dual Authentication
```
┌─────────────────────────────────────┐
│  👤 @username | 🔑 Local Wallet     │
├─────────────────────────────────────┤
│ Combined View                       │
│ ┌─────────┐ ┌─────────┐           │
│ │ Native  │ │HandCash │           │
│ │ Assets  │ │ Assets  │           │
│ └─────────┘ └─────────┘           │
│                                     │
│ [Manage Wallets] [Settings]        │
└─────────────────────────────────────┘
```

### 2. Transaction Flow

#### Sending with HandCash Integration
1. User clicks "Send"
2. System shows unified balance
3. User enters recipient (address or $handle)
4. System auto-detects optimal route:
   - $handle → HandCash API
   - Address → Check balance sources
5. Transaction preview shows source
6. User confirms with appropriate auth:
   - Native: Password/biometric
   - HandCash: OAuth confirmation
7. Transaction broadcast
8. Unified history update

### 3. Asset Visualization

Enhanced 3D Bubble Visualization:
- **Blue Bubbles**: Native wallet UTXOs
- **Green Bubbles**: HandCash UTXOs
- **Purple Bubbles**: Shared/linked assets
- **Size**: Represents value
- **Proximity**: Shows spending relationships

## Technical Architecture

### 1. System Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (React)               │
├─────────────────────────────────────────┤
│          State Management                │
│  ┌──────────┐  ┌──────────────┐        │
│  │  Native  │  │   HandCash   │        │
│  │  Wallet  │  │   Provider   │        │
│  │  Context │  │   Context    │        │
│  └──────────┘  └──────────────┘        │
├─────────────────────────────────────────┤
│           Service Layer                  │
│  ┌──────────┐  ┌──────────────┐        │
│  │   BSV    │  │   HandCash   │        │
│  │  Service │  │     API      │        │
│  │          │  │   Service    │        │
│  └──────────┘  └──────────────┘        │
├─────────────────────────────────────────┤
│         Storage Layer                    │
│  ┌──────────┐  ┌──────────────┐        │
│  │  Chrome  │  │   Secure     │        │
│  │  Storage │  │    Token     │        │
│  │          │  │   Storage    │        │
│  └──────────┘  └──────────────┘        │
└─────────────────────────────────────────┘
```

### 2. Data Flow

```
User Action → Router → Service Selection
                ↓
        Decision Engine
         ↙          ↘
   Native Wallet   HandCash API
         ↘          ↙
        Transaction
            ↓
      Blockchain/Network
            ↓
        Confirmation
            ↓
      Update Both UIs
```

### 3. Security Architecture

#### Authentication Security
- **OAuth 2.0 + PKCE** for HandCash authentication
- **Token Encryption**: AES-256-GCM for stored tokens
- **Token Refresh**: Automatic refresh before expiration
- **Revocation**: User can disconnect HandCash anytime
- **Scope Limitation**: Minimal required permissions

#### Transaction Security
- **Dual Confirmation**: Both wallets require explicit approval
- **Amount Limits**: Configurable limits for HandCash transactions
- **Whitelist**: Optional address/handle whitelist
- **2FA Options**: SMS/TOTP for high-value transactions
- **Audit Trail**: Complete transaction history

#### Privacy Considerations
- **Data Minimization**: Only essential HandCash data stored
- **Local First**: Preference for local wallet when possible
- **Opt-in Sync**: User controls what data is shared
- **Clear Disclosure**: Transparent about data usage

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] HandCash Connect SDK integration
- [ ] OAuth flow implementation
- [ ] Basic authentication UI
- [ ] Token storage mechanism
- [ ] Profile data fetching

### Phase 2: Core Integration (Weeks 5-8)
- [ ] Unified balance display
- [ ] HandCash transaction support
- [ ] $handle resolution
- [ ] Dual-wallet transaction routing
- [ ] Error handling & fallbacks

### Phase 3: Enhanced Features (Weeks 9-12)
- [ ] Advanced transaction routing
- [ ] Contact synchronization
- [ ] Social features integration
- [ ] Performance optimization
- [ ] Security audit

### Phase 4: Polish & Launch (Weeks 13-16)
- [ ] UI/UX refinements
- [ ] Beta testing program
- [ ] Documentation
- [ ] Marketing materials
- [ ] Public release

## Success Metrics

### User Acquisition
- **Target**: 25% of new users choose HandCash sign-in within 6 months
- **Measurement**: Authentication method tracking

### User Engagement
- **Target**: 40% increase in daily active users
- **Measurement**: Analytics dashboard

### Transaction Volume
- **Target**: 30% of transactions utilize HandCash features
- **Measurement**: Transaction source tracking

### User Satisfaction
- **Target**: 4.5+ star rating with HandCash integration
- **Measurement**: In-app surveys and app store reviews

### Technical Performance
- **Target**: <2 second HandCash authentication
- **Target**: <500ms balance synchronization
- **Target**: 99.9% uptime for integrated features

## Risk Analysis & Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| HandCash API downtime | High | Implement fallback to native wallet only |
| Token compromise | Critical | Encrypted storage, regular rotation |
| Sync conflicts | Medium | Conflict resolution algorithm |
| Performance degradation | Medium | Lazy loading, caching strategies |

### Business Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| User confusion with dual wallets | Medium | Clear UI separation, onboarding tutorial |
| HandCash dependency | High | Maintain full native wallet functionality |
| Regulatory changes | High | Modular architecture for easy adjustment |
| Competition from unified wallets | Medium | Focus on unique file-type asset features |

### User Experience Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex mental model | High | Progressive disclosure, smart defaults |
| Migration friction | Medium | Import/export tools, migration wizard |
| Feature overload | Medium | Customizable interface, feature flags |

## Competitive Analysis

### Direct Competitors
1. **RelayX Wallet**
   - Strength: Deep ecosystem integration
   - Weakness: Less focus on ordinals/tokens
   - Our Advantage: File-type asset innovation

2. **DotWallet**
   - Strength: Strong Asian market presence
   - Weakness: Limited Western adoption
   - Our Advantage: HandCash's Western user base

3. **Simply Cash**
   - Strength: Simplicity
   - Weakness: Limited features
   - Our Advantage: Power user capabilities

### Indirect Competitors
- MetaMask (Ethereum)
- Phantom (Solana)
- Rainbow (Multi-chain)

### Competitive Advantages
1. **Unique file-type asset paradigm**
2. **Optional HandCash integration (not mandatory)**
3. **Open-source and community-driven**
4. **Native bApps ecosystem integration**
5. **3D visualization innovation**

## Marketing & Go-to-Market Strategy

### Target Audiences

#### Primary: Existing BSV Users
- Already understand the ecosystem
- Looking for better wallet options
- Value open-source solutions

#### Secondary: HandCash Users
- Want more control over their assets
- Interested in advanced features
- Need desktop/browser experience

#### Tertiary: Crypto-Curious Users
- Intimidated by traditional wallets
- Familiar with social login patterns
- Interested in digital assets

### Launch Strategy

#### Soft Launch (Beta)
- 500 invited beta testers
- 50% existing users, 50% HandCash users
- 4-week testing period
- Bug bounty program

#### Public Launch
- Joint announcement with HandCash
- Demonstration video series
- Influencer partnerships
- Developer documentation

### Key Messages
1. "Your assets, your choice, your wallet"
2. "Sign in with HandCash, control with Bitcoin Wallet"
3. "The open-source wallet for the Bitcoin economy"

## Support & Documentation Requirements

### User Documentation
- Getting Started Guide
- HandCash Integration FAQ
- Video tutorials (3-5 minutes each)
- Troubleshooting guide

### Developer Documentation
- API reference
- Integration guide for bApps
- HandCash Connect implementation
- Sample code repositories

### Support Infrastructure
- In-app help system
- Discord community support
- Email support (24-48h response)
- Knowledge base website

## Legal & Compliance Considerations

### Regulatory Compliance
- No custodial services provided
- Clear terms of service
- Privacy policy updates
- GDPR compliance for EU users

### HandCash Partnership
- API usage agreement
- Trademark usage rights
- Revenue sharing (if applicable)
- Service level agreements

### Open Source Licensing
- Maintain Open BSV License
- Contributor agreements
- Dependency licensing review

## Conclusion

The integration of HandCash authentication into Bitcoin Wallet represents a strategic evolution that maintains the wallet's core values while dramatically improving accessibility. By offering HandCash sign-in as an optional feature, we can attract a broader user base without alienating power users who prefer full control.

This integration positions Bitcoin Wallet as the bridge between the simplicity users want and the sovereignty they need, making it the ideal reference client for the Bitcoin Corporation's bApps suite and the broader BSV ecosystem.

## Appendices

### A. Technical Specifications
- HandCash Connect SDK v0.8.11
- OAuth 2.0 + PKCE flow
- React Context API for state management
- Chrome Extension Manifest V3

### B. UI/UX Mockups
- [Link to Figma designs]
- [User flow diagrams]
- [Interactive prototype]

### C. API Endpoints Required
- GET /profile
- GET /balance
- POST /transaction
- GET /transactions/history
- POST /auth/token/refresh

### D. Security Audit Checklist
- [ ] OAuth implementation review
- [ ] Token storage encryption
- [ ] API key management
- [ ] Transaction signing process
- [ ] Error message sanitization

### E. Success Metrics Dashboard
- Daily active users (DAU)
- Authentication method distribution
- Transaction volume by source
- Error rates and types
- User satisfaction scores

---

**Document Version**: 1.0  
**Date**: January 2025  
**Author**: Bitcoin Wallet Product Team  
**Status**: DRAFT - Pending Review  
**Next Review**: Q1 2025 Planning Session