import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { AppHeader } from '../components/AppHeader';
import { FaTrophy, FaMedal, FaStar, FaGithub, FaCode, FaBug, FaBook, FaRocket } from 'react-icons/fa';

const PageContainer = styled.div<{ theme: any }>`
  min-height: 100vh;
  background: ${({ theme }) => theme.color.global.walletBackground};
  color: ${({ theme }) => theme.color.global.contrast};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section<{ theme: any }>`
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #f7931a 0%, #ff6b35 100%);
  border-radius: 16px;
  margin-bottom: 2rem;
  color: white;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const TabContainer = styled.div<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
  display: flex;
  gap: 4px;
`;

const Tab = styled.button<{ theme: any; active: boolean }>`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme, active }) => active ? theme.color.global.walletBackground : 'transparent'};
  color: ${({ theme, active }) => active ? '#f7931a' : theme.color.global.gray};
  cursor: pointer;
  font-weight: ${({ active }) => active ? '600' : '400'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    color: #f7931a;
  }
`;

const LeaderboardTable = styled.table<{ theme: any }>`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const TableHeader = styled.th<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.walletBackground};
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  color: ${({ theme }) => theme.color.global.contrast};
`;

const TableRow = styled.tr<{ theme: any; rank?: number }>`
  border-top: 1px solid ${({ theme }) => theme.color.global.walletBackground};
  background: ${({ rank, theme }) => 
    rank === 1 ? 'rgba(255, 215, 0, 0.1)' : 
    rank === 2 ? 'rgba(192, 192, 192, 0.1)' : 
    rank === 3 ? 'rgba(205, 127, 50, 0.1)' : 
    'transparent'
  };

  &:hover {
    background: ${({ theme }) => theme.color.global.walletBackground};
  }
`;

const TableCell = styled.td<{ theme: any }>`
  padding: 1rem;
  vertical-align: middle;
`;

const RankBadge = styled.div<{ rank: number }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: ${({ rank }) => 
    rank === 1 ? '#FFD700' : 
    rank === 2 ? '#C0C0C0' : 
    rank === 3 ? '#CD7F32' : 
    '#666'
  };
`;

const UserAvatar = styled.div<{ theme: any }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f7931a, #ff6b35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div<{ theme: any }>`
  font-weight: bold;
  color: ${({ theme }) => theme.color.global.contrast};
`;

const UserHandle = styled.div<{ theme: any }>`
  color: ${({ theme }) => theme.color.global.gray};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TokenReward = styled.div`
  color: #f7931a;
  font-weight: bold;
  font-size: 1.1rem;
`;

const TasksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const TaskCard = styled.div<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const TaskTitle = styled.h3`
  margin: 0;
  color: #f7931a;
  flex: 1;
`;

const TaskReward = styled.div`
  background: linear-gradient(45deg, #f7931a, #ff6b35);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: bold;
`;

const TaskDescription = styled.p<{ theme: any }>`
  color: ${({ theme }) => theme.color.global.gray};
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const TaskTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const TaskTag = styled.span<{ theme: any; type: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  background: ${({ type }) => 
    type === 'bug' ? 'rgba(244, 67, 54, 0.1)' : 
    type === 'feature' ? 'rgba(76, 175, 80, 0.1)' : 
    type === 'docs' ? 'rgba(33, 150, 243, 0.1)' : 
    'rgba(156, 39, 176, 0.1)'
  };
  color: ${({ type }) => 
    type === 'bug' ? '#f44336' : 
    type === 'feature' ? '#4CAF50' : 
    type === 'docs' ? '#2196F3' : 
    '#9C27B0'
  };
`;

const TaskAction = styled.button<{ theme: any }>`
  background: linear-gradient(to right, ${({ theme }) => theme.color.component.primaryButtonLeftGradient}, ${({ theme }) => theme.color.component.primaryButtonRightGradient});
  color: ${({ theme }) => theme.color.component.primaryButtonText};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const StatsBanner = styled.div<{ theme: any }>`
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #f7931a;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div<{ theme: any }>`
  color: ${({ theme }) => theme.color.global.gray};
  font-size: 0.9rem;
