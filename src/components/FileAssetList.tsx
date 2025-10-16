import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { FileAsset, FileAssetType } from '../types/FileAsset.types';
import { FileAssetCard } from './FileAssetCard';

const Container = styled.div<WhiteLabelTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h3<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 1.25rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterTab = styled.button<WhiteLabelTheme & { active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.color.global.gray}40;
  border-radius: 0.5rem;
  background: ${({ active, theme }) => 
    active 
      ? theme.color.global.contrast
      : theme.color.global.row};
  color: ${({ active, theme }) => 
    active 
      ? theme.color.global.walletBackground
      : theme.color.global.contrast};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.color.global.contrast}60;
  }
`;

const SearchInput = styled.input<WhiteLabelTheme>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.color.global.gray}40;
  border-radius: 0.5rem;
  background: ${({ theme }) => theme.color.global.row};
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 0.875rem;
  min-width: 200px;
  
  &::placeholder {
    color: ${({ theme }) => theme.color.global.gray};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.global.contrast}60;
  }
`;

const AssetGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const EmptyState = styled.div<WhiteLabelTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: ${({ theme }) => theme.color.global.gray};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  margin: 0;
`;

const SummaryBar = styled.div<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SummaryItem = styled.div<WhiteLabelTheme>`
  display: flex;
  flex-direction: column;
  
  .label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.color.global.gray};
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${({ theme }) => theme.color.global.contrast};
  }
`;

type FilterType = 'all' | 'ft' | 'nft' | 'confirmed' | 'pending';

interface FileAssetListProps {
  fileAssets: FileAsset[];
  theme: WhiteLabelTheme;
  onAssetClick?: (fileAsset: FileAsset) => void;
  showSummary?: boolean;
  title?: string;
}

export const FileAssetList: React.FC<FileAssetListProps> = ({
  fileAssets,
  theme,
  onAssetClick,
  showSummary = true,
  title = "File Assets"
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = useMemo(() => {
    let filtered = fileAssets;

    // Apply type filter
    if (activeFilter === 'ft') {
      filtered = filtered.filter(asset => asset.type === 'ft');
    } else if (activeFilter === 'nft') {
      filtered = filtered.filter(asset => asset.type === 'nft');
    } else if (activeFilter === 'confirmed') {
      filtered = filtered.filter(asset => asset.confirmed);
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter(asset => asset.pending);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.filename.toLowerCase().includes(query) ||
        asset.ticker?.toLowerCase().includes(query) ||
        asset.metadata?.name?.toLowerCase().includes(query) ||
        asset.metadata?.collection?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [fileAssets, activeFilter, searchQuery]);

  const summary = useMemo(() => {
    const total = fileAssets.length;
    const ftCount = fileAssets.filter(a => a.type === 'ft').length;
    const nftCount = fileAssets.filter(a => a.type === 'nft').length;
    const totalValue = fileAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const confirmedCount = fileAssets.filter(a => a.confirmed).length;
    const pendingCount = fileAssets.filter(a => a.pending).length;

    return {
      total,
      ftCount,
      nftCount,
      totalValue,
      confirmedCount,
      pendingCount
    };
  }, [fileAssets]);

  const filterOptions: { type: FilterType; label: string; count?: number }[] = [
    { type: 'all', label: 'All', count: summary.total },
    { type: 'ft', label: 'Tokens', count: summary.ftCount },
    { type: 'nft', label: 'NFTs', count: summary.nftCount },
    { type: 'confirmed', label: 'Confirmed', count: summary.confirmedCount },
    { type: 'pending', label: 'Pending', count: summary.pendingCount }
  ];

  return (
    <Container theme={theme}>
      {showSummary && (
        <SummaryBar theme={theme}>
          <SummaryItem theme={theme}>
            <div className="label">Total Assets</div>
            <div className="value">{summary.total}</div>
          </SummaryItem>
          <SummaryItem theme={theme}>
            <div className="label">Tokens (.ft)</div>
            <div className="value">{summary.ftCount}</div>
          </SummaryItem>
          <SummaryItem theme={theme}>
            <div className="label">NFTs (.nft)</div>
            <div className="value">{summary.nftCount}</div>
          </SummaryItem>
          <SummaryItem theme={theme}>
            <div className="label">Total Value</div>
            <div className="value">${summary.totalValue.toLocaleString()}</div>
          </SummaryItem>
        </SummaryBar>
      )}

      <Header>
        <Title theme={theme}>
          📁 {title}
        </Title>
        
        <Controls>
          <FilterTabs>
            {filterOptions.map(option => (
              <FilterTab
                key={option.type}
                theme={theme}
                active={activeFilter === option.type}
                onClick={() => setActiveFilter(option.type)}
              >
                {option.label} {option.count !== undefined && `(${option.count})`}
              </FilterTab>
            ))}
          </FilterTabs>
          
          <SearchInput
            theme={theme}
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Controls>
      </Header>

      <AssetGrid>
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => (
            <FileAssetCard
              key={asset.id}
              fileAsset={asset}
              theme={theme}
              onClick={onAssetClick}
            />
          ))
        ) : (
          <EmptyState theme={theme}>
            <EmptyIcon>
              {searchQuery ? '🔍' : activeFilter === 'ft' ? '🪙' : activeFilter === 'nft' ? '🎨' : '📁'}
            </EmptyIcon>
            <EmptyText>
              {searchQuery 
                ? `No assets found for "${searchQuery}"`
                : `No ${activeFilter === 'all' ? 'file assets' : activeFilter} found`
              }
            </EmptyText>
          </EmptyState>
        )}
      </AssetGrid>
    </Container>
  );
};