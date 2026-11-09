import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductVariants }     from '../../hooks/useProductVariants';
import { useProducts }            from '../../hooks/useProducts';
import { useAttributes }          from '../../hooks/useAttributes';
import { VariantTable }           from '../../components/VariantTable';
import { VariantFormModal }       from '../../components/VariantFormModal';
import { VariantGeneratorModal }  from '../../components/VariantGeneratorModal';
import { VariantImageRepository } from '../../../../infrastructure/repositories/VariantImageRepository';
import { AttributeValueRepository } from '../../../../infrastructure/repositories/AttributeValueRepository';
import axiosInstance from '../../../../core/api/axiosInstance';
import type { ProductVariant }    from '../../../../domain/entities/Product';
import type { AttributeValue }    from '../../../../domain/entities/AttributeValue';
import type { VariantFormValues } from '../../schemas/product.schemas';
import type { PendingImage }      from '../../components/VariantImageUploader';
import type { GeneratedVariant } from '../../components/VariantGeneratorModal';

const avRepo  = new AttributeValueRepository();
const imgRepo = new VariantImageRepository();

const LIMIT = 10;

const ProductVariantsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate      = useNavigate();

  const { items: products, fetch: fetchProducts } = useProducts();
  const {
    items, isLoading, isSubmitting, error,
    fetch, update, remove, dismissError,
  } = useProductVariants(productId!);
  const { items: attributes, fetch: fetchAttributes } = useAttributes();

  const [generatorOpen,      setGeneratorOpen]     = useState(false);
  const [editModalOpen,      setEditModalOpen]      = useState(false);
  const [editItem,           setEditItem]           = useState<ProductVariant | null>(null);
  const [deleteItem,         setDeleteItem]         = useState<ProductVariant | null>(null);
  const [allAttributeValues, setAllAttributeValues] = useState<AttributeValue[]>([]);
  const [isBulkSaving,       setIsBulkSaving]      = useState(false);
  const [bulkError,          setBulkError]          = useState('');
  const [page,               setPage]               = useState(1);
  const [variantImages,      setVariantImages]      = useState<Record<string, string | null>>({});

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

  // ── Fetch primary images in one batch request ──────────────────────────────
  useEffect(() => {
    if (items.length === 0) return;
    imgRepo
      .getPrimaryBatch(items.map((v) => v.variant_id))
      .then(setVariantImages)
      .catch(console.error);
  }, [items]);

  const product = useMemo(
    () => products.find((p) => p.product_id === productId),
    [products, productId],
  );

  const filteredAttributes = useMemo(() => {
  if (!product) return [];
    return attributes.filter(
      (a) => a.category_id === product.category_id && a.status === 'A',
    );
  }, [attributes, product]);

  const filteredAttributeValues = useMemo(() => {
    if (filteredAttributes.length === 0) return [];
    const validIds = new Set(filteredAttributes.map((a) => a.attribute_id));
    return allAttributeValues.filter((v:any) => validIds.has(v.attribute_id));
  }, [filteredAttributes, allAttributeValues]);

  const totalPages = Math.ceil(items.length / LIMIT);
  const pagedItems = items.slice((page - 1) * LIMIT, page * LIMIT);

  // ── Bulk create from generator ─────────────────────────────────────────────
  const handleBulkCreate = async (variants: GeneratedVariant[]) => {
    if (!product) return;
    setBulkError('');
    setIsBulkSaving(true);

    try {
      const res = await axiosInstance.post<{
        data: { variants: ProductVariant[] };
      }>('/product-variants/bulk', {
        product_id: product.product_id,
        variants: variants.map((v) => ({
          sku:                  v.sku,
          cost_price:           v.cost_price,      // ← add
          mrp:                  v.mrp,             // ← add
          selling_price:        v.selling_price,   // ← add
          stock_qty:            v.stock_qty,
          weight_kg:            v.weight_kg,
          image_url:            null,
          attribute_value_ids:  v.attributeValueIds,
        })),
      });

      const createdVariants = res.data?.data?.variants ?? [];

      for (let i = 0; i < variants.length; i++) {
        const pending = variants[i].pendingImages ?? [];
        const created = createdVariants[i];
        if (!created || pending.length === 0) continue;

        const files = pending
          .filter((img) => !img.isUrl && img.file)
          .map((img) => img.file!);

        if (files.length > 0) {
          await imgRepo.uploadFiles(created.variant_id, files);
        }
      }

      setGeneratorOpen(false);
      fetch();
    } catch (err: unknown) {
      setBulkError(
        (err as any)?.response?.data?.error ?? 'Failed to create variants.',
      );
    } finally {
      setIsBulkSaving(false);
    }
  };

  // ── Edit submit ────────────────────────────────────────────────────────────
  const handleEditSubmit = async (
    values:             VariantFormValues,
    _selectedValueIds:  string[],  // ← string UUIDs
    pendingImages:      PendingImage[],
  ) => {
    if (!editItem) return;

    await update(editItem.variant_id, {
      sku:           values.sku,
      cost_price:    values.cost_price    ?? null,  // ← add
      mrp:           values.mrp           ?? null,  // ← add
      selling_price: values.selling_price ?? null,  // ← add
      stock_qty:     values.stock_qty,
      weight_kg:     values.weight_kg,
      image_url:     values.image_url,
      status:        values.status,
    });

    if (pendingImages.length > 0) {
      const files = pendingImages
        .filter((img) => img.file)
        .map((img) => img.file!);

      if (files.length > 0) {
        await imgRepo.uploadFiles(editItem.variant_id, files);
      }
    }

    setEditModalOpen(false);
    setEditItem(null);
    fetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.variant_id);
    setDeleteItem(null);
  };

  const totalStock = items.reduce((s, v) => s + v.stock_qty, 0);
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
            Manage stock, pricing and attribute combinations for #{product?.sku ?? '—'}
          </p>
        </div>
        <button
          type="button"
          className="gng-btn-primary"
          onClick={() => setGeneratorOpen(true)}
        >
          <i className="fa-solid fa-wand-magic-sparkles" /> Generate Variants
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

      {/* Errors */}
      {(error || bulkError) && (
        <div className="gng-error-alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error || bulkError}</span>
          <button
            type="button"
            className="gng-error-dismiss"
            onClick={() => { dismissError(); setBulkError(''); }}
          >
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
        variantImages={variantImages}
        onEdit={(item) => { setEditItem(item); setEditModalOpen(true); }}
        onDelete={setDeleteItem}
        onPageChange={setPage}
      />

      {/* Generator Modal */}
      <VariantGeneratorModal
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onSubmit={handleBulkCreate}
        isSubmitting={isBulkSaving}
        productSku={product?.sku ?? ''}
        attributes={filteredAttributes}
        attributeValues={filteredAttributeValues}
      />

      {/* Edit Modal */}
      <VariantFormModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditItem(null); }}
        onSubmit={handleEditSubmit}
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