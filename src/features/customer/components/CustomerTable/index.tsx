import dayjs from 'dayjs';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Customer } from '../../../../domain/entities/Customer';
import styles from './index.module.css';

interface Props {
  items:        Customer[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onDelete:     (item: Customer) => void;
  onPageChange: (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
  A: { label: 'Active',   cls: 'gng-badge-active',   icon: 'fa-circle-check'  },
  I: { label: 'Inactive', cls: 'gng-badge-inactive',  icon: 'fa-circle-pause'  },
  D: { label: 'Deleted',  cls: 'gng-badge-deleted',   icon: 'fa-circle-xmark'  },
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

export const CustomerTable = ({
  items, total, page, totalPages, isLoading,
  onDelete, onPageChange,
}: Props) => {

  const columns: Column<Customer>[] = [
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
      key:      'name',
      title:    'Customer Name',
      sortable: true,
      render:   (row) => (
        <div className={styles.nameCell}>
          <div className={styles.avatar}>
            {row.first_name.charAt(0).toUpperCase()}{row.last_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={styles.fullName}>{row.first_name} {row.last_name}</p>
            <p className={styles.email}>{row.email_id}</p>
          </div>
        </div>
      ),
    },
    {
      key:    'mobile_no',
      title:  'Mobile',
      render: (row) => (
        row.mobile_no
          ? <span className={styles.mobile}>{row.mobile_no}</span>
          : <span className={styles.dash}>—</span>
      ),
    },
    {
      key:    'gender',
      title:  'Gender',
      align:  'center',
      render: (row) => (
        row.gender
          ? <span className={styles.gender}>{row.gender}</span>
          : <span className={styles.dash}>—</span>
      ),
    },
    {
      key:    'status',
      title:  'Status',
      align:  'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key:      'created_at',
      title:    'Joined',
      sortable: true,
      align:    'center',
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
            className="gng-action-btn gng-action-delete"
            onClick={() => onDelete(row)}
            title="Delete"
          >
            <i className="fa-regular fa-trash-can" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Customer>
      columns={columns}
      data={items}
      rowKey={(row) => row.customer_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-user"
      emptyTitle="No customers found"
      emptySubtitle="Customers will appear here once they register."
    />
  );
};