import { adminPaginationBtnClass } from '../lib/adminChrome.ts';
import { paginationItems } from '../lib/pagination.ts';

type PaginationProps = {
  page: number;
  pages: number;
  total: number;
  showing: number;
  onPage: (page: number) => void;
  disabled?: boolean;
};

export default function Pagination({ page, pages, total, showing, onPage, disabled }: PaginationProps) {
  const current = Math.min(Math.max(1, page), Math.max(1, pages));
  const last = Math.max(1, pages);
  const items = paginationItems(current, last);

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-3 xl:flex-row xl:items-center xl:justify-between">
      <p className="shrink-0 font-body text-[13px] text-muted">
        Page {current} of {last} · Showing {showing} of {total}
      </p>
      <nav className="flex flex-wrap items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          className={adminPaginationBtnClass(false)}
          disabled={disabled || current <= 1}
          onClick={() => onPage(current - 1)}
        >
          Previous
        </button>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 font-display text-[13px] font-bold text-muted"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={adminPaginationBtnClass(item === current)}
              aria-current={item === current ? 'page' : undefined}
              aria-label={`Page ${item}`}
              disabled={disabled || item === current}
              onClick={() => onPage(item)}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className={adminPaginationBtnClass(false, true)}
          disabled={disabled || current >= last}
          onClick={() => onPage(current + 1)}
        >
          Next
        </button>
      </nav>
    </div>
  );
}

