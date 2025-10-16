import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';

interface SwipeableViewProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
`;

const SwipeIndicator = styled.div<{ $direction: string; $active: boolean }>`
  position: fixed;
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.3), rgba(234, 179, 8, 0.1));
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 1000;
  
  ${props => {
    switch(props.$direction) {
      case 'left':
        return `
          top: 0;
          left: 0;
          width: 60px;
          height: 100%;
          background: linear-gradient(90deg, rgba(234, 179, 8, 0.3) 0%, transparent 100%);
        `;
      case 'right':
        return `
          top: 0;
          right: 0;
          width: 60px;
          height: 100%;
          background: linear-gradient(-90deg, rgba(234, 179, 8, 0.3) 0%, transparent 100%);
        `;
      case 'up':
        return `
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(180deg, rgba(234, 179, 8, 0.3) 0%, transparent 100%);
        `;
      case 'down':
        return `
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(0deg, rgba(234, 179, 8, 0.3) 0%, transparent 100%);
        `;
      default:
        return '';
    }
  }}
`;

export const MobileSwipeableView = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: SwipeableViewProps) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    
    setTouchEnd(currentTouch);
    
    const diffX = touchStart.x - currentTouch.x;
    const diffY = touchStart.y - currentTouch.y;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > threshold / 2) {
        setActiveDirection('left');
      } else if (diffX < -threshold / 2) {
        setActiveDirection('right');
      }
    } else {
      if (diffY > threshold / 2) {
        setActiveDirection('up');
      } else if (diffY < -threshold / 2) {
        setActiveDirection('down');
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setActiveDirection(null);
      return;
    }

    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);

    if (isHorizontalSwipe) {
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (diffX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    } else {
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (diffY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }
    
    setActiveDirection(null);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <Container
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <SwipeIndicator $direction="left" $active={activeDirection === 'left'} />
      <SwipeIndicator $direction="right" $active={activeDirection === 'right'} />
      <SwipeIndicator $direction="up" $active={activeDirection === 'up'} />
      <SwipeIndicator $direction="down" $active={activeDirection === 'down'} />
      {children}
    </Container>
  );
};