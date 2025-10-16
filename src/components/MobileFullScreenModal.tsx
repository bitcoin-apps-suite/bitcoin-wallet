import { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { WhiteLabelTheme } from '../theme.types';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  theme?: WhiteLabelTheme;
}

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const slideDown = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ModalContainer = styled.div<{ $isOpen: boolean; $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0a0a0a;
  z-index: 10000;
  display: ${props => props.$isOpen || props.$isClosing ? 'flex' : 'none'};
  flex-direction: column;
  animation: ${props => {
    if (props.$isClosing) return css`${slideDown} 0.3s ease-out forwards`;
    if (props.$isOpen) return css`${slideUp} 0.3s ease-out`;
    return 'none';
  }};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
  border-bottom: 1px solid rgba(234, 179, 8, 0.2);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Title = styled.h2`
  color: #eab308;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1rem;
  animation: ${fadeIn} 0.4s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
  
  ::-webkit-scrollbar {
    width: 4px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(234, 179, 8, 0.3);
    border-radius: 2px;
  }
`;

const Footer = styled.div`
  padding: 1rem;
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  border-top: 1px solid rgba(234, 179, 8, 0.2);
  display: flex;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
  z-index: 10;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.$primary ? css`
    background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);
    color: #000;
    box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
    
    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 8px rgba(234, 179, 8, 0.2);
    }
  ` : css`
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:active {
      background: rgba(255, 255, 255, 0.15);
    }
  `}
`;

export const MobileFullScreenModal = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  theme
}: FullScreenModalProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <ModalContainer $isOpen={isOpen} $isClosing={isClosing}>
      <Header>
        <Title>{title}</Title>
        <CloseButton onClick={handleClose}>
          <FaTimes size={20} />
        </CloseButton>
      </Header>
      
      <Content>{children}</Content>
      
      {onConfirm && (
        <Footer>
          <ActionButton onClick={handleClose}>
            Cancel
          </ActionButton>
          <ActionButton $primary onClick={handleConfirm}>
            <FaCheck size={16} />
            Confirm
          </ActionButton>
        </Footer>
      )}
    </ModalContainer>
  );
};