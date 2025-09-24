import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaBitcoin, 
  FaImage, 
  FaMusic, 
  FaGamepad, 
  FaFileAlt,
  FaKey,
  FaPalette,
  FaVideo,
  FaBook,
  FaCertificate
} from 'react-icons/fa';

const TabsContainer = styled.div`
  display: flex;
  width: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 0.5rem 1rem;
  gap: 0.5rem;
  overflow-x: auto;
  border-bottom: 2px solid #f7931a;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #f7931a;
    border-radius: 3px;
  }
`;

const Tab = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #f7931a 0%, #ff9500 100%)' 
    : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${props => props.active ? '#f7931a' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: fit-content;

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #f7931a 0%, #ff9500 100%)' 
      : 'rgba(247, 147, 26, 0.2)'};
    color: #fff;
    border-color: #f7931a;
    transform: translateY(-2px);
  }

  svg {
    font-size: 1rem;
  }
`;

const SceneContainer = styled.div`
  width: 100%;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const AssetCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(247, 147, 26, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(247, 147, 26, 0.1);
    border-color: #f7931a;
    transform: translateY(-5px);
  }
`;

const AssetIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
`;

const AssetName = styled.h4`
  color: #f7931a;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
`;

const AssetValue = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface WalletShowcaseTabsProps {
  onTabChange?: (tabId: string) => void;
}

