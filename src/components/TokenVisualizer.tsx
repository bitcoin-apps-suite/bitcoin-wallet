import React, { Suspense, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Grid, Html, Text, Box } from '@react-three/drei';
import * as THREE from 'three';
import { WhiteLabelTheme } from '../theme.types';
import { shouldUse3D, isMobileDevice } from '../utils/deviceDetection';

interface TokenData {
  address: string;
  tokenId: string;
  contentType: string;
  data: any;
  metadata?: {
    name?: string;
    description?: string;
    location?: { x: number; y: number; z: number };
    // Bitcoin-specific fields
    block?: number;
    txid?: string;
    vout?: number;
    satoshi?: number;
    inscription_number?: number;
    current_supply?: string;
    amount?: string;
    deployed_at?: number;
    asset_id?: string;
    genesis_txid?: string;
    utxo?: string;
    // Additional fields for extensibility
    [key: string]: any;
  };
}

interface TokenVisualizerProps {
  tokens: TokenData[];
  theme: WhiteLabelTheme;
  viewMode: 'data' | 'visual' | 'network';
}

const VisualizerContainer = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: ${({ theme }) => theme.color.global.walletBackground};
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

const DataView = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  padding: 2rem;
  color: ${({ theme }) => theme.color.global.contrast};
  overflow-y: auto;
  height: 100%;
`;

const TokenCard = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AddressLabel = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.color.global.gray};
  font-family: monospace;
  margin-bottom: 0.5rem;
  word-break: break-all;
  background: ${({ theme }) => theme.color.global.walletBackground};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const TokenInfo = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  font-size: 0.9rem;
  
  strong {
    color: ${({ theme }) => theme.color.global.contrast};
    display: block;
    margin-bottom: 0.25rem;
  }
  
  span {
    color: ${({ theme }) => theme.color.global.gray};
    font-family: monospace;
    font-size: 0.8rem;
  }
`;

const DataPreview = styled.pre<{ theme: WhiteLabelTheme['theme'] }>`
  background: ${({ theme }) => theme.color.global.walletBackground};
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow-x: auto;
  max-height: 200px;
  color: ${({ theme }) => theme.color.global.contrast};
`;

const MobileVisualView = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  padding: 1rem;
  color: ${({ theme }) => theme.color.global.contrast};
  height: 100%;
  overflow-y: auto;
`;

const MobileTokenCard = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #f7931a;
`;

const MobileNetworkView = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  padding: 1rem;
  color: ${({ theme }) => theme.color.global.contrast};
  height: 100%;
  overflow-y: auto;
