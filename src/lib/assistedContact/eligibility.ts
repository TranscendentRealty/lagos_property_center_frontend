// Pure eligibility/session transitions for the proactive shortlist offer.
// Every function takes its clock and randomness explicitly; nothing here touches React, storage or GA.
import type { Variant } from '@/types/assistedContact';
import { EXPERIMENT_VERSION, THRESHOLDS } from './config';

export interface EligibilitySession {
  v: 1;
  experimentVersion: string;
  id: string;
  lastActivityAt: number; // Wall-clock UTC ms; only used for session expiry.
  propertyIds: string[];
  activeMs: number;
  variant: Variant;
  eligibleEmitted: boolean;
  invitationShown: boolean;
  claim?: { tab: string; at: number };
  contactTaken: boolean;
}

export interface Suppression { reason: 'dismissed' | 'submitted'; expiresAt: number }

export interface UiGuards {
  supportedRoute: boolean;
  visibleAndFocused: boolean;
  consentPanelOpen: boolean;
  formOpen: boolean;
  editing: boolean;
  overlayOpen: boolean;
  inlineOfferVisible: boolean;
}

export function newSession(now: number, id: string, random: number): EligibilitySession {
  return {
    v: 1, experimentVersion: EXPERIMENT_VERSION, id, lastActivityAt: now, propertyIds: [], activeMs: 0,
    variant: random < 0.5 ? 'treatment' : 'control', eligibleEmitted: false, invitationShown: false, contactTaken: false,
  };
}

const isId = (value: unknown) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

// Corrupt, foreign-version or expired records are replaced, never repaired.
export function resolveSession(stored: unknown, now: number, makeNew: () => EligibilitySession): EligibilitySession {
  const s = stored as Partial<EligibilitySession> | null;
  const valid = !!s && typeof s === 'object' && s.v === 1 && s.experimentVersion === EXPERIMENT_VERSION
    && typeof s.id === 'string' && typeof s.lastActivityAt === 'number' && Number.isFinite(s.lastActivityAt)
    && Array.isArray(s.propertyIds) && s.propertyIds.length <= THRESHOLDS.maxPropertyIds && s.propertyIds.every(isId)
    && typeof s.activeMs === 'number' && Number.isFinite(s.activeMs) && s.activeMs >= 0
    && (s.variant === 'treatment' || s.variant === 'control')
    && typeof s.eligibleEmitted === 'boolean' && typeof s.invitationShown === 'boolean' && typeof s.contactTaken === 'boolean';
  // A record from the future (clock moved back) is also treated conservatively as a new session.
  if (!valid || s.lastActivityAt! > now + 60_000 || now - s.lastActivityAt! > THRESHOLDS.sessionIdleMs) return makeNew();
  return s as EligibilitySession;
}

export function recordActivity(session: EligibilitySession, now: number): EligibilitySession {
  return { ...session, lastActivityAt: Math.max(session.lastActivityAt, now) };
}

export function addListingView(session: EligibilitySession, propertyId: string): EligibilitySession {
  if (!isId(propertyId) || session.propertyIds.includes(propertyId)) return session;
  return { ...session, propertyIds: [...session.propertyIds, propertyId].slice(-THRESHOLDS.maxPropertyIds) };
}

export function addActiveTime(session: EligibilitySession, ms: number): EligibilitySession {
  if (!(ms > 0)) return session;
  return { ...session, activeMs: session.activeMs + ms };
}

export function suppressionActive(suppression: Suppression | null, now: number): boolean {
  return !!suppression && suppression.expiresAt > now;
}

// The experiment denominator: computed before the variant or any UI-safety decision.
export function isBaseEligible(session: EligibilitySession, suppression: Suppression | null, now: number): boolean {
  return session.propertyIds.length >= THRESHOLDS.distinctListings
    && session.activeMs >= THRESHOLDS.activeMs
    && !session.contactTaken
    && !session.invitationShown
    && !suppressionActive(suppression, now);
}

export function uiAllowsOffer(guards: UiGuards): boolean {
  return guards.supportedRoute && guards.visibleAndFocused && !guards.consentPanelOpen && !guards.formOpen
    && !guards.editing && !guards.overlayOpen && !guards.inlineOfferVisible;
}

export function claimHeldByOther(session: EligibilitySession, tab: string, now: number): boolean {
  return !!session.claim && session.claim.tab !== tab && now - session.claim.at < THRESHOLDS.claimTtlMs;
}

// Bounded, non-identifying band for how long a visitor spent in the form.
export function elapsedBand(ms: number): string {
  if (ms < 60_000) return 'lt_1m';
  if (ms < 180_000) return '1_3m';
  if (ms < 600_000) return '3_10m';
  return 'gt_10m';
}
