import React from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { FileAsset } from '../types/FileAsset.types';
import { formatUSD } from '../utils/format';

const Card = styled.div<WhiteLabelTheme & { isClickable?: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.color.global.row};
  border: 1px solid ${({ theme }) => theme.color.global.gray}20;
  border-radius: 0.75rem;
  cursor: ${({ isClickable }) => isClickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  
  &:hover {
    ${({ isClickable, theme }) => isClickable && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${theme.color.global.gray}40;
      border-color: ${theme.color.global.contrast}40;
    `}
  }
`;

const IconContainer = styled.div<{ type: 'ft' | 'nft' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  margin-right: 1rem;
  font-size: 1.5rem;
  background: ${({ type }) => 
    type === 'ft' 
      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'  // Gold for FT
      : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}; // Purple for NFT
`;

const InfoContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const FileNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const FileName = styled.span<WhiteLabelTheme>`
  font-weight: 600;
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileExtension = styled.span<{ type: 'ft' | 'nft' }>`
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
  background: ${({ type }) => 
    type === 'ft' ? '#fbbf24' : '#8b5cf6'};
  color: white;
`;

const MetaRow = styled.div<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.global.gray};
`;

const AmountDisplay = styled.span<WhiteLabelTheme>`
  font-weight: 500;
  color: ${({ theme }) => theme.color.global.contrast};
`;

const ValueDisplay = styled.span<WhiteLabelTheme>`
  font-weight: 500;
  color: #10b981;
`;

const StatusBadge = styled.div<{ status: 'confirmed' | 'pending' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  
  ${({ status }) => status === 'confirmed' 
    ? `
      background: #10b98120;
      color: #10b981;
    `
    : `
      background: #f59e0b20;
      color: #f59e0b;
    `
  }
`;

const StatusDot = styled.div<{ status: 'confirmed' | 'pending' }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ status }) => 
    status === 'confirmed' ? '#10b981' : '#f59e0b'};
`;

interface FileAssetCardProps {
  fileAsset: FileAsset;
  theme: WhiteLabelTheme;
  onClick?: (fileAsset: FileAsset) => void;
  showValue?: boolean;
}

export const FileAssetCard: React.FC<FileAssetCardProps> = ({
  fileAsset,
  theme,
  onClick,
  showValue = true
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(fileAsset);
    }
  };

  const getStatusText = () => {
    if (fileAsset.pending) return 'pending';
    return fileAsset.confirmed ? 'confirmed' : 'unconfirmed';
  };

  const formatAmount = () => {
    if (fileAsset.type === 'nft') return '1 NFT';
    
    const amount = fileAsset.displayAmount || 0;
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <Card 
      theme={theme} 
      onClick={handleClick}
      isClickable={Boolean(onClick)}
    >
      <IconContainer type={fileAsset.type}>
        {fileAsset.icon}
      </IconContainer>
      
      <InfoContainer>
        <FileNameRow>
          <FileName theme={theme}>
            {fileAsset.filename}
          </FileName>
          <FileExtension type={fileAsset.type}>
            .{fileAsset.type}
          </FileExtension>
        </FileNameRow>
        
        <MetaRow theme={theme}>
          <AmountDisplay theme={theme}>
            {formatAmount()}
          </AmountDisplay>
          
          {showValue && fileAsset.value && (
            <ValueDisplay theme={theme}>
              {formatUSD(fileAsset.value)}
            </ValueDisplay>
          )}
          
          {fileAsset.metadata?.collection && (
            <span>
              📁 {fileAsset.metadata.collection}
            </span>
          )}
          
          <StatusBadge status={getStatusText() as 'confirmed' | 'pending'}>
            <StatusDot status={getStatusText() as 'confirmed' | 'pending'} />
            {getStatusText()}
          </StatusBadge>
        </MetaRow>
      </InfoContainer>
    </Card>
  );
};