export const WalletShowcaseTabs: React.FC<WalletShowcaseTabsProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('bitcoin');

  const tabs: TabItem[] = [
    { id: 'bitcoin', label: 'Bitcoin', icon: <FaBitcoin /> },
    { id: 'nfts', label: 'NFT Art', icon: <FaImage /> },
    { id: 'music', label: 'Music', icon: <FaMusic /> },
    { id: 'gaming', label: 'Gaming', icon: <FaGamepad /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt /> },
    { id: 'tokens', label: 'Tokens', icon: <FaKey /> },
    { id: 'collectibles', label: 'Collectibles', icon: <FaPalette /> },
    { id: 'videos', label: 'Videos', icon: <FaVideo /> },
    { id: 'ebooks', label: 'E-Books', icon: <FaBook /> },
    { id: 'certificates', label: 'Certificates', icon: <FaCertificate /> },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const renderScene = () => {
    switch (activeTab) {
      case 'bitcoin':
        return null; // Bitcoin tab shows the regular wallet view

      case 'nfts':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>🎨</AssetIcon>
              <AssetName>Digital Mona</AssetName>
              <AssetValue>#00234 / 10000</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🖼️</AssetIcon>
              <AssetName>Pixel Punks</AssetName>
              <AssetValue>Rare Edition</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🌅</AssetIcon>
              <AssetName>Sunset Dreams</AssetName>
              <AssetValue>1 of 1</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🏛️</AssetIcon>
              <AssetName>Ancient Ruins</AssetName>
              <AssetValue>Genesis Collection</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🌌</AssetIcon>
              <AssetName>Cosmic Art</AssetName>
              <AssetValue>Limited #42</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🦋</AssetIcon>
              <AssetName>Metamorphosis</AssetName>
              <AssetValue>Ultra Rare</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      case 'music':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>🎵</AssetIcon>
              <AssetName>Summer Vibes</AssetName>
              <AssetValue>Album - 12 Tracks</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎸</AssetIcon>
              <AssetName>Rock Legends</AssetName>
              <AssetValue>Concert Pass NFT</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎹</AssetIcon>
              <AssetName>Classical Mix</AssetName>
              <AssetValue>Exclusive Track</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎤</AssetIcon>
              <AssetName>Backstage Pass</AssetName>
              <AssetValue>VIP Access</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎧</AssetIcon>
              <AssetName>DJ Set 2024</AssetName>
              <AssetValue>Live Recording</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎺</AssetIcon>
              <AssetName>Jazz Sessions</AssetName>
              <AssetValue>Limited Release</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      case 'gaming':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>⚔️</AssetIcon>
              <AssetName>Dragon Sword</AssetName>
              <AssetValue>Legendary</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🛡️</AssetIcon>
              <AssetName>Knight Armor</AssetName>
              <AssetValue>Epic Set</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🏆</AssetIcon>
              <AssetName>Champion Badge</AssetName>
              <AssetValue>Season 2024</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎮</AssetIcon>
              <AssetName>Game Pass</AssetName>
              <AssetValue>Premium Access</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>👾</AssetIcon>
              <AssetName>Alien Pet</AssetName>
              <AssetValue>Companion NFT</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🏰</AssetIcon>
              <AssetName>Castle Deed</AssetName>
              <AssetValue>Virtual Property</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      case 'documents':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>📄</AssetIcon>
              <AssetName>Smart Contract</AssetName>
              <AssetValue>Executed</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📋</AssetIcon>
              <AssetName>Property Deed</AssetName>
              <AssetValue>Verified</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📑</AssetIcon>
              <AssetName>Legal Agreement</AssetName>
              <AssetValue>Notarized</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📊</AssetIcon>
              <AssetName>Financial Report</AssetName>
              <AssetValue>Q4 2024</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🔖</AssetIcon>
              <AssetName>Patent Filing</AssetName>
              <AssetValue>Pending</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📝</AssetIcon>
              <AssetName>Will & Testament</AssetName>
              <AssetValue>Sealed</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      case 'tokens':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>🪙</AssetIcon>
              <AssetName>SHUA</AssetName>
              <AssetValue>1,000,000</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>💎</AssetIcon>
              <AssetName>DOGE BSV</AssetName>
              <AssetValue>50,000</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🌟</AssetIcon>
              <AssetName>Reward Points</AssetName>
              <AssetValue>10,000 PTS</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🔥</AssetIcon>
              <AssetName>BURN Token</AssetName>
              <AssetValue>777,777</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🚀</AssetIcon>
              <AssetName>MOON Coin</AssetName>
              <AssetValue>100,000</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>⚡</AssetIcon>
              <AssetName>Lightning</AssetName>
              <AssetValue>25,000 LTG</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      case 'collectibles':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>🃏</AssetIcon>
              <AssetName>Crypto Cards</AssetName>
              <AssetValue>Gold Series</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🏅</AssetIcon>
              <AssetName>Olympic NFT</AssetName>
              <AssetValue>2024 Edition</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>💠</AssetIcon>
              <AssetName>Crystal Collection</AssetName>
              <AssetValue>Ultra Rare</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎭</AssetIcon>
              <AssetName>Theater Masks</AssetName>
              <AssetValue>Classic Set</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🏺</AssetIcon>
              <AssetName>Ancient Vase</AssetName>
              <AssetValue>Museum NFT</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎲</AssetIcon>
              <AssetName>Lucky Dice</AssetName>
              <AssetValue>Golden Roll</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      case 'videos':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>🎬</AssetIcon>
              <AssetName>Indie Film</AssetName>
              <AssetValue>Director's Cut</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📹</AssetIcon>
              <AssetName>Documentary</AssetName>
              <AssetValue>4K Edition</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎥</AssetIcon>
              <AssetName>Tutorial Series</AssetName>
              <AssetValue>Full Course</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎞️</AssetIcon>
              <AssetName>Classic Movie</AssetName>
              <AssetValue>Remastered</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📺</AssetIcon>
              <AssetName>TV Series</AssetName>
              <AssetValue>Season Pass</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🎦</AssetIcon>
              <AssetName>Film Festival</AssetName>
              <AssetValue>Winner 2024</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      case 'ebooks':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>📚</AssetIcon>
              <AssetName>Bitcoin Guide</AssetName>
              <AssetValue>First Edition</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📖</AssetIcon>
              <AssetName>Sci-Fi Novel</AssetName>
              <AssetValue>Signed Copy</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📰</AssetIcon>
              <AssetName>Tech Magazine</AssetName>
              <AssetValue>Annual Pass</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📔</AssetIcon>
              <AssetName>Poetry Collection</AssetName>
              <AssetValue>Limited Print</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📕</AssetIcon>
              <AssetName>History Book</AssetName>
              <AssetValue>Illustrated</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📗</AssetIcon>
              <AssetName>Cookbook</AssetName>
              <AssetValue>Chef's Special</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      case 'certificates':
        return (
          <SceneContainer>
            <AssetCard>
              <AssetIcon>🎓</AssetIcon>
              <AssetName>BSV Developer</AssetName>
              <AssetValue>Certified 2024</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🏆</AssetIcon>
              <AssetName>Blockchain Expert</AssetName>
              <AssetValue>Level 3</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>📜</AssetIcon>
              <AssetName>Smart Contract Pro</AssetName>
              <AssetValue>Advanced</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🥇</AssetIcon>
              <AssetName>Gold Standard</AssetName>
              <AssetValue>Achievement</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>🔐</AssetIcon>
              <AssetName>Security Expert</AssetName>
              <AssetValue>Verified</AssetValue>
            </AssetCard>
            <AssetCard>
              <AssetIcon>⭐</AssetIcon>
              <AssetName>5-Star Rating</AssetName>
              <AssetValue>Professional</AssetValue>
            </AssetCard>
          </SceneContainer>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <TabsContainer>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>
      {renderScene()}
    </>
  );
};