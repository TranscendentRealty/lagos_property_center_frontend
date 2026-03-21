import React from 'react';
import { Metadata } from 'next';
import AboutUsIntro from '@/components/user/about-us/AboutUsIntro';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Transcendent Realty — our mission, values, and the team behind Lagos\'s most trusted premium real estate platform.',
  openGraph: {
    title: 'About Us | Transcendent Realty',
    description: 'Meet the team behind Transcendent Realty and discover how we\'re transforming property search in Lagos.',
  },
};
import MissionStatement from '@/components/user/about-us/MissionStatement';
import MeetTheTeam from '@/components/user/about-us/MeetTheTeam';
import StatsAndTestimonials from '@/components/user/about-us/StatsAndTestimonials';

const AboutUs = () => {
  return (
    <main>
        <AboutUsIntro />
        <MissionStatement />
        <MeetTheTeam />
        <StatsAndTestimonials />
    </main>
  )
}

export default AboutUs