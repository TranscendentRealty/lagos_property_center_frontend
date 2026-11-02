import type { Bedrooms, ContactWindow, PropertyTypeId, Timeframe, ViewingPreference } from '@/types/assistedContact';

// Client flags are baked into the build; the config route adds a server-side kill switch.
export const ASSISTED_CONTACT_ENABLED = process.env.NEXT_PUBLIC_ASSISTED_CONTACT_ENABLED === 'true';
export const PROACTIVE_ENABLED = ASSISTED_CONTACT_ENABLED && process.env.NEXT_PUBLIC_ASSISTED_CONTACT_PROACTIVE_ENABLED === 'true';

export const SERVICE_REQUEST_VERSION = 'shortlist_v1';
export const GENERAL_CONTACT_VERSION = 'general_contact_v1';
export const SERVICE_REQUEST_TEXT = 'By submitting, you ask Transcendent Realty to contact you about this property request.';

// Experiment settings. Changing any threshold must bump EXPERIMENT_VERSION so a new experiment starts.
export const EXPERIMENT_VERSION = 'shortlist_prompt_v1';
export const THRESHOLDS = {
  distinctListings: 2,
  activeMs: 90_000,
  interactionWindowMs: 60_000,
  sessionIdleMs: 30 * 60_000,
  cooldownMs: 7 * 86_400_000,
  editingQuietMs: 10_000,
  maxPropertyIds: 20,
  // A tick arriving this late means the device slept or the tab was frozen; discard the gap.
  maxTickGapMs: 5_000,
  checkpointMs: 5_000,
  claimTtlMs: 15_000,
} as const;

// Proactive display and active-time accumulation only happen on browsing routes.
export function isBrowsingRoute(pathname: string): boolean {
  return pathname === '/' || pathname === '/search' || pathname === '/search-with-ai'
    || pathname === '/explore' || pathname.startsWith('/explore/') || /^\/listing\/[a-f\d]{24}\/?$/i.test(pathname);
}

export const MAX_AREAS = 3;
export const LIMITS = { firstName: 80, otherArea: 100, note: 500, timezoneNote: 60, email: 254, message: 2000 } as const;

export const timeframeOptions: { value: Timeframe; label: string }[] = [
  { value: 'within_1_month', label: 'Within 1 month' },
  { value: 'one_to_three_months', label: '1–3 months' },
  { value: 'three_to_six_months', label: '3–6 months' },
  { value: 'later', label: 'Later' },
  { value: 'researching', label: 'Just researching' },
  { value: 'not_sure', label: 'Not sure yet' },
];

export const propertyTypeOptions: { value: PropertyTypeId; label: string; search: string }[] = [
  { value: 'apartment', label: 'Apartment', search: 'apartment' },
  { value: 'terrace', label: 'Terrace', search: 'terrace' },
  { value: 'semi_detached', label: 'Semi-Detached', search: 'semi-detached' },
  { value: 'fully_detached', label: 'Fully Detached', search: 'fully detached' },
];

export const bedroomOptions: Bedrooms[] = ['1', '2', '3', '4', '5+'];

export const viewingOptions: { value: ViewingPreference; label: string }[] = [
  { value: 'in_person', label: 'In person' },
  { value: 'remote', label: 'Remote / video' },
  { value: 'not_sure', label: 'Not sure' },
];

export const contactWindowOptions: { value: ContactWindow; label: string }[] = [
  { value: 'weekday_morning_wat', label: 'Weekday mornings (9am–12pm WAT)' },
  { value: 'weekday_afternoon_wat', label: 'Weekday afternoons (12pm–5pm WAT)' },
  { value: 'weekday_evening_wat', label: 'Weekday evenings (5pm–8pm WAT)' },
  { value: 'weekend_wat', label: 'Weekends (WAT)' },
  { value: 'anytime', label: 'Any time' },
];

// Map a search filter value or a listing's type/subtype onto a canonical form value.
export function toPropertyTypeId(...values: (string | undefined)[]): PropertyTypeId | undefined {
  const text = values.filter(Boolean).join(' ').toLowerCase();
  if (!text) return undefined;
  if (text.includes('semi')) return 'semi_detached';
  if (text.includes('detached')) return 'fully_detached';
  if (text.includes('terrace')) return 'terrace';
  if (text.includes('apartment') || text.includes('flat')) return 'apartment';
  return undefined;
}

export function toBedrooms(value: string | number | undefined): Bedrooms | undefined {
  const count = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  if (!Number.isInteger(count) || count < 1) return undefined;
  return count >= 5 ? '5+' : String(count) as Bedrooms;
}
