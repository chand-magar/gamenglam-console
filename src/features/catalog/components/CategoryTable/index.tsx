import dayjs from 'dayjs';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Category } from '../../../../domain/entities/Category';
import styles from './index.module.css';

interface Props {
  items:        Category[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onEdit:       (item: Category) => void;
  onDelete:     (item: Category) => void;
  onPageChange: (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
  A: { label: 'Active',   cls: 'gng-badge-active',   icon: 'fa-circle-check' },
  I: { label: 'Inactive', cls: 'gng-badge-inactive',  icon: 'fa-circle-pause' },
  D: { label: 'Deleted',  cls: 'gng-badge-deleted',   icon: 'fa-circle-xmark' },
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

export const CategoryTable = ({
  items, total, page, totalPages, isLoading,
  onEdit, onDelete, onPageChange,
}: Props) => {

  const columns: Column<Category>[] = [
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
      title:    'Category Name',
      sortable: true,
      render:   (row) => (
        <div className={styles.nameCell}>
          {row.image_url ? (
            <img src={row.image_url} alt={row.category_name} className={styles.categoryImg} />
          ) : (
            <div className={styles.categoryImgFallback}>
              <i className="fa-solid fa-tag" />
            </div>
          )}
          <span className={styles.categoryName}>{row.category_name}</span>
        </div>
      ),
    },
    {
      key:    'slug',
      title:  'Slug',
      align:  'center',
      render: (row) => <span className="gng-code-tag">{row.slug}</span>,
    },
    {
      key:    'status',
      title:  'Status',
      align:  'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key:      'created_at',
      title:    'Created At',
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
    <DataTable<Category>
      columns={columns}
      data={items}
      rowKey={(row) => row.category_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-folder-open"
      emptyTitle="No categories found"
      emptySubtitle="Create your first category to get started."
    />
  );
};