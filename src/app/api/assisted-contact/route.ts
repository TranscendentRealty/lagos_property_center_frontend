import { validateRequestBody } from '@/lib/assistedContact/validation';
import { errorResponse, forwardToIntake, honeypotResponse, intakeConfigured, isSameOrigin, readJson } from '@/lib/assistedContact/server';

export const dynamic = 'force-dynamic';

// Same-origin adapter: validates, then forwards to the Express intake with server-only credentials.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse(403, 'forbidden');
  if (!intakeConfigured()) return errorResponse(503, 'intake_unavailable');
  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;
  const result = validateRequestBody(parsed.value);
  if (!result.ok) return errorResponse(422, 'validation_failed', { fields: result.fields });
  if (result.value.requestType !== 'assisted_shortlist') return errorResponse(422, 'validation_failed', { fields: { requestType: 'invalid' } });
  if (result.value.website) return honeypotResponse();
  return forwardToIntake(request, result.value);
}
