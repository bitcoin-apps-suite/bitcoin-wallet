import { Bsv20 } from 'yours-wallet-provider';
import { 
  FileAsset, 
  FileAssetType, 
  OrdinalsNFT, 
  FTContainer, 
  NFTContainer,
  TICKER_ICONS,
  FILE_TYPE_ICONS
} from '../types/FileAsset.types';

export class FileTypeTranslatorService {
  
  /**
   * Convert BSV20 tokens to file assets
   */
  public bsv20ToFileAsset(bsv20: Bsv20): FileAsset {
    const isNFT = this.isBsv20NFT(bsv20);
    const ticker = bsv20.tick || bsv20.sym || 'TOKEN';
    
    if (isNFT) {
      return {
        id: bsv20.id || this.generateId(),
        filename: `${this.sanitizeFilename(bsv20.tick || bsv20.sym || 'NFT')}.nft`,
        type: 'nft',
        icon: this.getIcon(ticker, 'nft'),
        displayAmount: 1,
        ticker: ticker,
        value: this.estimateValue(bsv20),
        metadata: {
          name: bsv20.tick || bsv20.sym,
          description: `BSV20 NFT Token`,
          collection: (bsv20 as any).collection,
        },
        underlyingToken: bsv20,
        standard: 'bsv20',
        confirmed: bsv20.all?.confirmed ? bsv20.all.confirmed > 0n : true,
        pending: bsv20.all?.pending ? bsv20.all.pending > 0n : false,
        lastModified: new Date(),
        contentType: 'application/bsv20-nft'
      };
    }
    
    // Fungible token
    const amount = bsv20.all?.confirmed ? Number(bsv20.all.confirmed) : 0;
    
    return {
      id: bsv20.id || this.generateId(),
      filename: `${this.sanitizeFilename(ticker)}-shares.ft`,
      type: 'ft',
      icon: this.getIcon(ticker, 'ft'),
      displayAmount: amount,
      ticker: ticker,
      value: this.estimateValue(bsv20) * amount,
      metadata: {
        name: `${ticker} Shares`,
        description: `Fungible BSV20 tokens`,
        decimals: bsv20.dec || 0,
        totalSupply: (bsv20 as any).max ? Number((bsv20 as any).max) : undefined,
      },
      underlyingToken: bsv20,
      standard: 'bsv20',
      confirmed: amount > 0,
      pending: bsv20.all?.pending ? bsv20.all.pending > 0n : false,
      lastModified: new Date(),
      contentType: 'application/bsv20-ft'
    };
  }
  
  /**
   * Convert Ordinals to file assets
   */
  public ordinalsToFileAsset(ordinal: OrdinalsNFT): FileAsset {
    const name = this.extractNameFromOrdinal(ordinal);
    
    return {
      id: ordinal.id || ordinal.inscriptionId || this.generateId(),
      filename: `${this.sanitizeFilename(name)}.nft`,
      type: 'nft',
      icon: this.getIconFromContentType(ordinal.contentType),
      displayAmount: 1,
      ticker: name,
      value: this.estimateOrdinalValue(ordinal),
      metadata: {
        name: name,
        description: 'Bitcoin Ordinals Inscription',
        contentType: ordinal.contentType,
        inscriptionId: ordinal.inscriptionId,
        ...ordinal.metadata
      },
      underlyingToken: ordinal,
      standard: 'ordinals',
      confirmed: true,
      lastModified: new Date(),
      contentType: ordinal.contentType || 'application/ordinals'
    };
  }
  
  /**
   * Convert file assets back to blockchain transactions
   */
  public async fileAssetToTransaction(
    fileAsset: FileAsset, 
    recipient: string, 
    amount?: number
  ): Promise<any> {
    switch (fileAsset.standard) {
      case 'bsv20':
        return this.bsv20Transaction(fileAsset, recipient, amount);
      case 'ordinals':
        return this.ordinalsTransaction(fileAsset, recipient);
      default:
        throw new Error(`Unsupported standard: ${fileAsset.standard}`);
    }
  }
  
  /**
   * Create file containers for export/import
   */
  public createFileContainer(fileAsset: FileAsset): FTContainer | NFTContainer {
    if (fileAsset.type === 'ft') {
      return {
        version: '1.0',
        type: 'ft',
        ticker: fileAsset.ticker || 'TOKEN',
        amount: fileAsset.displayAmount || 0,
        decimals: fileAsset.metadata?.decimals || 0,
        metadata: fileAsset.metadata,
        blockchain: {
          standard: fileAsset.standard,
          tokenData: fileAsset.underlyingToken,
          txid: (fileAsset.underlyingToken as any)?.txid,
          vout: (fileAsset.underlyingToken as any)?.vout
        }
      };
    } else {
      return {
        version: '1.0',
        type: 'nft',
        name: fileAsset.metadata?.name || fileAsset.ticker || 'NFT',
        metadata: fileAsset.metadata || {},
        blockchain: {
          standard: fileAsset.standard,
          tokenData: fileAsset.underlyingToken,
          inscriptionId: (fileAsset.underlyingToken as any)?.inscriptionId,
          txid: (fileAsset.underlyingToken as any)?.txid,
          vout: (fileAsset.underlyingToken as any)?.vout
        }
      };
    }
  }
  
