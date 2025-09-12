import React from 'react';
import styles from '../../../app/page.module.css';
import PropertyCard from '../fragments/PropertyCard';
import { images } from '@/exports/images';
import { IAdmin, IAgency, IProperty } from '@/types/property';
import { AgentProfileData } from '@/types/common';
import { dummyAgency, dummyAdmin, dummyProperties } from '@/exports/placeholderData';




const AgentListings = () => {

const agent: AgentProfileData = {
    firstName: 'John', lastName: 'Doe', title: 'Lead Agent', phone: '+234 800 123 4567', email: 'johndoe@transcendentralty.com', rating: 4.0, bio: [ "With years of experience and a deep understanding of the local real estate market, John Doe is dedicated to helping clients find their dream properties or secure the best deals on their investments. Specializing in luxury residential, commercial, and investment properties, John Doe combines market expertise with a personalized approach to deliver exceptional results every time.", "Whether you're a first-time buyer, an investor, or looking to sell your property, John Doe is here to guide you every step of the way."], imageUrl: images.TeamMemberOnePlaceholder,
    quote: "Your satisfaction is my priority. Let's turn your real estate goals into reality!",
};

    return (
        <section className='container'>
            <hgroup className="section-heading">
                <h2>{agent.firstName}&apos;s Listings</h2>
                <p className='mt-2 text-muted'>Book {agent.firstName} for a tour to see these listings.</p>
            </hgroup>

            <div className="row d-flex justify-content-lg-between justify-content-center mx-0 px-0">
                {
                    dummyProperties.map((property, key) => (
                        <PropertyCard
                            property={property}
                            key={key}
                        />

                    ))
                }
            </div>


        </section>
    )
}

export default AgentListings