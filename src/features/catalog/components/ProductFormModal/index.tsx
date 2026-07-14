import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import { productSchema, type ProductFormValues } from '../../schemas/product.schemas';
import type { Product } from '../../../../domain/entities/Product';
import type { Category } from '../../../../domain/entities/Category';
import styles from './index.module.css';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: ProductFormValues) => Promise<void>;
  categories:   Category[];
  editItem?:    Product | null;
  isSubmitting: boolean;
}

const STATUS_OPTIONS = [
  { value: 'draft',    label: 'Draft'    },
  { value: 'active',   label: 'Active'   },
  { value: 'archived', label: 'Archived' },
];

export const ProductFormModal = ({
  open, onClose, onSubmit, categories, editItem, isSubmitting,
}: Props) => {
  const {
    register, handleSubmit, reset, watch, setValue, control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category_no:  0,
      sku:          '',
      product_name: '',
      slug:         '',
      description:  '',
      base_price:   0,
      is_featured:  false,
      stock_qty:    0,
      status:       'draft',
    },
  });

  const productNameValue = watch('product_name');

  useEffect(() => {
    if (editItem) {
      reset({
        category_no:  editItem.category_no,
        sku:          editItem.sku,
        product_name: editItem.product_name,
        slug:         editItem.slug,
        description:  editItem.description ?? '',
        base_price:   editItem.base_price,
        is_featured:  editItem.is_featured,
        stock_qty:    editItem.stock_qty,
        status:       editItem.status as 'draft' | 'active' | 'archived',
      });
    } else {
      reset({
        category_no:  0,
        sku:          '',
        product_name: '',
        slug:         '',
        description:  '',
        base_price:   0,
        is_featured:  false,
        stock_qty:    0,
        status:       'draft',
      });
    }
  }, [editItem, reset, open]);

  const generateSlug = () => {
    const slug = productNameValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setValue('slug', slug, { shouldValidate: true });
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Product' : 'Add New Product'}
      subtitle="Fill in the product details below."
      icon="fa-solid fa-box"
      variant="default"
      size="lg"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Save Product',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.formBody}>

        {/* Category + SKU */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label" htmlFor="category_no">
              Category <span className="gng-required">*</span>
            </label>
            <select
              id="category_no"
              className={`gng-select ${errors.category_no ? 'gng-input-error' : ''}`}
              {...register('category_no', { valueAsNumber: true })}
            >
              <option value={0}>Select Category</option>
              {categories.filter((c) => c.status === 'A').map((c) => (
                <option key={c.category_id} value={c.category_no}>
                  {c.category_name}
                </option>
              ))}
            </select>
            {errors.category_no && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.category_no.message}
              </p>
            )}
          </div>

          <div className="gng-field">
            <label className="gng-label" htmlFor="sku">
              SKU <span className="gng-required">*</span>
            </label>
            <input
              {...register('sku')}
              id="sku"
              type="text"
              placeholder="e.g. UHD-55-2024-X"
              className={`gng-input ${errors.sku ? 'gng-input-error' : ''}`}
            />
            {errors.sku && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.sku.message}
              </p>
            )}
          </div>
        </div>

        {/* Product Name + Slug */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label" htmlFor="product_name">
              Product Name <span className="gng-required">*</span>
            </label>
            <input
              {...register('product_name')}
              id="product_name"
              type="text"
              placeholder="e.g. UltraHD Smart Display 55"
              className={`gng-input ${errors.product_name ? 'gng-input-error' : ''}`}
            />
            {errors.product_name && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.product_name.message}
              </p>
            )}
          </div>

          <div className="gng-field">
            <label className="gng-label" htmlFor="slug">
              Slug <span className="gng-required">*</span>
            </label>
            <div className="gng-slug-wrapper">
              <input
                {...register('slug')}
                id="slug"
                type="text"
                placeholder="e.g. ultrahd-smart-display-55"
                className={`gng-input gng-slug-input ${errors.slug ? 'gng-input-error' : ''}`}
              />
              <button
                type="button"
                className="gng-slug-btn"
                onClick={generateSlug}
                title="Auto-generate from product name"
              >
                <i className="fa-solid fa-wand-magic-sparkles" />
              </button>
            </div>
            {errors.slug && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.slug.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="gng-field">
          <label className="gng-label" htmlFor="description">Description</label>
          <textarea
            {...register('description')}
            id="description"
            placeholder="Provide a detailed description of the product features..."
            className="gng-textarea"
          />
        </div>

        {/* Base Price + Stock */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label" htmlFor="base_price">
              Base Price ($) <span className="gng-required">*</span>
            </label>
            <input
              {...register('base_price', { valueAsNumber: true })}
              id="base_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={`gng-input ${errors.base_price ? 'gng-input-error' : ''}`}
            />
            {errors.base_price && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.base_price.message}
              </p>
            )}
          </div>

          <div className="gng-field">
            <label className="gng-label" htmlFor="stock_qty">Stock Quantity</label>
            <input
              {...register('stock_qty', { valueAsNumber: true })}
              id="stock_qty"
              type="number"
              min="0"
              placeholder="0"
              className="gng-input"
            />
          </div>
        </div>

        {/* Status + Featured */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label" htmlFor="status">Product Status</label>
            <select id="status" {...register('status')} className="gng-select">
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="gng-field">
            <label className="gng-label">Featured Product</label>
            <Controller
              name="is_featured"
              control={control}
              render={({ field }) => (
                <label className={styles.featuredLabel}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    className={`gng-toggle ${field.value ? 'gng-toggle-on' : ''}`}
                    onClick={() => field.onChange(!field.value)}
                  />
                  <div>
                    <p className={styles.toggleTitle}>Featured Product</p>
                    <p className={styles.toggleSub}>Show this product in premium carousels</p>
                  </div>
                </label>
              )}
            />
          </div>
        </div>

      </div>
    </Modal>
  );
};