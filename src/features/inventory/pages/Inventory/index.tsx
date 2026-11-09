import { useEffect, useRef, useState } from 'react';
import { useInventory }    from '../../hooks/useInventory';
import { useCategories }   from '../../../catalog/hooks/useCategories';
import { InventoryTable }  from '../../components/InventoryTable';
import styles from './index.module.css';

const STOCK_FILTER_OPTIONS = [
  { value: '',    label: 'All Stock'     },
  { value: 'low', label: 'Low Stock'     },
  { value: 'out', label: 'Out of Stock'  },
];

const InventoryPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, updateStock, changePage, dismissError,
  } = useInventory();

  const { items: categories, fetch: fetchCategories } = useCategories();

  const [stockFilter,    setStockFilter]    = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({});
    fetchCategories({ page: 1, limit: 100 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (stock: string, category: number | '') => {
    fetch({
      stock_status: stock as 'low' | 'out' | undefined,
      category_no:  category !== '' ? category : undefined,
      page:         1,
    });
  };

  const handleStockFilter = (value: string) => {
    setStockFilter(value);
    handleFilter(value, categoryFilter);
  };

  const handleCategoryFilter = (value: number | '') => {
    setCategoryFilter(value);
    handleFilter(stockFilter, value);
  };

  const lowStock  = items.filter((i) => i.stock_qty > 0 && i.stock_qty < 5).length;
  const outStock  = items.filter((i) => i.stock_qty === 0).length;
  const inStock   = items.filter((i) => i.stock_qty >= 5).length;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-active">Inventory</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Inventory Management</h1>
          <p className="gng-page-subtitle">
            Monitor stock levels and update quantities across all variants.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-boxes-stacked" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Variants</p>
            <p className="gng-stat-value">{total}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-green">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">In Stock</p>
            <p className="gng-stat-value">{inStock}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Low Stock</p>
            <p className="gng-stat-value">{lowStock}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-red">
            <i className="fa-solid fa-circle-xmark" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Out of Stock</p>
            <p className="gng-stat-value">{outStock}</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="gng-error-alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button type="button" className="gng-error-dismiss" onClick={dismissError}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className="gng-field" style={{ minWidth: 180 }}>
          <select
            className="gng-select"
            value={stockFilter}
            onChange={(e) => handleStockFilter(e.target.value)}
          >
            {STOCK_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="gng-field" style={{ minWidth: 180 }}>
          <select
            className="gng-select"
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(
              e.target.value !== '' ? Number(e.target.value) : ''
            )}
          >
            <option value="">All Categories</option>
            {categories
              .filter((c) => c.status === 'A')
              .map((c) => (
                <option key={c.category_no} value={c.category_no}>
                  {c.category_name}
                </option>
              ))}
          </select>
        </div>

        <button
          type="button"
          className="gng-btn-secondary"
          onClick={() => {
            setStockFilter('');
            setCategoryFilter('');
            fetch({});
          }}
        >
          <i className="fa-solid fa-rotate" /> Reset
        </button>
      </div>

      {/* Table */}
      <InventoryTable
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        onUpdateStock={updateStock}
        onPageChange={changePage}
      />
    </div>
  );
};

export default InventoryPage;