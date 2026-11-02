'use client';
import Offcanvas from 'react-bootstrap/Offcanvas';
import AssistedContactForm from './AssistedContactForm';

// User-opened only, so dialog semantics, focus trapping, Escape and focus return are appropriate here.
export default function AssistedContactDrawer({ show, onHide }: { show: boolean; onHide: () => void }) {
  return <Offcanvas show={show} onHide={onHide} placement="end" className="assist-drawer" aria-labelledby="assist-drawer-title" restoreFocus>
    <Offcanvas.Header closeButton closeLabel="Close shortlist request">
      <Offcanvas.Title as="h2" id="assist-drawer-title" className="h5 mb-0">Get a shortlist</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
      <AssistedContactForm mode="drawer" />
    </Offcanvas.Body>
  </Offcanvas>;
}
