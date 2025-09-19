import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Text } from '../../components/Reusable';
import { Show } from '../../components/Show';
import { useBottomMenu } from '../../hooks/useBottomMenu';
import { useTheme } from '../../hooks/useTheme';
import { WhiteLabelTheme } from '../../theme.types';
import { handCashAuthService } from '../../services/HandCashAuth.service';
import { PageLoader } from '../../components/PageLoader';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2rem;
`;

const TitleText = styled.h1<WhiteLabelTheme>`
  font-size: 1.75rem;
  color: ${({ theme }) => theme.color.global.contrast};
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-weight: 700;
  margin: 1rem 0;
  text-align: center;
`;

const SubtitleText = styled(Text)<WhiteLabelTheme>`
  font-size: 1rem;
  color: ${({ theme }) => theme.color.global.gray};
  text-align: center;
  margin-bottom: 2rem;
  max-width: 20rem;
`;

const HandCashLogo = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #00D54B 0%, #00AB3A 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 213, 75, 0.2);
  
  &::after {
    content: 'H';
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
    font-family: 'Inter', Arial, Helvetica, sans-serif;
  }
`;

const ProfileContainer = styled.div<WhiteLabelTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.color.global.row};
  width: 100%;
  max-width: 20rem;
  margin-bottom: 1.5rem;
`;

const ProfileAvatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 0.5rem;
`;

const ProfileName = styled.div<WhiteLabelTheme>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.global.contrast};
  margin-bottom: 0.25rem;
`;

const ProfileHandle = styled.div<WhiteLabelTheme>`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.color.global.gray};
`;

export const HandCashSignIn = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { hideMenu, showMenu } = useBottomMenu();

  useEffect(() => {
    hideMenu();
    checkExistingAuth();

    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        setLoading(true);
        try {
          const authResponse = await handCashAuthService.handleOAuthCallback(code);
          if (authResponse) {
            setProfile(authResponse.profile.publicProfile);
            setTimeout(() => {
              navigate('/bsv-wallet');
            }, 2000);
          } else {
            setError('Failed to authenticate with HandCash');
            setLoading(false);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to authenticate with HandCash');
          setLoading(false);
        }
      }
    };

    handleAuthCallback();

    return () => {
      showMenu();
    };
  }, [hideMenu, showMenu, navigate]);

  const checkExistingAuth = async () => {
    if (handCashAuthService.isAuthenticated()) {
      setLoading(true);
      const profile = handCashAuthService.getProfile();
      if (profile) {
        setProfile(profile.publicProfile);
        setTimeout(() => {
          navigate('/bsv-wallet');
        }, 1500);
      } else {
        setLoading(false);
      }
    }
  };

  const handleHandCashSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For development, use mock authentication
      if (window.location.hostname === 'localhost') {
        const authResponse = await handCashAuthService.mockAuthenticate();
        setProfile(authResponse.profile.publicProfile);
        setTimeout(() => {
          navigate('/bsv-wallet');
        }, 2000);
      } else {
        // For production, use real OAuth
        const oauthUrl = handCashAuthService.getOAuthUrl();
        window.location.href = oauthUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to HandCash');
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    handCashAuthService.clearAuth();
    setProfile(null);
  };

  if (loading && !profile) {
    return <PageLoader theme={theme} message="Connecting to HandCash..." />;
  }

  return (
    <Content>
      <HandCashLogo />
      
      <TitleText theme={theme}>
        {profile ? 'Connected!' : 'Sign in with HandCash'}
      </TitleText>
      
      <Show when={!profile}>
        <SubtitleText theme={theme}>
          Use your existing HandCash wallet to sign into Bitcoin Wallet and access all your BSV features.
        </SubtitleText>
        
        <Button
          theme={theme}
          type="primary"
          label="Connect HandCash Wallet"
          onClick={handleHandCashSignIn}
          disabled={loading}
          style={{ 
            background: 'linear-gradient(135deg, #00D54B 0%, #00AB3A 100%)',
            border: 'none',
            minWidth: '15rem'
          }}
        />
        
        <Button
          theme={theme}
          type="secondary-outline"
          label="Back"
          onClick={() => navigate('/start')}
          style={{ marginTop: '1rem' }}
        />
      </Show>

      <Show when={!!profile}>
        <ProfileContainer theme={theme}>
          {profile?.avatarUrl && (
            <ProfileAvatar src={profile.avatarUrl} alt={profile?.displayName || ''} />
          )}
          <ProfileName theme={theme}>{profile?.displayName || 'Unknown'}</ProfileName>
          <ProfileHandle theme={theme}>@{profile?.handle || 'unknown'}</ProfileHandle>
        </ProfileContainer>
        
        <Text theme={theme} style={{ marginBottom: '1rem' }}>
          Successfully connected! Redirecting to wallet...
        </Text>
        
        <Button
          theme={theme}
          type="secondary-outline"
          label="Disconnect"
          onClick={handleDisconnect}
        />
      </Show>

      <Show when={!!error}>
        <Text theme={theme} style={{ color: theme.color.component.snackbarError, marginTop: '1rem' }}>
          {error}
        </Text>
      </Show>
    </Content>
  );
};