import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-pine">404</p>
      <h1 className="mt-3 text-2xl font-bold">This page does not exist</h1>
      <p className="mt-2 text-ink/65">The link may be broken, or the page may have moved.</p>
      <Link to="/" className="btn-primary mt-6">Go to home</Link>
    </div>
  );
}
