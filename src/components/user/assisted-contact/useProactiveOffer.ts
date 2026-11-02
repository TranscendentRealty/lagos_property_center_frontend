'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CONSENT_EVENT, readConsent, trackEvent } from '@/lib/measurement';
import { onContactActivity } from '@/lib/contactActivity';
import { EXPERIMENT_VERSION, isBrowsingRoute, THRESHOLDS } from '@/lib/assistedContact/config';
import {
  addActiveTime, addListingView, claimHeldByOther, isBaseEligible, recordActivity, uiAllowsOffer, type EligibilitySession,
} from '@/lib/assistedContact/eligibility';
import {
  clearBehavioralState, coordinationAvailable, randomId, readSuppression, subscribe, updateSession, writeSuppression,
} from '@/lib/assistedContact/storage';
import { useEstimatedActiveBrowsing } from '@/hooks/useEstimatedActiveBrowsing';

const isEditable = (element: Element | null) => !!element && (element.matches('input, textarea, select') || (element as HTMLElement).isContentEditable);
const overlayOpen = () => document.body.classList.contains('modal-open')
  || !!document.querySelector('[aria-modal="true"], .offcanvas.show, .fullscreen-modal');

// Behavior-triggered invitation (Release B). Runs only when the proactive flag, the server kill switch,
// analytics consent (via readConsent) and cross-tab coordination all allow it. Manual/inline help never depends on it.
export function useProactiveOffer({ enabled, pathname, formOpen, inlineOfferCount }: {
  enabled: boolean; pathname: string; formOpen: boolean; inlineOfferCount: number;
}) {
  const [visible, setVisible] = useState(false);
  const [consented, setConsented] = useState(false);
  const [coordination, setCoordination] = useState(false);
  const tab = useRef('');
  const session = useRef<EligibilitySession | null>(null);
  const contactInPage = useRef(false); // Kept in memory even without consent; never persisted unconsented.
  const pendingMs = useRef(0);
  const lastCheckpoint = useRef(0);
  const lastEdit = useRef(-Infinity);
  const busy = useRef(false);
  const live = useRef({ pathname, formOpen, inlineOfferCount, visible });
  live.current = { pathname, formOpen, inlineOfferCount, visible };

  const running = enabled && consented && coordination;

  useEffect(() => {
    if (!enabled) return;
    tab.current = randomId();
    setCoordination(coordinationAvailable());
    let granted = !!readConsent()?.analytics;
    const sync = () => {
      const next = !!readConsent()?.analytics;
      // Withdrawal clears behavioral state; a fresh grant starts counters from zero.
      if (next !== granted) { clearBehavioralState(); session.current = null; pendingMs.current = 0; }
      if (!next) setVisible(false);
      granted = next;
      setConsented(next);
    };
    setConsented(granted);
    window.addEventListener(CONSENT_EVENT, sync);
    const onInput = () => { lastEdit.current = performance.now(); };
    document.addEventListener('input', onInput, true);
    return () => { window.removeEventListener(CONSENT_EVENT, sync); document.removeEventListener('input', onInput, true); };
  }, [enabled]);

  // A direct contact closes an unopened invitation immediately and suppresses offers for this session.
  useEffect(() => {
    if (!enabled) return;
    return onContactActivity(() => {
      contactInPage.current = true;
      setVisible(false);
      if (running) void updateSession(s => ({ session: { ...s, contactTaken: true }, result: null }));
    });
  }, [enabled, running]);

  useEffect(() => {
    if (!running) return;
    return subscribe(message => {
      if (message.type !== 'session') setVisible(false);
    });
  }, [running]);

  // Leaving browsing routes hides the panel without starting a cooldown; an inline offer takes precedence.
  useEffect(() => {
    if (visible && (!isBrowsingRoute(pathname) || inlineOfferCount > 0)) setVisible(false);
  }, [pathname, inlineOfferCount, visible]);

  const evaluate = useCallback(async () => {
    if (busy.current || live.current.visible) return;
    busy.current = true;
    try {
      const credit = pendingMs.current;
      pendingMs.current = 0;
      const now = performance.now();
      const guards = {
        supportedRoute: isBrowsingRoute(live.current.pathname),
        visibleAndFocused: document.visibilityState === 'visible' && document.hasFocus(),
        consentPanelOpen: !!document.querySelector('.consent-panel'),
        formOpen: live.current.formOpen,
        editing: isEditable(document.activeElement) || now - lastEdit.current < THRESHOLDS.editingQuietMs,
        overlayOpen: overlayOpen(),
        inlineOfferVisible: live.current.inlineOfferCount > 0,
      };
      const suppression = readSuppression();
      const outcome = await updateSession((current, wallNow) => {
        let next = addActiveTime(current, credit);
        if (credit > 0) next = recordActivity(next, wallNow);
        if (contactInPage.current && !next.contactTaken) next = { ...next, contactTaken: true };
        const eligible = isBaseEligible(next, suppression, wallNow);
        const emit = eligible && !next.eligibleEmitted;
        if (emit) next = { ...next, eligibleEmitted: true };
        // Claim inside the lock so two racing tabs cannot both win.
        const claim = eligible && next.variant === 'treatment' && uiAllowsOffer(guards) && !claimHeldByOther(next, tab.current, wallNow);
        if (claim) next = { ...next, claim: { tab: tab.current, at: wallNow } };
        return { session: next, result: { emit, claim, session: next } };
      });
      session.current = outcome.session;
      if (outcome.emit) trackEvent('assistance_eligible', { variant: outcome.session.variant, experiment_version: EXPERIMENT_VERSION });
      if (outcome.claim) setVisible(true);
    } catch { /* Coordination failed: stay silent; manual help is unaffected. */ } finally { busy.current = false; }
  }, []);

  useEstimatedActiveBrowsing(running && isBrowsingRoute(pathname), (credited, now) => {
    pendingMs.current += credited;
    if (now - lastCheckpoint.current >= THRESHOLDS.checkpointMs || pendingMs.current >= THRESHOLDS.checkpointMs) {
      lastCheckpoint.current = now;
      void evaluate();
    }
  });

  // Mark as shown only once the panel has actually rendered after a successful claim.
  useEffect(() => {
    if (!visible || !running) return;
    void updateSession(s => ({ session: { ...s, invitationShown: true, claim: undefined }, result: null }));
    trackEvent('assistance_offer_view', { trigger: 'proactive', variant: 'treatment', experiment_version: EXPERIMENT_VERSION });
  }, [visible, running]);

  const recordListingView = useCallback((propertyId: string) => {
    if (!running) return; // No cross-page view collection without analytics consent.
    void updateSession((s, now) => ({ session: recordActivity(addListingView(s, propertyId), now), result: null })).catch(() => undefined);
  }, [running]);

  const dismiss = useCallback((reason: 'close' | 'keep_browsing') => {
    setVisible(false);
    writeSuppression('dismissed');
    trackEvent('assistance_offer_dismiss', { trigger: 'proactive', reason, variant: 'treatment', experiment_version: EXPERIMENT_VERSION });
  }, []);

  const accept = useCallback(() => setVisible(false), []);

  const markSubmitted = useCallback(() => {
    setVisible(false);
    if (running) writeSuppression('submitted');
  }, [running]);

  const measurement = running && session.current ? {
    analyticsConsent: true as const, experimentVersion: EXPERIMENT_VERSION, variant: session.current.variant, eligibilitySessionId: session.current.id,
  } : undefined;

  return { visible: visible && running, dismiss, accept, markSubmitted, recordListingView, measurement };
}
