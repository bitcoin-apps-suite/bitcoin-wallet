// BTMS (Basic Token Management System) service for bitcoin-wallet.
//
// Wraps @bsv/btms to expose issue / send / accept / burn / query operations
// for fungible tokens. Two binding modes for the underlying BRC-100 wallet:
//
//   1. 'remote' (default) — HTTPWalletJSON pointing at a BRC-100 daemon
//      such as MetaNet Desktop on http://127.0.0.1:3321. User runs the
//      daemon separately. Same pattern bCorp Mint uses.
//
//   2. 'native' — fully in-browser BRC-100 wallet via
//      SetupClient.createWalletIdb() from @bsv/wallet-toolbox-client.
//      Stores tx data in IndexedDB; uses the user's local key. No
//      external daemon required. This is the eventual default for the
//      bitcoin-wallet product because it removes the MetaNet dependency.
//
// Mode + native key are persisted in localStorage so the choice survives
// reloads. Native rootKeyHex is generated on first init OR imported by
// the user — it should eventually be derived from bitcoin-wallet's main
// keystore so users have ONE key not two.

import { BTMS } from '@bsv/btms';
import type {
  BTMSAsset,
  BTMSAssetMetadata,
  IssueResult,
  SendResult,
  AcceptResult,
  BurnResult,
  IncomingToken,
} from '@bsv/btms';
import {
  WalletClient,
  HTTPWalletJSON,
  type WalletInterface,
  PrivateKey,
} from '@bsv/sdk';
import { MessageBoxClient } from '@bsv/message-box-client';
import { SetupClient } from '@bsv/wallet-toolbox-client';

const DEFAULT_REMOTE_URL = 'http://127.0.0.1:3321';
const DEFAULT_NETWORK_PRESET: 'local' | 'mainnet' | 'testnet' = 'mainnet';
const NATIVE_DB_NAME = 'bitcoin-wallet-brc100';

const LS_MODE = 'bw.btms.mode';
const LS_REMOTE_URL = 'bw.btms.remoteUrl';
const LS_NATIVE_KEY = 'bw.btms.nativeKeyHex';
const LS_NETWORK = 'bw.btms.network';

export type BindingMode = 'remote' | 'native';

let mode: BindingMode = (localStorage.getItem(LS_MODE) as BindingMode) || 'remote';
let remoteUrl: string = localStorage.getItem(LS_REMOTE_URL) || DEFAULT_REMOTE_URL;
let network: 'local' | 'mainnet' | 'testnet' =
  (localStorage.getItem(LS_NETWORK) as 'local' | 'mainnet' | 'testnet') || DEFAULT_NETWORK_PRESET;
let nativeKeyHex: string | null = localStorage.getItem(LS_NATIVE_KEY);

let walletInstance: WalletInterface | null = null;
let btmsInstance: BTMS | null = null;
let initPromise: Promise<WalletInterface> | null = null;

function persist() {
  localStorage.setItem(LS_MODE, mode);
  localStorage.setItem(LS_REMOTE_URL, remoteUrl);
  localStorage.setItem(LS_NETWORK, network);
  if (nativeKeyHex) localStorage.setItem(LS_NATIVE_KEY, nativeKeyHex);
}

function reset() {
  walletInstance = null;
  btmsInstance = null;
  initPromise = null;
}

async function buildRemote(): Promise<WalletInterface> {
  const substrate = new HTTPWalletJSON(remoteUrl);
  return new WalletClient(substrate);
}

async function buildNative(): Promise<WalletInterface> {
  if (!nativeKeyHex) {
    throw new Error('Native BRC-100 wallet not initialised — generate or import a root key first.');
  }
  const setup = await SetupClient.createWalletIdb({
    chain: network === 'testnet' ? 'test' : 'main',
    rootKeyHex: nativeKeyHex,
    databaseName: NATIVE_DB_NAME,
  });
  // The toolbox's Wallet implements WalletInterface but TS sees a slightly
  // different nested @bsv/sdk type. Behaviourally identical; cast through
  // unknown to bridge the duplicate type identity.
  return setup.wallet as unknown as WalletInterface;
}

async function getWallet(): Promise<WalletInterface> {
  if (walletInstance) return walletInstance;
  if (initPromise) return initPromise;
  initPromise = (mode === 'native' ? buildNative() : buildRemote())
    .then((w) => {
      walletInstance = w;
      return w;
    })
    .finally(() => {
      initPromise = null;
    });
  return initPromise;
}

async function getBtms(): Promise<BTMS> {
  if (btmsInstance) return btmsInstance;
  const wallet = await getWallet();
  const comms = new MessageBoxClient();
  btmsInstance = new BTMS({
    // Cross-package WalletInterface identity differs by nested @bsv/sdk
    // version — same shape, different type id. Cast at this boundary.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallet: wallet as any,
    networkPreset: network,
    comms,
  });
  return btmsInstance;
}

// ─── Configuration ────────────────────────────────────────────────────

export function getBindingMode(): BindingMode {
  return mode;
}

export function getRemoteUrl(): string {
  return remoteUrl;
}

