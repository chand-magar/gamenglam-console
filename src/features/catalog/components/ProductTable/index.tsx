import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Product } from '../../../../domain/entities/Product';
import styles from './index.module.css';

interface Props {
  items:        Product[];
  total:        number;
  page:         number;
  totalPages:   number;
  isLoading:    boolean;
  onEdit:       (item: Product) => void;
  onDelete:     (item: Product) => void;
  onPageChange: (page: number) => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Active',   cls: 'gng-badge-active'   },
  draft:    { label: 'Draft',    cls: 'gng-badge-draft'    },
  archived: { label: 'Archived', cls: 'gng-badge-archived' },
};

export const ProductTable = ({
  items, total, page, totalPages, isLoading,
  onEdit, onDelete, onPageChange,
}: Props) => {
  const navigate = useNavigate();

  const columns: Column<Product>[] = [
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
      key:      'product_name',
      title:    'Product Name',
      sortable: true,
      render:   (row) => (
        <div
          className={styles.nameCell}
          onClick={() => navigate(`/products/${row.product_id}/variants`)}
        >
          <p className={styles.productName}>{row.product_name}</p>
          <p className={styles.productSku}>{row.sku}</p>
        </div>
      ),
    },
    {
      key:    'sku',
      title:  'SKU',
      render: (row) => <span className="gng-code-tag">{row.sku}</span>,
    },
    {
      key:    'category',
      title:  'Category',
      render: (row) => (
        <span className={styles.category}>#{row.category_no}</span>
      ),
    },
    {
      key:    'base_price',
      title:  'Base Price',
      align:  'right',
      render: (row) => (
        <span className={styles.price}>${row.base_price.toFixed(2)}</span>
      ),
    },
    {
      key:    'stock_qty',
      title:  'Stock',
      align:  'center',
      render: (row) => (
        <span className={row.stock_qty === 0 ? styles.stockZero : styles.stock}>
          {row.stock_qty.toLocaleString()}
        </span>
      ),
    },
    {
      key:    'status',
      title:  'Status',
      align:  'center',
      render: (row) => {
        const cfg = STATUS_MAP[row.status] ?? STATUS_MAP['draft'];
        return (
          <span className={`gng-badge ${cfg.cls}`}>{cfg.label}</span>
        );
      },
    },
    {
      key:    'is_featured',
      title:  'Featured',
      align:  'center',
      render: (row) => (
        <i
          className={row.is_featured ? 'fa-solid fa-star' : 'fa-regular fa-star'}
          style={{ color: row.is_featured ? '#F59E0B' : '#D1D5DB', fontSize: 15 }}
        />
      ),
    },
    {
      key:      'created_at',
      title:    'Created At',
      align:    'center',
      sortable: true,
      render:   (row) => (
        <span className="gng-date">{dayjs(row.created_at).format('YYYY-MM-DD')}</span>
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
            onClick={() => navigate(`/products/${row.product_id}/variants`)}
            title="Manage Variants"
          >
            <i className="fa-regular fa-eye" />
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
    <DataTable<Product>
      columns={columns}
      data={items}
      rowKey={(row) => row.product_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-box-open"
      emptyTitle="No products found"
      emptySubtitle="Add your first product to get started."
    />
  );
};