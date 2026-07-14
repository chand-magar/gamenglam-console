import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import { attributeSchema, type AttributeFormValues } from '../../schemas/attribute.schemas';
import type { Attribute } from '../../../../domain/entities/Attribute';
import type { Category } from '../../../../domain/entities/Category';
import styles from './index.module.css';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: AttributeFormValues) => Promise<void>;
  categories:   Category[];
  editItem?:    Attribute | null;
  isSubmitting: boolean;
}

const TYPE_OPTIONS = [
  { value: 'select',       label: 'Select'       },
  { value: 'multi_select', label: 'Multi Select' },
  { value: 'boolean',      label: 'Boolean'      },
  { value: 'text',         label: 'Text'         },
  { value: 'number',       label: 'Number'       },
  { value: 'color',        label: 'Color'        },
] as const;

export const AttributeFormModal = ({
  open, onClose, onSubmit, categories, editItem, isSubmitting,
}: Props) => {
  const {
    register, handleSubmit, reset, control,
    formState: { errors },
  } = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      category_no:    0,
      attribute_name: '',
      code:           '',
      type:           'select',
      is_required:    false,
      is_variant:     false,
      sort_order:     0,
    },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        category_no:    editItem.category_no,
        attribute_name: editItem.attribute_name,
        code:           editItem.code,
        type:           editItem.type,
        is_required:    editItem.is_required,
        is_variant:     editItem.is_variant,
        sort_order:     editItem.sort_order,
      });
    } else {
      reset({
        category_no:    0,
        attribute_name: '',
        code:           '',
        type:           'select',
        is_required:    false,
        is_variant:     false,
        sort_order:     0,
      });
    }
  }, [editItem, reset, open]);

  const handleFormSubmit = async (values: AttributeFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Attribute' : 'Add Attribute'}
      subtitle="Configure product specification metadata."
      icon="fa-solid fa-sliders"
      variant="default"
      size="md"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Add Attribute',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.formBody}>

        {/* Category + Attribute Name */}
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
              <option value={0}>Select category</option>
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
            <label className="gng-label" htmlFor="attribute_name">
              Attribute Name <span className="gng-required">*</span>
            </label>
            <input
              {...register('attribute_name')}
              id="attribute_name"
              type="text"
              placeholder="e.g. Primary Color"
              className={`gng-input ${errors.attribute_name ? 'gng-input-error' : ''}`}
            />
            {errors.attribute_name && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.attribute_name.message}
              </p>
            )}
          </div>
        </div>

        {/* Code + Type */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label" htmlFor="code">
              Code <span className="gng-required">*</span>
            </label>
            <input
              {...register('code')}
              id="code"
              type="text"
              placeholder="e.g. color_hex"
              className={`gng-input ${errors.code ? 'gng-input-error' : ''}`}
            />
            {errors.code && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="gng-field">
            <label className="gng-label" htmlFor="type">
              Type <span className="gng-required">*</span>
            </label>
            <select
              id="type"
              className={`gng-select ${errors.type ? 'gng-input-error' : ''}`}
              {...register('type')}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.type && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.type.message}
              </p>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className={styles.togglesRow}>
          <Controller
            name="is_required"
            control={control}
            render={({ field }) => (
              <label className={styles.toggleLabel}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  className={`gng-toggle ${field.value ? 'gng-toggle-on' : ''}`}
                  onClick={() => field.onChange(!field.value)}
                />
                <div>
                  <p className={styles.toggleTitle}>Is Required</p>
                  <p className={styles.toggleSub}>Field cannot be empty</p>
                </div>
              </label>
            )}
          />

          <Controller
            name="is_variant"
            control={control}
            render={({ field }) => (
              <label className={styles.toggleLabel}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  className={`gng-toggle ${field.value ? 'gng-toggle-on' : ''}`}
                  onClick={() => field.onChange(!field.value)}
                />
                <div>
                  <p className={styles.toggleTitle}>Is Variant</p>
                  <p className={styles.toggleSub}>Affects inventory pricing</p>
                </div>
              </label>
            )}
          />
        </div>

        {/* Sort Order */}
        <div className="gng-field" style={{ maxWidth: 160 }}>
          <label className="gng-label">Sort Order</label>
          <div className={styles.spinnerWrapper}>
            <Controller
              name="sort_order"
              control={control}
              render={({ field }) => (
                <>
                  <button
                    type="button"
                    className={styles.spinnerBtn}
                    onClick={() => field.onChange(Math.max(0, field.value - 1))}
                  >
                    <i className="fa-solid fa-minus" />
                  </button>
                  <input
                    type="number"
                    className={styles.spinnerInput}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    min={0}
                  />
                  <button
                    type="button"
                    className={styles.spinnerBtn}
                    onClick={() => field.onChange(field.value + 1)}
                  >
                    <i className="fa-solid fa-plus" />
                  </button>
                </>
              )}
            />
          </div>
        </div>

      </div>
    </Modal>
  );
};