import { ImageResponse } from 'next/og';

export const alt = 'Property Listing';
// 800×418 keeps the standard 1.91:1 OG ratio while being ~56% fewer pixels than 1200×630.
// Smaller canvas = smaller PNG file = WhatsApp can fetch it before its timeout.
export const size = { width: 800, height: 418 };
export const contentType = 'image/png';

const THEME_GREEN = '#525536';
const THEME_YELLOW = '#e6df9d';
const OFF_WHITE = '#f5f5f5';
const TEXT_DARK = '#0f1a2a';

/**
 * Rewrites an R2 media URL through Cloudflare Image Resizing so the OG
 * image generator fetches a small, compressed version of the source photo
 * instead of the full-resolution original.
 * Docs: https://developers.cloudflare.com/images/transform-images/transform-via-url/
 */
function cfResize(url: string, width: number, height: number, quality = 75): string {
    try {
        const parsed = new URL(url);
        // Only apply to our own media domain; pass external / placeholder URLs through as-is
        if (!parsed.hostname.includes('transcendentrealty.com')) return url;
        return `${parsed.origin}/cdn-cgi/image/width=${width},height=${height},fit=cover,quality=${quality},format=jpeg${parsed.pathname}`;
    } catch {
        return url;
    }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

    const placeholder = 'https://placehold.co/346x418/525536/e6df9d.png';
    let photo = placeholder;
    let title = 'Exclusive Property Listing';
    let location = '';
    let price = '';
    let amenities: string[] = [];
    let description = '';

    try {
        const res = await fetch(`${apiBaseUrl}/api/v1/properties/${id}`, { cache: 'force-cache' });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
                const product = data.data;
                // Request a 346×418 version of the photo from Cloudflare — much smaller than the original
                const rawPhoto = product.photos?.[0] || placeholder;
                // photo = cfResize(rawPhoto, 346, 418);
                photo = rawPhoto; // Disable CF resizing for now since it's a paid cloudflare add-on
                title = product.title || title;
                description = product.description
                    ? product.description.slice(0, 100) + (product.description.length > 100 ? '…' : '')
                    : '';
                if (product.location?.city) {
                    location = `${product.location.street}, ${product.location.city}`;
                }
                if (product.price) {
                    price = `#${Number(product.price).toLocaleString('en-NG')}`;
                }
                amenities = (product.amenities || []).slice(0, 3);
            }
        }
    } catch {
        // fall through to defaults
    }

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    width: '800px',
                    height: '418px',
                    backgroundColor: THEME_GREEN,
                    fontFamily: 'sans-serif',
                }}
            >
                {/* ── LEFT: Property photo ── */}
                <div style={{ display: 'flex', width: '346px', height: '418px', flexShrink: 0, position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={photo}
                        alt={title}
                        width={346}
                        height={418}
                        style={{ objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    {/* Gradient bleed into the green panel */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '80px',
                            height: '418px',
                            background: `linear-gradient(to right, transparent, ${THEME_GREEN})`,
                        }}
                    />
                </div>

                {/* ── RIGHT: Details panel ── */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        padding: '28px 28px 28px 14px',
                        backgroundColor: THEME_GREEN,
                        justifyContent: 'space-between',
                    }}
                >
                    {/* Brand label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '20px', height: '2px', backgroundColor: THEME_YELLOW, borderRadius: '2px' }} />
                        <span
                            style={{
                                color: THEME_YELLOW,
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Transcendent Realty
                        </span>
                    </div>

                    {/* Title + location + price */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', flex: 1, justifyContent: 'center' }}>
                        <span
                            style={{
                                color: OFF_WHITE,
                                fontSize: title.length > 50 ? '17px' : '20px',
                                fontWeight: 800,
                                lineHeight: 1.2,
                            }}
                        >
                            {title}
                        </span>

                        {location && (
                            <span style={{ color: THEME_YELLOW, fontSize: '11px', opacity: 0.9 }}>
                                📍 {location}
                            </span>
                        )}

                        {price && (
                            <span
                                style={{
                                    color: THEME_YELLOW,
                                    fontSize: '20px',
                                    fontWeight: 800,
                                    marginTop: '2px',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                               {price}
                            </span>
                        )}

                        {/* Divider */}
                        <div
                            style={{
                                width: '100%',
                                height: '1px',
                                backgroundColor: THEME_YELLOW,
                                opacity: 0.25,
                                marginTop: '6px',
                                marginBottom: '2px',
                            }}
                        />

                        {description && (
                            <span style={{ color: OFF_WHITE, fontSize: '10px', lineHeight: 1.5, opacity: 0.8 }}>
                                {description}
                            </span>
                        )}

                        {amenities.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                                {amenities.map((a, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            backgroundColor: 'rgba(230,223,157,0.15)',
                                            border: '1px solid rgba(230,223,157,0.4)',
                                            color: THEME_YELLOW,
                                            fontSize: '9px',
                                            fontWeight: 600,
                                            padding: '3px 8px',
                                            borderRadius: '20px',
                                            letterSpacing: '0.03em',
                                        }}
                                    >
                                        {a}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '12px',
                            paddingTop: '10px',
                            borderTop: '1px solid rgba(230,223,157,0.2)',
                        }}
                    >
                        <span style={{ color: THEME_YELLOW, fontSize: '9px', opacity: 0.7, letterSpacing: '0.08em' }}>
                            transcendentrealty.com
                        </span>
                        <span
                            style={{
                                backgroundColor: THEME_YELLOW,
                                color: TEXT_DARK,
                                fontSize: '9px',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            View Listing
                        </span>
                    </div>
                </div>
            </div>
        ),
        { width: 800, height: 418 }
    );
}
