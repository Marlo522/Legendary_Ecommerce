import { Link } from 'react-router';
import { useAuth } from '../features/auth/useAuth';
import { postLoginPath } from '../features/auth/authPaths';

export function ForbiddenPage() {
  const { user } = useAuth();
  return <section className="mx-auto max-w-2xl px-6 py-20">
    <p className="editorial-caption mb-4">Access restricted</p>
    <h1 className="font-display text-5xl">This area is not available to your account.</h1>
    <p className="mt-5 text-sm text-brand-gray">Return to your account to continue.</p>
    <Link className="button-primary mt-7 inline-flex" to={postLoginPath(user)}>Go to my account</Link>
  </section>;
}

export function NotFoundPage() {
  return <section className="mx-auto max-w-2xl px-6 py-20">
    <p className="editorial-caption mb-4">404 / Page not found</p>
    <h1 className="font-display text-5xl">This page could not be found.</h1>
    <Link className="button-primary mt-7 inline-flex" to="/">Return to the store</Link>
  </section>;
}
