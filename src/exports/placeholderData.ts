import { IAdmin, IAgency, IProperty } from '@/types/property';


const dummyAgency: IAgency = { _id: '001', name: 'Transcendent Realty', email: 'transcendentrealtyservices@gmail.com', logo: 'https://res.cloudinary.com/do5lofza7/image/upload/v1755997174/LagosPropertyCenter/Agency/TranscendentRealty.png', address: '44/46 Alaramimo Street, Agege, Lagos', phone: '+2349169112315' };

const dummyAdmin: IAdmin = {
    _id: '001',
    name: 'Oluwapelumi Olalekan',
    email: 'polalekan@gmail.com',
    phone: '+234 701 430 8488',
    address: 'Ikeja, Lagos',
    avatar: 'https://res.cloudinary.com/do5lofza7/image/upload/v1755998014/LagosPropertyCenter/Admin/Pelumi.png',
    calendlyLink: 'www.example.com'
}

const dummyProperties: Array<IProperty> = [{
    _id: "001",
    title: 'Luxury 5-Bedroom Detached Duplex in Lekki',
    description: 'A stunning and spacious duplex with modern amenities, a swimming pool, and a BQ. Perfect for a family looking for comfort and class.',
    listingType: 'For Sale',
    propertyType: 'House',
    propertySubtype: 'Detached Duplex',
    location: { street: '123 Admiralty Way', city: 'Lekki', state: 'Lagos', country: 'Nigeria' },
    price: { amount: 350000000, currency: 'NGN' },
    details: { bedrooms: 5, bathrooms: 5, toilets: 6, parkingSpaces: 4, livingrooms: 5 },
    area: { total: 650, unit: 'sqm' },
    photos: ['https://res.cloudinary.com/do5lofza7/image/upload/v1751570976/Transcendent_Realty/Sample_Images/PropertyImagePlaceholder_ousfbr.png', 'https://res.cloudinary.com/do5lofza7/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1751570976/Transcendent_Realty/Sample_Images/PropertyImagePlaceholder_ousfbr.png', 'https://res.cloudinary.com/do5lofza7/image/upload/v1751570981/Transcendent_Realty/Sample_Images/PropertyImagePlaceholder2_jn6xcq.png'],
    isFeatured: true,
    status: 'Available',
    amenities: ['elevator', 'gym'],
    // creator: "01",
    // agency: "01",
    createdAt: "01-01-1970",
    updatedAt: "01-01-1970",
    creator: dummyAdmin,
    agency: dummyAgency
},
{
    _id: "2",
    title: 'Modern 3-Bedroom Apartment for Rent in Ikoyi',
    description: 'Well-finished 3-bedroom apartment in a secure and serene serviced estate. Comes with 24/7 power and security.',
    listingType: 'For Rent',
    propertyType: 'Apartment',
    propertySubtype: 'Flat',
    location: { street: '456 Orchid Road', city: 'Lekki', state: 'Lagos', country: 'Nigeria' },
    price: { amount: 15000000, currency: 'NGN' },
    details: { bedrooms: 3, bathrooms: 3, toilets: 4, parkingSpaces: 2, livingrooms: 3 },
    area: { total: 220, unit: 'sqm' },
    photos: ['https://res.cloudinary.com/do5lofza7/image/upload/v1751570981/Transcendent_Realty/Sample_Images/PropertyImagePlaceholder2_jn6xcq.png', 'https://res.cloudinary.com/do5lofza7/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1751570981/Transcendent_Realty/Sample_Images/PropertyImagePlaceholder2_jn6xcq.png'],
    isFeatured: true,
    status: 'Available',
    amenities: ['elevator', 'gym'],
    // creator: "01",
    // agency: "01",
    createdAt: "01-01-1970",
    updatedAt: "01-01-1970",
    creator: dummyAdmin,
    agency: dummyAgency
},
{
    _id: "3",
    title: 'Commercial Land on a Major Road in Ikeja',
    description: 'A prime plot of land measuring 1200 sqm, suitable for commercial development. Fenced and gated with a good title.',
    listingType: 'For Sale',
    propertyType: 'Land',
    location: { street: '789 Lekki County', city: 'Ajah', state: 'Lagos', country: 'Nigeria' },
    price: { amount: 500000000, currency: 'NGN' },
    details: { bedrooms: 3, bathrooms: 3, toilets: 4, parkingSpaces: 2, livingrooms: 3 },
    area: { total: 1200, unit: 'sqm' },
    photos: ['https://res.cloudinary.com/do5lofza7/image/upload/v1751570979/Transcendent_Realty/Sample_Images/SemiDetachedPlaceholder_cxff1j.png', 'https://res.cloudinary.com/do5lofza7/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1751570979/Transcendent_Realty/Sample_Images/SemiDetachedPlaceholder_cxff1j.png'],
    isFeatured: false,
    status: 'Available',
    amenities: ['elevator', 'gym'],
    // creator: "01",
    // agency: "01",
    createdAt: "01-01-1970",
    updatedAt: "01-01-1970",
    creator: dummyAdmin,
    agency: dummyAgency
},
{
    _id: "4",
    title: 'Luxury 6-Bedroom Detached Triplex in Ajah',
    description: 'A stunning and spacious duplex with modern amenities, a swimming pool, and a BQ. Perfect for a family looking for comfort and class.',
    listingType: 'For Sale',
    propertyType: 'House',
    propertySubtype: 'Detached Triplex',
    location: { street: 'Lekki County', city: 'Ajah', state: 'Lagos', country: 'Nigeria' },
    price: { amount: 400000000, currency: 'NGN' },
    details: { bedrooms: 6, bathrooms: 4, toilets: 7, parkingSpaces: 4, livingrooms: 6 },
    area: { total: 750, unit: 'sqm' },
    photos: ['https://res.cloudinary.com/do5lofza7/image/upload/v1751570976/Transcendent_Realty/Sample_Images/PropertyImagePlaceholder_ousfbr.png', 'https://res.cloudinary.com/do5lofza7/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1751570976/Transcendent_Realty/Sample_Images/PropertyImagePlaceholder_ousfbr.png', 'https://res.cloudinary.com/do5lofza7/image/upload/v1751570981/Transcendent_Realty/Sample_Images/PropertyImagePlaceholder2_jn6xcq.png'],
    isFeatured: true,
    status: 'Available',
    amenities: ['elevator', 'gym'],
    // creator: "01",
    // agency: "01",
    createdAt: "01-01-1970",
    updatedAt: "01-01-1970",
    creator: dummyAdmin,
    agency: dummyAgency
}
];

export {
    dummyAgency,
    dummyAdmin,
    dummyProperties
};