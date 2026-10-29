'use client';
import { contactNumber, whatsappLink } from '@/lib/contact';
import { trackContact } from '@/lib/measurement';
export default function SearchContactHelp() {
  const whatsapp = whatsappLink(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, 'Hello! I couldn’t find a suitable property on your website. Could we discuss what I am looking for?');
  const call = contactNumber(process.env.NEXT_PUBLIC_CALL_NUMBER);
  return <div className="d-flex justify-content-center flex-wrap gap-2 my-3">
    {whatsapp && <a className="btn btn-success" href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => trackContact('whatsapp', 'empty')}>Ask an agent on WhatsApp</a>}
    {call && <a className="btn btn-dark" href={`tel:+${call}`} onClick={() => trackContact('call', 'empty')}>Call the agent</a>}
  </div>;
}
