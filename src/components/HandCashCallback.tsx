import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { handCashAuthService } from '../services/HandCashAuth.service';
import { PageLoader } from './PageLoader';
import { useTheme } from '../hooks/useTheme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const StatusMessage = styled.div`
  color: white;
  font-size: 1.25rem;
  margin-top: 2rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid #ef4444;
  border-radius: 0.5rem;
  padding: 1rem;
  color: white;
  margin-top: 2rem;
  max-width: 400px;
`;

export const HandCashCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(error === 'access_denied' 
          ? 'You denied access to HandCash. Please try again.'
          : `HandCash error: ${error}`);
        
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received from HandCash.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        const result = await handCashAuthService.handleOAuthCallback(code);
        
        if (result) {
          setStatus('success');
          // Store the HandCash auth state globally
          window.dispatchEvent(new CustomEvent('handcash-authenticated', { 
            detail: result.profile 
          }));
          
          setTimeout(() => navigate('/'), 1500);
        } else {
          throw new Error('Failed to authenticate with HandCash');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <Container>
      {status === 'processing' && (
        <>
          <PageLoader theme={theme} message="Connecting to HandCash..." />
          <StatusMessage>Please wait while we authenticate your HandCash account...</StatusMessage>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div style={{ fontSize: '4rem' }}>✅</div>
          <StatusMessage>
            Successfully connected to HandCash!<br />
            Redirecting to your wallet...
          </StatusMessage>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div style={{ fontSize: '4rem' }}>❌</div>
          <ErrorMessage>
            {errorMessage}<br />
            <small>Redirecting back to wallet...</small>
          </ErrorMessage>
        </>
      )}
    </Container>
  );
};