import dayjs from 'dayjs';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Order } from '../../../../domain/entities/Order';
import { ORDER_STATUS_MAP } from '../../../../domain/entities/Order';
import styles from './index.module.css';

interface Props {
  items:        Order[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onView:       (item: Order) => void;
  onPageChange: (page: number) => void;
}

export const OrderTable = ({
  items, total, page, totalPages, isLoading,
  onView, onPageChange,
}: Props) => {

  const columns: Column<Order>[] = [
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
      key:      'order_ref',
      title:    'Order Ref',
      sortable: true,
      render:   (row) => (
        <span className="gng-code-tag">{row.order_ref}</span>
      ),
    },
    {
      key:    'customer',
      title:  'Customer',
      render: (row) => (
        <span className={styles.customerNo}>{row.customer_name || '—'}</span>
      ),
    },
    {
      key:    'items',
      title:  'Items',
      align:  'center',
      render: (row) => {
        const count = row.item_count ?? (row.items ?? []).length;
        return (
          <span className={styles.itemCount}>
            {count} item{count !== 1 ? 's' : ''}
          </span>
        );
      },
    },
    {
      key:    'total',
      title:  'Total',
      align:  'right',
      render: (row) => (
        <span className={styles.total}>₹{row.total.toFixed(2)}</span>
      ),
    },
    {
      key:    'order_status',
      title:  'Status',
      align:  'center',
      render: (row) => {
        const s = ORDER_STATUS_MAP[row.order_status];
        return (
          <span className={`gng-badge ${s.cls}`}>
            <i className={`fa-solid ${s.icon}`} style={{ fontSize: 10 }} />
            {s.label}
          </span>
        );
      },
    },
    {
      key:      'created_at',
      title:    'Placed At',
      align:    'center',
      sortable: true,
      render:   (row) => (
        <span className="gng-date">
          {dayjs(row.created_at).format('MMM DD, YYYY')}
        </span>
      ),
    },
    {
      key:    'actions',
      title:  'Actions',
      align:  'center',
      render: (row) => (
        <div className="gng-actions">
          <button
            type="button"
            className="gng-action-btn gng-action-view"
            onClick={() => onView(row)}
            title="View Order"
          >
            <i className="fa-regular fa-eye" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Order>
      columns={columns}
      data={items}
      rowKey={(row) => row.order_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-bag-shopping"
      emptyTitle="No orders found"
      emptySubtitle="Orders will appear here once customers place them."
    />
  );
};