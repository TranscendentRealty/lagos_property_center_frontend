// components/user/explore/ExploreMoreCategories.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

const categoriesData = [
  {
    id: 1,
    label: 'APARTMENT',
    imageUrl: '/images/ApartmentPlaceholder.png',
    altText: 'Modern apartment houses',
    slug: 'apartment',
  },
  {
    id: 2,
    label: 'TERRACE',
    imageUrl: '/images/TerracePlaceholder.png',
    altText: 'Modern terrace houses',
    slug: 'terrace',
  },
  {
    id: 3,
    label: 'SEMI DETACHED',
    imageUrl: '/images/SemiDetachedPlaceholder.png',
    altText: 'Modern semi-detached house',
    slug: 'semi-detached',
  },
  {
    id: 4,
    label: 'FULLY DETACHED',
    imageUrl: '/images/FullyDetachedPlaceholder.png',
    altText: 'Luxurious fully detached villa',
    slug: 'fully-detached',
  },
];

const ExploreMoreCategories = () => {
  const title = "Explore more categories";
  const subtitle = "View various listing categories...";

  return (
    <section className="explore-categories-section py-5 mt-5 mt-lg-0" id='explore-categories'>
      <div className="container" style={{ maxWidth: '1200px' }}>

        <hgroup className="mb-4 mb-md-5 mt-4 mt-md-0 section-heading">
          <h2 className="section-title fw-bold">{title}</h2>
          <p className="lead text-muted">{subtitle}</p>
        </hgroup>

        <div className="row g-5 justify-content-center">
          {categoriesData.map((category) => (
            <div key={category.id} className="col-12 col-md-6 col-lg-4 d-flex" data-aos="flip-right" data-aos-ease="ease-in" data-aos-duration="1500">
              <Link
                href={`/explore/${category.slug}#explore-categories`}
                className="card category-card text-decoration-none w-100"
              >
                <div className="category-card-image-wrapper">
                  <Image
                    src={category.imageUrl}
                    alt={category.altText}
                    layout="fill"
                    objectFit="cover"
                    className="category-img"
                  />
                </div>
                <div className="card-img-overlay d-flex align-items-end p-0">
                  <div className="category-label w-100 text-center">
                    <span className="label-text d-inline-block">{category.label}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ExploreMoreCategories;
