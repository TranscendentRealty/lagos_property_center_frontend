// First-party, bounded storage for proactive-offer eligibility, shared across tabs.
// Holds no contact data. Callers must only use it with analytics consent; without reliable
// coordination (storage + Web Locks + BroadcastChannel) the proactive offer is disabled entirely.
import { newSession, resolveSession, type EligibilitySession, type Suppression } from './eligibility';
import { THRESHOLDS } from './config';

const SESSION_KEY = 'tr-assist-session-v1';
const SUPPRESSION_KEY = 'tr-assist-suppress-v1';
const LOCK_NAME = 'tr-assist';
const CHANNEL_NAME = 'tr-assist';

export type CoordinationMessage = { type: 'session' | 'suppression' | 'contact' | 'withdraw' };

export function randomId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // RFC 4122 v4 fallback for older browsers in a non-secure context.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function coordinationAvailable(): boolean {
  try {
    if (!window.isSecureContext || !('locks' in navigator) || typeof BroadcastChannel === 'undefined') return false;
    localStorage.setItem('tr-assist-probe', '1');
    localStorage.removeItem('tr-assist-probe');
    return true;
  } catch { return false; }
}

function read(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Quota or blocked storage: state stays in memory. */ }
}

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (!channel && typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}
export function broadcast(message: CoordinationMessage) {
  try { getChannel()?.postMessage(message); } catch { /* Other tabs re-read on their next checkpoint. */ }
}
export function subscribe(listener: (message: CoordinationMessage) => void): () => void {
  const target = getChannel();
  if (!target) return () => undefined;
  const handler = (event: MessageEvent<CoordinationMessage>) => listener(event.data);
  target.addEventListener('message', handler);
  return () => target.removeEventListener('message', handler);
}

export function readSession(now = Date.now()): EligibilitySession {
  return resolveSession(read(SESSION_KEY), now, () => newSession(now, randomId(), Math.random()));
}

// Atomic read/merge/write: a late checkpoint in one tab can't erase another tab's dismissal or contact flag.
export async function updateSession<T>(mutate: (session: EligibilitySession, now: number) => { session: EligibilitySession; result: T }): Promise<T> {
  return navigator.locks.request(LOCK_NAME, async () => {
    const now = Date.now();
    const before = readSession(now);
    const { session, result } = mutate(before, now);
    write(SESSION_KEY, session);
    if (session !== before) broadcast({ type: 'session' });
    return result;
  });
}

export function readSuppression(): Suppression | null {
  const value = read(SUPPRESSION_KEY) as Suppression | null;
  if (!value || (value.reason !== 'dismissed' && value.reason !== 'submitted') || typeof value.expiresAt !== 'number') return null;
  // Ignore an expiry further out than the cooldown allows (corrupt record or clock change).
  return value.expiresAt - Date.now() > THRESHOLDS.cooldownMs ? null : value;
}

export function writeSuppression(reason: Suppression['reason']) {
  write(SUPPRESSION_KEY, { reason, expiresAt: Date.now() + THRESHOLDS.cooldownMs } satisfies Suppression);
  broadcast({ type: 'suppression' });
}

// Consent withdrawal: drop browsing and experiment records immediately.
export function clearBehavioralState() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* Nothing stored. */ }
  broadcast({ type: 'withdraw' });
}
