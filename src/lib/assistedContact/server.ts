// Server-only helpers for the same-origin intake adapters. Never import from client components:
// this reads the service secret.
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import type { IntakeErrorCode } from '@/types/assistedContact';

export const MAX_BODY_BYTES = 16 * 1024;
const BACKEND_TIMEOUT_MS = 10_000;
const noStore = { 'Cache-Control': 'no-store' };

export function intakeConfigured(): boolean {
  return process.env.ASSISTED_CONTACT_INTAKE_ENABLED === 'true' && !!process.env.LEAD_BACKEND_URL && !!process.env.LEAD_INTAKE_SERVICE_SECRET;
}

export function errorResponse(status: number, code: IntakeErrorCode, extra: { fields?: Record<string, string | undefined>; headers?: Record<string, string> } = {}) {
  return NextResponse.json({ error: { code, ...(extra.fields ? { fields: extra.fields } : {}) } }, { status, headers: { ...noStore, ...extra.headers } });
}

export function successResponse(status: 200 | 201, reference: string) {
  return NextResponse.json({ success: true, reference, status: 'received' }, { status, headers: noStore });
}

// Browser submissions must come from this site. This reduces casual abuse; it is not bot authentication.
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    try { return new URL(origin).host === host; } catch { return false; }
  }
  return request.headers.get('sec-fetch-site') === 'same-origin';
}

export async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; response: NextResponse }> {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return { ok: false, response: errorResponse(400, 'malformed_json') };
  }
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) return { ok: false, response: errorResponse(413, 'payload_too_large') };
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return { ok: false, response: errorResponse(413, 'payload_too_large') };
  try { return { ok: true, value: JSON.parse(text) }; } catch { return { ok: false, response: errorResponse(400, 'malformed_json') }; }
}

// The hosting proxy sets the forwarded-for header; only its first entry is the visitor. Bounded and
// character-checked so nothing arbitrary reaches the backend limiter key.
function clientIp(request: Request): string {
  const forwarded = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || '';
  return /^[0-9a-f.:]{3,45}$/i.test(forwarded) ? forwarded : 'unknown';
}

// A honeypot hit gets an ordinary-looking success and creates nothing.
export function honeypotResponse() {
  return successResponse(201, `TR-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`);
}

export async function forwardToIntake(request: Request, body: unknown): Promise<NextResponse> {
  const supportReference = randomUUID().slice(0, 8);
  try {
    const response = await fetch(`${process.env.LEAD_BACKEND_URL!.replace(/\/$/, '')}/api/v1/leads/intake`, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LEAD_INTAKE_SERVICE_SECRET}`,
        'X-Client-Ip': clientIp(request),
      },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if ((response.status === 201 || response.status === 200) && typeof result.reference === 'string') {
      return successResponse(response.status, result.reference);
    }
    const code = result?.error?.code as IntakeErrorCode | undefined;
    if (response.status === 409) return errorResponse(409, 'idempotency_conflict');
    if (response.status === 422) return errorResponse(422, 'validation_failed', { fields: result?.error?.fields });
    if (response.status === 429) return errorResponse(429, 'rate_limited', { headers: { 'Retry-After': response.headers.get('Retry-After') || '600' } });
    if (response.status === 503 && code === 'intake_unavailable') return errorResponse(503, 'intake_unavailable');
    // Log only status and a reference: never the request body or contact values.
    console.error(`[assisted-contact] intake failed status=${response.status} ref=${supportReference}`);
  } catch (error) {
    console.error(`[assisted-contact] intake unreachable (${(error as Error)?.name}) ref=${supportReference}`);
  }
  return NextResponse.json({ error: { code: 'service_error', supportReference } }, { status: 503, headers: noStore });
}
