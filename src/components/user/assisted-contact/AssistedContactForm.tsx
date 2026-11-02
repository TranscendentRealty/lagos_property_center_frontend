'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { availableLocations } from '@/exports/constants';
import { contactNumber, whatsappLink } from '@/lib/contact';
import { trackContact, trackEvent } from '@/lib/measurement';
import {
  bedroomOptions, contactWindowOptions, LIMITS, MAX_AREAS, propertyTypeOptions, SERVICE_REQUEST_TEXT, timeframeOptions, viewingOptions,
} from '@/lib/assistedContact/config';
import { FieldErrors, normalizePhone, stepFields, validateContact, validatePreferences } from '@/lib/assistedContact/validation';
import { AREA_NOT_SURE, AREA_OTHER, type AssistedDraft, type ContactChannel, type DraftField } from '@/types/assistedContact';
import { useAssistedContact } from './AssistedContactProvider';

const fieldLabels: Partial<Record<DraftField, string>> = {
  areas: 'Preferred area', otherArea: 'Other area', timeframe: 'Timeframe', channel: 'How to reach you',
  contactValue: 'Contact details', firstName: 'First name', timezoneNote: 'Time zone', note: 'Note',
};
const channelOptions: { value: ContactChannel; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' }, { value: 'call', label: 'Phone call' }, { value: 'email', label: 'Email' },
];
const serverErrorText: Record<string, string> = {
  network: 'We couldn’t reach our server. Check your connection and try again; your answers are still here.',
  timeout: 'This is taking longer than expected. Try again: we’ll only record your request once.',
  rate_limited: 'Too many attempts in a short time. Please wait a few minutes and try again, or contact us directly.',
  service_error: 'Something went wrong on our side. Please try again, or contact us directly.',
  payload_too_large: 'Your request is too long. Please shorten your note and try again.',
  idempotency_conflict: 'Your answers changed while we were sending them. Please submit again.',
  validation_failed: 'Please check the highlighted answers.',
};

const id = (field: string) => `assist-${field}`;
const errorId = (field: string) => `assist-${field}-error`;

function FieldError({ field, errors }: { field: string; errors: FieldErrors }) {
  return errors[field] ? <div id={errorId(field)} className="invalid-feedback d-block">{errors[field]}</div> : null;
}

// Direct alternatives offered on failure. Opening WhatsApp only opens a draft; the site can't confirm it was sent.
function DirectContactOptions() {
  const whatsapp = whatsappLink(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, 'Hello! I tried to request a property shortlist on your website. Could we discuss what I’m looking for?');
  const call = contactNumber(process.env.NEXT_PUBLIC_CALL_NUMBER);
  if (!whatsapp && !call) return null;
  return <div className="d-flex flex-wrap gap-2 mt-2">
    {whatsapp && <a className="btn btn-success btn-sm" href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => trackContact('whatsapp', 'assist')}>
      Open a draft WhatsApp message</a>}
    {call && <a className="btn btn-outline-dark btn-sm" href={`tel:+${call}`} onClick={() => trackContact('call', 'assist')}>Call the agent</a>}
  </div>;
}

