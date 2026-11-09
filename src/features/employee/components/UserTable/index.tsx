import dayjs from 'dayjs';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { User } from '../../../../domain/entities/User';
import type { Role } from '../../../../domain/entities/Role';
import styles from './index.module.css';

interface Props {
  items:        User[];
  roles:        Role[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onEdit:       (item: User) => void;
  onDelete:     (item: User) => void;
  onPageChange: (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  A: { label: 'Active',   cls: 'gng-badge-active'   },
  I: { label: 'Inactive', cls: 'gng-badge-inactive'  },
  D: { label: 'Deleted',  cls: 'gng-badge-deleted'   },
};

export const UserTable = ({
  items, roles, total, page, totalPages, isLoading,
  onEdit, onDelete, onPageChange,
}: Props) => {

  const columns: Column<User>[] = [
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
      key:      'user_fullname',
      title:    'Full Name',
      sortable: true,
      render:   (row) => (
        <div className={styles.nameCell}>
          <div className={styles.avatar}>
            {row.user_fullname.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={styles.fullName}>{row.user_fullname}</p>
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
      key:    'role_no',
      title:  'Role',
      render: (row) => {
        const role = roles.find((r) => r.role_no === row.role_no);
        return role
          ? <span className="gng-badge gng-badge-purple">{role.role_name}</span>
          : <span className={styles.dash}>—</span>;
      },
    },
    {
      key:    'gender',
      title:  'Gender',
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
      render: (row) => {
        const cfg = STATUS_MAP[row.status] ?? STATUS_MAP['I'];
        return <span className={`gng-badge ${cfg.cls}`}>{cfg.label}</span>;
      },
    },
    {
      key:      'created_at',
      title:    'Created',
      align:    'center',
      sortable: true,
      render:   (row) => (
        <span className="gng-date">{dayjs(row.created_at).format('MMM DD, YYYY')}</span>
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
            className="gng-action-btn gng-action-edit"
            onClick={() => onEdit(row)}
            title="Edit"
          >
            <i className="fa-regular fa-pen-to-square" />
          </button>
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
    <DataTable<User>
      columns={columns}
      data={items}
      rowKey={(row) => row.profile_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-user"
      emptyTitle="No users found"
      emptySubtitle="Add your first user to get started."
    />
  );
};