  /**
   * Parse file containers from imported data
   */
  public parseFileContainer(containerData: string): FileAsset {
    const container = JSON.parse(containerData) as FTContainer | NFTContainer;
    
    if (container.type === 'ft') {
      return {
        id: this.generateId(),
        filename: `${container.ticker}-shares.ft`,
        type: 'ft',
        icon: this.getIcon(container.ticker, 'ft'),
        displayAmount: container.amount,
        ticker: container.ticker,
        metadata: container.metadata,
        underlyingToken: container.blockchain.tokenData,
        standard: container.blockchain.standard as any,
        confirmed: true,
        contentType: 'application/bitcoin-ft'
      };
    } else {
      return {
        id: this.generateId(),
        filename: `${this.sanitizeFilename(container.name)}.nft`,
        type: 'nft',
        icon: '🎨',
        displayAmount: 1,
        ticker: container.name,
        metadata: container.metadata,
        underlyingToken: container.blockchain.tokenData,
        standard: container.blockchain.standard as any,
        confirmed: true,
        contentType: 'application/bitcoin-nft'
      };
    }
  }
  
  // Private helper methods
  
  private isBsv20NFT(bsv20: Bsv20): boolean {
    // Heuristics to determine if BSV20 token is NFT-like
    const amount = bsv20.all?.confirmed ? Number(bsv20.all.confirmed) : 0;
    const hasUniqueId = Boolean(bsv20.id);
    const hasMetadata = Boolean((bsv20 as any).collection || (bsv20 as any).metadata);
    const isLowSupply = (bsv20 as any).max ? Number((bsv20 as any).max) <= 1000 : false;
    
    return amount === 1 && (hasUniqueId || hasMetadata || isLowSupply);
  }
  
  private getIcon(ticker: string, type: FileAssetType): string {
    // Check specific ticker first
    const upperTicker = ticker.toUpperCase();
    if (TICKER_ICONS[upperTicker]) {
      return TICKER_ICONS[upperTicker];
    }
    
    // Check file extension patterns
    if (upperTicker.includes('.')) {
      const ext = upperTicker.split('.').pop();
      if (ext && TICKER_ICONS[ext]) {
        return TICKER_ICONS[ext];
      }
    }
    
    // Fallback to type-based icon
    return FILE_TYPE_ICONS[type] || '🪙';
  }
  
  private getIconFromContentType(contentType: string): string {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.startsWith('video/')) return '🎬';
    if (contentType.startsWith('audio/')) return '🎵';
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('json')) return '⚙️';
    if (contentType.includes('html')) return '🌐';
    return '🎨';
  }
  
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }
  
  private extractNameFromOrdinal(ordinal: OrdinalsNFT): string {
    if (ordinal.metadata?.name) return ordinal.metadata.name;
    if (ordinal.inscriptionId) return `Inscription-${ordinal.inscriptionId.slice(0, 8)}`;
    return `Ordinal-${ordinal.id || 'Unknown'}`;
  }
  
  private generateId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private estimateValue(bsv20: Bsv20): number {
    // Mock valuation - in real implementation, fetch from market data
    const ticker = bsv20.tick || bsv20.sym || '';
    
    // Mock prices for demo
    const mockPrices: Record<string, number> = {
      'AAPL': 175.50,
      'GOOGL': 135.25,
      'TSLA': 248.50,
      'MSFT': 378.90,
      'GOLD': 2045.00,
      'BTC': 43500.00,
      'BSV': 45.25
    };
    
    return mockPrices[ticker.toUpperCase()] || 1.00;
  }
  
  private estimateOrdinalValue(ordinal: OrdinalsNFT): number {
    // Mock NFT valuation
    return Math.random() * 1000 + 100; // $100-$1100
  }
  
  private bsv20Transaction(fileAsset: FileAsset, recipient: string, amount?: number) {
    return {
      type: 'bsv20_transfer',
      token: fileAsset.underlyingToken,
      recipient,
      amount: amount || fileAsset.displayAmount || 1
    };
  }
  
  private ordinalsTransaction(fileAsset: FileAsset, recipient: string) {
    return {
      type: 'ordinals_transfer',
      inscription: fileAsset.underlyingToken,
      recipient
    };
  }
}

export const fileTypeTranslator = new FileTypeTranslatorService();