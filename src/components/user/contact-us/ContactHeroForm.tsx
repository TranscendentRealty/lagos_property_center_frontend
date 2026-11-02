/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useRef, useState } from 'react';
import { trackContact } from '@/lib/measurement';
import { contactNumber } from '@/lib/contact';
import { publishContactActivity } from '@/lib/contactActivity';
import { GENERAL_CONTACT_VERSION, LIMITS } from '@/lib/assistedContact/config';
import { contactError, normalizedContactValue } from '@/lib/assistedContact/validation';
import { randomId } from '@/lib/assistedContact/storage';
import type { ContactChannel, GeneralContactRequest } from '@/types/assistedContact';
import { Form, Button } from 'react-bootstrap'; // Using react-bootstrap for form
// Assuming you have icons, e.g., react-icons
import { FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi';

interface ContactInfoItem {
    id: string;
    icon: React.ReactNode;
    title: string;
    lines: string[];
    href?: string; // For making phone/email clickable
}

interface ContactFormData {
    firstName: string;
    channel: ContactChannel | '';
    contactValue: string;
    message: string;
    website: string; // Honeypot
}
const emptyForm: ContactFormData = { firstName: '', channel: '', contactValue: '', message: '', website: '' };
const channelChoices: [ContactChannel, string][] = [['email', 'Email'], ['whatsapp', 'WhatsApp'], ['call', 'Phone call']];

interface ContactHeroFormProps {
    // backgroundImageUrl?: string;
    // title?: string;
    // subtitle?: string;
    // contactInfo?: ContactInfoItem[];
    onSubmitForm?: (data: ContactFormData) => Promise<void> | void;
}

const configuredPhone = contactNumber(process.env.NEXT_PUBLIC_CALL_NUMBER);
const defaultContactInfo: ContactInfoItem[] = [
    // { id: 'address', icon: <FiMapPin size={24} />, title: 'Address', lines: ['44/46 Alaramimo Street, Agege,', 'Lagos, Nigeria'] },
    ...(configuredPhone ? [{ id: 'phone', icon: <FiPhone size={24} />, title: 'Phone', lines: [`+${configuredPhone}`], href: `tel:+${configuredPhone}` }] : []),
    { id: 'email', icon: <FiMail size={24} />, title: 'Email', lines: ['info@transcendentrealty.com'], href: 'mailto:info@transcendentrealty.com' },
];

const ContactHeroForm: React.FC<ContactHeroFormProps> = ({
    onSubmitForm
}) => {

    const backgroundImageUrl = "/images/PropertyImagePlaceholder3.jpeg";
    const title = "Contact Us";
    const subtitle = "Let's bring your dream property to life. Share your enquiry with us, and one of our dedicated agents will respond promptly to provide you with the premium service you deserve."
    const contactInfo = defaultContactInfo;

    const [formData, setFormData] = useState<ContactFormData>(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ ok: boolean; text: string } | null>(null);
    const [errors, setErrors] = useState<Partial<Record<'channel' | 'contactValue' | 'message', string>>>({});
    // Same snapshot after a failure reuses its key, so a retry can't create a second enquiry.
    const pending = useRef<{ key: string; snapshot: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    // Switching between phone and email clears the now-unused value.
    const chooseChannel = (channel: ContactChannel) => setFormData(prev => ({
        ...prev, channel, contactValue: (channel === 'email') === (prev.channel === 'email') ? prev.contactValue : '',
    }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const found: typeof errors = {};
        const contactProblem = contactError(formData.channel, formData.contactValue);
        if (contactProblem) found[formData.channel ? 'contactValue' : 'channel'] = contactProblem;
        if (!formData.message.trim()) found.message = 'Please write a short message.';
        setErrors(found);
        if (Object.keys(found).length) return;
        const channel = formData.channel as ContactChannel;
        const body: Omit<GeneralContactRequest, 'idempotencyKey'> = {
            schemaVersion: 1, requestType: 'general_contact',
            contact: { channel, value: normalizedContactValue(channel, formData.contactValue), firstName: formData.firstName.trim() || undefined },
            message: formData.message.trim(), context: { entryPoint: 'contact_page', pagePath: '/contact-us' },
            permissions: { serviceRequestVersion: GENERAL_CONTACT_VERSION, marketingOptIn: false }, website: formData.website,
        };
        const snapshot = JSON.stringify(body);
        if (pending.current?.snapshot !== snapshot) pending.current = { key: randomId(), snapshot };
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
          // THE KEY CHANGE IS HERE: Use fetch to call your new API route
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...body, idempotencyKey: pending.current.key }),
          });

          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(response.status === 429 ? 'Too many attempts. Please wait a few minutes and try again.'
              : result?.error?.code === 'validation_failed' ? 'Please check your details and try again.'
              : 'We couldn’t send your message. Please try again, or call us directly.');
          }

          // Only a confirmed acceptance counts as contact (and suppresses shortlist prompts).
          publishContactActivity('contact_form');
          pending.current = null;
          setSubmitMessage({ ok: true, text: 'Thank you. Your message has been received and an agent will reply through your chosen channel.' });
          setFormData(emptyForm);
        } catch (error: any) {
          setSubmitMessage({ ok: false, text: error?.name === 'TypeError' ? 'We couldn’t reach our server. Check your connection and try again.' : error.message });
        } finally {
          setIsSubmitting(false);
        }
      };

    return (
        <section
            className="contact-hero-form-section"
            style={{ '--contact-bg-image': `url(${backgroundImageUrl})` }}
        >
            <div className="contact-hero-overlay"></div>
            <div className="container contact-content-container"> {/* Manages max-width and padding */}
                <div className="row align-items-center justify-content-between g-md-5"> {/* g-5 for ~64px gap */}

                    {/* Left Column: Text and Contact Info */}
                    <div className="col-lg-6 col-md-12 text-white contact-info-column">
                        <h1 className="fw-bold mb-3 contact-title">{title}</h1>
                        <p className="lead mb-4 contact-subtitle text-white">{subtitle}</p>
                        <div className="d-flex flex-column justify-content-start">
                            {contactInfo.map(item => (
                                <div key={item.id} className="d-flex contact-detail-item mb-3 align-items-start">
                                    <div className="contact-icon me-3 mt-1 flex-shrink-0">{item.icon}</div>
                                    <div>
                                        <h5 className="mb-0 fw-medium contact-detail-title">{item.title}</h5>
                                        {item.lines.map((line, index) =>
                                            item.href && index === 0 ? (
                                                <a key={index} href={item.href} onClick={() => { if (item.id === 'phone') trackContact('call', 'contact_page'); else if (item.id === 'email') publishContactActivity('email'); }} className="d-block text-white contact-detail-line">
                                                    {line}
                                                </a>
                                            ) : (
                                                <p key={index} className="mb-0 contact-detail-line">{line}</p>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="col-lg-5 col-md-12 col-sm-11">
                        <div className="contact-form-card card shadow-lg">
                            <div className="card-body p-4 p-md-5">
                                <Form onSubmit={handleSubmit} noValidate>
                                    {/* Honeypot: hidden from people and assistive technology. */}
                                    <div className="assist-hp" aria-hidden="true">
                                        <label htmlFor="contactFormWebsite">Website</label>
                                        <input id="contactFormWebsite" name="website" type="text" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
                                    </div>

                                    <Form.Group className="mb-3" controlId="contactFormName">
                                        <Form.Label>First name <span className="small">(optional)</span></Form.Label>
                                        <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} maxLength={LIMITS.firstName} placeholder="Enter your first name" autoComplete="given-name" />
                                    </Form.Group>

                                    <fieldset className="mb-3" aria-describedby={errors.channel ? 'contactFormChannelError' : undefined}>
                                        <legend className="form-label fs-6 mb-1">How should we reply?</legend>
                                        <div className="d-flex flex-wrap gap-3">
                                            {channelChoices.map(([value, label]) => (
                                                <Form.Check key={value} type="radio" name="channel" id={`contactFormChannel-${value}`} label={label}
                                                    checked={formData.channel === value} onChange={() => chooseChannel(value)} />
                                            ))}
                                        </div>
                                        {errors.channel && <div id="contactFormChannelError" className="invalid-feedback d-block">{errors.channel}</div>}
                                    </fieldset>

                                    {formData.channel && <Form.Group className="mb-3" controlId="contactFormContactValue">
                                        <Form.Label>{formData.channel === 'email' ? 'Email' : formData.channel === 'whatsapp' ? 'WhatsApp number' : 'Phone number'}</Form.Label>
                                        <Form.Control type={formData.channel === 'email' ? 'email' : 'tel'} name="contactValue" value={formData.contactValue} onChange={handleChange}
                                            autoComplete={formData.channel === 'email' ? 'email' : 'tel'} isInvalid={!!errors.contactValue}
                                            placeholder={formData.channel === 'email' ? 'Enter your email' : 'e.g. +234 801 234 5678'} />
                                        <Form.Control.Feedback type="invalid">{errors.contactValue}</Form.Control.Feedback>
                                    </Form.Group>}

                                    <Form.Group className="mb-3" controlId="contactFormMessage">
                                        <Form.Label>Message</Form.Label>
                                        <Form.Control as="textarea" name="message" value={formData.message} onChange={handleChange} rows={4} maxLength={LIMITS.message} placeholder="Your message..." autoComplete="off" isInvalid={!!errors.message} required />
                                        <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Button variant="dark" type="submit" className="w-100 submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>Submit <FiSend size={16} className="ms-1" /></>
                                        )}
                                    </Button>
                                    {submitMessage && (
                                        <div role={submitMessage.ok ? 'status' : 'alert'} className={`mt-3 small ${submitMessage.ok ? 'text-success' : 'text-danger'}`}>
                                            {submitMessage.text}
                                        </div>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactHeroForm;