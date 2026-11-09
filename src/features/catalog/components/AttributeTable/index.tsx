import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Attribute } from '../../../../domain/entities/Attribute';
import type { Category } from '../../../../domain/entities/Category';
import styles from './index.module.css';

interface Props {
  items:        Attribute[];
  categories:   Category[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onEdit:       (item: Attribute) => void;
  onDelete:     (item: Attribute) => void;
  onPageChange: (page: number) => void;
}

const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  select:       { label: 'Select',       cls: styles.typeSelect       },
  multi_select: { label: 'Multi Select', cls: styles.typeMultiSelect  },
  boolean:      { label: 'Boolean',      cls: styles.typeBoolean      },
  text:         { label: 'Text',         cls: styles.typeText         },
  number:       { label: 'Number',       cls: styles.typeNumber       },
  color:        { label: 'Color',        cls: styles.typeColor        },
};

const BoolIcon = ({ value }: { value: boolean }) =>
  value
    ? <i className="fa-solid fa-circle-check" style={{ color: '#16A34A', fontSize: 16 }} />
    : <i className="fa-regular fa-circle-xmark" style={{ color: '#D1D5DB', fontSize: 16 }} />;

export const AttributeTable = ({
  items, categories, total, page, totalPages, isLoading,
  onEdit, onDelete, onPageChange,
}: Props) => {
  const navigate = useNavigate();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.category_id, c.category_name]));

  const columns: Column<Attribute>[] = [
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
      key:      'attribute_name',
      title:    'Attribute Name',
      sortable: true,
      render:   (row) => (
        <span className={styles.attrName}>{row.attribute_name}</span>
      ),
    },
    {
      key:    'code',
      title:  'Code',
      render: (row) => <span className="gng-code-tag">{row.code}</span>,
    },
    {
      key:    'category',
      title:  'Category',
      render: (row) => (
        <span className={styles.categoryNo}>
          {row.category_id ? (categoryMap[row.category_id] ?? '—') : '—'}
        </span>
      ),
    },
    {
      key:    'type',
      title:  'Type',
      align:  'center',
      render: (row) => {
        const cfg = TYPE_CONFIG[row.type] ?? { label: row.type, cls: styles.typeText };
        return (
          <span className={`${styles.typeBadge} ${cfg.cls}`}>{cfg.label}</span>
        );
      },
    },
    {
      key:    'is_required',
      title:  'Req.',
      align:  'center',
      render: (row) => <BoolIcon value={row.is_required} />,
    },
    {
      key:    'is_variant',
      title:  'Var.',
      align:  'center',
      render: (row) => <BoolIcon value={row.is_variant} />,
    },
    {
      key:      'sort_order',
      title:    'Order',
      align:    'center',
      sortable: true,
      render:   (row) => (
        <span className={styles.sortOrder}>{row.sort_order}</span>
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
            className="gng-action-btn gng-action-manage"
            onClick={() => navigate(`/attributes/${row.attribute_id}/values`)}
            title="Manage Values"
          >
            <i className="fa-solid fa-list-ul" />
          </button>
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
    <DataTable<Attribute>
      columns={columns}
      data={items}
      rowKey={(row) => row.attribute_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-sliders"
      emptyTitle="No attributes found"
      emptySubtitle="Create your first attribute to configure product variations."
    />
  );
};