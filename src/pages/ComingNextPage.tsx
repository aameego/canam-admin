import { COMING_NEXT_COPY } from '../lib/adminChrome.ts';

export default function ComingNextPage({ name }: { name: string }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 sm:p-8">
      <h2 className="font-display text-[18px] font-extrabold text-navy">{name}</h2>
      <p className="mt-2 font-body text-[14px] text-muted">{COMING_NEXT_COPY}</p>
    </section>
  );
}