`;

export const LeaderboardPage: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('contributors');

  const contributors = [
    { rank: 1, name: 'Alex Chen', handle: 'alexdev', tokens: 15420, contributions: 47 },
    { rank: 2, name: 'Sarah Kim', handle: 'sarahk', tokens: 12340, contributions: 32 },
    { rank: 3, name: 'Mike Johnson', handle: 'mjdev', tokens: 9876, contributions: 28 },
    { rank: 4, name: 'Emma Davis', handle: 'emmacode', tokens: 8765, contributions: 25 },
    { rank: 5, name: 'David Wilson', handle: 'dwilson', tokens: 7654, contributions: 22 },
    { rank: 6, name: 'Lisa Zhang', handle: 'lzhang', tokens: 6543, contributions: 19 },
    { rank: 7, name: 'Tom Brown', handle: 'tbrown', tokens: 5432, contributions: 16 },
    { rank: 8, name: 'Anna Lee', handle: 'annalee', tokens: 4321, contributions: 13 },
  ];

  const availableTasks = [
    {
      title: 'Implement RGB Token Support',
      description: 'Add support for RGB smart contracts on Bitcoin, including token creation, transfer, and balance checking.',
      reward: 800,
      type: 'feature',
      tags: ['rgb', 'bitcoin', 'smart-contracts']
    },
    {
      title: 'Fix Transaction Fee Estimation',
      description: 'Improve the fee estimation algorithm to provide more accurate fee calculations for Bitcoin transactions.',
      reward: 300,
      type: 'bug',
      tags: ['fees', 'bitcoin', 'estimation']
    },
    {
      title: 'Update Lightning Documentation',
      description: 'Create comprehensive documentation for Lightning Network integration including setup and usage examples.',
      reward: 150,
      type: 'docs',
      tags: ['lightning', 'documentation', 'tutorial']
    },
    {
      title: 'Add Ordinals Gallery View',
      description: 'Create a gallery view for Ordinals/inscriptions with filtering, sorting, and metadata display.',
      reward: 500,
      type: 'feature',
      tags: ['ordinals', 'ui', 'gallery']
    },
    {
      title: 'Optimize Bundle Size',
      description: 'Reduce the application bundle size by implementing code splitting and removing unused dependencies.',
      reward: 200,
      type: 'enhancement',
      tags: ['performance', 'optimization', 'bundling']
    },
    {
      title: 'Fix Mobile Responsive Issues',
      description: 'Resolve layout and usability issues on mobile devices, particularly for token visualizer components.',
      reward: 250,
      type: 'bug',
      tags: ['mobile', 'responsive', 'ui']
    }
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy />;
    if (rank === 2) return <FaMedal />;
    if (rank === 3) return <FaMedal />;
    return <FaStar />;
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'bug': return <FaBug />;
      case 'feature': return <FaRocket />;
      case 'docs': return <FaBook />;
      default: return <FaCode />;
    }
  };

  return (
    <PageContainer theme={theme}>
      <AppHeader theme={theme} onTitleClick={() => window.location.href = '/'} />
      
      <ContentContainer>
        <HeroSection theme={theme}>
          <HeroTitle>
            <FaTrophy />
            Contributors Leaderboard
          </HeroTitle>
          <HeroSubtitle>
            Earn $BWallet tokens by contributing to the Bitcoin Wallet ecosystem
          </HeroSubtitle>
        </HeroSection>

        <StatsBanner theme={theme}>
          <StatItem>
            <StatValue>124</StatValue>
            <StatLabel theme={theme}>Active Contributors</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>1.2M</StatValue>
            <StatLabel theme={theme}>Total Tokens Distributed</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>342</StatValue>
            <StatLabel theme={theme}>Completed Tasks</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>89</StatValue>
            <StatLabel theme={theme}>Available Tasks</StatLabel>
          </StatItem>
        </StatsBanner>

        <TabContainer theme={theme}>
          <Tab
            theme={theme}
            active={activeTab === 'contributors'}
            onClick={() => setActiveTab('contributors')}
          >
            <FaTrophy />
            Top Contributors
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'tasks'}
            onClick={() => setActiveTab('tasks')}
          >
            <FaCode />
            Available Tasks
          </Tab>
        </TabContainer>

        {activeTab === 'contributors' && (
          <LeaderboardTable theme={theme}>
            <thead>
              <tr>
                <TableHeader theme={theme}>Rank</TableHeader>
                <TableHeader theme={theme}>Contributor</TableHeader>
                <TableHeader theme={theme}>Contributions</TableHeader>
                <TableHeader theme={theme}>$BWallet Earned</TableHeader>
              </tr>
            </thead>
            <tbody>
              {contributors.map((contributor) => (
                <TableRow key={contributor.rank} theme={theme} rank={contributor.rank}>
                  <TableCell theme={theme}>
                    <RankBadge rank={contributor.rank}>
                      {getRankIcon(contributor.rank)}
                      #{contributor.rank}
                    </RankBadge>
                  </TableCell>
                  <TableCell theme={theme}>
                    <UserInfo>
                      <UserAvatar theme={theme}>
                        {contributor.name.charAt(0)}
                      </UserAvatar>
                      <UserDetails>
                        <UserName theme={theme}>{contributor.name}</UserName>
                        <UserHandle theme={theme}>
                          <FaGithub />
                          @{contributor.handle}
                        </UserHandle>
                      </UserDetails>
                    </UserInfo>
                  </TableCell>
                  <TableCell theme={theme}>
                    {contributor.contributions} tasks
                  </TableCell>
                  <TableCell theme={theme}>
                    <TokenReward>{contributor.tokens.toLocaleString()}</TokenReward>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </LeaderboardTable>
        )}

        {activeTab === 'tasks' && (
          <TasksGrid>
            {availableTasks.map((task, index) => (
              <TaskCard key={index} theme={theme}>
                <TaskHeader>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskReward>{task.reward} $BWallet</TaskReward>
                </TaskHeader>
                <TaskDescription theme={theme}>
                  {task.description}
                </TaskDescription>
                <TaskTags>
                  <TaskTag theme={theme} type={task.type}>
                    {getTaskIcon(task.type)} {task.type}
                  </TaskTag>
                  {task.tags.map((tag) => (
                    <TaskTag key={tag} theme={theme} type="default">
                      {tag}
                    </TaskTag>
                  ))}
                </TaskTags>
                <TaskAction theme={theme}>
                  Start Task
                </TaskAction>
              </TaskCard>
            ))}
          </TasksGrid>
        )}
      </ContentContainer>
    </PageContainer>
  );
};