'use client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/measurement';
import { publishContactActivity } from '@/lib/contactActivity';
import { ASSISTED_CONTACT_ENABLED, PROACTIVE_ENABLED } from '@/lib/assistedContact/config';
import { elapsedBand } from '@/lib/assistedContact/eligibility';
import { randomId } from '@/lib/assistedContact/storage';
import { buildRequest, emptyDraft } from '@/lib/assistedContact/validation';
import type { AssistedDraft, DraftField, EntryPoint, IntakeErrorCode, PageContext, SubmitState, Trigger } from '@/types/assistedContact';
import { useProactiveOffer } from './useProactiveOffer';
import AssistedContactOffer from './AssistedContactOffer';

// Form UI is only downloaded when someone asks for it; the launcher and the offer stay small.
const AssistedContactDrawer = dynamic(() => import('./AssistedContactDrawer'), { ssr: false });

type Origin = { entryPoint: EntryPoint; trigger: Trigger };
type Config = { intakeEnabled: boolean; proactiveEnabled: boolean };

interface AssistedContactApi {
  enabled: boolean;
  open: (origin: { entryPoint: EntryPoint; trigger?: Trigger }) => void;
  close: () => void;
  setPageContext: (context: PageContext | null) => void;
  recordListingView: (propertyId: string) => void;
  registerInlineOffer: () => () => void;
  // Form state, shared by the drawer and the dedicated page.
  draft: AssistedDraft;
  updateDraft: (patch: Partial<AssistedDraft>) => void;
  prefilledFrom: PageContext['source'] | null;
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
  submitState: SubmitState;
  submit: () => Promise<void>;
  finish: () => void;
  intakeAvailable: boolean;
  origin: Origin;
}

const AssistedContactContext = createContext<AssistedContactApi | null>(null);

export function useAssistedContact(): AssistedContactApi | null {
  return useContext(AssistedContactContext);
}

const contextFields: DraftField[] = ['areas', 'propertyType', 'bedrooms'];
const SUBMIT_TIMEOUT_MS = 20_000;

function collapseMobileNavbar() {
  // Use Bootstrap's own data API so its collapse state stays consistent.
  document.querySelector<HTMLButtonElement>('.navbar-toggler[aria-expanded="true"]')?.click();
}

