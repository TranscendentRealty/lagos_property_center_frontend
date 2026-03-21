import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for could not be found. Explore our premium Lagos property listings instead.',
};

export default function NotFound() {
  const mosaicImages = [
    { src: '/images/PropertyImagePlaceholder.png', alt: 'Luxury apartment' },
    { src: '/images/PropertyImagePlaceholder2.png', alt: 'Luxury apartment' },
    { src: '/images/ApartmentPlaceholder.png', alt: 'Modern apartment' },
    { src: '/images/SemiDetachedPlaceholder.png', alt: 'Semi-detached home' },
  ];

  return (
    <main className="not-found-page">
      <div className="container-fluid px-0 flex-grow-1">
        <div className="row g-0" style={{ minHeight: '100vh' }}>

          {/* ── Left panel — text ── */}
          <div className="col-lg-6 not-found-content">
            <span className="not-found-label text-uppercase">
              Transcendent Realty
            </span>

            <div className="not-found-number" aria-hidden="true">404</div>

            <h1 className="not-found-heading fw-bold">
              This property<br />has left the market.
            </h1>

            <p className="not-found-sub">
              The page you&apos;re looking for may have been moved, renamed, or is
              no longer available. Let&apos;s get you back to finding your dream home.
            </p>

            <div className="d-flex flex-wrap gap-3 mt-2">
              <Link
                href="/"
                className="btn rounded-pill px-4 py-2 fw-semibold not-found-btn-primary"
              >
                Back to Home
              </Link>
              <Link
                href="/explore"
                className="btn rounded-pill px-4 py-2 fw-semibold not-found-btn-secondary"
              >
                Explore Properties
              </Link>
            </div>
          </div>

          {/* ── Right panel — image mosaic ── */}
          <div className="col-lg-6 not-found-image-col">
            <div className="not-found-image-grid">
              {mosaicImages.map((img) => (
                <div key={img.src} className="not-found-img-item">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 992px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>

            <div className="not-found-mosaic-label">
              <p>Discover premium properties across Lagos</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
