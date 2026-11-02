import { NextResponse } from 'next/server';
import { intakeConfigured } from '@/lib/assistedContact/server';

// Read at request time so operators can stop the proactive experiment or close intake without a rebuild.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    intakeEnabled: intakeConfigured(),
    proactiveEnabled: process.env.ASSISTED_CONTACT_PROACTIVE_KILL_SWITCH !== 'on',
  }, { headers: { 'Cache-Control': 'public, max-age=60' } });
}
