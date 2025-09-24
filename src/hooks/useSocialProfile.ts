import { useEffect, useState } from 'react';
import { SocialProfile } from 'yours-wallet-provider';
import { ChromeStorageService } from '../services/ChromeStorage.service';
import { ChromeStorageObject } from '../services/types/chromeStorage.types';
import { HOSTED_YOURS_IMAGE } from '../utils/constants';

export const useSocialProfile = (chromeStorageService: ChromeStorageService) => {
  const [socialProfile, setSocialProfile] = useState<SocialProfile>({
    displayName: 'Anonymous',
    avatar: HOSTED_YOURS_IMAGE,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSocialProfile = async (): Promise<SocialProfile> => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!chromeStorageService) {
          // Return default profile when running outside extension environment
          return socialProfile;
        }
        
        const { account } = chromeStorageService.getCurrentAccountObject();
        const profile = account?.settings?.socialProfile;
        
        if (!profile) {
          return socialProfile;
        }
        
        setSocialProfile(profile);
        return profile;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load social profile';
        setError(errorMessage);
        console.error('Error loading social profile:', err);
        return socialProfile;
      } finally {
        setIsLoading(false);
      }
    };

    getSocialProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromeStorageService]);

  const storeSocialProfile = async (profile: SocialProfile) => {
    try {
      setError(null);
      
      // Validate profile data
      if (!profile.displayName?.trim()) {
        throw new Error('Display name is required');
      }
      
      if (profile.displayName.length > 50) {
        throw new Error('Display name must be 50 characters or less');
      }
      
      if (profile.avatar && !profile.avatar.startsWith('http')) {
        throw new Error('Avatar must be a valid URL');
      }
      
      if (!chromeStorageService) {
        // Just update state when running outside extension environment
        setSocialProfile(profile);
        return;
      }
      
      const { account } = chromeStorageService.getCurrentAccountObject();
      if (!account) {
        throw new Error('No account found. Please ensure you are logged in.');
      }
      
      const accountSettings = account.settings;
      const key: keyof ChromeStorageObject = 'accounts';
      const update: Partial<ChromeStorageObject['accounts']> = {
        [account.addresses.identityAddress]: {
          ...account,
          settings: {
            ...accountSettings,
            socialProfile: {
              displayName: profile.displayName.trim(),
              avatar: profile.avatar || HOSTED_YOURS_IMAGE,
            },
          },
        },
      };
      
      await chromeStorageService.updateNested(key, update);
      setSocialProfile({
        displayName: profile.displayName.trim(),
        avatar: profile.avatar || HOSTED_YOURS_IMAGE,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save social profile';
      setError(errorMessage);
      console.error('Error saving social profile:', err);
      throw err;
    }
  };

  return {
    socialProfile,
    storeSocialProfile,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
