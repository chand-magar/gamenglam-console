import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  attributeValueSchema,
  type AttributeValueFormValues,
} from '../../schemas/attributeValue.schemas';
import type { AttributeValue } from '../../../../domain/entities/AttributeValue';
import styles from './index.module.css';

interface Props {
  attributeId:  string;
  internalName: string;
  inputType:    string;
  items:        AttributeValue[];
  isLoading:    boolean;
  isSubmitting: boolean;
  onCreate:     (values: AttributeValueFormValues) => Promise<void>;
  onUpdate:     (id: string, values: AttributeValueFormValues) => Promise<void>;
  onDelete:     (item: AttributeValue) => void;
}

const swatchColor = (v: AttributeValue) => v.color_hex || '#D1D5DB';

export const AttributeValuesPanel = ({
  internalName, inputType,
  items, isLoading, isSubmitting,
  onCreate, onUpdate, onDelete,
}: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<AttributeValueFormValues>({
    resolver: zodResolver(attributeValueSchema),
    defaultValues: {
      value: '', display_label: '', color_hex: '', sort_order: items.length + 1,
    },
  });

  const editForm = useForm<AttributeValueFormValues>({
    resolver: zodResolver(attributeValueSchema),
  });

  useEffect(() => {
    reset({ value: '', display_label: '', color_hex: '', sort_order: items.length + 1 });
  }, [items.length, reset]);

  const handleAddRow = async (values: AttributeValueFormValues) => {
    await onCreate({ ...values, color_hex: values.color_hex || null });
    reset({ value: '', display_label: '', color_hex: '', sort_order: items.length + 2 });
  };

  const startEdit = (item: AttributeValue) => {
    setEditingId(item.attribute_value_id);
    editForm.reset({
      value:         item.value,
      display_label: item.display_label,
      color_hex:     item.color_hex ?? '',
      sort_order:    item.sort_order,
    });
  };

  const handleSaveEdit = async (values: AttributeValueFormValues) => {
    if (!editingId) return;
    await onUpdate(editingId, { ...values, color_hex: values.color_hex || null });
    setEditingId(null);
  };

  return (
    <div className={styles.wrapper}>

      {/* ── Top cards ── */}
      <div className={styles.topGrid}>

        {/* Attribute overview */}
        <div className={styles.card}>
          <div className={styles.overviewHeader}>
            <p className={styles.cardTitle}>Attribute Overview</p>
            <span className="gng-badge gng-badge-green" style={{ fontSize: 10.5 }}>GLOBAL</span>
          </div>
          <div className={styles.overviewRow}>
            <span className={styles.overviewLabel}>Internal Name</span>
            <span className="gng-code-tag">{internalName}</span>
          </div>
          <div className={styles.overviewRow}>
            <span className={styles.overviewLabel}>Input Type</span>
            <span className={styles.overviewValue}>{inputType}</span>
          </div>
          <div className={styles.overviewRow}>
            <span className={styles.overviewLabel}>Active Values</span>
            <span className={styles.overviewCount}>
              {String(items.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Visual palette preview */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Visual Palette Preview</p>
          <div className={styles.paletteRow}>
            {items.slice(0, 5).map((v) => (
              <span
                key={v.attribute_value_id}
                className={styles.swatch}
                style={{ background: swatchColor(v) }}
                title={v.display_label}
              />
            ))}
            <span className={styles.swatchMore}>
              <i className="fa-solid fa-plus" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Values table ── */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 48 }}>No</th>
              <th>Value (ID)</th>
              <th>Display Label</th>
              <th>Color Preview</th>
              <th style={{ width: 90 }}>Sort Order</th>
              <th style={{ width: 110 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className={styles.loadingCell}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />
                  Loading…
                </td>
              </tr>
            )}

            {!isLoading && items.map((item, index) => {
              const isEditing = editingId === item.attribute_value_id;

              if (isEditing) {
                return (
                  <tr key={item.attribute_value_id} className={styles.editingRow}>
                    <td className="gng-row-no">{String(index + 1).padStart(2, '0')}</td>
                    <td>
                      <input className={styles.inlineInput} {...editForm.register('value')} />
                    </td>
                    <td>
                      <input className={styles.inlineInput} {...editForm.register('display_label')} />
                    </td>
                    <td>
                      <div className={styles.colorCell}>
                        <input
                          type="color"
                          className={styles.colorPicker}
                          value={editForm.watch('color_hex') || '#000000'}
                          onChange={(e) => editForm.setValue('color_hex', e.target.value)}
                        />
                        <input
                          className={styles.inlineInputSmall}
                          {...editForm.register('color_hex')}
                          placeholder="#000000"
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className={styles.inlineInputSmall}
                        {...editForm.register('sort_order', { valueAsNumber: true })}
                      />
                    </td>
                    <td>
                      <div className="gng-actions">
                        <button
                          type="button"
                          className={`gng-action-btn ${styles.saveBtn}`}
                          onClick={editForm.handleSubmit(handleSaveEdit)}
                          title="Save"
                        >
                          <i className="fa-solid fa-check" />
                        </button>
                        <button
                          type="button"
                          className={`gng-action-btn ${styles.cancelEditBtn}`}
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.attribute_value_id}>
                  <td className="gng-row-no">{String(index + 1).padStart(2, '0')}</td>
                  <td className={styles.valueId}>{item.value}</td>
                  <td>{item.display_label}</td>
                  <td>
                    <div className={styles.colorPreview}>
                      <span
                        className={styles.colorDot}
                        style={{ background: swatchColor(item) }}
                      />
                      {item.color_hex && (
                        <span className={styles.colorHex}>{item.color_hex}</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.sortOrder}>{item.sort_order}</td>
                  <td>
                    <div className="gng-actions">
                      <button
                        type="button"
                        className="gng-action-btn gng-action-edit"
                        onClick={() => startEdit(item)}
                        title="Edit"
                      >
                        <i className="fa-regular fa-pen-to-square" />
                      </button>
                      <button
                        type="button"
                        className="gng-action-btn gng-action-delete"
                        onClick={() => onDelete(item)}
                        title="Delete"
                      >
                        <i className="fa-regular fa-trash-can" />
                      </button>
                      <button
                        type="button"
                        className={`gng-action-btn ${styles.dragBtn}`}
                        title="Drag to reorder"
                      >
                        <i className="fa-solid fa-grip-vertical" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* ── Add new row ── */}
            <tr className={styles.addRow}>
              <td>
                <span className={styles.addIcon}>
                  <i className="fa-solid fa-plus" />
                </span>
              </td>
              <td>
                <input
                  className={styles.inlineInput}
                  placeholder="e.g. ruby_red"
                  {...register('value')}
                />
                {errors.value && (
                  <p className="gng-error-text">{errors.value.message}</p>
                )}
              </td>
              <td>
                <input
                  className={styles.inlineInput}
                  placeholder="e.g. Ruby Red"
                  {...register('display_label')}
                />
                {errors.display_label && (
                  <p className="gng-error-text">{errors.display_label.message}</p>
                )}
              </td>
              <td>
                <div className={styles.colorCell}>
                  <input
                    type="color"
                    className={styles.colorPicker}
                    {...register('color_hex')}
                  />
                </div>
              </td>
              <td>
                <input
                  type="number"
                  className={styles.inlineInputSmall}
                  {...register('sort_order', { valueAsNumber: true })}
                />
              </td>
              <td>
                <button
                  type="button"
                  className={styles.addValueBtn}
                  onClick={handleSubmit(handleAddRow)}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <i className="fa-solid fa-spinner fa-spin" />
                    : <>Add Value</>}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div className={styles.tableFooter}>
          <span>
            Showing 1–{items.length} of {items.length}{' '}
            {internalName.replace('attr_', '')} values
          </span>
        </div>
      </div>
    </div>
  );
};