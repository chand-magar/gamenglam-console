import dayjs from 'dayjs';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Review } from '../../../../domain/entities/Review';

interface Props {
  items:        Review[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onDelete:     (item: Review) => void;
  onPageChange: (page: number) => void;
}

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ color: '#f59e0b', letterSpacing: 1, fontSize: 13 }}>
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    <span style={{ color: 'var(--gng-muted)', marginLeft: 4, fontSize: 11 }}>({rating}/5)</span>
  </span>
);

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
  A: { label: 'Visible',  cls: 'gng-badge-active',   icon: 'fa-circle-check' },
  I: { label: 'Hidden',   cls: 'gng-badge-inactive', icon: 'fa-circle-pause' },
};

export const ReviewTable = ({
  items, total, page, totalPages, isLoading, onDelete, onPageChange,
}: Props) => {

  const columns: Column<Review>[] = [
    {
      key:    'no',
      title:  'No',
      width:  '56px',
      render: (_, index) => (
        <span className="gng-row-no">
          {String((page - 1) * 10 + index + 1).padStart(2, '0')}
        </span>
      ),
    },
    {
      key:    'product',
      title:  'Product',
      render: (row) => (
        <span style={{ fontSize: 13, fontWeight: 500 }}>{row.product_name}</span>
      ),
    },
    {
      key:    'customer',
      title:  'Customer',
      render: (row) => (
        <span style={{ fontSize: 13 }}>{row.customer_name}</span>
      ),
    },
    {
      key:    'rating',
      title:  'Rating',
      align:  'center',
      render: (row) => <Stars rating={row.rating} />,
    },
    {
      key:    'review',
      title:  'Review',
      render: (row) => (
        <div style={{ maxWidth: 280 }}>
          {row.title && (
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0, marginBottom: 2, color: 'var(--gng-text)' }}>
              {row.title}
            </p>
          )}
          <p style={{ fontSize: 12, color: 'var(--gng-muted)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {row.body}
          </p>
        </div>
      ),
    },
    {
      key:    'status',
      title:  'Status',
      align:  'center',
      render: (row) => {
        const s = STATUS_MAP[row.status] ?? STATUS_MAP['I'];
        return (
          <span className={`gng-badge ${s.cls}`}>
            <i className={`fa-solid ${s.icon}`} style={{ fontSize: 10 }} />
            {s.label}
          </span>
        );
      },
    },
    {
      key:    'date',
      title:  'Date',
      align:  'center',
      render: (row) => (
        <span className="gng-date">{dayjs(row.created_at).format('MMM DD, YYYY')}</span>
      ),
    },
    {
      key:    'actions',
      title:  'Actions',
      align:  'center',
      render: (row) => (
        <div className="gng-actions">
          <button type="button" className="gng-action-btn gng-action-delete" onClick={() => onDelete(row)} title="Delete">
            <i className="fa-regular fa-trash-can" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Review>
      columns={columns}
      data={items}
      rowKey={(row) => row.review_id}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-solid fa-star"
      emptyTitle="No reviews found"
      emptySubtitle="Customer reviews will appear here once submitted."
    />
  );
};