`;

const NetworkNode = styled.div<{ theme: WhiteLabelTheme['theme']; nodeType: string }>`
  background: ${({ theme }) => theme.color.global.row};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${({ nodeType }) => {
    switch (nodeType) {
      case 'image/png': return '#ff6b35';
      case 'token/counterparty': return '#9c27b0';
      case 'application/bsv-20': return '#4caf50';
      case 'application/rgb': return '#2196f3';
      default: return '#f7931a';
    }
  }};
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NodeIcon = styled.div<{ nodeType: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ nodeType }) => {
    switch (nodeType) {
      case 'image/png': return 'linear-gradient(135deg, #ff6b35, #ff8c42)';
      case 'token/counterparty': return 'linear-gradient(135deg, #9c27b0, #ab47bc)';
      case 'application/bsv-20': return 'linear-gradient(135deg, #4caf50, #66bb6a)';
      case 'application/rgb': return 'linear-gradient(135deg, #2196f3, #42a5f5)';
      default: return 'linear-gradient(135deg, #f7931a, #ffb84d)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const NodeContent = styled.div`
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button<{ variant: 'send' | 'receive' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  background: ${({ variant }) => 
    variant === 'send' 
      ? 'linear-gradient(135deg, #ff6b35, #ff8c42)'
      : 'linear-gradient(135deg, #4caf50, #66bb6a)'
  };
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LoadingBox = styled.div<{ theme: WhiteLabelTheme['theme'] }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.color.global.gray};
`;

// Placeholder Model Component for demo/fallback
function PlaceholderModel({ position = [0, 0, 0], metadata, color = '#808080' }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={hovered ? 1.1 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {hovered && metadata && (
        <Html distanceFactor={10}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            <div>{metadata.name} (Demo)</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>
              {metadata.address?.slice(0, 8)}...
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// GLTF Model Component
function GLTFModel({ url, position = [0, 0, 0], metadata }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const gltf = useGLTF(url);
  
  // Handle both single GLTF and array returns
  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;

  return (
    <group position={position}>
      <primitive
        ref={meshRef}
        object={scene}
        scale={hovered ? 1.1 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
      {hovered && metadata && (
        <Html distanceFactor={10}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            <div>{metadata.name}</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>
              {metadata.address?.slice(0, 8)}...
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Model Component that chooses between GLTF and Placeholder
function Model({ url, position = [0, 0, 0], metadata }: any) {
  const isPlaceholder = !url || url.startsWith('/path/to/');
  
  if (isPlaceholder) {
    const color = metadata?.name === 'Elephant' ? '#808080' : '#FFDB58';
    return <PlaceholderModel position={position} metadata={metadata} color={color} />;
  }
  
  return <GLTFModel url={url} position={position} metadata={metadata} />;
}

// Zoo Environment Component
function ZooEnvironment({ zooAddress }: { zooAddress?: string }) {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#7ec850" />
      </mesh>
      
      {/* Zoo Fence */}
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[i * 2.5 - 25, 1, -10]} castShadow>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
      
      {/* Zoo Label */}
      {zooAddress && (
        <Html position={[0, 3, -10]}>
          <div style={{
            background: 'rgba(139, 69, 19, 0.9)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Zoo Location</div>
            <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>
              {zooAddress}
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

export const TokenVisualizer: React.FC<TokenVisualizerProps> = ({
  tokens,
  theme: whiteLabelTheme,
  viewMode,
}) => {
  const theme = whiteLabelTheme.theme;
  
  // Visual view state - declare at top level to avoid hooks rules violation
  const [visualMode, setVisualMode] = useState<'utxo' | 'address'>('utxo');
  const [selectedBalls, setSelectedBalls] = useState<string[]>([]);
  const [draggedBall, setDraggedBall] = useState<string | null>(null);
  
  // Data View - Shows raw token data and metadata
  if (viewMode === 'data') {
    return (
      <VisualizerContainer theme={theme}>
        <DataView theme={theme}>
          <h3>Bitcoin Asset Data View</h3>
          {tokens.map((token, index) => (
            <TokenCard key={index} theme={theme}>
              <h4 style={{ margin: '0 0 1rem 0', color: theme.color.global.contrast }}>
                {token.metadata?.name || token.tokenId}
              </h4>
              
              <AddressLabel theme={theme}>
                🏠 {token.address}
              </AddressLabel>
              
              <TokenInfo theme={theme}>
                <InfoItem theme={theme}>
                  <strong>Token ID</strong>
                  <span>{token.tokenId}</span>
                </InfoItem>
                <InfoItem theme={theme}>
                  <strong>Content Type</strong>
                  <span>{token.contentType}</span>
                </InfoItem>
                
                {token.metadata?.txid && (
                  <InfoItem theme={theme}>
                    <strong>Transaction ID</strong>
                    <span>{token.metadata.txid.slice(0, 16)}...</span>
                  </InfoItem>
                )}
                
                {token.metadata?.block && (
                  <InfoItem theme={theme}>
                    <strong>Block Height</strong>
                    <span>{token.metadata.block.toLocaleString()}</span>
                  </InfoItem>
                )}
                
                {token.metadata?.inscription_number && (
                  <InfoItem theme={theme}>
                    <strong>Inscription #</strong>
                    <span>{token.metadata.inscription_number.toLocaleString()}</span>
                  </InfoItem>
                )}
                
                {token.metadata?.satoshi && (
                  <InfoItem theme={theme}>
                    <strong>Satoshi Value</strong>
                    <span>{(token.metadata.satoshi / 100000000).toFixed(8)} BTC</span>
                  </InfoItem>
                )}
                
                {token.metadata?.current_supply && (
                  <InfoItem theme={theme}>
                    <strong>Current Supply</strong>
                    <span>{parseInt(token.metadata.current_supply).toLocaleString()}</span>
                  </InfoItem>
                )}
                
                {token.metadata?.amount && (
                  <InfoItem theme={theme}>
                    <strong>Amount</strong>
                    <span>{parseInt(token.metadata.amount).toLocaleString()}</span>
                  </InfoItem>
                )}
              </TokenInfo>
              
              {token.metadata?.description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: theme.color.global.contrast }}>Description:</strong>
                  <p style={{ 
                    color: theme.color.global.gray, 
                    fontSize: '0.9rem', 
                    margin: '0.25rem 0 0 0',
                    lineHeight: '1.4'
                  }}>
                    {token.metadata.description}
                  </p>
                </div>
              )}
              
              {token.data && (
                <div>
                  <strong style={{ color: theme.color.global.contrast }}>Raw Data:</strong>
                  <DataPreview theme={theme}>
                    {typeof token.data === 'object' 
                      ? JSON.stringify(token.data, null, 2)
                      : String(token.data)}
                  </DataPreview>
                </div>
              )}
            </TokenCard>
          ))}
        </DataView>
      </VisualizerContainer>
    );
  }

  // Visual View - Interactive UTXO/Address balls in tokenized world (3D) or mobile cards (2D)
  if (viewMode === 'visual') {
    // Mobile version - show simplified card-based interface
    if (!shouldUse3D()) {
      return (
        <VisualizerContainer theme={theme}>
          <MobileVisualView theme={theme}>
            <h3 style={{ marginBottom: '1rem', color: theme.color.global.contrast }}>
              🔥 Bitcoin Assets - Mobile View
            </h3>
            {tokens.map((token, index) => (
              <MobileTokenCard key={index} theme={theme}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  marginBottom: '0.5rem' 
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f7931a, #ffb84d)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    ₿
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: 0, 
                      color: theme.color.global.contrast,
                      fontSize: '1rem'
                    }}>
                      {token.metadata?.name || token.tokenId}
                    </h4>
                    <p style={{ 
                      margin: '0.25rem 0', 
                      color: theme.color.global.gray,
                      fontSize: '0.8rem'
                    }}>
                      {token.address.slice(0, 16)}...
                    </p>
                  </div>
                </div>
                
                {token.metadata?.satoshi && (
                  <div style={{
                    background: theme.color.global.walletBackground,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    marginBottom: '0.5rem'
                  }}>
                    <strong style={{ color: '#f7931a' }}>
                      {(token.metadata.satoshi / 100000000).toFixed(8)} BTC
                    </strong>
                  </div>
                )}
                
                <ActionButtons>
                  <ActionButton variant="send">
                    📤 Send
                  </ActionButton>
                  <ActionButton variant="receive">
                    📥 Receive
                  </ActionButton>
                </ActionButtons>
              </MobileTokenCard>
            ))}
          </MobileVisualView>
        </VisualizerContainer>
      );
    }
    // Generate UTXO data from tokens
    const generateUTXOs = () => {
      const utxos: any[] = [];
      tokens.forEach((token, idx) => {
        // Each token can have multiple UTXOs
        const utxoCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < utxoCount; i++) {
          utxos.push({
            id: `${token.tokenId}-utxo-${i}`,
            address: token.address,
            tokenId: token.tokenId,
            value: token.metadata?.satoshi ? (token.metadata.satoshi / utxoCount) : Math.random() * 100000000,
            type: token.contentType,
            metadata: token.metadata,
            category: getAssetCategory(token.contentType, token.metadata?.name),
            position: getCategoryPosition(token.contentType, idx, i)
          });
        }
      });
      return utxos;
    };

    // Categorize assets for spatial organization
    const getAssetCategory = (contentType: string, name?: string) => {
      if (name?.toLowerCase().includes('property') || name?.toLowerCase().includes('estate')) return 'real-estate';
      if (contentType === 'image/png' || contentType === 'image/jpeg') return 'art';
      if (contentType === 'token/counterparty' || contentType === 'application/bsv-20') return 'currency';
      if (contentType === 'application/rgb') return 'smart-contract';
      if (name?.toLowerCase().includes('music') || name?.toLowerCase().includes('audio')) return 'media';
      return 'general';
    };

    // Position assets by category in 3D space
    const getCategoryPosition = (contentType: string, tokenIdx: number, utxoIdx: number): [number, number, number] => {
      const category = getAssetCategory(contentType);
      const basePositions: Record<string, [number, number, number]> = {
        'real-estate': [-10, 0, -10],
        'art': [10, 0, -10],
        'currency': [-10, 0, 10],
        'smart-contract': [10, 0, 10],
        'media': [0, 5, 0],
        'general': [0, 0, 0]
      };
      
      const base = basePositions[category] || [0, 0, 0];
      const offset = [
        (Math.random() - 0.5) * 4 + tokenIdx * 0.5,
        Math.random() * 3 + utxoIdx * 0.3,
        (Math.random() - 0.5) * 4
      ];
      
      return [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]];
    };

    const utxos = generateUTXOs();

    // Interactive UTXO Ball Component
    const UTXOBall = ({ utxo, index }: { utxo: any; index: number }) => {
      const meshRef = useRef<THREE.Mesh>(null);
      const [hovered, setHovered] = useState(false);
      const [isDragging, setIsDragging] = useState(false);
      const [position, setPosition] = useState(utxo.position);

      useFrame(() => {
        if (meshRef.current && !isDragging) {
          meshRef.current.rotation.y += 0.001;
          if (hovered) {
            meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
          } else {
            meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
          }
        }
      });

      const handlePointerDown = (e: any) => {
        e.stopPropagation();
        setIsDragging(true);
        setDraggedBall(utxo.id);
      };

      const handlePointerUp = (e: any) => {
        e.stopPropagation();
        setIsDragging(false);
        setDraggedBall(null);
        
        // Check if we can combine with nearby UTXOs
        if (selectedBalls.includes(utxo.id)) {
          setSelectedBalls(prev => prev.filter(id => id !== utxo.id));
        } else {
          setSelectedBalls(prev => [...prev, utxo.id]);
        }
      };

      const handlePointerMove = (e: any) => {
        if (isDragging && meshRef.current) {
          const newPosition = e.point;
          setPosition([newPosition.x, newPosition.y, newPosition.z]);
          meshRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);
        }
      };

      const getColor = () => {
        if (selectedBalls.includes(utxo.id)) return '#ffd700';
        switch (utxo.category) {
          case 'real-estate': return '#8b4513';
          case 'art': return '#ff1493';
          case 'currency': return '#4caf50';
          case 'smart-contract': return '#2196f3';
          case 'media': return '#9c27b0';
          default: return '#f7931a';
        }
      };

      const ballSize = Math.cbrt(utxo.value / 10000000) * 0.3 + 0.5; // Size based on value

      return (
        <group position={position}>
          <mesh
            ref={meshRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
          >
            <sphereGeometry args={[ballSize, 32, 32]} />
            <meshStandardMaterial
              color={getColor()}
              metalness={0.7}
              roughness={0.3}
              emissive={getColor()}
              emissiveIntensity={isDragging ? 0.5 : (hovered ? 0.3 : 0.1)}
            />
          </mesh>
          
          {/* UTXO Info Label */}
          {(hovered || isDragging) && (
            <Html distanceFactor={10}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.95)',
                border: `2px solid ${getColor()}`,
                borderRadius: '8px',
                padding: '8px',
                minWidth: '180px',
                color: 'white',
                fontSize: '10px',
                fontFamily: 'monospace',
                pointerEvents: 'none'
              }}>
                <div style={{ color: getColor(), fontWeight: 'bold', marginBottom: '4px' }}>
                  {utxo.category.toUpperCase()} UTXO
                </div>
                <div>Value: {(utxo.value / 100000000).toFixed(8)} BTC</div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>
                  {utxo.address.slice(0, 16)}...
                </div>
                {utxo.metadata?.name && (
                  <div style={{ marginTop: '4px', color: getColor() }}>
                    {utxo.metadata.name}
                  </div>
                )}
                {isDragging && (
                  <div style={{ marginTop: '4px', color: '#ffd700' }}>
                    ✨ Drag to combine!
                  </div>
                )}
              </div>
            </Html>
          )}
        </group>
      );
    };

    // Zone labels for different asset categories
    const ZoneLabel = ({ position, label, color }: any) => (
      <group position={position}>
        <Text
          position={[0, -2, 0]}
          fontSize={1}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
        <Box args={[8, 0.1, 8]} position={[0, -2.5, 0]}>
          <meshStandardMaterial color={color} opacity={0.1} transparent />
        </Box>
      </group>
    );

    return (
      <VisualizerContainer theme={theme}>
        {/* View Mode Toggle */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '8px',
          padding: '0.5rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setVisualMode('utxo')}
            style={{
              padding: '0.5rem 1rem',
              background: visualMode === 'utxo' ? '#f7931a' : 'transparent',
              color: 'white',
              border: '1px solid #f7931a',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            UTXO View
          </button>
          <button
            onClick={() => setVisualMode('address')}
            style={{
              padding: '0.5rem 1rem',
              background: visualMode === 'address' ? '#f7931a' : 'transparent',
              color: 'white',
              border: '1px solid #f7931a',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Address View
          </button>
        </div>

        {/* Combine button for selected UTXOs */}
        {selectedBalls.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100
          }}>
            <button
              onClick={() => {
                alert(`Combining ${selectedBalls.length} UTXOs into one!`);
                setSelectedBalls([]);
              }}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(45deg, #ffd700, #f7931a)',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 16px rgba(247, 147, 26, 0.4)'
              }}
            >
              ⚡ Combine {selectedBalls.length} UTXOs
            </button>
          </div>
        )}

        <Canvas
          shadows
          camera={{ position: [0, 15, 25], fov: 60 }}
          style={{ background: 'linear-gradient(to bottom, #0a0e27, #000000)' }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#f7931a" />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#4caf50" />
          <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow />
          
          <OrbitControls enablePan={true} enableRotate={true} enableZoom={true} />
          
          <Suspense fallback={null}>
            {/* Asset Category Zones */}
            <ZoneLabel position={[-10, 0, -10]} label="🏠 REAL ESTATE" color="#8b4513" />
            <ZoneLabel position={[10, 0, -10]} label="🎨 ART & NFTs" color="#ff1493" />
            <ZoneLabel position={[-10, 0, 10]} label="💰 CURRENCIES" color="#4caf50" />
            <ZoneLabel position={[10, 0, 10]} label="📜 CONTRACTS" color="#2196f3" />
            <ZoneLabel position={[0, 5, 0]} label="🎵 MEDIA" color="#9c27b0" />
            
            {/* UTXO Balls */}
            {visualMode === 'utxo' && utxos.map((utxo, index) => (
              <UTXOBall key={utxo.id} utxo={utxo} index={index} />
            ))}
            
            {/* Address View - Group UTXOs by address */}
            {visualMode === 'address' && (
              <>
                {tokens.map((token, index) => {
                  const angle = (index / tokens.length) * Math.PI * 2;
                  const radius = 8;
                  const x = Math.cos(angle) * radius;
                  const z = Math.sin(angle) * radius;
                  
                  return (
                    <group key={token.address} position={[x, 2, z]}>
                      <mesh>
                        <sphereGeometry args={[1.5, 32, 32]} />
                        <meshStandardMaterial
                          color="#f7931a"
                          metalness={0.8}
                          roughness={0.2}
                          emissive="#f7931a"
                          emissiveIntensity={0.2}
                        />
                      </mesh>
                      <Html distanceFactor={10}>
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.9)',
                          padding: '8px',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '10px'
                        }}>
                          <div>{token.address.slice(0, 16)}...</div>
                          <div style={{ color: '#f7931a' }}>
                            {token.metadata?.name || 'Bitcoin Address'}
                          </div>
                        </div>
                      </Html>
                    </group>
                  );
                })}
              </>
            )}
          </Suspense>
          
          {/* Grid floor with zones */}
          <Grid 
            args={[40, 40]} 
            cellSize={2} 
            cellThickness={0.5} 
            cellColor="#f7931a20"
            sectionColor="#f7931a40"
            position={[0, -3, 0]}
          />
        </Canvas>
      </VisualizerContainer>
    );
  }

  // Network View - Interactive Bitcoin transaction network with send/receive
  // Mobile version - show network as list
  if (!shouldUse3D()) {
    return (
      <VisualizerContainer theme={theme}>
        <MobileNetworkView theme={theme}>
          <h3 style={{ marginBottom: '1rem', color: theme.color.global.contrast }}>
            🌐 Bitcoin Network - Mobile View
          </h3>
          {tokens.map((token, index) => {
            const getNodeColor = (contentType: string) => {
              switch (contentType) {
                case 'image/png': return '#ff6b35';
                case 'token/counterparty': return '#9c27b0';
                case 'application/bsv-20': return '#4caf50';
                case 'application/rgb': return '#2196f3';
                default: return '#f7931a';
              }
            };

            const getNodeIcon = (contentType: string) => {
              switch (contentType) {
                case 'image/png': return '🎨';
                case 'token/counterparty': return '🪙';
                case 'application/bsv-20': return '💰';
                case 'application/rgb': return '📜';
                default: return '₿';
              }
            };

            return (
              <NetworkNode key={token.tokenId} theme={theme} nodeType={token.contentType}>
                <NodeIcon nodeType={token.contentType}>
                  {getNodeIcon(token.contentType)}
                </NodeIcon>
                <NodeContent>
                  <h4 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: theme.color.global.contrast,
                    fontSize: '1rem'
                  }}>
                    {token.metadata?.name || token.tokenId}
                  </h4>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: theme.color.global.gray,
                    fontSize: '0.8rem'
                  }}>
                    {token.address.slice(0, 12)}...{token.address.slice(-8)}
                  </p>
                  
                  {token.metadata?.txid && (
                    <p style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: theme.color.global.gray,
                      fontSize: '0.7rem'
                    }}>
                      TX: {token.metadata.txid.slice(0, 16)}...
                    </p>
                  )}
                  
                  {token.metadata?.satoshi && (
                    <div style={{
                      color: getNodeColor(token.contentType),
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem'
                    }}>
                      {(token.metadata.satoshi / 100000000).toFixed(8)} BTC
                    </div>
                  )}
                  
                  <ActionButtons>
                    <ActionButton variant="send">
                      📤 SEND
                    </ActionButton>
                    <ActionButton variant="receive">
                      📥 RECEIVE
                    </ActionButton>
                  </ActionButtons>
                </NodeContent>
              </NetworkNode>
            );
          })}
        </MobileNetworkView>
      </VisualizerContainer>
    );
  }

  // Desktop 3D Network View
  return (
    <VisualizerContainer theme={theme}>
      <Canvas 
        camera={{ position: [0, 8, 12], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #1a1a2e, #0f0f23)' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#f7931a" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4CAF50" />
        <OrbitControls enablePan={true} enableRotate={true} enableZoom={true} />
        
        {/* Floating particles for atmosphere */}
        <Suspense fallback={null}>
          {[...Array(50)].map((_, i) => (
            <mesh key={`particle-${i}`} position={[
              (Math.random() - 0.5) * 30,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 30
            ]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#f7931a" opacity={0.3} transparent />
            </mesh>
          ))}
          
          {/* Bitcoin transaction network nodes */}
          {tokens.map((token, index) => {
            const angle = (index / tokens.length) * Math.PI * 2;
            const radius = 6;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.sin(index * 0.5) * 2;
            
            // Node color based on token type
            const getNodeColor = () => {
              switch (token.contentType) {
                case 'image/png': return '#ff6b35';
                case 'token/counterparty': return '#9c27b0';
                case 'application/bsv-20': return '#4caf50';
                case 'application/rgb': return '#2196f3';
                default: return '#f7931a';
              }
            };
            
            return (
              <group key={token.tokenId} position={[x, y, z]}>
                {/* Main transaction ball */}
                <mesh>
                  <sphereGeometry args={[0.8, 32, 32]} />
                  <meshStandardMaterial 
                    color={getNodeColor()}
                    metalness={0.8}
                    roughness={0.2}
                    emissive={getNodeColor()}
                    emissiveIntensity={0.1}
                  />
                </mesh>
                
                {/* Rotating ring around the ball */}
                <mesh rotation={[Math.PI / 2, 0, index]}>
                  <torusGeometry args={[1.2, 0.05, 8, 32]} />
                  <meshStandardMaterial 
                    color="#ffffff" 
                    opacity={0.6} 
                    transparent 
                    emissive="#ffffff"
                    emissiveIntensity={0.1}
                  />
                </mesh>
                
                {/* Transaction details and controls */}
                <Html 
                  distanceFactor={8}
                  transform
                  occlude
                  position={[0, 1.5, 0]}
                >
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: `2px solid ${getNodeColor()}`,
                    borderRadius: '12px',
                    padding: '12px',
                    minWidth: '200px',
                    color: 'white',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 0 20px ${getNodeColor()}50`
                  }}>
                    {/* Token header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      color: getNodeColor(),
                      fontWeight: 'bold'
                    }}>
                      <span style={{ marginRight: '8px' }}>₿</span>
                      {token.metadata?.name || token.tokenId}
                    </div>
                    
                    {/* Address */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ color: '#888', fontSize: '9px' }}>ADDRESS</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {token.address.slice(0, 12)}...{token.address.slice(-8)}
                      </div>
                    </div>
                    
                    {/* Transaction info */}
                    {token.metadata?.txid && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ color: '#888', fontSize: '9px' }}>LAST TX</div>
                        <div>{token.metadata.txid.slice(0, 16)}...</div>
                      </div>
                    )}
                    
                    {/* Value/Amount */}
                    {token.metadata?.satoshi && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ color: '#888', fontSize: '9px' }}>VALUE</div>
                        <div style={{ color: '#f7931a', fontWeight: 'bold' }}>
                          {(token.metadata.satoshi / 100000000).toFixed(8)} BTC
                        </div>
                      </div>
                    )}
                    
                    {token.metadata?.amount && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ color: '#888', fontSize: '9px' }}>AMOUNT</div>
                        <div style={{ color: getNodeColor(), fontWeight: 'bold' }}>
                          {parseInt(token.metadata.amount).toLocaleString()}
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px',
                      marginTop: '12px'
                    }}>
                      <button style={{
                        background: `linear-gradient(45deg, ${getNodeColor()}, ${getNodeColor()}dd)`,
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        padding: '6px 12px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: `0 2px 8px ${getNodeColor()}40`
                      }}>
                        📤 SEND
                      </button>
                      <button style={{
                        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        padding: '6px 12px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px #4CAF5040'
                      }}>
                        📥 RECEIVE
                      </button>
                    </div>
                    
                    {/* Status indicator */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '8px',
                      fontSize: '9px',
                      color: '#4CAF50'
                    }}>
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        background: '#4CAF50', 
                        borderRadius: '50%',
                        marginRight: '4px',
                        animation: 'pulse 2s infinite'
                      }}></span>
                      CONFIRMED
                    </div>
                  </div>
                </Html>
                
                {/* Connection lines between nodes */}
                {index < tokens.length - 1 && (
                  <line>
                    <bufferGeometry>
                      <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([
                          0, 0, 0,
                          Math.cos((index + 1) / tokens.length * Math.PI * 2) * radius - x,
                          Math.sin((index + 1) * 0.5) * 2 - y,
                          Math.sin((index + 1) / tokens.length * Math.PI * 2) * radius - z
                        ])}
                        itemSize={3}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial 
                      color="#f7931a" 
                      opacity={0.4} 
                      transparent 
                      linewidth={2}
                    />
                  </line>
                )}
                
                {/* Transaction flow particles */}
                {index % 2 === 0 && (
                  <mesh position={[Math.cos(Date.now() * 0.001 + index) * 1.5, 0, 0]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial 
                      color="#f7931a" 
                      emissive="#f7931a"
                      emissiveIntensity={0.5}
                      metalness={0.8}
                      roughness={0.2}
                    />
                  </mesh>
                )}
              </group>
            );
          })}
          
          {/* Central Bitcoin logo */}
          <group position={[0, 0, 0]}>
            <mesh>
              <sphereGeometry args={[1.5, 64, 64]} />
              <meshStandardMaterial 
                color="#f7931a"
                metalness={0.9}
                roughness={0.1}
                emissive="#f7931a"
                emissiveIntensity={0.2}
              />
            </mesh>
            <Html distanceFactor={6} transform>
              <div style={{
                fontSize: '24px',
                color: '#f7931a',
                textAlign: 'center',
                fontWeight: 'bold',
                textShadow: '0 0 10px #f7931a'
              }}>
                ₿
              </div>
            </Html>
          </group>
        </Suspense>
        
        {/* Grid floor */}
        <Grid 
          args={[40, 40]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#f7931a30" 
          sectionColor="#f7931a60"
          position={[0, -5, 0]}
        />
      </Canvas>
    </VisualizerContainer>
  );
};