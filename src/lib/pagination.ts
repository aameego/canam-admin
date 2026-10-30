export type PaginationItem = number | 'ellipsis';

const EDGE = 3;
const SIBLING = 1;
const SHOW_ALL_MAX = 10;

export const paginationItems = (page: number, pages: number): PaginationItem[] => {
  const total = Math.max(0, Math.floor(pages));
  if (total === 0) return [];

  const current = Math.min(Math.max(1, Math.floor(page) || 1), total);
  if (total <= SHOW_ALL_MAX) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const visible = new Set<number>();
  for (let i = 1; i <= EDGE; i += 1) visible.add(i);
  for (let i = total - EDGE + 1; i <= total; i += 1) visible.add(i);
  for (let i = current - SIBLING; i <= current + SIBLING; i += 1) {
    if (i >= 1 && i <= total) visible.add(i);
  }

  const sorted = [...visible].sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous > 0 && value - previous > 1) items.push('ellipsis');
    items.push(value);
    previous = value;
  }
  return items;
};

export const ADMIN_CONTENT_ID = 'admin-content';

export const scrollAdminContentToTop = (): void => {
  document.getElementById(ADMIN_CONTENT_ID)?.scrollTo({ top: 0 });
};
