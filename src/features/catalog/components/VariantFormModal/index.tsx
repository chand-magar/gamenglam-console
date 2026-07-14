import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import { variantSchema, type VariantFormValues } from '../../schemas/product.schemas';
import type { ProductVariant } from '../../../../domain/entities/Product';
import type { Attribute } from '../../../../domain/entities/Attribute';
import type { AttributeValue } from '../../../../domain/entities/AttributeValue';
import type { VariantAttributeValue } from '../../../../domain/entities/VariantAttributeValue';
import { VariantAttributeValueRepository } from '../../../../infrastructure/repositories/VariantAttributeValueRepository';
import styles from './index.module.css';

interface Props {
  open:            boolean;
  onClose:         () => void;
  onSubmit:        (values: VariantFormValues, selectedValueNos: number[]) => Promise<void>;
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
      sku: '', price_override: null, stock_qty: 0,
      weight_kg: null, image_url: null, status: 'draft',
    },
  });

  const [selectedValueNos,  setSelectedValueNos]  = useState<number[]>([]);
  const [loadingAttrValues, setLoadingAttrValues]  = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      reset({
        sku:            editItem.sku,
        price_override: editItem.price_override,
        stock_qty:      editItem.stock_qty,
        weight_kg:      editItem.weight_kg,
        image_url:      editItem.image_url,
        status:         editItem.status as 'draft' | 'active' | 'archived',
      });
      setLoadingAttrValues(true);
      vavRepo
        .getByVariantId(editItem.variant_id)
        .then((data: VariantAttributeValue[]) => {
          setSelectedValueNos(data.map((d) => d.attribute_value_no));
        })
        .catch(console.error)
        .finally(() => setLoadingAttrValues(false));
    } else {
      reset({
        sku: '', price_override: null, stock_qty: 0,
        weight_kg: null, image_url: null, status: 'draft',
      });
      setSelectedValueNos([]);
    }
  }, [editItem, reset, open]);

  const toggleValue = (valueNo: number) => {
    setSelectedValueNos((prev) =>
      prev.includes(valueNo)
        ? prev.filter((n) => n !== valueNo)
        : [...prev, valueNo],
    );
  };

  const handleFormSubmit = async (values: VariantFormValues) => {
    await onSubmit(values, selectedValueNos);
    reset();
    setSelectedValueNos([]);
  };

  const groupedAttributes = attributes
    .map((attr) => ({
      attribute: attr,
      values: attributeValues.filter((v) => v.attribute_no === attr.attribute_no),
    }))
    .filter((g) => g.values.length > 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Variant' : 'Add Variant'}
      subtitle={`Update details for SKU: ${editItem?.sku ?? productSku}`}
      icon="fa-solid fa-cubes"
      variant="default"
      size="lg"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Add Variant',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.twoCol}>

        {/* ── Left ── */}
        <div className={styles.leftCol}>

          <div className="gng-field">
            <label className="gng-label">SKU Code</label>
            <input
              {...register('sku')}
              type="text"
              placeholder="e.g. UV4K-BLK-55"
              readOnly={!!editItem}
              className={`gng-input ${errors.sku ? 'gng-input-error' : ''} ${editItem ? 'gng-input-readonly' : ''}`}
            />
            {errors.sku && (
              <p className="gng-error-text">
                <i className="fa-solid fa-circle-exclamation" /> {errors.sku.message}
              </p>
            )}
          </div>

          <div className="gng-form-row">
            <div className="gng-field">
              <label className="gng-label">Price Override ($)</label>
              <input
                {...register('price_override', {
                  setValueAs: (v) => v === '' ? null : Number(v),
                })}
                type="number" step="0.01" min="0"
                placeholder="129.00"
                className="gng-input"
              />
            </div>
            <div className="gng-field">
              <label className="gng-label">Stock Quantity</label>
              <input
                {...register('stock_qty', { valueAsNumber: true })}
                type="number" min="0"
                placeholder="0"
                className="gng-input"
              />
            </div>
          </div>

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

          <div className="gng-field">
            <label className="gng-label">Variant Image URL</label>
            <div className="gng-url-wrapper">
              <input
                {...register('image_url', {
                  setValueAs: (v) => v === '' ? null : v,
                })}
                type="text"
                placeholder="https://images.unsplash.com/variant-092"
                className="gng-input"
              />
              <button type="button" className="gng-url-btn" title="Upload">
                <i className="fa-solid fa-cloud-arrow-up" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right — Attribute values ── */}
        <div className={styles.rightCol}>
          <div className={styles.attrHeader}>
            <i className="fa-solid fa-tags" style={{ color: '#6C35DE', fontSize: 14 }} />
            <span className={styles.attrTitle}>Attribute Values</span>
          </div>

          {loadingAttrValues ? (
            <div className={styles.attrLoading}>
              <i className="fa-solid fa-spinner fa-spin" /> Loading…
            </div>
          ) : groupedAttributes.length === 0 ? (
            <p className={styles.attrEmpty}>
              No attribute values configured for this category yet.
            </p>
          ) : (
            <div className={styles.attrGroups}>
              {groupedAttributes.map(({ attribute, values }) => (
                <div key={attribute.attribute_id} className={styles.attrGroup}>
                  <p className={styles.attrGroupLabel}>
                    {attribute.attribute_name.toUpperCase()}
                  </p>
                  <div className={styles.pillRow}>
                    {values.map((v) => {
                      const selected = selectedValueNos.includes(v.attribute_value_no);
                      return (
                        <button
                          key={v.attribute_value_id}
                          type="button"
                          className={`${styles.pill} ${selected ? styles.pillSelected : styles.pillUnselected}`}
                          onClick={() => toggleValue(v.attribute_value_no)}
                        >
                          {v.color_hex && (
                            <span
                              className={styles.colorDot}
                              style={{ background: v.color_hex }}
                            />
                          )}
                          {v.display_label}
                          {selected && <span className={styles.pillX}>×</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className={styles.addAttrBtn}
            onClick={() => window.open('/attributes', '_blank')}
          >
            <i className="fa-solid fa-circle-plus" />
            Add New Attribute
          </button>
        </div>
      </div>
    </Modal>
  );
};