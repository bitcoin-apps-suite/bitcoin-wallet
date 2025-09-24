export interface NotificationOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  icon?: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface NotificationSystem {
  show: (options: NotificationOptions) => string;
  hide: (id: string) => void;
  clear: () => void;
  count: () => number;
}

class NotificationManager implements NotificationSystem {
  private notifications: Map<string, NotificationOptions & { id: string; timestamp: number }> = new Map();
  private listeners: Set<(notifications: (NotificationOptions & { id: string })[]) => void> = new Set();
  private counter = 0;

  show(options: NotificationOptions): string {
    const id = `notification_${++this.counter}_${Date.now()}`;
    const notification = {
      ...options,
      id,
      timestamp: Date.now(),
      duration: options.duration || this.getDefaultDuration(options.type),
    };

    this.notifications.set(id, notification);
    this.notifyListeners();

    // Auto-remove notification after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, notification.duration);
    }

    // Browser notification for important messages
    if (options.type === 'error' || options.type === 'warning') {
      this.showBrowserNotification(options);
    }

    return id;
  }

  hide(id: string): void {
    if (this.notifications.delete(id)) {
      this.notifyListeners();
    }
  }

  clear(): void {
    this.notifications.clear();
    this.notifyListeners();
  }

  count(): number {
    return this.notifications.size;
  }

  subscribe(listener: (notifications: (NotificationOptions & { id: string })[]) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current state
    listener(this.getAll());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  getAll(): (NotificationOptions & { id: string })[] {
    return Array.from(this.notifications.values()).map(({ timestamp, ...notification }) => notification);
  }

  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(listener => {
      try {
        listener(notifications);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  private getDefaultDuration(type: string): number {
    switch (type) {
      case 'success':
        return 3000;
      case 'info':
        return 4000;
      case 'warning':
        return 6000;
      case 'error':
        return 8000;
      default:
        return 4000;
    }
  }

  private async showBrowserNotification(options: NotificationOptions): Promise<void> {
    try {
      // Check if browser notifications are supported
      if (!('Notification' in window)) {
        return;
      }

      // Check permission
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const notification = new Notification(options.title, {
          body: options.message,
          icon: options.icon || '/icon-192x192.png',
          tag: `bitcoin-wallet-${options.type}`,
          requireInteraction: options.type === 'error',
        });

        // Auto-close after a delay
        setTimeout(() => {
          notification.close();
        }, this.getDefaultDuration(options.type));

        // Handle click
        notification.onclick = () => {
          window.focus();
          notification.close();
          options.action?.callback();
        };
      }
    } catch (error) {
      console.warn('Browser notification failed:', error);
    }
  }

  // Cleanup old notifications
  cleanup(maxAge: number = 60000): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (now - notification.timestamp > maxAge) {
        this.notifications.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.notifyListeners();
    }
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();

// Convenience functions
export const showSuccessNotification = (title: string, message: string, duration?: number): string => {
  return notificationManager.show({ title, message, type: 'success', duration });
};

export const showErrorNotification = (title: string, message: string, duration?: number): string => {
  return notificationManager.show({ title, message, type: 'error', duration });
};

export const showWarningNotification = (title: string, message: string, duration?: number): string => {
  return notificationManager.show({ title, message, type: 'warning', duration });
};

export const showInfoNotification = (title: string, message: string, duration?: number): string => {
  return notificationManager.show({ title, message, type: 'info', duration });
};

// Transaction-specific notifications
export const showTransactionNotification = (
  type: 'sent' | 'received' | 'failed',
  amount: string,
  txid?: string
): string => {
  const messages = {
    sent: {
      title: 'Transaction Sent',
      message: `Successfully sent ${amount} BSV`,
      type: 'success' as const,
    },
    received: {
      title: 'Payment Received',
      message: `Received ${amount} BSV`,
      type: 'success' as const,
    },
    failed: {
      title: 'Transaction Failed',
      message: `Failed to send ${amount} BSV`,
      type: 'error' as const,
    },
  };

  const config = messages[type];
  return notificationManager.show({
    ...config,
    action: txid ? {
      label: 'View Transaction',
      callback: () => {
        window.open(`https://whatsonchain.com/tx/${txid}`, '_blank');
      },
    } : undefined,
  });
};

// Auto-cleanup notifications
setInterval(() => {
  notificationManager.cleanup();
}, 30000); // Every 30 seconds