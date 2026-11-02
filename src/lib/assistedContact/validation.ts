// Validation shared by the form (inline errors) and the Next intake adapter (authoritative before forwarding).
// The Express intake validates again independently.
import { availableLocations } from '@/exports/constants';
import {
  AREA_NOT_SURE, AREA_OTHER, AssistedContactRequest, AssistedDraft, ContactChannel, DraftField, EntryPoint,
  GeneralContactRequest, PageContext, Trigger,
} from '@/types/assistedContact';
import {
  bedroomOptions, contactWindowOptions, GENERAL_CONTACT_VERSION, LIMITS, MAX_AREAS, propertyTypeOptions,
  SERVICE_REQUEST_VERSION, timeframeOptions, viewingOptions,
} from './config';

export type FieldErrors = Partial<Record<string, string>>;

const channels: ContactChannel[] = ['whatsapp', 'call', 'email'];
const entryPoints: EntryPoint[] = ['floating', 'navigation', 'footer', 'listing', 'search_empty', 'search_error', 'page', 'proactive'];
const triggers: Trigger[] = ['manual', 'zero_results', 'proactive'];
const values = <T extends { value: string }>(options: T[]) => options.map(option => option.value);

export const emptyDraft: AssistedDraft = {
  areas: [], otherArea: '', timeframe: '', propertyType: '', bedrooms: '', channel: '', contactValue: '',
  firstName: '', viewingPreference: '', contactWindow: '', timezoneNote: '', note: '', website: '',
};

// Accept international numbers from anywhere; a leading 0 with 11 digits is read as a Nigerian local number.
export function normalizePhone(input: string): string | null {
  let value = input.trim().replace(/[\s().-]/g, '');
  if (value.startsWith('00')) value = '+' + value.slice(2);
  if (/^0\d{10}$/.test(value)) value = '+234' + value.slice(1);
  return /^\+[1-9]\d{7,14}$/.test(value) ? value : null;
}

export function isEmail(input: string): boolean {
  const value = input.trim();
  return value.length <= LIMITS.email && /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(value);
}

export function contactError(channel: ContactChannel | '', value: string): string | undefined {
  if (!channel) return 'Choose how Bukunmi should reach you.';
  if (channel === 'email') return isEmail(value) ? undefined : 'Enter a valid email address, for example name@example.com.';
  return normalizePhone(value) ? undefined : 'Enter a phone number with its country code, for example +234 801 234 5678.';
}

export function validatePreferences(draft: AssistedDraft): FieldErrors {
  const errors: FieldErrors = {};
  const special: string[] = [AREA_NOT_SURE, AREA_OTHER];
  if (draft.areas.length === 0) errors.areas = 'Choose at least one area, or “Not sure yet”.';
  else if (draft.areas.length > MAX_AREAS) errors.areas = `Choose up to ${MAX_AREAS} areas.`;
  else if (draft.areas.includes(AREA_NOT_SURE) && draft.areas.length > 1) errors.areas = '“Not sure yet” can’t be combined with other areas.';
  else if (draft.areas.some(area => !special.includes(area) && !availableLocations.includes(area))) errors.areas = 'Choose areas from the list.';
  if (draft.areas.includes(AREA_OTHER)) {
    const other = draft.otherArea.trim();
    if (!other) errors.otherArea = 'Tell us which other area you have in mind.';
    else if (other.length > LIMITS.otherArea) errors.otherArea = `Keep this under ${LIMITS.otherArea} characters.`;
  }
  if (!draft.timeframe) errors.timeframe = 'Choose a timeframe, or “Not sure yet”.';
  return errors;
}

export function validateContact(draft: AssistedDraft): FieldErrors {
  const errors: FieldErrors = {};
  const contact = contactError(draft.channel, draft.contactValue);
  if (contact) errors[draft.channel ? 'contactValue' : 'channel'] = contact;
  if (draft.firstName.trim().length > LIMITS.firstName) errors.firstName = `Keep this under ${LIMITS.firstName} characters.`;
  if (draft.timezoneNote.trim().length > LIMITS.timezoneNote) errors.timezoneNote = `Keep this under ${LIMITS.timezoneNote} characters.`;
  if (draft.note.length > LIMITS.note) errors.note = `Keep your note under ${LIMITS.note} characters.`;
  return errors;
}

