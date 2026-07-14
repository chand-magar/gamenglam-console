import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Role } from '../../../../domain/entities/Role';
import styles from './index.module.css';

interface Props {
  items:        Role[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onEdit:       (item: Role) => void;
  onDelete:     (item: Role) => void;
  onPageChange: (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  A: { label: 'Active',   cls: 'gng-badge-active'   },
  I: { label: 'Inactive', cls: 'gng-badge-inactive'  },
  D: { label: 'Deleted',  cls: 'gng-badge-deleted'   },
};

export const RoleTable = ({
  items, total, page, totalPages, isLoading,
  onEdit, onDelete, onPageChange,
}: Props) => {

  const columns: Column<Role>[] = [
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
      key:      'role_name',
      title:    'Role Name',
      sortable: true,
      render:   (row) => (
        <span className={styles.roleName}>{row.role_name}</span>
      ),
    },
    {
      key:    'sections',
      title:  'Sections',
      render: (row) => {
        const details = row.role_details ?? [];
        return (
          <div className={styles.sectionPills}>
            {details.slice(0, 3).map((s) => (
              <span key={s.section_id} className={styles.sectionPill}>
                <i className={s.section_icon} style={{ fontSize: 11 }} />
                {s.section_name}
              </span>
            ))}
            {details.length > 3 && (
              <span className={styles.morePill}>+{details.length - 3} more</span>
            )}
            {details.length === 0 && (
              <span className={styles.morePill}>No permissions</span>
            )}
          </div>
        );
      },
    },
    {
      key:    'pages',
      title:  'Pages',
      align:  'center',
      render: (row) => {
        const details    = row.role_details ?? [];
        const totalPages = details.reduce(
          (acc, s) => acc + (s.pages ?? []).length, 0,
        );
        return (
          <span className={styles.pageCount}>
            {totalPages} {totalPages === 1 ? 'page' : 'pages'}
          </span>
        );
      },
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
    <DataTable<Role>
      columns={columns}
      data={items}
      rowKey={(row) => row.role_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-id-badge"
      emptyTitle="No roles found"
      emptySubtitle="Create your first role to assign permissions."
    />
  );
};