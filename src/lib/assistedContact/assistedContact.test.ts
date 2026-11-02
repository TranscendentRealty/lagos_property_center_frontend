import { describe, expect, it } from 'vitest';
import { ActiveClock } from '@/hooks/useEstimatedActiveBrowsing';
import {
  addActiveTime, addListingView, claimHeldByOther, isBaseEligible, newSession, resolveSession, uiAllowsOffer, type UiGuards,
} from './eligibility';
import { buildRequest, emptyDraft, normalizePhone, safeRequestPath, validateContact, validatePreferences, validateRequestBody } from './validation';
import { EXPERIMENT_VERSION, THRESHOLDS, toBedrooms, toPropertyTypeId } from './config';

const A = 'a'.repeat(24), B = 'b'.repeat(24);
const KEY = '6feb96da-1778-4daa-a243-aacddce63a02';

// Drive the clock with an interaction every `every` ms for `duration` ms, ticking each second.
function run(clock: ActiveClock, start: number, duration: number, every = 10_000) {
  let credited = 0;
  for (let t = start; t <= start + duration; t += 1000) {
    if ((t - start) % every === 0) clock.interaction(t);
    clock.tick(t);
    credited += clock.take();
  }
  return credited;
}

describe('estimated active browsing', () => {
  it('credits continuous visible, focused, recent activity', () => {
    const clock = new ActiveClock();
    clock.setActive(true, 0);
    expect(run(clock, 0, 90_000)).toBe(90_000);
  });

  it('does not start just because the tab loaded', () => {
    const clock = new ActiveClock();
    clock.setActive(true, 0);
    for (let t = 0; t <= 30_000; t += 1000) clock.tick(t);
    expect(clock.take()).toBe(0);
  });

  it('stops 60 seconds after the last interaction and never credits the idle gap later', () => {
    const clock = new ActiveClock();
    clock.setActive(true, 0);
    clock.interaction(0);
    for (let t = 1000; t <= 200_000; t += 1000) clock.tick(t);
    expect(clock.take()).toBe(60_000);
    clock.interaction(200_000);
    clock.tick(201_000);
    expect(clock.take()).toBe(1000);
  });

  it('gains nothing while hidden or blurred and needs fresh activity after restore', () => {
    const clock = new ActiveClock();
    clock.setActive(true, 0);
    clock.interaction(0);
    clock.tick(1000);
    clock.setActive(false, 2000);
    for (let t = 3000; t <= 50_000; t += 1000) clock.tick(t);
    clock.setActive(true, 50_000);
    clock.tick(51_000);
    expect(clock.take()).toBe(2000);
  });

  it('discards a device-sleep gap', () => {
    const clock = new ActiveClock();
    clock.setActive(true, 0);
    clock.interaction(0);
    clock.tick(1000);
    clock.tick(40_000); // 39s timer gap
    clock.tick(41_000);
    expect(clock.take()).toBe(1000);
  });
});

describe('eligibility', () => {
  const now = 1_800_000_000_000;
  const base = () => newSession(now, 'id', 0.1);
  const ready = () => addActiveTime(addListingView(addListingView(base(), A), B), THRESHOLDS.activeMs);

  it('requires two distinct listings AND 90 seconds', () => {
    expect(isBaseEligible(addActiveTime(addListingView(addListingView(base(), A), B), 89_999), null, now)).toBe(false);
    expect(isBaseEligible(ready(), null, now)).toBe(true);
    expect(isBaseEligible(addActiveTime(addListingView(base(), A), 600_000), null, now)).toBe(false);
  });

  it('counts a repeat or invalid listing ID once', () => {
    const session = addListingView(addListingView(addListingView(base(), A), A), 'not-an-id');
    expect(session.propertyIds).toEqual([A]);
  });

  it('is suppressed by contact, a shown invitation or an active cooldown', () => {
    expect(isBaseEligible({ ...ready(), contactTaken: true }, null, now)).toBe(false);
    expect(isBaseEligible({ ...ready(), invitationShown: true }, null, now)).toBe(false);
    expect(isBaseEligible(ready(), { reason: 'dismissed', expiresAt: now + 1 }, now)).toBe(false);
    expect(isBaseEligible(ready(), { reason: 'dismissed', expiresAt: now - 1 }, now)).toBe(true);
  });

  it('assigns a stable variant and replaces corrupt, expired, foreign-version or future records', () => {
    const fresh = () => newSession(now, 'new', 0.9);
    const stored = ready();
    expect(resolveSession(stored, now + 1000, fresh)).toBe(stored);
    expect(resolveSession(stored, now + THRESHOLDS.sessionIdleMs + 1, fresh).id).toBe('new');
    expect(resolveSession({ ...stored, experimentVersion: 'old' }, now, fresh).id).toBe('new');
    expect(resolveSession({ ...stored, activeMs: 'x' }, now, fresh).id).toBe('new');
    expect(resolveSession('garbage', now, fresh).id).toBe('new');
    expect(resolveSession({ ...stored, lastActivityAt: now + 3_600_000 }, now, fresh).id).toBe('new');
    expect(newSession(now, 'x', 0.1).variant).toBe('treatment');
    expect(newSession(now, 'x', 0.7).variant).toBe('control');
    expect(stored.experimentVersion).toBe(EXPERIMENT_VERSION);
  });

  it('defers for editing, overlays, consent panel, open form and an inline offer', () => {
    const ok: UiGuards = { supportedRoute: true, visibleAndFocused: true, consentPanelOpen: false, formOpen: false, editing: false, overlayOpen: false, inlineOfferVisible: false };
    expect(uiAllowsOffer(ok)).toBe(true);
    for (const key of ['consentPanelOpen', 'formOpen', 'editing', 'overlayOpen', 'inlineOfferVisible'] as const) expect(uiAllowsOffer({ ...ok, [key]: true })).toBe(false);
    for (const key of ['supportedRoute', 'visibleAndFocused'] as const) expect(uiAllowsOffer({ ...ok, [key]: false })).toBe(false);
  });

  it('lets only one tab hold a fresh claim', () => {
    const claimed = { ...ready(), claim: { tab: 'one', at: now } };
    expect(claimHeldByOther(claimed, 'two', now + 1000)).toBe(true);
    expect(claimHeldByOther(claimed, 'one', now + 1000)).toBe(false);
    expect(claimHeldByOther(claimed, 'two', now + THRESHOLDS.claimTtlMs + 1)).toBe(false);
  });
});

