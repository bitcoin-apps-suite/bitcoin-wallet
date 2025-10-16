import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaPlus, FaTimes, FaPaperPlane, FaQrcode, FaHistory, FaCamera } from 'react-icons/fa';
import { WhiteLabelTheme } from '../theme.types';

interface FloatingActionProps {
  theme?: WhiteLabelTheme;
  onSend: () => void;
  onReceive: () => void;
  onHistory: () => void;
  onExchange: () => void;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(45deg); }
`;

const MainFAB = styled.button<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  svg {
    color: #000;
    font-size: 24px;
    animation: ${({ $isOpen }) => $isOpen ? css`${rotate} 0.3s forwards` : 'none'};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ActionButton = styled.button<{ $delay: number }>`
  position: fixed;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(234, 179, 8, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  animation: ${fadeIn} 0.2s ease-out;
  animation-delay: ${props => props.$delay}ms;
  animation-fill-mode: both;
  transition: all 0.2s ease;
  
  svg {
    color: #eab308;
    font-size: 20px;
  }
  
  &:active {
    transform: scale(0.9);
    background: rgba(234, 179, 8, 0.2);
  }
`;

const ActionLabel = styled.span<{ $delay: number }>`
  position: fixed;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 998;
  animation: ${fadeIn} 0.2s ease-out;
  animation-delay: ${props => props.$delay}ms;
  animation-fill-mode: both;
`;

const Backdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 997;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

export const MobileFloatingAction = ({ theme, onSend, onReceive, onHistory, onExchange }: FloatingActionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  const actions = [
    { icon: FaPaperPlane, label: 'Send', action: onSend, position: { bottom: 96, right: 24 } },
    { icon: FaQrcode, label: 'Receive', action: onReceive, position: { bottom: 156, right: 24 } },
    { icon: FaHistory, label: 'History', action: onHistory, position: { bottom: 96, right: 84 } },
    { icon: FaCamera, label: 'Scan QR', action: onExchange, position: { bottom: 156, right: 84 } }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      <Backdrop $isOpen={isOpen} onClick={() => setIsOpen(false)} />
      
      {isOpen && actions.map((action, index) => (
        <React.Fragment key={index}>
          <ActionButton
            $delay={index * 30}
            style={action.position}
            onClick={() => handleActionClick(action.action)}
          >
            <action.icon />
          </ActionButton>
          <ActionLabel
            $delay={index * 30}
            style={{ 
              ...action.position, 
              right: action.position.right + 60
            }}
          >
            {action.label}
          </ActionLabel>
        </React.Fragment>
      ))}
      
      <MainFAB ref={fabRef} $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaPlus />}
      </MainFAB>
    </>
  );
};