import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import { categorySchema, type CategoryFormValues } from '../../schemas/category.schemas';
import type { Category } from '../../../../domain/entities/Category';
import styles from './index.module.css';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: CategoryFormValues) => Promise<void>;
  categories:   Category[];
  editItem?:    Category | null;
  isSubmitting: boolean;
}

export const CategoryFormModal = ({
  open, onClose, onSubmit, categories, editItem, isSubmitting,
}: Props) => {
  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category_name: '',
      slug:          '',
      details:       '',
      parent_id:     null,
    },
  });

  const nameValue = watch('category_name');

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      reset({
        category_name: editItem.category_name,
        slug:          editItem.slug,
        details:       editItem.details ?? '',
        parent_id:     (editItem as any).parent_id ?? null, // ← UUID
      });
    } else {
      reset({ category_name: '', slug: '', details: '', parent_id: null });
    }
  }, [editItem, reset, open]);

  const generateSlug = () => {
    const slug = nameValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setValue('slug', slug, { shouldValidate: true });
  };

  const handleFormSubmit = async (values: CategoryFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Category' : 'Add Category'}
      subtitle="Configure category details."
      icon="fa-solid fa-sitemap"
      variant="default"
      size="md"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Add Category',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.formBody}>

        {/* Category Name + Slug */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label" htmlFor="category_name">
              Category Name <span className="gng-required">*</span>
            </label>
            <input
              {...register('category_name')}
              id="category_name"
              type="text"
              placeholder="e.g. Electronics"
              className={`gng-input ${errors.category_name ? 'gng-input-error' : ''}`}
            />
            {errors.category_name && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" /> {errors.category_name.message}
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
                placeholder="e.g. electronics"
                className={`gng-input gng-slug-input ${errors.slug ? 'gng-input-error' : ''}`}
              />
              <button
                type="button"
                className="gng-slug-btn"
                onClick={generateSlug}
                title="Auto-generate from name"
              >
                <i className="fa-solid fa-wand-magic-sparkles" />
              </button>
            </div>
            {errors.slug && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" /> {errors.slug.message}
              </p>
            )}
          </div>
        </div>

        {/* Parent Category */}
        <div className="gng-field">
          <label className="gng-label" htmlFor="parent_id">
            Parent Category
          </label>
          <select
            id="parent_id"
            className="gng-select"
            {...register('parent_id', {
              setValueAs: (v) => (v === '' || v === null) ? null : v, // ← keep as UUID string
            })}
          >
            <option value="">None (Top Level)</option>
            {categories
              .filter((c) => c.status === 'A' && c.category_id !== editItem?.category_id)
              .map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
          </select>
        </div>

        {/* Details */}
        <div className="gng-field">
          <label className="gng-label" htmlFor="details">Details</label>
          <textarea
            {...register('details')}
            id="details"
            placeholder="Optional description..."
            className="gng-textarea"
          />
        </div>
      </div>
    </Modal>
  );
};