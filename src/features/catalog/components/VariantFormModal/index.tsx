import { useEffect, useState, useRef } from 'react';
import { useForm }     from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal }       from '../../../../shared/components/Modal';
import { variantSchema, type VariantFormValues } from '../../schemas/product.schemas';
import type { ProductVariant }        from '../../../../domain/entities/Product';
import type { Attribute }             from '../../../../domain/entities/Attribute';
import type { AttributeValue }        from '../../../../domain/entities/AttributeValue';
import type { VariantImage }          from '../../../../domain/entities/VariantImage';
import { VariantAttributeValueRepository } from '../../../../infrastructure/repositories/VariantAttributeValueRepository';
import { VariantImageRepository }          from '../../../../infrastructure/repositories/VariantImageRepository';
import { VariantImageUploader, type PendingImage } from '../VariantImageUploader';
import styles from './index.module.css';

interface Props {
  open:            boolean;
  onClose:         () => void;
  onSubmit:        (values: VariantFormValues, selectedValueIds: string[], pendingImages: PendingImage[]) => Promise<void>;
  editItem?:       ProductVariant | null;
  isSubmitting:    boolean;
  productSku:      string;
  attributes:      Attribute[];
  attributeValues: AttributeValue[];
}

const STATUS_OPTIONS = [
  { value: 'draft',    label: 'Draft'    },
  { value: 'active',   label: 'Active'   },
  { value: 'archived', label: 'Archived' },
];

const vavRepo = new VariantAttributeValueRepository();

