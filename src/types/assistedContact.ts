// Shared shapes for the assisted-contact (shortlist request) funnel. No browser-only code here:
// the Next API route imports these types too.

export type ContactChannel = 'whatsapp' | 'call' | 'email';
export type Timeframe = 'within_1_month' | 'one_to_three_months' | 'three_to_six_months' | 'later' | 'researching' | 'not_sure';
export type PropertyTypeId = 'apartment' | 'terrace' | 'semi_detached' | 'fully_detached';
export type Bedrooms = '1' | '2' | '3' | '4' | '5+';
export type ViewingPreference = 'in_person' | 'remote' | 'not_sure';
export type ContactWindow = 'weekday_morning_wat' | 'weekday_afternoon_wat' | 'weekday_evening_wat' | 'weekend_wat' | 'anytime';

// Where the visitor opened the form from, and why the invitation existed.
export type EntryPoint = 'floating' | 'navigation' | 'footer' | 'listing' | 'search_empty' | 'search_error' | 'page' | 'proactive';
export type Trigger = 'manual' | 'zero_results' | 'proactive';
export type Variant = 'treatment' | 'control';

// Areas hold location names from `availableLocations`, or exactly one of the two special tokens.
export const AREA_NOT_SURE = 'not_sure';
export const AREA_OTHER = 'other';

export interface AssistedDraft {
  areas: string[];
  otherArea: string;
  timeframe: Timeframe | '';
  propertyType: PropertyTypeId | '';
  bedrooms: Bedrooms | '';
  channel: ContactChannel | '';
  contactValue: string;
  firstName: string;
  viewingPreference: ViewingPreference | '';
  contactWindow: ContactWindow | '';
  timezoneNote: string;
  note: string;
  website: string; // Honeypot; never rendered visibly.
}
export type DraftField = keyof AssistedDraft;

// Structured context registered by the current page. Only explicit filters/listing facts; never a price.
export interface PageContext {
  source: 'listing' | 'search';
  pathname: string;
  propertyId?: string;
  area?: string;
  propertyType?: PropertyTypeId;
  bedrooms?: Bedrooms;
  searchMode?: 'standard' | 'ai';
}

export interface AssistedContactRequest {
  schemaVersion: 1;
  requestType: 'assisted_shortlist';
  idempotencyKey: string;
  preferences: {
    areas: string[];
    otherArea?: string;
    timeframe: Timeframe;
    propertyType?: PropertyTypeId;
    bedrooms?: Bedrooms;
  };
  contact: { channel: ContactChannel; value: string; firstName?: string };
  optional?: { viewingPreference?: ViewingPreference; contactWindow?: ContactWindow; timezoneNote?: string; note?: string };
  context: { entryPoint: EntryPoint; trigger: Trigger; pagePath: string; propertyIds: string[]; searchMode?: 'standard' | 'ai' };
  permissions: { serviceRequestVersion: string; marketingOptIn: false };
  measurement?: { analyticsConsent: true; experimentVersion: string; variant: Variant; eligibilitySessionId: string };
  website: string;
}

export interface GeneralContactRequest {
  schemaVersion: 1;
  requestType: 'general_contact';
  idempotencyKey: string;
  contact: { channel: ContactChannel; value: string; firstName?: string };
  message: string;
  context: { entryPoint: 'contact_page'; pagePath: '/contact-us' };
  permissions: { serviceRequestVersion: string; marketingOptIn: false };
  website: string;
}

export type IntakeErrorCode = 'validation_failed' | 'idempotency_conflict' | 'rate_limited' | 'intake_unavailable'
  | 'malformed_json' | 'payload_too_large' | 'forbidden' | 'service_error' | 'network' | 'timeout';

export type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; reference: string }
  | { status: 'error'; code: IntakeErrorCode; fields?: Partial<Record<string, string>>; retryAfterSeconds?: number };
