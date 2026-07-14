import { useState } from 'react';
import styles from './index.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ColumnAlign = 'left' | 'center' | 'right';

export interface Column<T> {
  key:        string;
  title:      string;
  align?:     ColumnAlign;
  sortable?:  boolean;
  width?:     string;
  render:     (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns:        Column<T>[];
  data:           T[];
  rowKey:         (row: T) => string | number;
  isLoading?:     boolean;
  skeletonRows?:  number;
  total?:         number;
  page?:          number;
  limit?:         number;
  totalPages?:    number;
  onPageChange?:  (page: number) => void;
  emptyIcon?:     string;
  emptyTitle?:    string;
  emptySubtitle?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, '...', total - 1, total];
  if (current >= total - 2) return [1, 2, '...', total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

const SKELETON_WIDTHS = [
  styles.skeletonShort,
  styles.skeletonMedium,
  styles.skeletonLong,
  styles.skeletonMedium,
  styles.skeletonShort,
];

// Map align → justify-content value for flex containers
const alignToJustify = (align?: ColumnAlign): string => {
  if (align === 'center') return 'center';
  if (align === 'right')  return 'flex-end';
  return 'flex-start';
};

// ── Component ─────────────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading     = false,
  skeletonRows  = 5,
  total         = 0,
  page          = 1,
  limit         = 10,
  totalPages    = 0,
  onPageChange,
  emptyIcon     = 'fa-regular fa-folder-open',
  emptyTitle    = 'No data found',
  emptySubtitle = 'Nothing to display yet.',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const pageNumbers = getPageNumbers(page, totalPages);

  const sortIconName = (key: string) => {
    if (sortKey !== key) return 'fa-solid fa-sort';
    return sortDir === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>

        {/* ── Head ── */}
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={col.sortable ? styles.thSortable : ''}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {/*
                  Use a flex div that fills the full th width.
                  justify-content controls left/center/right alignment.
                */}
                <div
                  className={styles.thInner}
                  style={{ justifyContent: alignToJustify(col.align) }}
                >
                  {col.title}
                  {col.sortable && (
                    <i
                      className={`${sortIconName(col.key)} ${styles.sortIcon} ${
                        sortKey === col.key ? styles.sortIconActive : ''
                      }`}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody className={styles.tbody}>

          {/* Loading skeleton */}
          {isLoading &&
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <tr key={`skel-${rowIdx}`}>
                {columns.map((col, colIdx) => (
                  <td key={col.key} className={styles.skeletonCell}>
                    <div
                      className={`${styles.skeleton} ${
                        SKELETON_WIDTHS[colIdx % SKELETON_WIDTHS.length]
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}

          {/* Empty state */}
          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className={emptyIcon} />
                  </div>
                  <p className={styles.emptyTitle}>{emptyTitle}</p>
                  <p className={styles.emptySubtitle}>{emptySubtitle}</p>
                </div>
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!isLoading &&
            data.map((row, index) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align ?? 'left' }}
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {/* ── Pagination ── */}
      {!isLoading && totalPages > 1 && onPageChange && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing{' '}
            {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)}{' '}
            of {total} results
          </span>

          <div className={styles.paginationPages}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} />
            </button>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className={styles.pageDots}>…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageBtn} ${
                    p === page ? styles.pageBtnActive : ''
                  }`}
                  onClick={() => onPageChange(p as number)}
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}