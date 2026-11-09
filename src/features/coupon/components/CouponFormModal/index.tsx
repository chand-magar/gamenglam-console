import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import { couponSchema, type CouponFormValues } from '../../schemas/coupon.schemas';
import type { Coupon } from '../../../../domain/entities/Coupon';
import dayjs from 'dayjs';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: CouponFormValues) => Promise<void>;
  editItem?:    Coupon | null;
  isSubmitting: boolean;
}

export const CouponFormModal = ({ open, onClose, onSubmit, editItem, isSubmitting }: Props) => {
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '', description: '', discount_type: 'percentage',
      discount_value: 0, min_order_amount: 0,
      max_uses: null, valid_from: '', valid_until: null,
    },
  });

  const discountType = watch('discount_type');

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      reset({
        code:             editItem.code,
        description:      editItem.description ?? '',
        discount_type:    editItem.discount_type,
        discount_value:   editItem.discount_value,
        min_order_amount: editItem.min_order_amount,
        max_uses:         editItem.max_uses ?? null,
        valid_from:       dayjs(editItem.valid_from).format('YYYY-MM-DD'),
        valid_until:      editItem.valid_until ? dayjs(editItem.valid_until).format('YYYY-MM-DD') : null,
      });
    } else {
      reset({
        code: '', description: '', discount_type: 'percentage',
        discount_value: 0, min_order_amount: 0,
        max_uses: null, valid_from: dayjs().format('YYYY-MM-DD'), valid_until: null,
      });
    }
  }, [editItem, open, reset]);

  const handleFormSubmit = async (values: CouponFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Coupon' : 'Create Coupon'}
      subtitle="Configure coupon details and validity."
      icon="fa-solid fa-ticket"
      variant="default"
      size="md"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Create Coupon',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Code */}
        <div className="gng-field">
          <label className="gng-label">
            Coupon Code <span className="gng-required">*</span>
          </label>
          <input
            {...register('code')}
            type="text"
            placeholder="e.g. SPORT10"
            className={`gng-input ${errors.code ? 'gng-input-error' : ''}`}
            style={{ textTransform: 'uppercase' }}
            disabled={!!editItem}
          />
          {errors.code && <p className="gng-error-text"><i className="fa-solid fa-circle-exclamation" /> {errors.code.message}</p>}
        </div>

        {/* Description */}
        <div className="gng-field">
          <label className="gng-label">Description</label>
          <input {...register('description')} type="text" placeholder="e.g. 10% off on all sports gear" className="gng-input" />
        </div>

        {/* Discount type + value */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label">Discount Type <span className="gng-required">*</span></label>
            <Controller
              name="discount_type"
              control={control}
              render={({ field }) => (
                <select {...field} className="gng-select">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              )}
            />
          </div>
          <div className="gng-field">
            <label className="gng-label">
              Discount Value <span className="gng-required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gng-muted)', fontSize: 13 }}>
                {discountType === 'percentage' ? '%' : '₹'}
              </span>
              <input
                {...register('discount_value')}
                type="number"
                min={0}
                step={0.01}
                className={`gng-input ${errors.discount_value ? 'gng-input-error' : ''}`}
                style={{ paddingLeft: 28 }}
              />
            </div>
            {errors.discount_value && <p className="gng-error-text"><i className="fa-solid fa-circle-exclamation" /> {errors.discount_value.message}</p>}
          </div>
        </div>

        {/* Min order + max uses */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label">Min Order Amount (₹)</label>
            <input {...register('min_order_amount')} type="number" min={0} step={0.01} placeholder="0" className="gng-input" />
          </div>
          <div className="gng-field">
            <label className="gng-label">Max Uses <span style={{ color: 'var(--gng-muted)', fontWeight: 400 }}>(blank = unlimited)</span></label>
            <input
              {...register('max_uses', { setValueAs: (v) => (v === '' || v === null) ? null : Number(v) })}
              type="number"
              min={1}
              step={1}
              placeholder="Unlimited"
              className="gng-input"
            />
          </div>
        </div>

        {/* Validity */}
        <div className="gng-form-row">
          <div className="gng-field">
            <label className="gng-label">Valid From <span className="gng-required">*</span></label>
            <input {...register('valid_from')} type="date" className={`gng-input ${errors.valid_from ? 'gng-input-error' : ''}`} />
            {errors.valid_from && <p className="gng-error-text"><i className="fa-solid fa-circle-exclamation" /> {errors.valid_from.message}</p>}
          </div>
          <div className="gng-field">
            <label className="gng-label">Valid Until <span style={{ color: 'var(--gng-muted)', fontWeight: 400 }}>(blank = no expiry)</span></label>
            <input
              {...register('valid_until', { setValueAs: (v) => (v === '' || v === null) ? null : v })}
              type="date"
              className="gng-input"
            />
          </div>
        </div>

      </div>
    </Modal>
  );
};
