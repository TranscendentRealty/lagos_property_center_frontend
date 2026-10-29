import Image from 'next/image';
import Search from '../layout/Search';
import MeasuredSection from '../layout/MeasuredSection';
export default function SearchForYourDreamHome() {
  return <MeasuredSection>
    <div className="compact-ai-image"><Image src="/images/FullyDetachedPlaceholder.png" alt="A Lagos home" fill sizes="(max-width: 767px) 100vw, 320px" style={{ objectFit: 'cover' }} /></div>
    <div className="compact-ai-content">
      <h2 id="ai-search-heading">Describe the home you want</h2>
      <p>Tell us what matters to you. Our AI-assisted search will check available listings.</p>
      <Search aiSearch />
      <p className="small text-muted mt-3 mb-0">Try “4-bedroom semi-detached in Ikate” or “Apartment in Lekki Phase 1 with a pool”.</p>
    </div>
  </MeasuredSection>;
}
