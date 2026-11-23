import { useQuery } from '@tanstack/react-query';
import BusyOverlay from '../components/BusyOverlay.tsx';
import { queriesApi } from '../api/queries.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { adminQueryKeys } from '../lib/queryKeys.ts';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' });

/** Contact Us submissions from the storefront, newest first. */
export default function QueriesPage() {
  const query = useQuery({
    queryKey: adminQueryKeys.queries,
    queryFn: async () => (await queriesApi.list()).data.messages,
  });
  const rows = query.data ?? [];

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:gap-6">
      <p className="font-body text-[13px] text-muted">
        Messages customers send from the website&apos;s Contact Us form. Each one is also emailed to the ops inbox.
      </p>

      {query.isError && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {getErrorMessage(query.error, 'Could not load queries.')}
        </p>
      )}
      {query.isLoading && (
        <div className="relative min-h-48 rounded-lg border border-line bg-white">
          <BusyOverlay label="Loading queries…" />
        </div>
      )}
      {query.isSuccess && rows.length === 0 && (
        <p className="rounded-lg border border-line bg-white px-4 py-8 font-body text-[14px] text-muted">
          No queries yet.
        </p>
      )}

      <div className="grid min-w-0 gap-3">
        {rows.map((row) => (
          <article key={row._id} className="min-w-0 rounded-lg border border-line bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display text-[15px] font-bold text-navy">{row.businessName}</h3>
                <p className="font-body text-[13px] text-muted">
                  {row.fullName} · <span className="capitalize">{row.businessType.replace('-', ' ')}</span>
                </p>
              </div>
              <p className="shrink-0 font-body text-[12px] text-muted">{formatDate(row.createdAt)}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-[13px]">
              <a className="break-all text-navy underline" href={`mailto:${row.email}`}>
                {row.email}
              </a>
              <a className="text-navy underline" href={`tel:${row.phone}`}>
                {row.phone}
              </a>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words rounded-[6px] bg-canvas p-3 font-body text-[14px] text-ink">
              {row.message}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
