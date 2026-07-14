import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductVariants } from '../../hooks/useProductVariants';
import { useProducts } from '../../hooks/useProducts';
import { useAttributes } from '../../hooks/useAttributes';
import { VariantTable } from '../../components/VariantTable';
import { VariantFormModal } from '../../components/VariantFormModal';
import { AttributeValueRepository } from '../../../../infrastructure/repositories/AttributeValueRepository';
import { VariantAttributeValueRepository } from '../../../../infrastructure/repositories/VariantAttributeValueRepository';
import type { ProductVariant } from '../../../../domain/entities/Product';
import type { AttributeValue } from '../../../../domain/entities/AttributeValue';
import type { VariantFormValues } from '../../schemas/product.schemas';

const avRepo  = new AttributeValueRepository();
const vavRepo = new VariantAttributeValueRepository();

const LIMIT = 10;

const ProductVariantsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate      = useNavigate();

  const { items: products, fetch: fetchProducts } = useProducts();
  const {
    items, isLoading, isSubmitting, error,
    fetch, create, update, remove, dismissError,
  } = useProductVariants(productId!);
  const { items: attributes, fetch: fetchAttributes } = useAttributes();

  const [modalOpen,          setModalOpen]         = useState(false);
  const [editItem,           setEditItem]           = useState<ProductVariant | null>(null);
  const [deleteItem,         setDeleteItem]         = useState<ProductVariant | null>(null);
  const [allAttributeValues, setAllAttributeValues] = useState<AttributeValue[]>([]);
  const [page,               setPage]               = useState(1);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || !productId) return;
    hasFetched.current = true;
    fetch();
    fetchProducts({ page: 1, limit: 100 });
    fetchAttributes({ page: 1, limit: 100 });
    avRepo
      .getAllFlat({ limit: 500 })
      .then((res) => setAllAttributeValues(res.items))
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const product = useMemo(
    () => products.find((p) => p.product_id === productId),
    [products, productId],
  );

  const filteredAttributes = useMemo(() => {
    if (!product) return [];
    return attributes.filter(
      (a) => a.category_no === product.category_no && a.status === 'A',
    );
  }, [attributes, product]);

  const filteredAttributeValues = useMemo(() => {
    if (filteredAttributes.length === 0) return [];
    const validNos = new Set(filteredAttributes.map((a) => a.attribute_no));
    return allAttributeValues.filter((v) => validNos.has(v.attribute_no));
  }, [filteredAttributes, allAttributeValues]);

  const totalPages = Math.ceil(items.length / LIMIT);
  const pagedItems = items.slice((page - 1) * LIMIT, page * LIMIT);

  const handleSubmit = async (
    values: VariantFormValues,
    selectedValueNos: number[],
  ) => {
    let savedVariant: ProductVariant | undefined;

    if (editItem) {
      const result = await update(editItem.variant_id, {
        sku:            values.sku,
        price_override: values.price_override,
        stock_qty:      values.stock_qty,
        weight_kg:      values.weight_kg,
        image_url:      values.image_url,
        status:         values.status,
      });
      savedVariant = (result as { payload?: ProductVariant })?.payload ?? undefined;
    } else {
      const result = await create({
        product_no:     product?.product_no ?? 0,
        sku:            values.sku,
        price_override: values.price_override,
        stock_qty:      values.stock_qty,
        weight_kg:      values.weight_kg,
        image_url:      values.image_url,
      });
      savedVariant = (result as { payload?: ProductVariant })?.payload ?? undefined;
    }

    if (savedVariant && selectedValueNos.length > 0) {
      await Promise.all(
        selectedValueNos.map((no) =>
          vavRepo.create({
            variant_no:         savedVariant!.variant_no,
            attribute_value_no: no,
          }),
        ),
      );
    }

    setModalOpen(false);
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.variant_id);
    setDeleteItem(null);
  };

  const totalStock = items.reduce((s, v) => s + v.stock_qty, 0);
  const avgPrice   = items.length
    ? items.reduce((s, v) => s + (v.price_override ?? product?.base_price ?? 0), 0) / items.length
    : 0;
  const lowStock = items.filter((v) => v.stock_qty === 0).length;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link" onClick={() => navigate('/dashboard')}>
          Dashboard
        </span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-link" onClick={() => navigate('/products')}>
          Products
        </span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Variants</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">
            Variants — {product?.product_name ?? '—'}
          </h1>
          <p className="gng-page-subtitle">
            Manage stock, pricing, and attributes for product ID: #{product?.sku ?? '—'}
          </p>
        </div>
        <button
          type="button"
          className="gng-btn-primary"
          onClick={() => { setEditItem(null); setModalOpen(true); }}
        >
          <i className="fa-solid fa-plus" /> Add Variant
        </button>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-cubes" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Variants</p>
            <p className="gng-stat-value">{items.length}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-green">
            <i className="fa-solid fa-boxes-stacked" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Stock</p>
            <p className="gng-stat-value">{totalStock.toLocaleString()} Units</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-arrow-trend-up" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Avg. Price</p>
            <p className="gng-stat-value">${avgPrice.toFixed(2)}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Low Stock Alert</p>
            <p className="gng-stat-value">{lowStock} Alerts</p>
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

      {/* Variant table */}
      <VariantTable
        items={pagedItems}
        total={items.length}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onEdit={(item) => { setEditItem(item); setModalOpen(true); }}
        onDelete={setDeleteItem}
        onPageChange={setPage}
      />

      {/* Variant Form Modal */}
      <VariantFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit}
        editItem={editItem}
        isSubmitting={isSubmitting}
        productSku={product?.sku ?? ''}
        attributes={filteredAttributes}
        attributeValues={filteredAttributeValues}
      />

      {/* Delete confirm */}
      {deleteItem && (
        <div className="gng-confirm-overlay">
          <div className="gng-confirm-box">
            <div className="gng-confirm-icon">
              <i className="fa-solid fa-trash-can" />
            </div>
            <p className="gng-confirm-title">Delete Variant</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete variant{' '}
              <span className="gng-confirm-name">"{deleteItem.sku}"</span>?
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

export default ProductVariantsPage;