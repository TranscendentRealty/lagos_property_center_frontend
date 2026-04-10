// components/layout/LocationDropdownSearch.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { availableLocations } from '@/exports/constants';

// const locations = [
//     'Lekki Phase 1',
//     'Chevron',
//     'Ikate',
//     'Ologolo',
//     'Osapa',
//     'Idado',
//     'Lekki Conservation Road',
//     'Ikota',
//     'VGC',
//     'Orchid Road',
// ];

const LocationDropdownSearch = ({ classNames }: { classNames?: string }) => {
    const router = useRouter();
    const [selectedLocation, setSelectedLocation] = useState('');

    useEffect(() => {
        if (!selectedLocation) return;
        router.push(`/search?search=${encodeURIComponent(selectedLocation)}`);
    }, [selectedLocation, router]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedLocation) return;
        router.push(`/search?search=${encodeURIComponent(selectedLocation)}`);
    };

    return (
        <form onSubmit={handleSearch}>
            <div className={`input-group search-wrapper ${classNames ?? ''}`}>
                <div className="aurora-input-wrapper">
                    <select
                        className="form-control search-field text-white"
                        value={selectedLocation}
                        onChange={(e) => {
                            setSelectedLocation(e.target.value)

                        }}
                        style={{ background: 'transparent', cursor: 'pointer' }}
                    >
                        <option value="" disabled>Search by location...</option>
                        {availableLocations.map(loc => (
                            <option
                                key={loc}
                                value={loc}
                                style={{ color: '#000', backgroundColor: '#fff' }}
                            >
                                {loc}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group-append py-0">
                    <button
                        type="submit"
                        className="btn search-btn text-white"
                        // disabled={!selectedLocation}
                        disabled={true}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default LocationDropdownSearch;
