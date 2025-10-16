import { Bsv20 } from 'yours-wallet-provider';

export type FileAssetType = 'ft' | 'nft';

export interface FileAssetMetadata {
  name?: string;
  description?: string;
  creator?: string;
  image?: string;
  attributes?: Record<string, any>;
  collection?: string;
  rarity?: string;
  [key: string]: any;
}

export interface FileAsset {
  // File identification
  id: string;
  filename: string;
  type: FileAssetType;
  
  // Display properties
  icon: string;
  displayAmount?: number;
  ticker?: string;
  
  // Financial data
  value?: number; // USD value
  marketCap?: number;
  priceChange24h?: number;
  
  // Asset metadata
  metadata?: FileAssetMetadata;
  
  // Blockchain backing
  underlyingToken: Bsv20 | OrdinalsNFT | any;
  standard: 'bsv20' | 'ordinals' | 'brc100' | 'unknown';
  
  // Status
  confirmed: boolean;
  pending?: boolean;
  
  // File properties
  size?: number; // bytes
  lastModified?: Date;
  contentType?: string;
}

export interface OrdinalsNFT {
  id: string;
  inscriptionId?: string;
  contentType: string;
  content?: string;
  metadata?: FileAssetMetadata;
  satoshi?: number;
  address?: string;
}

export interface FungibleTokenData {
  ticker: string;
  amount: number;
  decimals: number;
  totalSupply?: number;
  maxSupply?: number;
  deployer?: string;
  deployedAt?: Date;
}

export interface NonFungibleTokenData {
  tokenId: string;
  name: string;
  description?: string;
  image?: string;
  collection?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  rarity?: {
    rank: number;
    score: number;
  };
}

// File container formats
export interface FTContainer {
  version: '1.0';
  type: 'ft';
  ticker: string;
  amount: number;
  decimals: number;
  metadata?: FileAssetMetadata;
  blockchain: {
    standard: string;
    tokenData: any;
    txid?: string;
    vout?: number;
  };
}

export interface NFTContainer {
  version: '1.0';
  type: 'nft';
  name: string;
  metadata: FileAssetMetadata;
  content?: {
    type: string;
    data: string | ArrayBuffer;
    encoding?: string;
  };
  blockchain: {
    standard: string;
    tokenData: any;
    inscriptionId?: string;
    txid?: string;
    vout?: number;
  };
}

export type FileContainer = FTContainer | NFTContainer;

// Icon mapping for common tickers
export const TICKER_ICONS: Record<string, string> = {
  // Stocks
  'AAPL': '🍎',
  'GOOGL': '🔍', 
  'TSLA': '🚗',
  'MSFT': '💻',
  'AMZN': '📦',
  'META': '👥',
  'NVDA': '🖥️',
  'NFLX': '🎬',
  
  // Crypto
  'BTC': '₿',
  'BSV': '💎',
  'ETH': '⟠',
  
  // Commodities
  'GOLD': '🥇',
  'SILVER': '🥈',
  'OIL': '🛢️',
  
  // Default categories
  'STOCK': '📈',
  'CRYPTO': '🪙',
  'COMMODITY': '🏭',
  'REAL_ESTATE': '🏠',
  'BOND': '📋',
  'DERIVATIVE': '📊',
  
  // File types as assets
  'JPEG': '🖼️',
  'PNG': '🖼️',
  'GIF': '🖼️',
  'MP4': '🎬',
  'MP3': '🎵',
  'PDF': '📄',
  'DOC': '📝',
  'ZIP': '📦',
  'JSON': '⚙️',
  'HTML': '🌐',
  'CSS': '🎨',
  'JS': '⚡',
  'PY': '🐍',
  'GO': '🐹',
  'RUST': '🦀',
  
  // Default fallbacks
  'NFT': '🎨',
  'TOKEN': '🪙',
  'SHARE': '📈',
  'COIN': '🪙'
};

export const FILE_TYPE_ICONS: Record<string, string> = {
  'ft': '🪙',
  'nft': '🎨'
};