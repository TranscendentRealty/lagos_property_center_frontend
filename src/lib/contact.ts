export function contactNumber(value?: string): string | null {
  const digits = (value || '').replace(/[\s()+-]/g, '');
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}
export function whatsappLink(number: string | undefined, message: string): string | null {
  const valid = contactNumber(number);
  return valid ? `https://wa.me/${valid}?text=${encodeURIComponent(message)}` : null;
}