export default function AssistedContactForm({ mode }: { mode: 'drawer' | 'page' }) {
  const assist = useAssistedContact();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState<Record<1 | 2, boolean>>({ 1: false, 2: false });
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const step = assist?.step ?? 1;

  // Move focus to the new step's heading, but not when the form first appears.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus();
  }, [step]);

  // Server-side field errors land on step 2 or step 1 as appropriate.
  const submitState = assist?.submitState;
  useEffect(() => {
    if (submitState?.status !== 'error' || submitState.code !== 'validation_failed') return;
    const fields = submitState.fields || {};
    const next: FieldErrors = {};
    for (const key of Object.keys(fields)) next[key] = 'Please check this answer.';
    setErrors(next);
    if (stepFields[1].some(field => field in fields)) assist?.setStep(1);
    requestAnimationFrame(() => summaryRef.current?.focus());
  }, [submitState, assist]);

  useEffect(() => { if (submitState?.status === 'success') successRef.current?.focus(); }, [submitState?.status]);

  if (!assist) return null;
  const { draft, updateDraft, prefilledFrom, setStep, submit, finish, intakeAvailable } = assist;

  if (submitState?.status === 'success') {
    return <div className="assist-success" role="status">
      <h3 className="h5" tabIndex={-1} ref={successRef}>Request received</h3>
      <p>Your shortlist request has been received. Bukunmi will review your preferences and contact you through your chosen channel.</p>
      <p className="small text-muted">Your request reference: <strong>{submitState.reference}</strong></p>
      {mode === 'drawer'
        ? <button type="button" className="btn btn-dark" onClick={finish}>Keep browsing</button>
        : <Link href="/search" className="btn btn-dark" onClick={finish}>Keep browsing</Link>}
    </div>;
  }

  if (!intakeAvailable) {
    return <div role="status">
      <p>Online shortlist requests are unavailable right now. You can still reach Bukunmi directly.</p>
      <DirectContactOptions />
    </div>;
  }

  const recheck = (next: AssistedDraft) => {
    if (!attempted[step]) return;
    setErrors(step === 1 ? validatePreferences(next) : validateContact(next));
  };
  const change = (patch: Partial<AssistedDraft>) => {
    updateDraft(patch);
    recheck({ ...draft, ...patch });
  };

  function toggleArea(area: string, checked: boolean) {
    let areas = draft.areas.filter(item => item !== area);
    if (checked) areas = area === AREA_NOT_SURE ? [AREA_NOT_SURE] : [...areas.filter(item => item !== AREA_NOT_SURE), area];
    change({ areas, ...(area === AREA_OTHER && !checked ? { otherArea: '' } : {}) });
  }

  function showErrors(found: FieldErrors, forStep: 1 | 2) {
    setErrors(found);
    setAttempted(current => ({ ...current, [forStep]: true }));
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  function next(event: FormEvent) {
    event.preventDefault();
    const found = validatePreferences(draft);
    if (Object.keys(found).length) return showErrors(found, 1);
    setErrors({});
    trackEvent('assistance_step_complete', { step: 1, trigger: assist!.origin.trigger });
    setStep(2);
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const found = validateContact(draft);
    if (Object.keys(found).length) return showErrors(found, 2);
    setErrors({});
    trackEvent('assistance_step_complete', { step: 2, trigger: assist!.origin.trigger });
    await submit();
  }

  const summary = Object.entries(errors).filter(([, message]) => message);
  const submitting = submitState?.status === 'submitting';
  const failure = submitState?.status === 'error' ? submitState : null;
  const normalized = draft.channel && draft.channel !== 'email' ? normalizePhone(draft.contactValue) : null;
  const invalid = (field: string) => errors[field] ? { 'aria-invalid': true, 'aria-describedby': errorId(field) } : {};

  return <form className="assist-form" noValidate onSubmit={step === 1 ? next : send} aria-describedby="assist-step-note">
    <p id="assist-step-note" className="small text-muted mb-1">Step {step} of 2</p>
    {prefilledFrom && step === 1 && <p className="assist-context-label small">Based on your current {prefilledFrom === 'listing' ? 'property' : 'search'}. Change anything you like.</p>}

    {summary.length > 0 && <div ref={summaryRef} tabIndex={-1} role="alert" className="alert alert-danger py-2">
      <p className="fw-semibold mb-1">Please check {summary.length === 1 ? 'this answer' : 'these answers'}:</p>
      <ul className="mb-0 ps-3">{summary.map(([field, message]) => <li key={field}>
        <a href={`#${id(field)}`} className="alert-link">{fieldLabels[field as DraftField] || 'Answer'}</a>: {message}
      </li>)}</ul>
    </div>}

    {/* Honeypot: hidden from people and assistive technology. */}
    <div className="assist-hp" aria-hidden="true">
      <label htmlFor={id('website')}>Website</label>
      <input id={id('website')} name="website" type="text" tabIndex={-1} autoComplete="off" value={draft.website}
        onChange={e => updateDraft({ website: e.target.value })} />
    </div>

    {step === 1 ? <>
      <h3 ref={headingRef} tabIndex={-1} className="h5 mt-2">What are you looking for?</h3>

      <fieldset className="mb-3" id={id('areas')} {...invalid('areas')}>
        <legend className="form-label fs-6 fw-semibold mb-1">Preferred area <span className="fw-normal text-muted">(up to {MAX_AREAS})</span></legend>
        <div className="assist-area-grid">
          {[...availableLocations, AREA_OTHER, AREA_NOT_SURE].map(area => {
            const checked = draft.areas.includes(area);
            const full = !checked && draft.areas.filter(item => item !== AREA_NOT_SURE).length >= MAX_AREAS && area !== AREA_NOT_SURE;
            return <div className="form-check" key={area}>
              <input className="form-check-input" type="checkbox" id={id(`area-${area}`)} checked={checked} disabled={full}
                onChange={e => toggleArea(area, e.target.checked)} />
              <label className="form-check-label" htmlFor={id(`area-${area}`)}>
                {area === AREA_OTHER ? 'Other area' : area === AREA_NOT_SURE ? 'Not sure yet' : area}
              </label>
            </div>;
          })}
        </div>
        <FieldError field="areas" errors={errors} />
      </fieldset>

      {draft.areas.includes(AREA_OTHER) && <div className="mb-3">
        <label className="form-label" htmlFor={id('otherArea')}>Which other area?</label>
        <input className={`form-control ${errors.otherArea ? 'is-invalid' : ''}`} id={id('otherArea')} maxLength={LIMITS.otherArea}
          value={draft.otherArea} onChange={e => change({ otherArea: e.target.value })} {...invalid('otherArea')} />
        <FieldError field="otherArea" errors={errors} />
      </div>}

      <fieldset className="mb-3" id={id('timeframe')} {...invalid('timeframe')}>
        <legend className="form-label fs-6 fw-semibold mb-1">When are you hoping to buy?</legend>
        {timeframeOptions.map(option => <div className="form-check" key={option.value}>
          <input className="form-check-input" type="radio" name="assist-timeframe" id={id(`timeframe-${option.value}`)}
            checked={draft.timeframe === option.value} onChange={() => change({ timeframe: option.value })} />
          <label className="form-check-label" htmlFor={id(`timeframe-${option.value}`)}>{option.label}</label>
        </div>)}
        <FieldError field="timeframe" errors={errors} />
      </fieldset>

      <div className="row g-2 mb-3">
        <div className="col-sm-7">
          <label className="form-label" htmlFor={id('propertyType')}>Property type <span className="text-muted">(optional)</span></label>
          <select className="form-select" id={id('propertyType')} value={draft.propertyType}
            onChange={e => change({ propertyType: e.target.value as AssistedDraft['propertyType'] })}>
            <option value="">Any type</option>
            {propertyTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="col-sm-5">
          <label className="form-label" htmlFor={id('bedrooms')}>Bedrooms <span className="text-muted">(optional)</span></label>
          <select className="form-select" id={id('bedrooms')} value={draft.bedrooms}
            onChange={e => change({ bedrooms: e.target.value as AssistedDraft['bedrooms'] })}>
            <option value="">Any</option>
            {bedroomOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2">
        <button type="submit" className="btn btn-dark">Next</button>
        {mode === 'drawer' && <button type="button" className="btn btn-outline-dark" onClick={assist.close}>Keep browsing</button>}
      </div>
    </> : <>
      <h3 ref={headingRef} tabIndex={-1} className="h5 mt-2">How should Bukunmi reach you?</h3>

      <fieldset className="mb-3" id={id('channel')} {...invalid('channel')}>
        <legend className="form-label fs-6 fw-semibold mb-1">Preferred channel</legend>
        <div className="d-flex flex-wrap gap-3">
          {channelOptions.map(option => <div className="form-check" key={option.value}>
            <input className="form-check-input" type="radio" name="assist-channel" id={id(`channel-${option.value}`)}
              checked={draft.channel === option.value}
              // Switching between phone and email clears the now-unused value.
              onChange={() => change({ channel: option.value, ...((option.value === 'email') !== (draft.channel === 'email') ? { contactValue: '' } : {}) })} />
            <label className="form-check-label" htmlFor={id(`channel-${option.value}`)}>{option.label}</label>
          </div>)}
        </div>
        <FieldError field="channel" errors={errors} />
      </fieldset>

      {draft.channel && <div className="mb-3">
        <label className="form-label" htmlFor={id('contactValue')}>
          {draft.channel === 'email' ? 'Email address' : draft.channel === 'whatsapp' ? 'WhatsApp number' : 'Phone number'}
        </label>
        <input className={`form-control ${errors.contactValue ? 'is-invalid' : ''}`} id={id('contactValue')}
          type={draft.channel === 'email' ? 'email' : 'tel'} autoComplete={draft.channel === 'email' ? 'email' : 'tel'}
          inputMode={draft.channel === 'email' ? 'email' : 'tel'} maxLength={draft.channel === 'email' ? LIMITS.email : 24}
          value={draft.contactValue} onChange={e => change({ contactValue: e.target.value })} {...invalid('contactValue')} />
        {draft.channel !== 'email' && <div className="form-text">
          {normalized ? <>We’ll use <strong>{normalized}</strong>.</> : 'Include your country code if you’re outside Nigeria.'}
        </div>}
        <FieldError field="contactValue" errors={errors} />
      </div>}

      <div className="mb-3">
        <label className="form-label" htmlFor={id('firstName')}>First name <span className="text-muted">(optional)</span></label>
        <input className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} id={id('firstName')} autoComplete="given-name"
          maxLength={LIMITS.firstName} value={draft.firstName} onChange={e => change({ firstName: e.target.value })} {...invalid('firstName')} />
        <FieldError field="firstName" errors={errors} />
      </div>

      <fieldset className="mb-3">
        <legend className="form-label fs-6 fw-semibold mb-1">Viewing preference <span className="fw-normal text-muted">(optional)</span></legend>
        <div className="d-flex flex-wrap gap-3">
          {viewingOptions.map(option => <div className="form-check" key={option.value}>
            <input className="form-check-input" type="radio" name="assist-viewing" id={id(`viewing-${option.value}`)}
              checked={draft.viewingPreference === option.value} onChange={() => change({ viewingPreference: option.value })} />
            <label className="form-check-label" htmlFor={id(`viewing-${option.value}`)}>{option.label}</label>
          </div>)}
        </div>
      </fieldset>

      <div className="row g-2 mb-3">
        <div className="col-sm-7">
          <label className="form-label" htmlFor={id('contactWindow')}>Best time to reach you <span className="text-muted">(optional)</span></label>
          <select className="form-select" id={id('contactWindow')} value={draft.contactWindow}
            onChange={e => change({ contactWindow: e.target.value as AssistedDraft['contactWindow'] })}>
            <option value="">No preference</option>
            {contactWindowOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="col-sm-5">
          <label className="form-label" htmlFor={id('timezoneNote')}>Your time zone <span className="text-muted">(if outside Nigeria)</span></label>
          <input className={`form-control ${errors.timezoneNote ? 'is-invalid' : ''}`} id={id('timezoneNote')} maxLength={LIMITS.timezoneNote}
            placeholder="e.g. London" value={draft.timezoneNote} onChange={e => change({ timezoneNote: e.target.value })} {...invalid('timezoneNote')} />
          <FieldError field="timezoneNote" errors={errors} />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor={id('note')}>Anything else Bukunmi should know? <span className="text-muted">(optional)</span></label>
        <textarea className={`form-control ${errors.note ? 'is-invalid' : ''}`} id={id('note')} rows={3} maxLength={LIMITS.note}
          value={draft.note} onChange={e => change({ note: e.target.value })} aria-describedby={`${id('note')}-count${errors.note ? ` ${errorId('note')}` : ''}`} />
        <div id={`${id('note')}-count`} className="form-text">{draft.note.length}/{LIMITS.note} characters</div>
        <FieldError field="note" errors={errors} />
      </div>

      <p className="small assist-service-text">{SERVICE_REQUEST_TEXT} <Link href="/privacy-policy">Privacy notice</Link>.</p>

      {failure && failure.code !== 'validation_failed' && <div role="alert" className="alert alert-warning py-2">
        <p className="mb-1">{serverErrorText[failure.code] || serverErrorText.service_error}
          {failure.code === 'rate_limited' && failure.retryAfterSeconds ? ` You can try again in about ${Math.ceil(failure.retryAfterSeconds / 60)} minute(s).` : ''}</p>
        <DirectContactOptions />
      </div>}

      <div className="d-flex flex-wrap gap-2">
        <button type="button" className="btn btn-outline-dark" onClick={() => { setErrors({}); setStep(1); }} disabled={submitting}>Back</button>
        <button type="submit" className="btn btn-dark" disabled={submitting}>
          {submitting ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Sending…</>
            : failure && ['network', 'timeout', 'service_error'].includes(failure.code) ? 'Try again' : 'Request my shortlist'}
        </button>
      </div>
      {mode === 'page' && <p className="small text-muted mt-3 mb-0">Your answers are kept only while this page is open.</p>}
    </>}
  </form>;
}
