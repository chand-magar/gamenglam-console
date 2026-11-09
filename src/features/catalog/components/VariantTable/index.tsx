import { DataTable }  from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { ProductVariant } from '../../../../domain/entities/Product';
import styles from './index.module.css';

interface Props {
  items:         ProductVariant[];
  total:         number;
  page:          number;
  totalPages:    number;
  isLoading:     boolean;
  variantImages: Record<string, string | null>; // ← add
  onEdit:        (item: ProductVariant) => void;
  onDelete:      (item: ProductVariant) => void;
  onPageChange:  (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Active',   cls: 'gng-badge-active'   },
  draft:    { label: 'Draft',    cls: 'gng-badge-draft'    },
  archived: { label: 'Archived', cls: 'gng-badge-archived' },
};

export const VariantTable = ({
  items, total, page, totalPages, isLoading,
  variantImages, // ← add
  onEdit, onDelete, onPageChange,
}: Props) => {

  const columns: Column<ProductVariant>[] = [
    {
      key:    'no',
      title:  'No.',
      width:  '52px',
      render: (_, index) => (
        <span className="gng-row-no">
          {String((page - 1) * 10 + index + 1).padStart(2, '0')}
        </span>
      ),
    },
    {
      key:   'image',
      title: 'Image',
      width: '60px',
      render: (row) => {
        const url = variantImages[row.variant_id];
        if (url === undefined) {
          return <div className={styles.imgSkeleton} />;
        }
        if (!url) {
          return (
            <div className={styles.imgFallback}>
              <i className="fa-regular fa-image" style={{ color: '#D1D5DB', fontSize: 14 }} />
            </div>
          );
        }
        return (
          <img
            src={url}
            alt="Variant"
            className={styles.imgThumb}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        );
      },
    },
    {
      key:      'sku',
      title:    'SKU',
      sortable: true,
      render:   (row) => (
        <span className={styles.tdSku}>{row.sku}</span>
      ),
    },
    {
      key:      'cost_price',
      title:    'Cost',
      sortable: true,
      render:   (row) => (
        <span className={styles.tdSku}>{row.cost_price}</span>
      ),
    },
    {
      key:      'mrp',
      title:    'MRP',
      sortable: true,
      render:   (row) => (
        <span className={styles.tdSku}>{row.mrp}</span>
      ),
    },
    {
      key:      'selling_price',
      title:    'Selling Price',
      sortable: true,
      render:   (row) => (
        <span className={styles.tdSku}>{row.selling_price}</span>
      ),
    },
    {
      key:    'stock_qty',
      title:  'Stock',
      align:  'center',
      render: (row) => {
        const isLow = row.stock_qty === 0;
        return isLow
          ? (
            <span className={styles.stockLow}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 4 }} />
              LOW STOCK
            </span>
          )
          : <span className={styles.stockNormal}>{row.stock_qty.toLocaleString()}</span>;
      },
    },
    {
      key:    'weight_kg',
      title:  'Weight (kg)',
      align:  'center',
      render: (row) => (
        row.weight_kg != null
          ? <span className={styles.tdWeight}>{row.weight_kg}</span>
          : <span className={styles.dash}>—</span>
      ),
    },
    {
      key:    'status',
      title:  'Status',
      align:  'center',
      render: (row) => {
        const cfg = STATUS_MAP[row.status] ?? STATUS_MAP['draft'];
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
    <DataTable<ProductVariant>
      columns={columns}
      data={items}
      rowKey={(row) => row.variant_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-box-open"
      emptyTitle="No variants yet"
      emptySubtitle="Add your first variant to get started."
    />
  );
};