describe('form validation', () => {
  it('accepts international and Nigerian local numbers without requiring a Nigerian number', () => {
    expect(normalizePhone('0801 234 5678')).toBe('+2348012345678');
    expect(normalizePhone('+44 20 7946 0958')).toBe('+442079460958');
    expect(normalizePhone('001 415 555 2671')).toBe('+14155552671');
    expect(normalizePhone('12345')).toBeNull();
  });

  it('requires exactly the relevant contact field', () => {
    expect(validateContact({ ...emptyDraft }).channel).toBeDefined();
    expect(validateContact({ ...emptyDraft, channel: 'email', contactValue: '+2348012345678' }).contactValue).toBeDefined();
    expect(validateContact({ ...emptyDraft, channel: 'email', contactValue: 'ada@example.com' })).toEqual({});
    expect(validateContact({ ...emptyDraft, channel: 'whatsapp', contactValue: '+2348012345678' })).toEqual({});
  });

  it('accepts uncertain answers and enforces area rules', () => {
    expect(validatePreferences({ ...emptyDraft, areas: ['not_sure'], timeframe: 'not_sure' })).toEqual({});
    expect(validatePreferences({ ...emptyDraft, areas: ['not_sure', 'Ikate'], timeframe: 'later' }).areas).toBeDefined();
    expect(validatePreferences({ ...emptyDraft, areas: ['Ikate', 'Chevron', 'Osapa', 'Idado'], timeframe: 'later' }).areas).toBeDefined();
    expect(validatePreferences({ ...emptyDraft, areas: ['other'], timeframe: 'later' }).otherArea).toBeDefined();
    expect(validatePreferences({ ...emptyDraft, areas: ['Atlantis'], timeframe: 'later' }).areas).toBeDefined();
  });

  it('builds a request with no budget, price or transaction type, and validates it strictly', () => {
    const draft = { ...emptyDraft, areas: ['Ikate'], timeframe: 'one_to_three_months' as const, channel: 'whatsapp' as const, contactValue: '0801 234 5678' };
    const request = JSON.parse(JSON.stringify({ ...buildRequest(draft, { entryPoint: 'listing', trigger: 'manual', pagePath: `/listing/${A}?x=1`,
      context: { source: 'listing', pathname: `/listing/${A}`, propertyId: A } }), idempotencyKey: KEY }));
    expect(request.contact.value).toBe('+2348012345678');
    expect(request.context.pagePath).toBe(`/listing/${A}`);
    expect(JSON.stringify(request)).not.toMatch(/budget|price|rent|transaction/i);
    expect(validateRequestBody(request).ok).toBe(true);
    for (const extra of [{ budget: { kind: 'band' } }, { transactionType: 'buy' }]) {
      expect(validateRequestBody({ ...request, preferences: { ...request.preferences, ...extra } }).ok).toBe(false);
    }
    expect(validateRequestBody({ ...request, surprise: 1 }).ok).toBe(false);
    expect(validateRequestBody({ ...request, context: { ...request.context, propertyIds: [A, A, A, A] } }).ok).toBe(false);
    expect(validateRequestBody({ ...request, idempotencyKey: 'nope' }).ok).toBe(false);
  });

  it('validates general enquiries', () => {
    const general = { schemaVersion: 1, requestType: 'general_contact', idempotencyKey: KEY, contact: { channel: 'email', value: 'ada@example.com' },
      message: 'Hello', context: { entryPoint: 'contact_page', pagePath: '/contact-us' }, permissions: { serviceRequestVersion: 'general_contact_v1', marketingOptIn: false }, website: '' };
    expect(validateRequestBody(general).ok).toBe(true);
    expect(validateRequestBody({ ...general, message: ' ' }).ok).toBe(false);
  });

  it('allowlists paths and maps context', () => {
    expect(safeRequestPath('/agent/123')).toBe('/other');
    expect(safeRequestPath('/explore/lekki?x=1')).toBe('/explore');
    expect(toPropertyTypeId('House', 'Semi-detached Duplex')).toBe('semi_detached');
    expect(toPropertyTypeId('fully detached')).toBe('fully_detached');
    expect(toBedrooms(6)).toBe('5+');
    expect(toBedrooms('0')).toBeUndefined();
  });
});
