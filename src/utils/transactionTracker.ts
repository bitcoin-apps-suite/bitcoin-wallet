export interface TransactionStatus {
  txid: string;
  status: 'pending' | 'confirmed' | 'failed' | 'unknown';
  confirmations: number;
  timestamp: number;
  errorMessage?: string;
  retryCount?: number;
}

export interface TransactionTracker {
  addTransaction: (txid: string) => void;
  getTransactionStatus: (txid: string) => TransactionStatus | null;
  updateTransactionStatus: (txid: string, status: Partial<TransactionStatus>) => void;
  removeTransaction: (txid: string) => void;
  getAllPendingTransactions: () => TransactionStatus[];
  cleanupOldTransactions: (maxAge?: number) => void;
}

class TransactionTrackerImpl implements TransactionTracker {
  private transactions: Map<string, TransactionStatus> = new Map();
  private readonly MAX_RETRY_COUNT = 3;
  private readonly DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  addTransaction(txid: string): void {
    if (!txid || typeof txid !== 'string') {
      throw new Error('Invalid transaction ID');
    }

    const existingTx = this.transactions.get(txid);
    if (existingTx) {
      console.warn(`Transaction ${txid} already being tracked`);
      return;
    }

    this.transactions.set(txid, {
      txid,
      status: 'pending',
      confirmations: 0,
      timestamp: Date.now(),
      retryCount: 0,
    });

    console.log(`Started tracking transaction: ${txid}`);
  }

  getTransactionStatus(txid: string): TransactionStatus | null {
    if (!txid) return null;
    return this.transactions.get(txid) || null;
  }

  updateTransactionStatus(txid: string, updates: Partial<TransactionStatus>): void {
    const existing = this.transactions.get(txid);
    if (!existing) {
      console.warn(`Cannot update unknown transaction: ${txid}`);
      return;
    }

    const updated: TransactionStatus = {
      ...existing,
      ...updates,
      txid, // Ensure txid cannot be overwritten
    };

    // Validate status transitions
    if (updates.status) {
      const isValidTransition = this.isValidStatusTransition(existing.status, updates.status);
      if (!isValidTransition) {
        console.warn(`Invalid status transition for ${txid}: ${existing.status} -> ${updates.status}`);
        return;
      }
    }

    this.transactions.set(txid, updated);
    console.log(`Updated transaction ${txid}:`, updates);
  }

  removeTransaction(txid: string): void {
    const removed = this.transactions.delete(txid);
    if (removed) {
      console.log(`Stopped tracking transaction: ${txid}`);
    }
  }

  getAllPendingTransactions(): TransactionStatus[] {
    return Array.from(this.transactions.values()).filter(tx => tx.status === 'pending');
  }

  cleanupOldTransactions(maxAge: number = this.DEFAULT_MAX_AGE): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [txid, tx] of this.transactions.entries()) {
      const age = now - tx.timestamp;
      
      // Clean up old confirmed/failed transactions
      if (age > maxAge && (tx.status === 'confirmed' || tx.status === 'failed')) {
        this.transactions.delete(txid);
        cleanedCount++;
      }
      
      // Clean up very old pending transactions (assume failed)
      else if (age > maxAge * 2 && tx.status === 'pending') {
        this.updateTransactionStatus(txid, {
          status: 'failed',
          errorMessage: 'Transaction timeout - no confirmation received',
        });
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old transactions`);
    }
  }

  private isValidStatusTransition(from: string, to: string): boolean {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'failed'],
      confirmed: [], // Final state
      failed: ['pending'], // Allow retry
      unknown: ['pending', 'confirmed', 'failed'],
    };

    return validTransitions[from]?.includes(to) || false;
  }

  // Get statistics about tracked transactions
  getStats() {
    const stats = {
      total: this.transactions.size,
      pending: 0,
      confirmed: 0,
      failed: 0,
      unknown: 0,
    };

    for (const tx of this.transactions.values()) {
      stats[tx.status]++;
    }

    return stats;
  }

  // Export transactions for debugging
  exportTransactions(): TransactionStatus[] {
    return Array.from(this.transactions.values());
  }
}

// Singleton instance
export const transactionTracker: TransactionTracker = new TransactionTrackerImpl();

// Utility functions for common operations
export const trackNewTransaction = (txid: string): void => {
  try {
    transactionTracker.addTransaction(txid);
  } catch (error) {
    console.error('Failed to track transaction:', error);
  }
};

export const markTransactionConfirmed = (txid: string, confirmations: number = 1): void => {
  transactionTracker.updateTransactionStatus(txid, {
    status: 'confirmed',
    confirmations,
  });
};

export const markTransactionFailed = (txid: string, errorMessage?: string): void => {
  transactionTracker.updateTransactionStatus(txid, {
    status: 'failed',
    errorMessage,
  });
};

export const getPendingTransactionCount = (): number => {
  return transactionTracker.getAllPendingTransactions().length;
};

// Auto-cleanup utility
export const startTransactionCleanup = (intervalMs: number = 60000): () => void => {
  const intervalId = setInterval(() => {
    transactionTracker.cleanupOldTransactions();
  }, intervalMs);

  return () => clearInterval(intervalId);
};