export default function AssistedContactProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const [isOpen, setIsOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [origin, setOrigin] = useState<Origin>({ entryPoint: 'page', trigger: 'manual' });
  const [draft, setDraft] = useState<AssistedDraft>(emptyDraft);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const [prefilledFrom, setPrefilledFrom] = useState<PageContext['source'] | null>(null);
  const [inlineOfferCount, setInlineOfferCount] = useState(0);
  const [config, setConfig] = useState<Config>({ intakeEnabled: true, proactiveEnabled: false });
  const edited = useRef(new Set<DraftField>());
  const prefilled = useRef(new Set<DraftField>());
  const pageContext = useRef<PageContext | null>(null);
  const pending = useRef<{ key: string; snapshot: string } | null>(null);
  const reported = useRef(new Set<string>());
  const openedAt = useRef(0);

  useEffect(() => {
    if (!ASSISTED_CONTACT_ENABLED) return;
    fetch('/api/assisted-contact/config').then(r => r.ok ? r.json() : null)
      .then(body => { if (body && typeof body.intakeEnabled === 'boolean') setConfig(body); })
      .catch(() => undefined); // Keep defaults: proactive stays off when the switch can't be read.
  }, []);

  const proactive = useProactiveOffer({
    enabled: PROACTIVE_ENABLED && config.proactiveEnabled, pathname, formOpen: isOpen, inlineOfferCount,
  });
  const proactiveRef = useRef(proactive);
  proactiveRef.current = proactive;

  // Close the drawer when the route changes (e.g. the privacy link); the draft stays in memory.
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Prefill only fields the visitor hasn't edited, and only from context registered for this route.
  const applyContext = useCallback(() => {
    const context = pageContext.current?.pathname === pathname ? pageContext.current : null;
    setDraft(current => {
      const next = { ...current };
      const values: Partial<AssistedDraft> = {
        areas: context?.area ? [context.area] : [], propertyType: context?.propertyType || '', bedrooms: context?.bedrooms || '',
      };
      const applied = new Set<DraftField>();
      for (const field of contextFields) {
        if (edited.current.has(field)) continue;
        const value = values[field];
        const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
        if (hasValue) { Object.assign(next, { [field]: value }); applied.add(field); }
        else if (prefilled.current.has(field)) Object.assign(next, { [field]: emptyDraft[field] });
      }
      prefilled.current = applied;
      return next;
    });
    setPrefilledFrom(context && contextFields.some(field => !edited.current.has(field) && (
      field === 'areas' ? !!context.area : !!context[field as 'propertyType' | 'bedrooms'])) ? context.source : null);
  }, [pathname]);

  const open = useCallback((next: { entryPoint: EntryPoint; trigger?: Trigger }) => {
    const trigger = next.trigger || 'manual';
    if (next.entryPoint === 'navigation') collapseMobileNavbar();
    if (trigger === 'proactive') proactiveRef.current.accept();
    setOrigin({ entryPoint: next.entryPoint, trigger });
    if (submitState.status === 'success') { setSubmitState({ status: 'idle' }); setStep(1); }
    applyContext();
    openedAt.current = performance.now();
    setEverOpened(true);
    setIsOpen(true);
    trackEvent('assistance_open', { trigger, entry_point: next.entryPoint });
  }, [applyContext, submitState.status]);

  const close = useCallback(() => setIsOpen(false), []);

  const updateDraft = useCallback((patch: Partial<AssistedDraft>) => {
    for (const field of Object.keys(patch) as DraftField[]) { edited.current.add(field); prefilled.current.delete(field); }
    setDraft(current => ({ ...current, ...patch }));
    setSubmitState(state => state.status === 'error' && state.code !== 'intake_unavailable' ? { status: 'idle' } : state);
  }, []);

  const setPageContext = useCallback((context: PageContext | null) => { pageContext.current = context; }, []);

  const registerInlineOffer = useCallback(() => {
    setInlineOfferCount(count => count + 1);
    return () => setInlineOfferCount(count => Math.max(0, count - 1));
  }, []);

  const submit = useCallback(async () => {
    const context = pageContext.current?.pathname === pathname ? pageContext.current : undefined;
    const measurement = proactiveRef.current.measurement;
    const body = buildRequest(draft, { ...origin, pagePath: pathname, context, measurement });
    const snapshot = JSON.stringify(body);
    // Same snapshot after a timeout reuses its key; any deliberate change is a new submission.
    if (pending.current?.snapshot !== snapshot) pending.current = { key: randomId(), snapshot };
    const { key } = pending.current;
    setSubmitState({ status: 'submitting' });
    const fail = (code: IntakeErrorCode, extra: Partial<Extract<SubmitState, { status: 'error' }>> = {}) => {
      setSubmitState({ status: 'error', code, ...extra });
      trackEvent('assistance_submit_error', { error_code: code, trigger: origin.trigger, entry_point: origin.entryPoint });
    };
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
    try {
      const response = await fetch('/api/assisted-contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ ...body, idempotencyKey: key }),
      });
      const result = await response.json().catch(() => ({}));
      if ((response.status === 201 || response.status === 200) && typeof result.reference === 'string') {
        if (!reported.current.has(key)) {
          reported.current.add(key);
          trackEvent('assistance_submit_success', {
            trigger: origin.trigger, entry_point: origin.entryPoint, elapsed_band: elapsedBand(performance.now() - openedAt.current),
            ...(measurement ? { variant: measurement.variant, experiment_version: measurement.experimentVersion } : {}),
          });
        }
        pending.current = null;
        edited.current.clear(); prefilled.current.clear();
        setDraft(emptyDraft);
        setSubmitState({ status: 'success', reference: result.reference });
        proactiveRef.current.markSubmitted();
        publishContactActivity('shortlist_request');
        return;
      }
      const code = result?.error?.code as IntakeErrorCode | undefined;
      if (response.status === 409) { pending.current = null; return fail('idempotency_conflict'); }
      if (response.status === 422) return fail('validation_failed', { fields: result?.error?.fields });
      if (response.status === 429) return fail('rate_limited', { retryAfterSeconds: Number(response.headers.get('Retry-After')) || undefined });
      if (code === 'intake_unavailable') { setConfig(c => ({ ...c, intakeEnabled: false })); return fail('intake_unavailable'); }
      return fail(response.status === 413 ? 'payload_too_large' : 'service_error');
    } catch (error) {
      fail((error as Error)?.name === 'AbortError' ? 'timeout' : 'network');
    } finally {
      window.clearTimeout(timer);
    }
  }, [draft, origin, pathname]);

  // "Keep browsing" after success: the draft is already cleared.
  const finish = useCallback(() => { setIsOpen(false); setSubmitState({ status: 'idle' }); setStep(1); }, []);

  const recordListingView = proactive.recordListingView;
  const api = useMemo<AssistedContactApi>(() => ({
    enabled: ASSISTED_CONTACT_ENABLED, open, close, setPageContext, recordListingView, registerInlineOffer,
    draft, updateDraft, prefilledFrom, step, setStep, submitState, submit, finish, intakeAvailable: config.intakeEnabled, origin,
  }), [open, close, setPageContext, recordListingView, registerInlineOffer, draft, updateDraft, prefilledFrom, step, submitState, submit, finish, config.intakeEnabled, origin]);

  if (!ASSISTED_CONTACT_ENABLED) return <>{children}</>;
  return <AssistedContactContext.Provider value={api}>
    {children}
    {proactive.visible && !isOpen && <AssistedContactOffer variant="proactive"
      onAccept={() => open({ entryPoint: 'proactive', trigger: 'proactive' })} onDismiss={proactive.dismiss} />}
    {everOpened && pathname !== '/get-a-shortlist' && <AssistedContactDrawer show={isOpen} onHide={close} />}
  </AssistedContactContext.Provider>;


  // Always render: to visually test
  // return <AssistedContactContext.Provider value={api}>
  //   {children}
  //   {<AssistedContactOffer variant="proactive"
  //     onAccept={() => open({ entryPoint: 'proactive', trigger: 'proactive' })} onDismiss={proactive.dismiss} />}
  //   {everOpened && pathname !== '/get-a-shortlist' && <AssistedContactDrawer show={isOpen} onHide={close} />}
  // </AssistedContactContext.Provider>;
}