export function hasNativeKey(): boolean {
  return !!nativeKeyHex;
}

export function setBindingMode(next: BindingMode): void {
  if (mode === next) return;
  mode = next;
  persist();
  reset();
}

export function setRemoteUrl(url: string): void {
  remoteUrl = url || DEFAULT_REMOTE_URL;
  persist();
  if (mode === 'remote') reset();
}

export function setNetwork(net: 'local' | 'mainnet' | 'testnet'): void {
  if (network === net) return;
  network = net;
  persist();
  reset();
}

/** Generate a fresh BRC-100 root key and persist it locally. */
export function generateNativeKey(): { rootKeyHex: string; identityAddress: string } {
  const pk = PrivateKey.fromRandom();
  const hex = pk.toString();
  const address = pk.toPublicKey().toAddress();
  nativeKeyHex = hex;
  persist();
  if (mode === 'native') reset();
  return { rootKeyHex: hex, identityAddress: String(address) };
}

/** Import an existing root key from hex or WIF. */
export function importNativeKey(input: string): { rootKeyHex: string; identityAddress: string } {
  const trimmed = input.trim();
  let pk: PrivateKey;
  // Try WIF first; fall back to hex.
  try {
    pk = PrivateKey.fromWif(trimmed);
  } catch {
    pk = new PrivateKey(trimmed, 'hex');
  }
  const hex = pk.toString();
  const address = pk.toPublicKey().toAddress();
  nativeKeyHex = hex;
  persist();
  if (mode === 'native') reset();
  return { rootKeyHex: hex, identityAddress: String(address) };
}

export function clearNativeKey(): void {
  nativeKeyHex = null;
  localStorage.removeItem(LS_NATIVE_KEY);
  if (mode === 'native') reset();
}

// ─── Status + operations ──────────────────────────────────────────────

export interface BtmsStatus {
  walletReady: boolean;
  bindingMode: BindingMode;
  walletUrl: string | null; // null in native mode
  networkPreset: 'local' | 'mainnet' | 'testnet';
  identityKey: string | null;
  hasNativeKey: boolean;
  reason?: string;
}

export async function btmsStatus(): Promise<BtmsStatus> {
  const base = {
    bindingMode: mode,
    walletUrl: mode === 'remote' ? remoteUrl : null,
    networkPreset: network,
    hasNativeKey: !!nativeKeyHex,
  };
  if (mode === 'native' && !nativeKeyHex) {
    return {
      ...base,
      walletReady: false,
      identityKey: null,
      reason: 'No native root key — generate or import one in settings.',
    };
  }
  try {
    const wallet = await getWallet();
    const { authenticated } = await wallet.isAuthenticated({});
    if (!authenticated) {
      return {
        ...base,
        walletReady: false,
        identityKey: null,
        reason:
          mode === 'remote'
            ? `BRC-100 wallet at ${remoteUrl} not authenticated`
            : 'Native wallet not authenticated',
      };
    }
    const { publicKey } = await wallet.getPublicKey({ identityKey: true });
    return {
      ...base,
      walletReady: true,
      identityKey: publicKey,
    };
  } catch (err) {
    return {
      ...base,
      walletReady: false,
      identityKey: null,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

async function ensureAuth(): Promise<void> {
  const wallet = await getWallet();
  const { authenticated } = await wallet.isAuthenticated({});
  if (!authenticated) {
    throw new Error(
      mode === 'remote'
        ? `BRC-100 wallet at ${remoteUrl} is not authenticated. Open MetaNet Desktop, unlock the wallet, then retry.`
        : 'Native BRC-100 wallet not authenticated.',
    );
  }
}

export async function btmsIssue(input: { amount: number; metadata?: BTMSAssetMetadata }): Promise<IssueResult> {
  await ensureAuth();
  return (await getBtms()).issue(input.amount, input.metadata);
}

export async function btmsListAssets(): Promise<BTMSAsset[]> {
  await ensureAuth();
  return (await getBtms()).listAssets();
}

export async function btmsGetBalance(assetId: string): Promise<number> {
  await ensureAuth();
  return (await getBtms()).getBalance(assetId);
}

export async function btmsSend(input: { assetId: string; recipient: string; amount: number }): Promise<SendResult> {
  await ensureAuth();
  return (await getBtms()).send(input.assetId, input.recipient, input.amount);
}

export async function btmsListIncoming(): Promise<IncomingToken[]> {
  await ensureAuth();
  return (await getBtms()).listIncoming();
}

export async function btmsAccept(payment: IncomingToken): Promise<AcceptResult> {
  await ensureAuth();
  return (await getBtms()).accept(payment);
}

export async function btmsBurn(input: { assetId: string; amount?: number }): Promise<BurnResult> {
  await ensureAuth();
  return (await getBtms()).burn(input.assetId, input.amount);
}

// Re-export so consumers don't depend on @bsv/btms directly.
export type {
  BTMSAsset,
  BTMSAssetMetadata,
  IssueResult,
  SendResult,
  AcceptResult,
  BurnResult,
  IncomingToken,
};
