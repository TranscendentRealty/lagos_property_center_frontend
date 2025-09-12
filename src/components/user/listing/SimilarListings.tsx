import React from 'react';
import styles from '../../../app/page.module.css';
import PropertyCard from '../fragments/PropertyCard';
import { images } from '@/exports/images';
import { IProperty } from '@/types/property';
import { dummyProperties } from '@/exports/placeholderData';


interface SimilarListingsProps {
    properties: Array<IProperty>;
}

const SimilarListings = ({
    properties
} : SimilarListingsProps) => {

    return (
        <section className=''>
            <hgroup className="section-heading">
                <h2>Similar Listings</h2>
                <p>People also checked the following out </p>
            </hgroup>

            <div className={`row d-flex justify-content-lg-${properties.length === 3 ? 'between' : 'start'} justify-content-center mx-0 px-0`}>
                {
                    properties.map((property, key) => (
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

export default SimilarListings