import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { ProductTable } from '../../components/ProductTable';
import { ProductFormModal } from '../../components/ProductFormModal';
import type { Product } from '../../../../domain/entities/Product';
import type { ProductFormValues } from '../../schemas/product.schemas';

const ProductListPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage, dismissError,
  } = useProducts();

  const { items: categories, fetch: fetchCategories } = useCategories();

  const [modalOpen,      setModalOpen]      = useState(false);
  const [editItem,       setEditItem]       = useState<Product | null>(null);
  const [deleteItem,     setDeleteItem]     = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');

  const hasFetched    = useRef(false);
  const isFirstFilter = useRef(true);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
    fetchCategories({ page: 1, limit: 100 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isFirstFilter.current) { isFirstFilter.current = false; return; }
    fetch({
      page: 1, limit: 10,
      category_no: categoryFilter ? Number(categoryFilter) : undefined,
      status:      statusFilter   || undefined,
    });
  }, [categoryFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleOpenEdit   = (item: Product) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (values: ProductFormValues) => {
    if (editItem) {
      await update(editItem.product_id, {
        category_no:  values.category_no,
        sku:          values.sku,
        product_name: values.product_name,
        slug:         values.slug,
        description:  values.description,
        base_price:   values.base_price,
        is_featured:  values.is_featured,
        stock_qty:    values.stock_qty,
        status:       values.status,
      });
    } else {
      await create({
        category_no:  values.category_no,
        sku:          values.sku,
        product_name: values.product_name,
        slug:         values.slug,
        description:  values.description,
        base_price:   values.base_price,
        is_featured:  values.is_featured,
        stock_qty:    values.stock_qty,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.product_id);
    setDeleteItem(null);
  };

  const lowStock   = items.filter((p) => p.stock_qty === 0).length;
  const totalValue = items.reduce((s, p) => s + p.base_price * p.stock_qty, 0);
  const activeCount = items.filter((p) => p.status === 'active').length;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Products</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Product Management</h1>
          <p className="gng-page-subtitle">
            Manage your product catalogue, pricing and inventory.
          </p>
        </div>
        <button type="button" className="gng-btn-primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Add Product
        </button>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-box-archive" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Stock Value</p>
            <p className="gng-stat-value">${(totalValue / 1000).toFixed(1)}K</p>
          </div>
          <span className="gng-stat-badge">+12%</span>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-green">
            <i className="fa-solid fa-arrow-trend-up" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Active Products</p>
            <p className="gng-stat-value">{isLoading ? '—' : activeCount}</p>
          </div>
          <span className="gng-stat-badge">+5.4%</span>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Low Stock Items</p>
            <p className="gng-stat-value">{isLoading ? '—' : lowStock}</p>
          </div>
          <span className="gng-stat-badge">-{lowStock}</span>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-rotate" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Recent Sync</p>
            <p className="gng-stat-value">2m ago</p>
          </div>
          <span className="gng-stat-badge">Updated</span>
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

      {/* Toolbar */}
      <div className="gng-toolbar">
        <div className="gng-toolbar-left">
          <select
            className="gng-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_no} value={c.category_no}>{c.category_name}</option>
            ))}
          </select>
          <select
            className="gng-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="button"
            className="gng-btn-link"
            onClick={() => { setCategoryFilter(''); setStatusFilter(''); }}
          >
            Reset Filters
          </button>
        </div>
        <div className="gng-toolbar-right">
          <button type="button" className="gng-btn-secondary">
            <i className="fa-solid fa-filter" /> Filter
          </button>
          <button type="button" className="gng-btn-secondary">
            <i className="fa-solid fa-file-export" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <ProductTable
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteItem}
        onPageChange={changePage}
      />

      {/* Form Modal */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        categories={categories}
        editItem={editItem}
        isSubmitting={isSubmitting}
      />

      {/* Delete confirm */}
      {deleteItem && (
        <div className="gng-confirm-overlay">
          <div className="gng-confirm-box">
            <div className="gng-confirm-icon">
              <i className="fa-solid fa-trash-can" />
            </div>
            <p className="gng-confirm-title">Delete Product</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">"{deleteItem.product_name}"</span>?
              All variants will also be removed.
            </p>
            <div className="gng-confirm-actions">
              <button
                type="button"
                className="gng-confirm-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gng-btn-danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Deleting…</>
                  : <><i className="fa-solid fa-trash-can" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;