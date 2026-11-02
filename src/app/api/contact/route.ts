// app/api/contact/route.ts
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { GENERAL_CONTACT_VERSION } from '@/lib/assistedContact/config';
import { validateRequestBody } from '@/lib/assistedContact/validation';
import { errorResponse, forwardToIntake, honeypotResponse, intakeConfigured, isSameOrigin, readJson } from '@/lib/assistedContact/server';
import type { GeneralContactRequest } from '@/types/assistedContact';

export const dynamic = 'force-dynamic';

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);
const emailTo = process.env.CONTACT_FORM_EMAIL_TO;

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

// Pages loaded before this release still post the old five-field shape; accept it temporarily.
function fromLegacy(body: unknown): unknown {
  const old = body as Record<string, unknown> | null;
  if (!old || typeof old !== 'object' || 'requestType' in old || typeof old.email !== 'string') return body;
  const name = [old.firstname, old.surname].filter(part => typeof part === 'string' && part.trim()).join(' ').slice(0, 80);
  const phone = typeof old.phone === 'string' && old.phone.trim() ? `\n\nPhone: ${old.phone.trim().slice(0, 30)}` : '';
  return {
    schemaVersion: 1, requestType: 'general_contact', idempotencyKey: randomUUID(),
    contact: { channel: 'email', value: old.email.trim(), ...(name ? { firstName: name } : {}) },
    message: `${typeof old.message === 'string' ? old.message : ''}${phone}`,
    context: { entryPoint: 'contact_page', pagePath: '/contact-us' },
    permissions: { serviceRequestVersion: GENERAL_CONTACT_VERSION, marketingOptIn: false }, website: '',
  };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse(403, 'forbidden');
  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;
  const result = validateRequestBody(fromLegacy(parsed.value));
  if (!result.ok || result.value.requestType !== 'general_contact') {
    return errorResponse(422, 'validation_failed', { fields: result.ok ? { requestType: 'invalid' } : result.fields });
  }
  if (result.value.website) return honeypotResponse();

  // Durable path: the enquiry is stored and the agent is notified by the backend worker.
  if (intakeConfigured()) return forwardToIntake(request, result.value);

  // Legacy email-only path, used until durable intake is switched on.
  if (!emailTo) {
    console.error("CONTACT_FORM_EMAIL_TO is not set in environment variables.");
    return errorResponse(503, 'service_error');
  }
  const value: GeneralContactRequest = result.value;
  const { channel, firstName } = value.contact;
  try {
    const { error } = await resend.emails.send({
      from: 'Transcendent Realty <noreply@transcendentrealty.com>',
      to: [emailTo],
      subject: 'New contact form enquiry',
      ...(channel === 'email' ? { replyTo: value.contact.value } : {}),
      html: `<div><h1>New enquiry from your website</h1><hr />`
        + `<p><strong>Name:</strong> ${escapeHtml(firstName || 'Not given')}</p>`
        + `<p><strong>Preferred channel:</strong> ${escapeHtml(channel)}</p>`
        + `<p><strong>Contact:</strong> ${escapeHtml(value.contact.value)}</p>`
        + `<p><strong>Message:</strong></p><p style="white-space:pre-wrap">${escapeHtml(value.message)}</p>`
        + `<hr /><p><em>This email was sent from the Transcendent Realty contact form.</em></p></div>`,
    });
    if (error) {
      console.error("Resend API Error:", error.name);
      return errorResponse(503, 'service_error');
    }
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error("API Route Error:", (err as Error)?.name);
    return errorResponse(503, 'service_error');
  }
}
