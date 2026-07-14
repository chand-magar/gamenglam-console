import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import { sectionSchema, type SectionFormValues } from '../../schemas/section.schemas';
import type { Section } from '../../../../domain/entities/Section';
import styles from './index.module.css';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: SectionFormValues) => Promise<void>;
  editItem?:    Section | null;
  isSubmitting: boolean;
}

export const SectionFormModal = ({
  open, onClose, onSubmit, editItem, isSubmitting,
}: Props) => {
  const {
    register, handleSubmit, reset, control,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      section_name:  '',
      section_path:  '/',
      section_icon:  '',
      section_order: 0,
    },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        section_name:  editItem.section_name,
        section_path:  editItem.section_path,
        section_icon:  editItem.section_icon,
        section_order: editItem.section_order,
      });
    } else {
      reset({
        section_name:  '',
        section_path:  '/',
        section_icon:  '',
        section_order: 0,
      });
    }
  }, [editItem, reset, open]);

  const handleFormSubmit = async (values: SectionFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Section' : 'Add Section'}
      subtitle="Configure navigation section details."
      icon="fa-solid fa-rectangle-list"
      variant="default"
      size="md"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Add Section',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.formBody}>

        {/* Section Name + Path */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label" htmlFor="section_name">
              Section Name <span className="gng-required">*</span>
            </label>
            <input
              {...register('section_name')}
              id="section_name"
              type="text"
              placeholder="e.g. Dashboard"
              className={`gng-input ${errors.section_name ? 'gng-input-error' : ''}`}
            />
            {errors.section_name && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.section_name.message}
              </p>
            )}
          </div>

          <div className="gng-field">
            <label className="gng-label" htmlFor="section_path">
              Section Path <span className="gng-required">*</span>
            </label>
            <input
              {...register('section_path')}
              id="section_path"
              type="text"
              placeholder="e.g. /dashboard"
              className={`gng-input ${errors.section_path ? 'gng-input-error' : ''}`}
            />
            {errors.section_path && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.section_path.message}
              </p>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className="gng-field">
          <label className="gng-label" htmlFor="section_icon">
            Section Icon <span className="gng-required">*</span>
          </label>
          <div className={styles.iconInputWrapper}>
            <input
              {...register('section_icon')}
              id="section_icon"
              type="text"
              placeholder="e.g. fa-solid fa-gauge-high"
              className={`gng-input ${errors.section_icon ? 'gng-input-error' : ''}`}
            />
            <div className={styles.iconPreviewBox}>
              <Controller
                name="section_icon"
                control={control}
                render={({ field }) => (
                  field.value
                    ? <i className={field.value} />
                    : <i className="fa-regular fa-image" style={{ color: '#D1D5DB' }} />
                )}
              />
            </div>
          </div>
          {errors.section_icon && (
            <p className="gng-error-text">
              <i className="fa-solid fa-circle-exclamation" />
              {errors.section_icon.message}
            </p>
          )}
          <p className={styles.iconHint}>
            Use Font Awesome class names e.g. <code>fa-solid fa-gauge-high</code>
          </p>
        </div>

        {/* Sort Order */}
        <div className="gng-field" style={{ maxWidth: 160 }}>
          <label className="gng-label">Section Order</label>
          <div className={styles.spinnerWrapper}>
            <Controller
              name="section_order"
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