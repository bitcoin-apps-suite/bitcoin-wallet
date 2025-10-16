import { handCashAuthService } from './HandCashAuth.service';
import { validate } from 'bitcoin-address-validation';

export interface TransactionRoute {
  source: 'native' | 'handcash' | 'optimal';
  reason: string;
  canUseBoth: boolean;
}

export interface TransactionRequest {
  to: string;
  amount: number;
  currency: 'BSV' | 'USD';
  nativeBalance: number;
  handCashBalance?: number;
}

export class TransactionRouterService {
  
  /**
   * Determines the optimal wallet source for a transaction
   */
  public determineRoute(request: TransactionRequest): TransactionRoute {
    const { to, amount, nativeBalance, handCashBalance } = request;
    
    // Check if recipient is a HandCash handle
    const isHandCashHandle = this.isHandCashHandle(to);
    
    // Check if recipient is a Paymail address
    const isPaymail = this.isPaymail(to);
    
    // Check if it's a regular BSV address
    const isBsvAddress = validate(to);
    
    // Check if HandCash is available
    const hasHandCash = handCashAuthService.isAuthenticated() && (handCashBalance || 0) > 0;
    
    // Routing logic
    if (isHandCashHandle) {
      // HandCash handles can only be sent to via HandCash
      if (!hasHandCash) {
        return {
          source: 'native',
          reason: 'HandCash not connected. Send to BSV address instead.',
          canUseBoth: false
        };
      }
      
      if ((handCashBalance || 0) < amount) {
        return {
          source: 'native',
          reason: 'Insufficient HandCash balance. Use native wallet or top up HandCash.',
          canUseBoth: false
        };
      }
      
      return {
        source: 'handcash',
        reason: 'Sending to HandCash handle requires HandCash wallet.',
        canUseBoth: false
      };
    }
    
    if (isPaymail) {
      // Paymail can be sent from either wallet
      const canAffordNative = nativeBalance >= amount;
      const canAffordHandCash = (handCashBalance || 0) >= amount;
      
      if (canAffordNative && canAffordHandCash) {
        // User can choose
        return {
          source: 'optimal',
          reason: 'Both wallets have sufficient balance. Choose your preferred source.',
          canUseBoth: true
        };
      }
      
      if (canAffordNative) {
        return {
          source: 'native',
          reason: 'Using native wallet (sufficient balance).',
          canUseBoth: false
        };
      }
      
      if (canAffordHandCash) {
        return {
          source: 'handcash',
          reason: 'Using HandCash wallet (sufficient balance).',
          canUseBoth: false
        };
      }
      
      return {
        source: 'native',
        reason: 'Insufficient balance in both wallets.',
        canUseBoth: false
      };
    }
    
    if (isBsvAddress) {
      // Regular BSV address - prefer native wallet
      if (nativeBalance >= amount) {
        return {
          source: 'native',
          reason: 'Using native wallet for BSV address transaction.',
          canUseBoth: hasHandCash && (handCashBalance || 0) >= amount
        };
      }
      
      if (hasHandCash && (handCashBalance || 0) >= amount) {
        return {
          source: 'handcash',
          reason: 'Insufficient native balance. Using HandCash wallet.',
          canUseBoth: false
        };
      }
      
      // Check if combined balance is sufficient
      const combinedBalance = nativeBalance + (handCashBalance || 0);
      if (combinedBalance >= amount) {
        return {
          source: 'optimal',
          reason: 'Transaction requires funds from both wallets.',
          canUseBoth: true
        };
      }
      
      return {
        source: 'native',
        reason: 'Insufficient balance across all wallets.',
        canUseBoth: false
      };
    }
    
    // Default fallback
    return {
      source: 'native',
      reason: 'Invalid recipient address format.',
      canUseBoth: false
    };
  }
  
  /**
   * Checks if the address is a HandCash handle
   */
  private isHandCashHandle(address: string): boolean {
    // HandCash handles start with $ and contain only alphanumeric characters
    return /^\$[a-zA-Z0-9_]+$/.test(address);
  }
  
  /**
   * Checks if the address is a Paymail address
   */
  private isPaymail(address: string): boolean {
    // Basic Paymail validation
    const paymailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return paymailRegex.test(address);
  }
  
  /**
   * Splits a transaction between wallets if needed
   */
  public splitTransaction(
    amount: number,
    nativeBalance: number,
    handCashBalance: number
  ): { nativeAmount: number; handCashAmount: number } {
    if (amount <= nativeBalance) {
      return { nativeAmount: amount, handCashAmount: 0 };
    }
    
    if (amount <= handCashBalance) {
      return { nativeAmount: 0, handCashAmount: amount };
    }
    
    // Split between both wallets
    const nativeAmount = Math.min(nativeBalance, amount);
    const handCashAmount = amount - nativeAmount;
    
    return { nativeAmount, handCashAmount };
  }
  
  /**
   * Estimates transaction fees for different routes
   */
  public estimateFees(route: TransactionRoute): {
    native?: number;
    handcash?: number;
    total: number;
  } {
    const baseFee = 0.00000500; // Base BSV transaction fee
    
    switch (route.source) {
      case 'native':
        return { native: baseFee, total: baseFee };
        
      case 'handcash':
        // HandCash may have different fee structure
        const handcashFee = baseFee * 1.1; // Slightly higher for convenience
        return { handcash: handcashFee, total: handcashFee };
        
      case 'optimal':
        // If using both wallets, double the fees
        return {
          native: baseFee,
          handcash: baseFee * 1.1,
          total: baseFee + (baseFee * 1.1)
        };
        
      default:
        return { total: baseFee };
    }
  }
  
  /**
   * Validates if a transaction can proceed
   */
  public validateTransaction(
    request: TransactionRequest,
    route: TransactionRoute
  ): { valid: boolean; error?: string } {
    const { amount, nativeBalance, handCashBalance } = request;
    
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    const fees = this.estimateFees(route);
    const totalNeeded = amount + fees.total;
    
    switch (route.source) {
      case 'native':
        if (nativeBalance < totalNeeded) {
          return { 
            valid: false, 
            error: `Insufficient balance. Need ${totalNeeded} BSV (including fees)` 
          };
        }
        break;
        
      case 'handcash':
        if ((handCashBalance || 0) < totalNeeded) {
          return { 
            valid: false, 
            error: `Insufficient HandCash balance. Need ${totalNeeded} BSV (including fees)` 
          };
        }
        break;
        
      case 'optimal':
        const combinedBalance = nativeBalance + (handCashBalance || 0);
        if (combinedBalance < totalNeeded) {
          return { 
            valid: false, 
            error: `Insufficient combined balance. Need ${totalNeeded} BSV (including fees)` 
          };
        }
        break;
    }
    
    return { valid: true };
  }
}

export const transactionRouter = new TransactionRouterService();