export function normalizedContactValue(channel: ContactChannel, value: string): string {
  return channel === 'email' ? value.trim() : normalizePhone(value) || value.trim();
}

const trimmed = (value: string) => value.trim() || undefined;

// Build the request body (without idempotency key) from a draft that passed both steps.
export function buildRequest(draft: AssistedDraft, meta: {
  entryPoint: EntryPoint; trigger: Trigger; pagePath: string; context?: PageContext;
  measurement?: AssistedContactRequest['measurement'];
}): Omit<AssistedContactRequest, 'idempotencyKey'> {
  const channel = draft.channel as ContactChannel;
  const optional = {
    viewingPreference: draft.viewingPreference || undefined, contactWindow: draft.contactWindow || undefined,
    timezoneNote: trimmed(draft.timezoneNote), note: trimmed(draft.note),
  };
  return {
    schemaVersion: 1, requestType: 'assisted_shortlist',
    preferences: {
      areas: draft.areas, otherArea: draft.areas.includes(AREA_OTHER) ? draft.otherArea.trim() : undefined,
      timeframe: draft.timeframe as AssistedContactRequest['preferences']['timeframe'],
      propertyType: draft.propertyType || undefined, bedrooms: draft.bedrooms || undefined,
    },
    contact: { channel, value: normalizedContactValue(channel, draft.contactValue), firstName: trimmed(draft.firstName) },
    optional: Object.values(optional).some(Boolean) ? optional : undefined,
    context: {
      entryPoint: meta.entryPoint, trigger: meta.trigger, pagePath: safeRequestPath(meta.pagePath),
      propertyIds: meta.context?.propertyId ? [meta.context.propertyId] : [], searchMode: meta.context?.searchMode,
    },
    permissions: { serviceRequestVersion: SERVICE_REQUEST_VERSION, marketingOptIn: false },
    measurement: meta.measurement,
    website: draft.website,
  };
}

// Only allowlisted paths, with no query string, reach the lead record.
export function safeRequestPath(path: string): string {
  const clean = path.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  if (/^\/listing\/[a-f\d]{24}$/i.test(clean)) return clean;
  if (['/', '/search', '/search-with-ai', '/explore', '/get-a-shortlist', '/contact-us', '/about-us'].includes(clean)) return clean;
  if (clean.startsWith('/explore/')) return '/explore';
  return '/other';
}

// ---- Strict structural validation for the Next intake adapter ----

type Obj = Record<string, unknown>;
const isObj = (value: unknown): value is Obj => typeof value === 'object' && value !== null && !Array.isArray(value);
const onlyKeys = (value: Obj, allowed: string[]) => Object.keys(value).every(key => allowed.includes(key));
const optionalString = (value: unknown, max: number) => value === undefined || (typeof value === 'string' && value.length <= max);
const optionalEnum = (value: unknown, allowed: readonly string[]) => value === undefined || (typeof value === 'string' && allowed.includes(value));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateContactShape(contact: unknown, fields: FieldErrors) {
  if (!isObj(contact) || !onlyKeys(contact, ['channel', 'value', 'firstName'])) { fields.contact = 'invalid'; return; }
  if (!channels.includes(contact.channel as ContactChannel)) { fields.channel = 'invalid'; return; }
  if (typeof contact.value !== 'string' || contactError(contact.channel as ContactChannel, contact.value)) fields.contactValue = 'invalid';
  if (!optionalString(contact.firstName, LIMITS.firstName)) fields.firstName = 'invalid';
}

function validatePermissions(permissions: unknown, version: string, fields: FieldErrors) {
  if (!isObj(permissions) || !onlyKeys(permissions, ['serviceRequestVersion', 'marketingOptIn'])
    || permissions.serviceRequestVersion !== version || permissions.marketingOptIn !== false) fields.permissions = 'invalid';
}

