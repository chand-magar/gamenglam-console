import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver }   from '@hookform/resolvers/zod';
import { Modal }         from '../../../../shared/components/Modal';
import { productSchema, type ProductFormValues } from '../../schemas/product.schemas';
import type { Product }  from '../../../../domain/entities/Product';
import type { Category } from '../../../../domain/entities/Category';
import styles from './index.module.css';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: ProductFormValues, pendingImage?: File | null) => Promise<void>;
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
    register, handleSubmit, reset, setValue, watch, control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      category_id:    '',   // ← UUID string
      sku:            '',
      product_name:   '',
      slug:           '',
      description:    '',
      is_featured:    false,
      status:         'draft',
      features:       [],
      specifications: [],
    },
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } =
    useFieldArray({ control, name: 'specifications' });

  const { fields: featFields, append: appendFeat, remove: removeFeat } =
    useFieldArray({ control, name: 'features' as any });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [newFeature,   setNewFeature]   = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productName = watch('product_name');
  const isEdit      = !!editItem;

  // Auto-generate slug from product name (create only)
  useEffect(() => {
    if (!isEdit && productName) {
      const slug = productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug, { shouldValidate: false });
    }
  }, [productName, isEdit, setValue]);

  // Reset form on open
  useEffect(() => {
    if (!open) return;

    if (editItem) {
   
      reset({
        category_id:    (editItem as any).category_id ?? '',  // ← UUID
        sku:            editItem.sku,
        product_name:   editItem.product_name,
        slug:           editItem.slug,
        description:    editItem.description ?? '',
        is_featured:    editItem.is_featured,
        status:         editItem.status as 'draft' | 'active' | 'archived',
        features:       (editItem as any).features       ?? [],
        specifications: (editItem as any).specifications ?? [],
      });

      setImagePreview(editItem.image_url ?? null);
    } else {
      reset({
        category_id: '', sku: '', product_name: '', slug: '',
        description: '', is_featured: false,
        status: 'draft', features: [], specifications: [],
      });
      setImagePreview(null);
    }

    setPendingImage(null);
    setNewFeature('');
  }, [editItem, open, categories, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImage(file);
    setImagePreview(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    appendFeat(newFeature.trim() as any);
    setNewFeature('');
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    await onSubmit(values, pendingImage);
    reset();
    setImagePreview(null);
    setPendingImage(null);
    setNewFeature('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      subtitle={isEdit ? `Editing: ${editItem.product_name}` : 'Create a new product'}
      icon="fa-solid fa-box"
      variant="default"
      size="lg"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: isEdit ? 'Save Changes' : 'Add Product',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.twoCol}>

        {/* ── Left ── */}
        <div className={styles.leftCol}>

          {/* Category */}
          <div className="gng-field">
            <label className="gng-label">
              Category <span className="gng-label-required">*</span>
            </label>
            <select
              {...register('category_id')}
              className={`gng-select ${errors.category_id ? 'gng-input-error' : ''}`}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" /> {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Product Name */}
          <div className="gng-field">
            <label className="gng-label">
              Product Name <span className="gng-label-required">*</span>
            </label>
            <input
              {...register('product_name')}
              type="text"
              placeholder="e.g. Samsung Galaxy S24"
              className={`gng-input ${errors.product_name ? 'gng-input-error' : ''}`}
            />
            {errors.product_name && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" /> {errors.product_name.message}
              </p>
            )}
          </div>

          {/* SKU + Slug */}
          <div className="gng-form-row">
            <div className="gng-field">
              <label className="gng-label">SKU <span className="gng-label-required">*</span></label>
              <input
                {...register('sku')}
                type="text"
                placeholder="e.g. SGS24-BLK"
                className={`gng-input ${errors.sku ? 'gng-input-error' : ''}`}
              />
              {errors.sku && <p className="gng-error-text"><i className="fa-solid fa-circle-exclamation" /> {errors.sku.message}</p>}
            </div>
            <div className="gng-field">
              <label className="gng-label">Slug <span className="gng-label-required">*</span></label>
              <input
                {...register('slug')}
                type="text"
                placeholder="samsung-galaxy-s24"
                className={`gng-input ${errors.slug ? 'gng-input-error' : ''}`}
              />
              {errors.slug && <p className="gng-error-text"><i className="fa-solid fa-circle-exclamation" /> {errors.slug.message}</p>}
            </div>
          </div>

          {/* Status + Featured */}
          <div className="gng-form-row">
            <div className="gng-field">
              <label className="gng-label">Status</label>
              <select {...register('status')} className="gng-select">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="gng-field">
              <label className="gng-label">Featured</label>
              <div className={styles.featuredRow}>
                <input
                  {...register('is_featured')}
                  type="checkbox"
                  id="is_featured"
                  className={styles.featuredCheckbox}
                />
                <label htmlFor="is_featured" className={styles.featuredLabel}>
                  Show on homepage
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="gng-field">
            <label className="gng-label">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Product description..."
              className="gng-input"
              style={{ resize:'vertical', fontFamily:'inherit', fontSize:14, lineHeight:1.6 }}
            />
          </div>

          {/* Specifications */}
          <div className="gng-field">
            <label className="gng-label">Specifications</label>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {specFields.map((field, index) => (
                <div key={field.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, alignItems:'center' }}>
                  <input
                    {...register(`specifications.${index}.key`)}
                    placeholder="Key (e.g. Weight)"
                    className="gng-input"
                    style={{ fontSize:13 }}
                  />
                  <input
                    {...register(`specifications.${index}.value`)}
                    placeholder="Value (e.g. 500g)"
                    className="gng-input"
                    style={{ fontSize:13 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="gng-action-btn gng-action-delete"
                    title="Remove"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendSpec({ key: '', value: '' })}
                className="gng-btn-secondary"
                style={{ fontSize:12, width:'fit-content' }}
              >
                <i className="fa-solid fa-plus" /> Add Specification
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="gng-field">
            <label className="gng-label">Features</label>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {featFields.map((field, index) => (
                <div key={field.id} style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input
                    {...register(`features.${index}` as any)}
                    placeholder="e.g. Waterproof"
                    className="gng-input"
                    style={{ fontSize:13 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeat(index)}
                    className="gng-action-btn gng-action-delete"
                    title="Remove"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ))}
              <div style={{ display:'flex', gap:8 }}>
                <input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                  placeholder="Type a feature and press Enter"
                  className="gng-input"
                  style={{ fontSize:13 }}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="gng-btn-secondary"
                  style={{ fontSize:12, whiteSpace:'nowrap' }}
                >
                  <i className="fa-solid fa-plus" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right — image ── */}
        <div className={styles.rightCol}>

          <div className={styles.imgHeader}>
            <i className="fa-solid fa-image" style={{ color: '#6C35DE', fontSize: 13 }} />
            <span className={styles.imgTitle}>Product Image</span>
          </div>

          {imagePreview ? (
            <div className={styles.imgPreviewBox}>
              <img src={imagePreview} alt="Product" className={styles.imgPreview} />
              <div className={styles.imgActions}>
                <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.imgActionBtn} title="Change image">
                  <i className="fa-solid fa-pen" />
                </button>
                <button type="button" onClick={handleRemoveImage} className={`${styles.imgActionBtn} ${styles.imgActionDelete}`} title="Remove image">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              {pendingImage && (
                <div className={styles.pendingBadge}>
                  <i className="fa-solid fa-clock" style={{ fontSize: 9 }} />
                  Pending upload
                </div>
              )}
            </div>
          ) : (
            <div className={styles.imgUploadZone} onClick={() => fileInputRef.current?.click()}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 26, color: '#9CA3AF' }} />
              <p className={styles.imgUploadText}>Click to upload</p>
              <p className={styles.imgUploadSub}>PNG, JPG, WebP — max 5MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <div className={styles.imgTips}>
            <p className={styles.imgTipsTitle}>Image Guidelines</p>
            <ul className={styles.imgTipsList}>
              <li>Use square images (1:1 ratio)</li>
              <li>Minimum 800×800 pixels</li>
              <li>White or transparent background</li>
              <li>Max file size 5MB</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};