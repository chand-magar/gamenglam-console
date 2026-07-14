import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import { pageSchema, type PageFormValues } from '../../schemas/page.schemas';
import type { Page } from '../../../../domain/entities/Page';
import type { Section } from '../../../../domain/entities/Section';
import styles from './index.module.css';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: PageFormValues) => Promise<void>;
  sections:     Section[];
  editItem?:    Page | null;
  isSubmitting: boolean;
}

export const PageFormModal = ({
  open, onClose, onSubmit, sections, editItem, isSubmitting,
}: Props) => {
  const {
    register, handleSubmit, reset, control,
    formState: { errors },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      section_no: 0,
      page_name:  '',
      page_path:  '/',
      page_order: 0,
    },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        section_no: editItem.section_no,
        page_name:  editItem.page_name,
        page_path:  editItem.page_path,
        page_order: editItem.page_order,
      });
    } else {
      reset({ section_no: 0, page_name: '', page_path: '/', page_order: 0 });
    }
  }, [editItem, reset, open]);

  const handleFormSubmit = async (values: PageFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Page' : 'Add Page'}
      subtitle="Configure page details and section assignment."
      icon="fa-solid fa-file-lines"
      variant="default"
      size="md"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Add Page',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.formBody}>

        {/* Section */}
        <div className="gng-field">
          <label className="gng-label" htmlFor="section_no">
            Section <span className="gng-required">*</span>
          </label>
          <select
            id="section_no"
            className={`gng-select ${errors.section_no ? 'gng-input-error' : ''}`}
            {...register('section_no', { valueAsNumber: true })}
          >
            <option value={0}>Select Section</option>
            {sections.filter((s) => s.status === 'A').map((s) => (
              <option key={s.section_id} value={s.section_no}>
                {s.section_name}
              </option>
            ))}
          </select>
          {errors.section_no && (
            <p className="gng-error-text">
              <i className="fa-solid fa-circle-exclamation" />
              {errors.section_no.message}
            </p>
          )}
        </div>

        {/* Page Name + Path */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label" htmlFor="page_name">
              Page Name <span className="gng-required">*</span>
            </label>
            <input
              {...register('page_name')}
              id="page_name"
              type="text"
              placeholder="e.g. Category List"
              className={`gng-input ${errors.page_name ? 'gng-input-error' : ''}`}
            />
            {errors.page_name && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.page_name.message}
              </p>
            )}
          </div>

          <div className="gng-field">
            <label className="gng-label" htmlFor="page_path">
              Page Path <span className="gng-required">*</span>
            </label>
            <input
              {...register('page_path')}
              id="page_path"
              type="text"
              placeholder="e.g. /category"
              className={`gng-input ${errors.page_path ? 'gng-input-error' : ''}`}
            />
            {errors.page_path && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" />
                {errors.page_path.message}
              </p>
            )}
          </div>
        </div>

        {/* Page Order */}
        <div className="gng-field" style={{ maxWidth: 160 }}>
          <label className="gng-label">Page Order</label>
          <div className={styles.spinnerWrapper}>
            <Controller
              name="page_order"
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