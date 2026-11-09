import dayjs from 'dayjs';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Coupon } from '../../../../domain/entities/Coupon';

interface Props {
  items:        Coupon[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onEdit:       (item: Coupon) => void;
  onDelete:     (item: Coupon) => void;
  onPageChange: (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
  A: { label: 'Active',   cls: 'gng-badge-active',   icon: 'fa-circle-check' },
  I: { label: 'Inactive', cls: 'gng-badge-inactive', icon: 'fa-circle-pause' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_MAP[status] ?? STATUS_MAP['I'];
  return (
    <span className={`gng-badge ${s.cls}`}>
      <i className={`fa-solid ${s.icon}`} style={{ fontSize: 10 }} />
      {s.label}
    </span>
  );
};

const DiscountBadge = ({ type, value }: { type: string; value: number }) => (
  <span className={`gng-badge ${type === 'percentage' ? 'gng-badge-blue' : 'gng-badge-purple'}`}>
    {type === 'percentage' ? `${value}%` : `₹${value}`}
  </span>
);

export const CouponTable = ({
  items, total, page, totalPages, isLoading,
  onEdit, onDelete, onPageChange,
}: Props) => {

  const columns: Column<Coupon>[] = [
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
      key:    'code',
      title:  'Code',
      render: (row) => <span className="gng-code-tag">{row.code}</span>,
    },
    {
      key:    'discount',
      title:  'Discount',
      align:  'center',
      render: (row) => <DiscountBadge type={row.discount_type} value={row.discount_value} />,
    },
    {
      key:    'min_order',
      title:  'Min Order',
      align:  'center',
      render: (row) => (
        <span style={{ fontSize: 13 }}>
          {row.min_order_amount > 0 ? `₹${row.min_order_amount}` : '—'}
        </span>
      ),
    },
    {
      key:    'usage',
      title:  'Usage',
      align:  'center',
      render: (row) => (
        <span style={{ fontSize: 13 }}>
          {row.used_count}
          {row.max_uses != null ? ` / ${row.max_uses}` : ' / ∞'}
        </span>
      ),
    },
    {
      key:    'validity',
      title:  'Valid Until',
      align:  'center',
      render: (row) => {
        if (!row.valid_until) return <span className="gng-date">No expiry</span>;
        const expired = dayjs(row.valid_until).isBefore(dayjs());
        return (
          <span className="gng-date" style={{ color: expired ? '#ef4444' : undefined }}>
            {dayjs(row.valid_until).format('MMM DD, YYYY')}
            {expired && <> <i className="fa-solid fa-triangle-exclamation" /></>}
          </span>
        );
      },
    },
    {
      key:    'status',
      title:  'Status',
      align:  'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key:    'actions',
      title:  'Actions',
      align:  'center',
      render: (row) => (
        <div className="gng-actions">
          <button type="button" className="gng-action-btn gng-action-edit" onClick={() => onEdit(row)} title="Edit">
            <i className="fa-regular fa-pen-to-square" />
          </button>
          <button type="button" className="gng-action-btn gng-action-delete" onClick={() => onDelete(row)} title="Delete">
            <i className="fa-regular fa-trash-can" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Coupon>
      columns={columns}
      data={items}
      rowKey={(row) => row.coupon_id}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-solid fa-ticket"
      emptyTitle="No coupons found"
      emptySubtitle="Create your first coupon to get started."
    />
  );
};
