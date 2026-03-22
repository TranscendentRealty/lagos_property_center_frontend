import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Property Listing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

    const placeholder = 'https://placehold.co/600x630/1a1a1a/ffffff.png';
    let photo1 = placeholder;
    let photo2 = placeholder;
    let title = 'Property Listing';
    let location = '';

    try {
        const res = await fetch(`${apiBaseUrl}/api/v1/properties/${id}`, { cache: 'force-cache' });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
                const product = data.data;
                photo1 = product.photos?.[0] || placeholder;
                photo2 = product.photos?.[1] || photo1;
                title = product.title || title;
                if (product.location?.city) {
                    location = `${product.location.street}, ${product.location.city}`;
                }
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
                    width: '1200px',
                    height: '630px',
                    backgroundColor: '#111',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Left photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photo1}
                    width={600}
                    height={630}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                />

                {/* Thin divider */}
                <div style={{ width: '3px', height: '630px', backgroundColor: '#fff', flexShrink: 0 }} />

                {/* Right photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photo2}
                    width={597}
                    height={630}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                />

                {/* Bottom gradient overlay with title */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '180px',
                        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.85))',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '0 40px 28px',
                    }}
                >
                    <span
                        style={{
                            color: '#ffffff',
                            fontSize: '32px',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                            maxWidth: '900px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {title}
                    </span>
                    {location && (
                        <span
                            style={{
                                color: '#e0e0e0',
                                fontSize: '20px',
                                marginTop: '8px',
                                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                            }}
                        >
                            {location}
                        </span>
                    )}
                    <span
                        style={{
                            color: '#aaa',
                            fontSize: '16px',
                            marginTop: '6px',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Transcendent Realty
                    </span>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
