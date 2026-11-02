import { Link } from 'react-router-dom';
import { routes } from '../routes.ts';

export default function NotFoundPage() {
  return (
    <section className="rounded-lg border border-line bg-white p-5 sm:p-8">
      <h2 className="font-display text-[18px] font-extrabold text-navy">Page not found</h2>
      <p className="mt-2 font-body text-[14px] text-muted">
        This address does not match any admin screen. Check the link or go back to the dashboard.
      </p>
      <Link
        to={routes.root}
        className="mt-5 inline-flex h-11 items-center rounded-[6px] bg-navy px-4 font-display text-[13px] font-bold text-white hover:bg-navy/90"
      >
        Go to dashboard
      </Link>
    </section>
  );
}
