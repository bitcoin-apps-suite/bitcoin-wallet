import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import { WhiteLabelTheme } from '../theme.types';
import { formatUSD } from '../utils/format';

const Container = styled.div<WhiteLabelTheme>`
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #1a1a1a, #000000);
  position: relative;
`;

const ControlPanel = styled.div<WhiteLabelTheme>`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.color.global.gray + '40'};
  border-radius: 12px;
  padding: 1rem;
  z-index: 100;
`;

const InfoText = styled.div<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

interface BubbleData {
  id: string;
  address: string;
  amount: number; // in satoshis
  usdValue: number;
  type: 'utxo' | 'address';
  position: [number, number, number];
  color: string;
}

interface BubbleProps {
  data: BubbleData;
  onSend: (id: string) => void;
  onReceive: (id: string) => void;
  onCombine: (id: string) => void;
}

const Bubble: React.FC<BubbleProps> = ({ data, onSend, onReceive, onCombine }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Calculate bubble size based on value (logarithmic scale for better visualization)
  const size = useMemo(() => {
    const minSize = 0.3;
    const maxSize = 2.5;
    const logValue = Math.log10(Math.max(data.usdValue, 1));
    const normalizedSize = minSize + (logValue / 6) * (maxSize - minSize);
    return Math.min(Math.max(normalizedSize, minSize), maxSize);
  }, [data.usdValue]);

  // Animate the bubble
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = data.position[1] + Math.sin(state.clock.elapsedTime + data.id.charCodeAt(0)) * 0.1;
      
      // Scale on hover
      const targetScale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Gentle rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + data.id.charCodeAt(0)) * 0.1;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh
        ref={meshRef}
        position={data.position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshPhysicalMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0}
          transparent
          opacity={0.9}
          envMapIntensity={1}
        />
        
        {/* Display amount on the bubble */}
        <Text
          position={[0, 0, size + 0.1]}
          fontSize={size * 0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/bold.woff"
        >
          {`${(data.amount / 100000000).toFixed(4)} BSV`}
        </Text>
        
        {/* Interactive HTML overlay when clicked */}
        {clicked && (
          <Html
            position={[0, size + 1, 0]}
            center
            style={{
              width: '200px',
              pointerEvents: 'all'
            }}
          >
            <div style={{
              background: 'rgba(0, 0, 0, 0.95)',
              border: '1px solid #fbbf24',
              borderRadius: '12px',
              padding: '12px',
              color: 'white',
              fontSize: '12px'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '10px', color: '#aaa' }}>
                {data.address.slice(0, 8)}...{data.address.slice(-6)}
              </div>
              <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#fbbf24' }}>
                {formatUSD(data.usdValue)}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => onSend(data.id)}
                  style={{
                    background: 'linear-gradient(135deg, #fde047, #f59e0b)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#000',
                    fontWeight: '600'
                  }}
                >
                  Send
                </button>
                <button
                  onClick={() => onReceive(data.id)}
                  style={{
                    background: 'linear-gradient(135deg, #fde047, #f59e0b)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#000',
                    fontWeight: '600'
                  }}
                >
                  Receive
                </button>
                <button
                  onClick={() => onCombine(data.id)}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#fff',
                    fontWeight: '600'
                  }}
                >
                  Combine
                </button>
              </div>
            </div>
          </Html>
        )}
      </mesh>
    </Float>
  );
};

interface BubbleVisualizationProps {
  theme: WhiteLabelTheme;
  utxos?: any[];
  balance: number;
  exchangeRate: number;
  onSend: (id: string) => void;
  onReceive: (id: string) => void;
  onCombine: (ids: string[]) => void;
}

export const BubbleVisualization: React.FC<BubbleVisualizationProps> = ({
  theme,
  utxos = [],
  balance,
  exchangeRate,
  onSend,
  onReceive,
  onCombine
}) => {
  // Generate bubble data from UTXOs
  const bubbleData: BubbleData[] = useMemo(() => {
    // Mock data for demonstration - replace with real UTXO data
    const mockData = [
      { amount: 10000000, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
      { amount: 5000000, address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2' },
      { amount: 25000000, address: '1CounterpartyXXXXXXXXXXXXXXXUWLpVr' },
      { amount: 2000000, address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' },
      { amount: 15000000, address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
      { amount: 8000000, address: '1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp' },
      { amount: 3500000, address: '1LuckyR1fFHEsXYyx5QK4UFzv3PEAepPMK' },
      { amount: 12000000, address: '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX' },
    ];

    return mockData.map((item, index) => {
      const angle = (index / mockData.length) * Math.PI * 2;
      const radius = 3 + (index % 3) * 1.5;
      const height = (index % 3 - 1) * 2;
      
      return {
        id: `bubble-${index}`,
        address: item.address,
        amount: item.amount,
        usdValue: (item.amount / 100000000) * exchangeRate,
        type: 'utxo' as const,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number],
        color: `hsl(${45 + index * 15}, 100%, 50%)` // Yellow gradient colors
      };
    });
  }, [utxos, exchangeRate]);

  const handleCombine = (id: string) => {
    // For now, combine with adjacent bubbles
    const selectedIndex = bubbleData.findIndex(b => b.id === id);
    const combineCandidates = [
      bubbleData[selectedIndex]?.id,
      bubbleData[selectedIndex + 1]?.id,
    ].filter(Boolean);
    onCombine(combineCandidates);
  };

  return (
    <Container theme={theme}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* Render bubbles */}
        {bubbleData.map(bubble => (
          <Bubble
            key={bubble.id}
            data={bubble}
            onSend={onSend}
            onReceive={onReceive}
            onCombine={handleCombine}
          />
        ))}
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={3}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        {/* Grid helper */}
        <gridHelper args={[20, 20, '#333333', '#222222']} />
      </Canvas>
      
      {/* Control Panel */}
      <ControlPanel theme={theme}>
        <InfoText theme={theme}>
          <strong>Total Balance:</strong> {(balance / 100000000).toFixed(8)} BSV
        </InfoText>
        <InfoText theme={theme}>
          <strong>USD Value:</strong> {formatUSD(balance / 100000000 * exchangeRate)}
        </InfoText>
        <InfoText theme={theme} style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7 }}>
          Click bubbles to interact • Drag to rotate • Scroll to zoom
        </InfoText>
      </ControlPanel>
    </Container>
  );
};