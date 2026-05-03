// BTMS (Basic Token Management System) service for bitcoin-wallet.
//
// Wraps @bsv/btms to expose issue / send / accept / burn / query operations
// for fungible tokens. Lifted from bCorp Mint's main/btms.ts but adapted for
// browser context (no Electron IPC) — runs directly in the renderer.
//
// WALLET BINDING
// --------------
// BTMS needs a BRC-100 WalletInterface. v1 binds to a local BRC-100 wallet
// daemon via HTTPWalletJSON — the same pattern bCorp Mint uses. By default
// this is MetaNet Desktop on http://127.0.0.1:3321. If MetaNet isn't
// running, all BTMS calls throw a friendly error and the UI shows a
// "Connect a BRC-100 wallet" state.
//
// FUTURE: bitcoin-wallet should expose its OWN keys as a BRC-100 provider so
// users don't need MetaNet Desktop. That's a separate follow-up — for now
// this service ships the FEATURE, with one working binding.
//
// WHY BTMS MATTERS HERE
// ---------------------
// Every creator-content asset class in the b0ase portfolio has a fungible
// token side: $NPGX, $MARINA3D talent tokens, per-issue magazine tokens,
// per-film bMovies tokens, per-book bitcoin-writer tokens. Without BTMS the
// wallet can show an ordinal but can't show that the holder has 5% of
// $MARINA3D — and that's the bit that gates print rights, royalties, etc.

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
import { WalletClient, HTTPWalletJSON } from '@bsv/sdk';
import { MessageBoxClient } from '@bsv/message-box-client';

const DEFAULT_WALLET_URL = 'http://127.0.0.1:3321';
const DEFAULT_NETWORK_PRESET: 'local' | 'mainnet' | 'testnet' = 'mainnet';

let walletClientInstance: WalletClient | null = null;
let walletUrlInUse: string = DEFAULT_WALLET_URL;
let btmsInstance: BTMS | null = null;
let networkInUse: 'local' | 'mainnet' | 'testnet' = DEFAULT_NETWORK_PRESET;

function getWalletClient(): WalletClient {
  if (!walletClientInstance) {
    const substrate = new HTTPWalletJSON(walletUrlInUse);
    walletClientInstance = new WalletClient(substrate);
  }
  return walletClientInstance;
}

function getBtms(): BTMS {
  if (!btmsInstance) {
    const wallet = getWalletClient();
    const comms = new MessageBoxClient();
    btmsInstance = new BTMS({
      wallet,
      networkPreset: networkInUse,
      comms,
    });
  }
  return btmsInstance;
}

/** Configure the BRC-100 wallet endpoint (default: MetaNet Desktop). */
export function configureWallet(walletUrl: string, network?: 'local' | 'mainnet' | 'testnet'): void {
  if (walletUrl !== walletUrlInUse) {
    walletUrlInUse = walletUrl;
    walletClientInstance = null;
    btmsInstance = null;
  }
  if (network && network !== networkInUse) {
    networkInUse = network;
    btmsInstance = null;
  }
}

async function ensureAuthenticated(): Promise<void> {
  const wallet = getWalletClient();
  const { authenticated } = await wallet.isAuthenticated();
  if (!authenticated) {
    throw new Error(
      `BRC-100 wallet at ${walletUrlInUse} is not authenticated. Open MetaNet Desktop, unlock the wallet, then retry.`,
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────

export interface BtmsStatus {
  walletReady: boolean;
  walletUrl: string;
  networkPreset: string;
  identityKey: string | null;
  reason?: string;
}

export async function btmsStatus(): Promise<BtmsStatus> {
  try {
    const wallet = getWalletClient();
    const { authenticated } = await wallet.isAuthenticated();
    if (!authenticated) {
      return {
        walletReady: false,
        walletUrl: walletUrlInUse,
        networkPreset: networkInUse,
        identityKey: null,
        reason: 'BRC-100 wallet not authenticated',
      };
    }
    const { publicKey } = await wallet.getPublicKey({ identityKey: true });
    return {
      walletReady: true,
      walletUrl: walletUrlInUse,
      networkPreset: networkInUse,
      identityKey: publicKey,
    };
  } catch (err) {
    return {
      walletReady: false,
      walletUrl: walletUrlInUse,
      networkPreset: networkInUse,
      identityKey: null,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function btmsIssue(input: {
  amount: number;
  metadata?: BTMSAssetMetadata;
}): Promise<IssueResult> {
  await ensureAuthenticated();
  return getBtms().issue(input.amount, input.metadata);
}

export async function btmsListAssets(): Promise<BTMSAsset[]> {
  await ensureAuthenticated();
  return getBtms().listAssets();
}

export async function btmsGetBalance(assetId: string): Promise<number> {
  await ensureAuthenticated();
  return getBtms().getBalance(assetId);
}

export async function btmsSend(input: {
  assetId: string;
  recipient: string;
  amount: number;
}): Promise<SendResult> {
  await ensureAuthenticated();
  return getBtms().send(input.assetId, input.recipient, input.amount);
}

export async function btmsListIncoming(): Promise<IncomingToken[]> {
  await ensureAuthenticated();
  return getBtms().listIncoming();
}

export async function btmsAccept(payment: IncomingToken): Promise<AcceptResult> {
  await ensureAuthenticated();
  return getBtms().accept(payment);
}

export async function btmsBurn(input: {
  assetId: string;
  amount?: number;
}): Promise<BurnResult> {
  await ensureAuthenticated();
  return getBtms().burn(input.assetId, input.amount);
}

// Re-export types so consumers don't have to depend on @bsv/btms directly.
export type {
  BTMSAsset,
  BTMSAssetMetadata,
  IssueResult,
  SendResult,
  AcceptResult,
  BurnResult,
  IncomingToken,
};
