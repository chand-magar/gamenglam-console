import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Page } from '../../../../domain/entities/Page';
import type { Section } from '../../../../domain/entities/Section';
import styles from './index.module.css';

interface Props {
  items:        Page[];
  sections:     Section[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onEdit:       (item: Page) => void;
  onDelete:     (item: Page) => void;
  onPageChange: (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  A: { label: 'Active',   cls: 'gng-badge-active'   },
  I: { label: 'Inactive', cls: 'gng-badge-inactive'  },
  D: { label: 'Deleted',  cls: 'gng-badge-deleted'   },
};

export const PageTable = ({
  items, sections, total, page, totalPages, isLoading,
  onEdit, onDelete, onPageChange,
}: Props) => {

  const columns: Column<Page>[] = [
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
      key:      'page_name',
      title:    'Page Name',
      sortable: true,
      render:   (row) => (
        <span className={styles.pageName}>{row.page_name}</span>
      ),
    },
    {
      key:    'page_path',
      title:  'Path',
      render: (row) => (
        <span className="gng-code-tag">{row.page_path}</span>
      ),
    },
    {
      key:    'section_no',
      title:  'Section',
      render: (row) => {
        const section = sections.find((s) => s.section_no === row.section_no);
        return section ? (
          <div className={styles.sectionCell}>
            <i className={section.section_icon} style={{ color: '#6C35DE', fontSize: 13 }} />
            <span className={styles.sectionName}>{section.section_name}</span>
          </div>
        ) : (
          <span className={styles.noSection}>#{row.section_no}</span>
        );
      },
    },
    {
      key:      'page_order',
      title:    'Order',
      align:    'center',
      sortable: true,
      render:   (row) => (
        <span className={styles.orderBadge}>{row.page_order}</span>
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
    <DataTable<Page>
      columns={columns}
      data={items}
      rowKey={(row) => row.page_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-file-lines"
      emptyTitle="No pages found"
      emptySubtitle="Create your first page to get started."
    />
  );
};