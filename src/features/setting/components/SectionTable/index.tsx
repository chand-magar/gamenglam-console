import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Section } from '../../../../domain/entities/Section';
import styles from './index.module.css';

interface Props {
  items:        Section[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onEdit:       (item: Section) => void;
  onDelete:     (item: Section) => void;
  onPageChange: (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  A: { label: 'Active',   cls: 'gng-badge-active'   },
  I: { label: 'Inactive', cls: 'gng-badge-inactive'  },
  D: { label: 'Deleted',  cls: 'gng-badge-deleted'   },
};

export const SectionTable = ({
  items, total, page, totalPages, isLoading,
  onEdit, onDelete, onPageChange,
}: Props) => {

  const columns: Column<Section>[] = [
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
      key:      'section_name',
      title:    'Section Name',
      sortable: true,
      render:   (row) => (
        <div className={styles.nameCell}>
          <div className={styles.iconWrapper}>
            <i className={row.section_icon} />
          </div>
          <span className={styles.sectionName}>{row.section_name}</span>
        </div>
      ),
    },
    {
      key:    'section_path',
      title:  'Path',
      render: (row) => (
        <span className="gng-code-tag">{row.section_path}</span>
      ),
    },
    {
      key:    'section_icon',
      title:  'Icon',
      render: (row) => (
        <div className={styles.iconPreview}>
          <i className={row.section_icon} />
          <span className={styles.iconName}>{row.section_icon}</span>
        </div>
      ),
    },
    {
      key:      'section_order',
      title:    'Order',
      align:    'center',
      sortable: true,
      render:   (row) => (
        <span className={styles.orderBadge}>{row.section_order}</span>
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
    <DataTable<Section>
      columns={columns}
      data={items}
      rowKey={(row) => row.section_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-rectangle-list"
      emptyTitle="No sections found"
      emptySubtitle="Create your first section to get started."
    />
  );
};