export const VariantFormModal = ({
  open, onClose, onSubmit, editItem, isSubmitting,
  productSku, attributes, attributeValues,
}: Props) => {
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: '', stock_qty: 0,
      weight_kg: null, image_url: null, status: 'draft',
    },
  });

  const [selectedValueIds,  setSelectedValueIds]  = useState<string[]>([]); // ← UUIDs
  const [loadingAttrValues, setLoadingAttrValues]  = useState(false);
  const [existingImages,    setExistingImages]     = useState<VariantImage[]>([]);
  const [pendingImages,     setPendingImages]      = useState<PendingImage[]>([]);

  const imgRepo = useRef(new VariantImageRepository());
  const isEdit  = !!editItem;

  useEffect(() => {
    if (!open) return;

    if (editItem) {
      reset({
        sku:           editItem.sku,
        cost_price:    (editItem as any).cost_price   ?? null,  // ← add
        mrp:           (editItem as any).mrp          ?? null,  // ← add
        selling_price: (editItem as any).selling_price ?? null, // ← add
        stock_qty:     editItem.stock_qty,
        weight_kg:     editItem.weight_kg,
        image_url:     editItem.image_url,
        status:        editItem.status as 'draft' | 'active' | 'archived',
      });

      setLoadingAttrValues(true);
      setPendingImages([]);

      Promise.all([
        vavRepo.getByVariantId(editItem.variant_id),
        imgRepo.current.getByVariantId(editItem.variant_id),
      ])
        .then(([vavData, imgData]) => {
          // Use attribute_value_id (UUID) instead of attribute_value_no
          setSelectedValueIds(vavData.map((d: any) => d.attribute_value_id).filter(Boolean));
          setExistingImages(imgData);
        })
        .catch(console.error)
        .finally(() => setLoadingAttrValues(false));

    } else {
      reset({ sku: '', stock_qty: 0, weight_kg: null, image_url: null, status: 'draft' });
      setSelectedValueIds([]);
      setExistingImages([]);
      setPendingImages([]);
    }
  }, [editItem, reset, open]);

  const toggleValue = (valueId: string) => {
    if (isEdit) return;
    setSelectedValueIds((prev) =>
      prev.includes(valueId)
        ? prev.filter((id) => id !== valueId)
        : [...prev, valueId],
    );
  };

  const handleDeleteImage = async (imageId: string) => {
    await imgRepo.current.delete(imageId);
    setExistingImages((prev) => prev.filter((img) => img.image_id !== imageId));
  };

  const handleFormSubmit = async (values: VariantFormValues) => {
    await onSubmit(values, selectedValueIds, pendingImages);
    reset();
    setSelectedValueIds([]);
    setExistingImages([]);
    setPendingImages([]);
  };

  // Group attributes by attribute_id (UUID) — no more attribute_no
  const groupedAttributes = attributes
    .map((attr) => ({
      attribute: attr,
      values:    attributeValues.filter((v: any) => v.attribute_id === attr.attribute_id),
    }))
    .filter((g) => {
      if (g.values.length === 0) return false;
      if (isEdit) {
        return g.values.some((v: any) => selectedValueIds.includes(v.attribute_value_id));
      }
      return true;
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Variant' : 'Add Variant'}
      subtitle={isEdit ? `Editing SKU: ${editItem.sku}` : `New variant for ${productSku}`}
      icon="fa-solid fa-cubes"
      variant="default"
      size="lg"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: isEdit ? 'Save Changes' : 'Add Variant',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.twoCol}>

        {/* ── Left — fields ── */}
        <div className={styles.leftCol}>

          {/* SKU */}
          <div className="gng-field">
            <label className="gng-label">SKU Code</label>
            <input
              {...register('sku')}
              type="text"
              placeholder="e.g. UV4K-BLK-55"
              readOnly={isEdit}
              className={`gng-input ${errors.sku ? 'gng-input-error' : ''} ${isEdit ? 'gng-input-readonly' : ''}`}
            />
            {errors.sku && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" /> {errors.sku.message}
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="gng-field">
            <label className="gng-label">Stock Quantity</label>
            <input
              {...register('stock_qty', { valueAsNumber: true })}
              type="number" min="0"
              placeholder="0"
              className="gng-input"
            />
          </div>

          {/* Cost + MRP + Selling */}
          <div className="gng-form-row">
            <div className="gng-field">
              <label className="gng-label">Cost Price</label>
              <input
                {...register('cost_price', { setValueAs: (v) => v === '' ? null : Number(v) })}
                type="number" step="0.01" min="0"
                placeholder="0.00"
                className="gng-input"
              />
            </div>
            <div className="gng-field">
              <label className="gng-label">MRP</label>
              <input
                {...register('mrp', { setValueAs: (v) => v === '' ? null : Number(v) })}
                type="number" step="0.01" min="0"
                placeholder="0.00"
                className="gng-input"
              />
            </div>
            </div>
            <div className="gng-form-row">
            <div className="gng-field">
              <label className="gng-label">Selling Price</label>
              <input
                {...register('selling_price', { setValueAs: (v) => v === '' ? null : Number(v) })}
                type="number" step="0.01" min="0"
                placeholder="0.00"
                className="gng-input"
              />
            </div>
          </div>

          {/* Weight + Status */}
          <div className="gng-form-row">
            <div className="gng-field">
              <label className="gng-label">Weight (kg)</label>
              <input
                {...register('weight_kg', {
                  setValueAs: (v) => v === '' ? null : Number(v),
                })}
                type="number" step="0.1" min="0"
                placeholder="1.2"
                className="gng-input"
              />
            </div>
            <div className="gng-field">
              <label className="gng-label">Status</label>
              <select {...register('status')} className="gng-select">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Images */}
          <VariantImageUploader
            existingImages={existingImages}
            pendingImages={pendingImages}
            onDelete={handleDeleteImage}
            onPendingChange={setPendingImages}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── Right — Attribute values ── */}
        <div className={styles.rightCol}>
          <div className={styles.attrHeader}>
            <i className="fa-solid fa-tags" style={{ color: '#6C35DE', fontSize: 14 }} />
            <span className={styles.attrTitle}>Attribute Values</span>
            {isEdit && (
              <span className={styles.readOnlyBadge}>
                <i className="fa-solid fa-lock" style={{ fontSize: 9 }} /> Read-only
              </span>
            )}
          </div>

          {isEdit && (
            <p className={styles.readOnlyNote}>
              Attribute values are fixed after creation. To change them, delete this variant and generate a new one.
            </p>
          )}

          {loadingAttrValues ? (
            <div className={styles.attrLoading}>
              <i className="fa-solid fa-spinner fa-spin" /> Loading…
            </div>
          ) : groupedAttributes.length === 0 ? (
            <p className={styles.attrEmpty}>
              {isEdit
                ? 'No attribute values assigned to this variant.'
                : 'No attribute values configured for this category yet.'}
            </p>
          ) : (
            <div className={styles.attrGroups}>
              {groupedAttributes.map(({ attribute, values }) => {
                const displayValues = isEdit
                  ? values.filter((v: any) => selectedValueIds.includes(v.attribute_value_id))
                  : values;

                return (
                  <div key={attribute.attribute_id} className={styles.attrGroup}>
                    <p className={styles.attrGroupLabel}>
                      {attribute.attribute_name.toUpperCase()}
                    </p>
                    <div className={styles.pillRow}>
                      {displayValues.map((v: any) => {
                        const selected = selectedValueIds.includes(v.attribute_value_id);
                        return (
                          <button
                            key={v.attribute_value_id}
                            type="button"
                            disabled={isEdit}
                            onClick={() => toggleValue(v.attribute_value_id)}
                            className={`${styles.pill} ${
                              selected
                                ? isEdit ? styles.pillSelectedLocked : styles.pillSelected
                                : styles.pillUnselected
                            }`}
                          >
                            {v.color_hex && (
                              <span className={styles.colorDot} style={{ background: v.color_hex }} />
                            )}
                            {v.display_label}
                            {selected && !isEdit && <span className={styles.pillX}>×</span>}
                            {selected && isEdit && (
                              <i className="fa-solid fa-check" style={{ fontSize: 9 }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isEdit && (
            <button
              type="button"
              className={styles.addAttrBtn}
              onClick={() => window.open('/attributes', '_blank')}
            >
              <i className="fa-solid fa-circle-plus" />
              Add New Attribute
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};