// Magazine viewer — resolves a manifest+N inscription set into a page-turn
// flipbook UI. Used by Ordinal.tsx when it detects an `npg-magazine`
// manifest JSON inscription.
//
// Manifest schema (from @b0ase/creator-tool-core/manifest, mirrored in
// npgx web's lib/magazine/inscribe-as-ordinals.ts and the Mint apps):
//
//   { type: 'npg-magazine', version: '1', title, issue, pages: [
//       { n, kind: 'cover'|'page'|'back', txid, width?, height? }
//   ] }
//
// Each child txid is a 1Sat ordinal whose inscription content is the page
// image. We resolve content via the public ordfs.network gateway, no
// indexer round-trip needed.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styled from 'styled-components';

// ─── Manifest schema (kept inline for zero-dep simplicity) ───────────────

type MagazinePageKind = 'cover' | 'page' | 'back';

interface MagazinePageRef {
  n: number;
  kind: MagazinePageKind;
  txid: string;
  width?: number;
  height?: number;
}

interface MagazineManifest {
  type: 'npg-magazine';
  version: '1';
  title: string;
  issue?: string;
  creator?: string;
  createdAt?: string;
  pages: MagazinePageRef[];
  meta?: Record<string, unknown>;
}

export function isMagazineManifest(json: unknown): json is MagazineManifest {
  if (!json || typeof json !== 'object') return false;
  const m = json as MagazineManifest;
  return m.type === 'npg-magazine' && m.version === '1' && Array.isArray(m.pages);
}

// ─── Public ordfs gateway — no indexer round-trip ────────────────────────

const ORDFS_GATEWAY = 'https://ordfs.network';
function pageImageUrl(txid: string, vout = 0): string {
  return `${ORDFS_GATEWAY}/${txid}_${vout}`;
}

// ─── Component ───────────────────────────────────────────────────────────

interface Props {
  manifest: MagazineManifest;
  /** Optional: the manifest's own txid, shown as a tag */
  manifestTxid?: string;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  width: 100%;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  z-index: 2;
`;

const Center = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const PageDiv = styled.div`
  background: #1e1522;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ZoomBar = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 11px;
  z-index: 3;
  user-select: none;
`;

const ZoomBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  min-width: 26px;
  text-align: center;
`;

const Status = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const Page = React.forwardRef<HTMLDivElement, { src: string; alt: string }>(
  ({ src, alt }, ref) => (
    <PageDiv ref={ref}>
      <img src={src} alt={alt} />
    </PageDiv>
  ),
);

export function MagazineViewer({ manifest, manifestTxid }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-fit + zoom multiplier
  const z = Math.max(0.4, Math.min(2.5, zoom));
  const baseW = Math.floor(Math.min(containerSize.width * 0.45, containerSize.height * 0.65));
  const pageWidth = Math.max(100, Math.floor(baseW * z));
  const pageHeight = Math.max(140, Math.floor(pageWidth * 1.4));

  const pages = useMemo(() => {
    return manifest.pages.map((p) => ({
      key: `p-${p.n}-${p.txid}`,
      src: pageImageUrl(p.txid),
      alt: `${manifest.title} — ${p.kind} ${p.n}`,
    }));
  }, [manifest]);

  // Sync activeIndex → flipbook
  useEffect(() => {
    const id = setTimeout(() => {
      const fb = bookRef.current;
      if (!fb) return;
      const pf = fb.pageFlip();
      if (!pf) return;
      const target = Math.max(0, Math.min(activeIndex, pages.length - 1));
      if (pf.getCurrentPageIndex() !== target) pf.turnToPage(target);
    }, 60);
    return () => clearTimeout(id);
  }, [activeIndex, pages.length]);

  const onFlip = useCallback((e: any) => {
    setActiveIndex(e.data);
  }, []);

  const zoomIn = () => setZoom((v) => Math.min(2.5, +(v + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((v) => Math.max(0.4, +(v - 0.1).toFixed(2)));
  const zoomReset = () => setZoom(1);
  const zoomFit = () => {
    const W = containerSize.width;
    const H = containerSize.height;
    const baseline = Math.min(W * 0.45, H * 0.65);
    if (baseline <= 0) { setZoom(1); return; }
    const maxPageW = Math.min(W * 0.5, H / 1.4);
    setZoom(Math.max(0.4, Math.min(2.5, +(maxPageW / baseline).toFixed(2))));
  };

  return (
    <Wrapper>
      <Header>
        <span>
          📖 <strong>{manifest.title}</strong>
          {manifest.issue && <span style={{ opacity: 0.6 }}> · Issue {manifest.issue}</span>}
          <span style={{ opacity: 0.6 }}> · {pages.length} pages</span>
        </span>
        {manifestTxid && (
          <span style={{ opacity: 0.5, fontFamily: 'monospace', fontSize: 10 }}>
            {manifestTxid.slice(0, 16)}…
          </span>
        )}
      </Header>
      <Center ref={containerRef}>
        {pages.length === 0 ? (
          <Status>Empty manifest — no pages.</Status>
        ) : (
          /* @ts-ignore react-pageflip typing */
          <HTMLFlipBook
            key={`fb-${pages.length}-${pageWidth}`}
            ref={bookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={100}
            maxWidth={1200}
            minHeight={140}
            maxHeight={1680}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onFlip}
            flippingTime={500}
            useMouseEvents={true}
            startPage={activeIndex}
            drawShadow={true}
            maxShadowOpacity={0.4}
          >
            {pages.map((p) => (
              <Page key={p.key} src={p.src} alt={p.alt} />
            ))}
          </HTMLFlipBook>
        )}
        {pages.length > 0 && (
          <ZoomBar>
            <ZoomBtn onClick={zoomOut} title="Zoom out">−</ZoomBtn>
            <ZoomBtn onClick={zoomReset} title="100%" style={{ minWidth: 56 }}>
              {Math.round(zoom * 100)}%
            </ZoomBtn>
            <ZoomBtn onClick={zoomIn} title="Zoom in">+</ZoomBtn>
            <ZoomBtn onClick={zoomFit} title="Fit to window" style={{ fontSize: 10 }}>
              Fit
            </ZoomBtn>
          </ZoomBar>
        )}
      </Center>
    </Wrapper>
  );
}

export default MagazineViewer;
