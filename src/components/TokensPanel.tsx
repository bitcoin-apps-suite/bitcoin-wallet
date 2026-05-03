// TokensPanel — fungible-token holdings and incoming offers via BTMS.
//
// Distinct from the existing OrdWallet (1Sat ordinals = unique assets).
// This view lists fungible tokens the user holds: $NPGX, $MARINA3D talent
// tokens, per-issue magazine tokens, per-film bMovies tokens, etc. Powered
// by @bsv/btms which itself binds to a BRC-100 wallet (default: MetaNet
// Desktop on 127.0.0.1:3321).

import React, { useCallback, useEffect, useState } from 'react';
import {
  btmsStatus,
  btmsListAssets,
  btmsGetBalance,
  btmsListIncoming,
  btmsAccept,
  btmsSend,
  btmsBurn,
  type BTMSAsset,
  type IncomingToken,
  type BtmsStatus,
} from '../services/Btms.service';

type AssetWithBalance = BTMSAsset & { balance?: number };

export function TokensPanel() {
  const [status, setStatus] = useState<BtmsStatus | null>(null);
  const [assets, setAssets] = useState<AssetWithBalance[]>([]);
  const [incoming, setIncoming] = useState<IncomingToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await btmsStatus();
      setStatus(s);
      if (!s.walletReady) {
        setAssets([]);
        setIncoming([]);
        return;
      }
      const list = await btmsListAssets();
      // Resolve balance per asset in parallel — limit concurrency to keep
      // the wallet daemon responsive.
      const withBalances: AssetWithBalance[] = await Promise.all(
        list.map(async (a) => {
          try {
            const balance = await btmsGetBalance(a.assetId);
            return { ...a, balance };
          } catch {
            return { ...a };
          }
        }),
      );
      setAssets(withBalances);
      try {
        setIncoming(await btmsListIncoming());
      } catch {
        setIncoming([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onAccept = useCallback(
    async (offer: IncomingToken) => {
      setActionMsg('Accepting offer…');
      try {
        await btmsAccept(offer);
        setActionMsg('Offer accepted.');
        void refresh();
      } catch (err) {
        setActionMsg(`Accept failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setTimeout(() => setActionMsg(null), 4000);
      }
    },
    [refresh],
  );

  const onSend = useCallback(
    async (asset: AssetWithBalance) => {
      const recipient = window.prompt(`Send ${asset.assetId.slice(0, 12)}… to which BSV identity key?`);
      if (!recipient) return;
      const amountStr = window.prompt(`Amount to send (you hold ${asset.balance ?? '?'})?`);
      const amount = Number(amountStr);
      if (!amount || amount <= 0) return;
      setActionMsg(`Sending ${amount} of ${asset.assetId.slice(0, 12)}…`);
      try {
        await btmsSend({ assetId: asset.assetId, recipient, amount });
        setActionMsg('Sent. Recipient must accept the incoming offer.');
        void refresh();
      } catch (err) {
        setActionMsg(`Send failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setTimeout(() => setActionMsg(null), 6000);
      }
    },
    [refresh],
  );

  const onBurn = useCallback(
    async (asset: AssetWithBalance) => {
      if (!window.confirm(`Burn ALL ${asset.balance ?? '?'} of ${asset.assetId.slice(0, 12)}…? This is irreversible.`)) {
        return;
      }
      setActionMsg('Burning…');
      try {
        await btmsBurn({ assetId: asset.assetId });
        setActionMsg('Burned.');
        void refresh();
      } catch (err) {
        setActionMsg(`Burn failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setTimeout(() => setActionMsg(null), 4000);
      }
    },
    [refresh],
  );

  return (
    <div style={panelStyle}>
      <header style={headerStyle}>
        <div>
          <div style={titleStyle}>Tokens</div>
          <div style={subtitleStyle}>
            Fungible tokens via BTMS · {status?.walletReady ? 'connected' : 'disconnected'}
          </div>
        </div>
        <button onClick={refresh} disabled={loading} style={refreshBtnStyle}>
          {loading ? '…' : '↻ Refresh'}
        </button>
      </header>

      {/* Wallet binding state */}
      {!status?.walletReady && (
        <div style={warnBoxStyle}>
          <div style={{ fontWeight: 700 }}>BRC-100 wallet not connected</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            BTMS needs a BRC-100 wallet daemon at <code>{status?.walletUrl ?? 'http://127.0.0.1:3321'}</code>.
            Easiest: run MetaNet Desktop and unlock it. Native binding (using bitcoin-wallet's own
            keys) is on the roadmap.
          </div>
          {status?.reason && (
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6, fontFamily: 'monospace' }}>
              {status.reason}
            </div>
          )}
        </div>
      )}

      {error && <div style={errBoxStyle}>{error}</div>}
      {actionMsg && <div style={infoBoxStyle}>{actionMsg}</div>}

      {/* Incoming offers */}
      {incoming.length > 0 && (
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>Incoming ({incoming.length})</div>
          {incoming.map((offer, i) => (
            <div key={`${offer.assetId}-${i}`} style={cardStyle}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={cardTitleStyle}>
                  {offer.amount} of {offer.assetId.slice(0, 16)}…
                </div>
                <div style={cardMetaStyle}>incoming offer</div>
              </div>
              <button onClick={() => onAccept(offer)} style={primaryBtnStyle}>
                Accept
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Asset holdings */}
      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>Holdings ({assets.length})</div>
        {assets.length === 0 && status?.walletReady && (
          <div style={emptyStyle}>No fungible tokens yet.</div>
        )}
        {assets.map((asset) => (
          <div key={asset.assetId} style={cardStyle}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={cardTitleStyle}>
                {(asset as { metadata?: { symbol?: string; name?: string } }).metadata?.symbol
                  ?? (asset as { metadata?: { name?: string } }).metadata?.name
                  ?? asset.assetId.slice(0, 16) + '…'}
              </div>
              <div style={cardMetaStyle}>
                Balance: <strong style={{ color: '#fff' }}>{asset.balance ?? '?'}</strong>
              </div>
              <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'monospace', marginTop: 2, wordBreak: 'break-all' }}>
                {asset.assetId}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onSend(asset)} style={smallBtnStyle}>Send</button>
              <button onClick={() => onBurn(asset)} style={burnBtnStyle}>Burn</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ─── styles ───
const panelStyle: React.CSSProperties = {
  width: '100%',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  background: '#0a0a0a',
  color: '#fff',
  minHeight: '100%',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: 1,
  textTransform: 'uppercase',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.65,
  marginTop: 2,
};

const refreshBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  color: '#fff',
  padding: '5px 10px',
  fontSize: 11,
  cursor: 'pointer',
  fontWeight: 600,
};

const warnBoxStyle: React.CSSProperties = {
  background: 'rgba(255, 200, 50, 0.08)',
  border: '1px solid rgba(255, 200, 50, 0.3)',
  borderRadius: 6,
  padding: 12,
};

const errBoxStyle: React.CSSProperties = {
  background: 'rgba(255, 80, 80, 0.1)',
  border: '1px solid rgba(255, 80, 80, 0.3)',
  borderRadius: 6,
  padding: 10,
  fontSize: 12,
  color: '#ffaaaa',
};

const infoBoxStyle: React.CSSProperties = {
  background: 'rgba(80, 150, 255, 0.1)',
  border: '1px solid rgba(80, 150, 255, 0.3)',
  borderRadius: 6,
  padding: 10,
  fontSize: 12,
  color: '#aaccff',
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 1,
  opacity: 0.65,
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 10,
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 6,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const cardMetaStyle: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.75,
  marginTop: 2,
};

const emptyStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.55,
  padding: 12,
  textAlign: 'center',
};

const primaryBtnStyle: React.CSSProperties = {
  background: '#3a7afe',
  border: 'none',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
};

const smallBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#fff',
  padding: '4px 10px',
  borderRadius: 4,
  fontSize: 11,
  cursor: 'pointer',
};

const burnBtnStyle: React.CSSProperties = {
  ...smallBtnStyle,
  borderColor: 'rgba(255, 100, 100, 0.4)',
  color: '#ff9a9a',
};

export default TokensPanel;
