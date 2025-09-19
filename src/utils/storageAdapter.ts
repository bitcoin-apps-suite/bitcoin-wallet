export const isExtensionEnvironment = (): boolean => {
  return typeof chrome !== 'undefined' && 
         chrome.storage && 
         chrome.storage.local &&
         typeof chrome.storage.local.get === 'function';
};

class LocalStorageAdapter {
  private prefix = 'bitcoin_wallet_';

  async get(keys: string | string[] | null): Promise<any> {
    const result: any = {};
    
    if (keys === null) {
      // Get all items with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '');
          const value = localStorage.getItem(key);
          try {
            result[cleanKey] = value ? JSON.parse(value) : null;
          } catch {
            result[cleanKey] = value;
          }
        }
      }
    } else {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      keyArray.forEach(key => {
        const value = localStorage.getItem(this.prefix + key);
        try {
          result[key] = value ? JSON.parse(value) : undefined;
        } catch {
          result[key] = value;
        }
      });
    }
    
    return result;
  }

  async set(items: { [key: string]: any }): Promise<void> {
    Object.entries(items).forEach(([key, value]) => {
      localStorage.setItem(
        this.prefix + key,
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    });
  }

  async remove(keys: string | string[]): Promise<void> {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    keyArray.forEach(key => {
      localStorage.removeItem(this.prefix + key);
    });
  }

  async clear(): Promise<void> {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export const storageAdapter = isExtensionEnvironment() 
  ? {
      get: (keys: string | string[] | null) => {
        return new Promise((resolve, reject) => {
          chrome.storage.local.get(keys, (result: any) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
      },
      set: (items: any) => {
        return new Promise<void>((resolve, reject) => {
          chrome.storage.local.set(items, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      },
      remove: (keys: string | string[]) => {
        return new Promise<void>((resolve, reject) => {
          chrome.storage.local.remove(keys, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      },
      clear: () => {
        return new Promise<void>((resolve, reject) => {
          chrome.storage.local.clear(() => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      }
    }
  : new LocalStorageAdapter();