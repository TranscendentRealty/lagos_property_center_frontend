import { Metadata } from 'next';
import ShortlistPageForm from '@/components/user/assisted-contact/ShortlistPageForm';

// Personal information is never carried in query parameters, so the canonical is the bare path.
export const metadata: Metadata = {
  title: 'Get a shortlist',
  description: 'Tell us the area and type of home you have in mind, and Bukunmi will suggest a short list of suitable Lagos properties.',
  alternates: { canonical: '/get-a-shortlist' },
};

export default function GetAShortlistPage() {
  return <main className="container py-4 py-md-5" style={{ maxWidth: 720 }}>
    <h1 className="h2">Want help narrowing this down?</h1>
    <p className="lead">Tell us the area and type of home you have in mind. Bukunmi can suggest a short list of suitable properties and explain the next steps.</p>
    <div className="card shadow-sm"><div className="card-body p-3 p-md-4">
      <ShortlistPageForm />
    </div></div>
  </main>;
}
