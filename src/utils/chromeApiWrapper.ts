// Wrapper for Chrome APIs that handles both extension and web environments

export const chromeApiAvailable = () => {
  return typeof chrome !== 'undefined' && 
         chrome.runtime && 
         chrome.storage && 
         chrome.windows;
};

export const safeChrome = {
  runtime: {
    onMessage: {
      addListener: (callback: any) => {
        if (chromeApiAvailable() && chrome.runtime?.onMessage) {
          chrome.runtime.onMessage.addListener(callback);
        }
      }
    },
    getURL: (path: string) => {
      if (chromeApiAvailable() && chrome.runtime?.getURL) {
        return chrome.runtime.getURL(path);
      }
      return path;
    },
    lastError: chromeApiAvailable() ? chrome.runtime?.lastError : null
  },
  windows: {
    create: (options: any, callback?: any) => {
      if (chromeApiAvailable() && chrome.windows?.create) {
        chrome.windows.create(options, callback);
      }
    },
    onRemoved: {
      addListener: (callback: any) => {
        if (chromeApiAvailable() && chrome.windows?.onRemoved) {
          chrome.windows.onRemoved.addListener(callback);
        }
      }
    }
  },
  tabs: {
    query: (options: any, callback: any) => {
      if (chromeApiAvailable() && chrome.tabs?.query) {
        chrome.tabs.query(options, callback);
      } else {
        callback([]);
      }
    },
    sendMessage: (tabId: number, message: any, callback?: any) => {
      if (chromeApiAvailable() && chrome.tabs?.sendMessage) {
        chrome.tabs.sendMessage(tabId, message, callback);
      }
    }
  },
  storage: {
    local: {
      get: chromeApiAvailable() && chrome.storage?.local?.get ? chrome.storage.local.get.bind(chrome.storage.local) : () => {},
      set: chromeApiAvailable() && chrome.storage?.local?.set ? chrome.storage.local.set.bind(chrome.storage.local) : () => {},
      remove: chromeApiAvailable() && chrome.storage?.local?.remove ? chrome.storage.local.remove.bind(chrome.storage.local) : () => {},
      clear: chromeApiAvailable() && chrome.storage?.local?.clear ? chrome.storage.local.clear.bind(chrome.storage.local) : () => {}
    }
  }
};