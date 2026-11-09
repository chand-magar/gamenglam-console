import { useState } from 'react';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { InventoryItem } from '../../../../domain/entities/Inventory';
import { getStockStatus } from '../../../../domain/entities/Inventory';
import styles from './index.module.css';

interface Props {
  items:         InventoryItem[];
  total:         number;
  page:          number;
  totalPages:    number;
  isLoading:     boolean;
  isSubmitting:  boolean;
  onUpdateStock: (variantId: string, stockQty: number) => void;
  onPageChange:  (page: number) => void;
}

const STOCK_STATUS_MAP = {
  in_stock:     { label: 'In Stock',     cls: 'gng-badge-active'   },
  low_stock:    { label: 'Low Stock',    cls: 'gng-badge-archived' },
  out_of_stock: { label: 'Out of Stock', cls: 'gng-badge-deleted'  },
};

const VARIANT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Active',   cls: 'gng-badge-active'   },
  draft:    { label: 'Draft',    cls: 'gng-badge-draft'    },
  archived: { label: 'Archived', cls: 'gng-badge-archived' },
};

function InlineStockEditor({
  item, onSave, isSubmitting,
}: {
  item:         InventoryItem;
  onSave:       (variantId: string, qty: number) => void;
  isSubmitting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value,   setValue]   = useState(item.stock_qty);

  const handleSave = () => {
    onSave(item.variant_id, value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')  handleSave();
    if (e.key === 'Escape') { setValue(item.stock_qty); setEditing(false); }
  };

  if (editing) {
    return (
      <div className={styles.stockEditor}>
        <button
          type="button"
          className={styles.stockSpinBtn}
          onClick={() => setValue((v) => Math.max(0, v - 1))}
        >
          <i className="fa-solid fa-minus" />
        </button>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onKeyDown={handleKeyDown}
          className={styles.stockInput}
          autoFocus
        />
        <button
          type="button"
          className={styles.stockSpinBtn}
          onClick={() => setValue((v) => v + 1)}
        >
          <i className="fa-solid fa-plus" />
        </button>
        <button
          type="button"
          className={styles.stockSaveBtn}
          onClick={handleSave}
          disabled={isSubmitting}
        >
          <i className="fa-solid fa-check" />
        </button>
        <button
          type="button"
          className={styles.stockCancelBtn}
          onClick={() => { setValue(item.stock_qty); setEditing(false); }}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    );
  }

  const status = getStockStatus(item.stock_qty);

  return (
    <button
      type="button"
      className={styles.stockDisplay}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      <span className={`${styles.stockQty} ${
        status === 'out_of_stock' ? styles.stockZero
        : status === 'low_stock'  ? styles.stockLow
        : ''
      }`}>
        {item.stock_qty}
      </span>
      <i className="fa-regular fa-pen-to-square" style={{ fontSize: 11, color: '#9CA3AF' }} />
    </button>
  );
}

// ── Product image cell ────────────────────────────────────────────────────────
function ProductImageCell({ imageUrl, productName }: { imageUrl?: string | null; productName: string }) {
  if (!imageUrl) {
    return (
      <div className={styles.imgFallback}>
        <i className="fa-regular fa-image" style={{ color: '#D1D5DB', fontSize: 14 }} />
      </div>
    );
  }
  return (
    <img
      src={imageUrl}
      alt={productName}
      className={styles.imgThumb}
      onError={(e) => {
        const el = e.target as HTMLImageElement;
        el.style.display = 'none';
      }}
    />
  );
}

export const InventoryTable = ({
  items, total, page, totalPages, isLoading,
  isSubmitting, onUpdateStock, onPageChange,
}: Props) => {

  const columns: Column<InventoryItem>[] = [
    {
      key:    'no',
      title:  'No',
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
      width: '60px',   // ← add this
      render: (row) => (
        <ProductImageCell
          imageUrl={row.image_url}
          productName={row.product_name}
        />
      ),
    },
    {
      key:      'product_name',
      title:    'Product / Variant',
      sortable: true,
      render:   (row) => (
        <div className={styles.nameCell}>
          <div>
            <p className={styles.productName}>{row.product_name}</p>
            <span className="gng-code-tag">{row.sku}</span>
          </div>
        </div>
      ),
    },
    {
      key:    'category_name',
      title:  'Category',
      render: (row) => (
        <span className={styles.category}>{row.category_name}</span>
      ),
    },
    {
      key:    'stock_qty',
      title:  'Stock Qty',
      align:  'center',
      render: (row) => (
        <InlineStockEditor
          item={row}
          onSave={onUpdateStock}
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      key:    'cost_price',
      title:  'Cost price',
      align:  'center',
      render: (row) => (
        <span className={styles.category}>{row.cost_price}</span>
      ),
    },
    {
      key:    'mrp',
      title:  'MRP',
      align:  'center',
      render: (row) => (
        <span className={styles.category}>{row.mrp}</span>
      ),
    },
    {
      key:    'selling_price',
      title:  'Selling price',
      align:  'center',
      render: (row) => (
        <span className={styles.category}>{row.selling_price}</span>
      ),
    },
    {
      key:    'stock_status',
      title:  'Stock Status',
      align:  'center',
      render: (row) => {
        const s = STOCK_STATUS_MAP[getStockStatus(row.stock_qty)];
        return <span className={`gng-badge ${s.cls}`}>{s.label}</span>;
      },
    },
    {
      key:    'status',
      title:  'Variant Status',
      align:  'center',
      render: (row) => {
        const s = VARIANT_STATUS_MAP[row.status] ?? VARIANT_STATUS_MAP['draft'];
        return <span className={`gng-badge ${s.cls}`}>{s.label}</span>;
      },
    },
  ];

  return (
    <DataTable<InventoryItem>
      columns={columns}
      data={items}
      rowKey={(row) => row.variant_no}
      isLoading={isLoading}
      total={total}
      page={page}
      limit={10}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyIcon="fa-regular fa-boxes-stacked"
      emptyTitle="No inventory found"
      emptySubtitle="Add product variants to manage inventory."
    />
  );
};