export function validateRequestBody(body: unknown): { ok: true; value: AssistedContactRequest | GeneralContactRequest } | { ok: false; fields: FieldErrors } {
  const fields: FieldErrors = {};
  if (!isObj(body) || body.schemaVersion !== 1) return { ok: false, fields: { schemaVersion: 'invalid' } };
  if (typeof body.idempotencyKey !== 'string' || !uuid.test(body.idempotencyKey)) fields.idempotencyKey = 'invalid';
  if (typeof body.website !== 'string' || body.website.length > 200) fields.website = 'invalid';
  validateContactShape(body.contact, fields);

  if (body.requestType === 'general_contact') {
    if (!onlyKeys(body, ['schemaVersion', 'requestType', 'idempotencyKey', 'contact', 'message', 'context', 'permissions', 'website'])) fields.body = 'unsupported_key';
    if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > LIMITS.message) fields.message = 'invalid';
    if (!isObj(body.context) || !onlyKeys(body.context, ['entryPoint', 'pagePath']) || body.context.entryPoint !== 'contact_page'
      || body.context.pagePath !== '/contact-us') fields.context = 'invalid';
    validatePermissions(body.permissions, GENERAL_CONTACT_VERSION, fields);
    return Object.keys(fields).length ? { ok: false, fields } : { ok: true, value: body as unknown as GeneralContactRequest };
  }

  if (body.requestType !== 'assisted_shortlist') return { ok: false, fields: { requestType: 'invalid' } };
  if (!onlyKeys(body, ['schemaVersion', 'requestType', 'idempotencyKey', 'preferences', 'contact', 'optional', 'context', 'permissions', 'measurement', 'website'])) fields.body = 'unsupported_key';

  const prefs = body.preferences;
  if (!isObj(prefs) || !onlyKeys(prefs, ['areas', 'otherArea', 'timeframe', 'propertyType', 'bedrooms'])
    || !Array.isArray(prefs.areas) || !prefs.areas.every(area => typeof area === 'string')) {
    fields.preferences = 'invalid';
  } else {
    const draftErrors = validatePreferences({
      ...emptyDraft, areas: prefs.areas as string[], otherArea: typeof prefs.otherArea === 'string' ? prefs.otherArea : '',
      timeframe: (values(timeframeOptions).includes(prefs.timeframe as string) ? prefs.timeframe : '') as AssistedDraft['timeframe'],
    });
    Object.assign(fields, draftErrors);
    if (!optionalEnum(prefs.propertyType, values(propertyTypeOptions))) fields.propertyType = 'invalid';
    if (!optionalEnum(prefs.bedrooms, bedroomOptions)) fields.bedrooms = 'invalid';
  }

  const optional = body.optional;
  if (optional !== undefined && (!isObj(optional) || !onlyKeys(optional, ['viewingPreference', 'contactWindow', 'timezoneNote', 'note'])
    || !optionalEnum(optional.viewingPreference, values(viewingOptions)) || !optionalEnum(optional.contactWindow, values(contactWindowOptions))
    || !optionalString(optional.timezoneNote, LIMITS.timezoneNote) || !optionalString(optional.note, LIMITS.note))) fields.optional = 'invalid';

  const context = body.context;
  if (!isObj(context) || !onlyKeys(context, ['entryPoint', 'trigger', 'pagePath', 'propertyIds', 'searchMode'])
    || !entryPoints.includes(context.entryPoint as EntryPoint) || !triggers.includes(context.trigger as Trigger)
    || typeof context.pagePath !== 'string' || safeRequestPath(context.pagePath) !== context.pagePath
    || !Array.isArray(context.propertyIds) || context.propertyIds.length > 3
    || !context.propertyIds.every(id => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id))
    || !optionalEnum(context.searchMode, ['standard', 'ai'])) fields.context = 'invalid';

  validatePermissions(body.permissions, SERVICE_REQUEST_VERSION, fields);

  const measurement = body.measurement;
  if (measurement !== undefined && (!isObj(measurement) || !onlyKeys(measurement, ['analyticsConsent', 'experimentVersion', 'variant', 'eligibilitySessionId'])
    || measurement.analyticsConsent !== true || typeof measurement.experimentVersion !== 'string' || !/^[a-z\d_]{1,40}$/.test(measurement.experimentVersion)
    || !['treatment', 'control'].includes(measurement.variant as string)
    || typeof measurement.eligibilitySessionId !== 'string' || !uuid.test(measurement.eligibilitySessionId))) fields.measurement = 'invalid';

  return Object.keys(fields).length ? { ok: false, fields } : { ok: true, value: body as unknown as AssistedContactRequest };
}

// Draft fields shown on each step, in display order, so the error summary can link to them.
export const stepFields: Record<1 | 2, DraftField[]> = {
  1: ['areas', 'otherArea', 'timeframe', 'propertyType', 'bedrooms'],
  2: ['channel', 'contactValue', 'firstName', 'viewingPreference', 'contactWindow', 'timezoneNote', 'note'],
};
