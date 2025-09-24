import { PublicKey } from '@bsv/sdk';

export interface PaymailValidationResult {
  isValid: boolean;
  error?: string;
  publicKey?: PublicKey;
  capabilities?: string[];
}

export const validatePaymailFormat = (paymail: string): boolean => {
  const paymailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return paymailRegex.test(paymail);
};

export const validatePaymail = async (paymail: string): Promise<PaymailValidationResult> => {
  try {
    // Basic format validation
    if (!validatePaymailFormat(paymail)) {
      return {
        isValid: false,
        error: 'Invalid paymail format. Must be in format: alias@domain.tld',
      };
    }

    // Check if paymail domain supports the protocol
    const [alias, domain] = paymail.split('@');
    
    if (!alias || !domain) {
      return {
        isValid: false,
        error: 'Invalid paymail format',
      };
    }

    try {
      // For now, we'll do a basic DNS check to see if the domain exists
      const response = await fetch(`https://${domain}/.well-known/bsvalias`, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (response.ok) {
        const capabilities = await response.json();
        return {
          isValid: true,
          capabilities: capabilities.capabilities || [],
        };
      } else {
        return {
          isValid: false,
          error: 'Domain does not support paymail protocol',
        };
      }
    } catch (error) {
      console.warn('Paymail validation failed:', error);
      return {
        isValid: false,
        error: 'Unable to validate paymail address. Domain may not support paymail protocol.',
      };
    }
  } catch (error) {
    console.error('Paymail validation error:', error);
    return {
      isValid: false,
      error: 'Failed to validate paymail address',
    };
  }
};

export const isPaymail = (address: string): boolean => {
  return validatePaymailFormat(address);
};

export const getPaymailDisplayName = (paymail: string): string => {
  if (!validatePaymailFormat(paymail)) {
    return paymail;
  }
  
  const [alias] = paymail.split('@');
  return alias || paymail;
};

export const formatPaymailForDisplay = (paymail: string, maxLength = 20): string => {
  if (!validatePaymailFormat(paymail)) {
    return paymail;
  }
  
  if (paymail.length <= maxLength) {
    return paymail;
  }
  
  const [alias, domain] = paymail.split('@');
  const availableLength = maxLength - domain.length - 1; // -1 for @
  
  if (availableLength > 3) {
    return `${alias.substring(0, availableLength - 3)}...@${domain}`;
  }
  
  return paymail.substring(0, maxLength - 3) + '...';
};