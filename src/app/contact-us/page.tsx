import React from 'react';
import { Metadata } from 'next';
import ContactHeroForm from '@/components/user/contact-us/ContactHeroForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Transcendent Realty. Reach out to our team to buy or invest in premium Lagos properties.',
  openGraph: {
    title: 'Contact Us | Transcendent Realty',
    description: 'Speak directly with a Transcendent Realty agent. We\'re ready to help you find your ideal property in Lagos.',
  },
};



const ContactUs = () => {
  return (
    <main>
        <ContactHeroForm />
    </main>
  )
}

export default ContactUs