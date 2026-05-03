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
  setBindingMode,
  setRemoteUrl,
  generateNativeKey,
  importNativeKey,
  clearNativeKey,
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

      {/* Binding mode + settings */}
      <BindingModeBox status={status} onChange={refresh} />

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

// ─── Binding-mode settings sub-panel ───────────────────────────────────

function BindingModeBox({
  status,
  onChange,
}: {
  status: BtmsStatus | null;
  onChange: () => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [remoteUrlDraft, setRemoteUrlDraft] = useState(status?.walletUrl ?? 'http://127.0.0.1:3321');
  const [importHex, setImportHex] = useState('');
  const [keyMsg, setKeyMsg] = useState<string | null>(null);

  if (!status) return null;

  const onModeToggle = (m: 'remote' | 'native') => {
    setBindingMode(m);
    onChange();
  };
  const onSaveRemote = () => {
    setRemoteUrl(remoteUrlDraft.trim());
    onChange();
  };
  const onGen = () => {
    const { identityAddress } = generateNativeKey();
    setKeyMsg(`Generated. Identity address: ${identityAddress}. Backup the key in settings.`);
    onChange();
    setTimeout(() => setKeyMsg(null), 8000);
  };
  const onImport = () => {
    if (!importHex.trim()) return;
    try {
      const { identityAddress } = importNativeKey(importHex);
      setKeyMsg(`Imported. Identity address: ${identityAddress}.`);
      setImportHex('');
      onChange();
    } catch (err) {
      setKeyMsg(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTimeout(() => setKeyMsg(null), 8000);
    }
  };
  const onClearKey = () => {
    if (!window.confirm('Clear native root key? Data stored under it will be inaccessible without a backup.')) return;
    clearNativeKey();
    onChange();
  };

  return (
    <div
      style={{
        background: status.walletReady ? 'rgba(80, 200, 120, 0.06)' : 'rgba(255, 200, 50, 0.08)',
        border: `1px solid ${status.walletReady ? 'rgba(80, 200, 120, 0.3)' : 'rgba(255, 200, 50, 0.3)'}`,
        borderRadius: 6,
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            BRC-100 wallet · {status.bindingMode === 'native' ? 'Native (in-browser)' : 'Remote (BRC-100 daemon)'}
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
            {status.walletReady
              ? `Ready · identity ${status.identityKey?.slice(0, 16)}…`
              : status.reason ?? 'Not connected'}
          </div>
        </div>
        <button onClick={() => setShowSettings((v) => !v)} style={tinyBtnStyle}>
          {showSettings ? 'Hide' : 'Settings'}
        </button>
      </div>

      {showSettings && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['remote', 'native'] as const).map((m) => (
              <button
                key={m}
                onClick={() => onModeToggle(m)}
                style={{
                  ...tinyBtnStyle,
                  flex: 1,
                  background: status.bindingMode === m ? '#3a7afe' : 'rgba(255,255,255,0.05)',
                }}
              >
                {m === 'remote' ? 'Remote (MetaNet Desktop)' : 'Native (in-browser, IndexedDB)'}
              </button>
            ))}
          </div>

          {status.bindingMode === 'remote' ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                value={remoteUrlDraft}
                onChange={(e) => setRemoteUrlDraft(e.target.value)}
                placeholder="http://127.0.0.1:3321"
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  color: '#fff',
                  padding: '5px 8px',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              />
              <button onClick={onSaveRemote} style={tinyBtnStyle}>Save</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, opacity: 0.7 }}>
                Native mode runs the BRC-100 wallet entirely in this browser tab via
                IndexedDB. No external daemon needed. Generate a new root key (random)
                or import an existing one (hex or WIF).
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={onGen} style={{ ...tinyBtnStyle, flex: 1, background: '#3a7afe' }}>
                  Generate new key
                </button>
                {status.hasNativeKey && (
                  <button onClick={onClearKey} style={{ ...tinyBtnStyle, color: '#ff9a9a', borderColor: 'rgba(255,100,100,0.4)' }}>
                    Clear key
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <input
                  value={importHex}
                  onChange={(e) => setImportHex(e.target.value)}
                  placeholder="Import hex or WIF…"
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    color: '#fff',
                    padding: '5px 8px',
                    fontSize: 11,
                    fontFamily: 'monospace',
                  }}
                />
                <button onClick={onImport} disabled={!importHex.trim()} style={tinyBtnStyle}>Import</button>
              </div>
              {keyMsg && (
                <div style={{ fontSize: 11, color: keyMsg.startsWith('Import failed') ? '#ffaaaa' : '#aaccff', wordBreak: 'break-all' }}>
                  {keyMsg}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const tinyBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#fff',
  padding: '4px 10px',
  borderRadius: 4,
  fontSize: 11,
  cursor: 'pointer',
  fontWeight: 600,
};
