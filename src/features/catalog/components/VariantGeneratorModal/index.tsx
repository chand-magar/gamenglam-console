import { useState, useMemo } from 'react';
import type { Attribute }      from '../../../../domain/entities/Attribute';
import type { AttributeValue } from '../../../../domain/entities/AttributeValue';
import type { PendingImage }   from '../VariantImageUploader';
import styles from './index.module.css';

export interface GeneratedVariant {
  sku:                string;
  cost_price:         number | null;
  mrp:                number | null;
  selling_price:      number | null;
  stock_qty:          number;
  weight_kg:          number | null;
  image_url:          string | null;
  attributeValueNos:  number[];
  attributeValueIds:  string[];
  attributeLabels:    string;
  pendingImages:      PendingImage[];
}

interface Props {
  open:            boolean;
  onClose:         () => void;
  onSubmit:        (variants: GeneratedVariant[]) => Promise<void>;
  isSubmitting:    boolean;
  productSku:      string;
  attributes:      Attribute[];
  attributeValues: AttributeValue[];
}

function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
    [[]],
  );
}

export const VariantGeneratorModal = ({
  open, onClose, onSubmit, isSubmitting,
  productSku, attributes, attributeValues,
}: Props) => {
  const [step,           setStep]           = useState<1 | 2>(1);
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});
  const [variants,       setVariants]       = useState<GeneratedVariant[]>([]);

  const primaryAttrId = useMemo(() => {
    const colorAttr = attributes.find((a) => a.type === 'color' && a.status === 'A');
    return colorAttr?.attribute_id ?? attributes[0]?.attribute_id;
  }, [attributes]);

  const groupedAttributes = useMemo(() =>
    attributes
      .filter((a) => a.status === 'A')
      .map((attr) => ({
        attr,
        values: attributeValues.filter((v: any) => v.attribute_id === attr.attribute_id),
      }))
      .filter((g) => g.values.length > 0),
    [attributes, attributeValues],
  );

  const toggleValue = (attrId: string, valueId: string) => {
    setSelectedValues((prev) => {
      const cur = prev[attrId] ?? [];
      return {
        ...prev,
        [attrId]: cur.includes(valueId)
          ? cur.filter((id) => id !== valueId)
          : [...cur, valueId],
      };
    });
  };

  const attrIdsWithValues = Object.keys(selectedValues)
    .filter((id) => (selectedValues[id]?.length ?? 0) > 0);

  const previewCount = attrIdsWithValues.length > 0
    ? attrIdsWithValues.reduce((acc, id) => acc * (selectedValues[id]?.length ?? 0), 1)
    : 0;

  const handleGenerate = () => {
    const valueGroups = attrIdsWithValues.map((attrId) => {
      const ids   = selectedValues[attrId] ?? [];
      const group = groupedAttributes.find((g) => g.attr.attribute_id === attrId);
      return ids.map((id) => {
        const val = group?.values.find((v: any) => v.attribute_value_id === id);
        return { id, label: val?.display_label ?? id, attrId };
      });
    });

    const combos = cartesian(valueGroups);
    const generated: GeneratedVariant[] = combos.map((combo) => {
      const suffix = combo.map((c) => c.label.replace(/\s+/g, '')).join('-').toUpperCase();
      return {
        sku:               `${productSku}-${suffix}`,
        cost_price:        null,
        mrp:               null,
        selling_price:     null,
        stock_qty:         0,
        weight_kg:         null,
        image_url:         null,
        attributeValueNos: [],
        attributeValueIds: combo.map((c) => c.id),
        attributeLabels:   combo.map((c) => c.label).join(' / '),
        pendingImages:     [],
      };
    });

    setVariants(generated);
    setStep(2);
  };

  const updateVariant = (idx: number, key: keyof GeneratedVariant, value: unknown) =>
    setVariants((prev) => prev.map((v, i) => i === idx ? { ...v, [key]: value } : v));

  const removeVariant = (idx: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  const applyImagesToSamePrimary = (idx: number) => {
    const source = variants[idx];
    if (!source.pendingImages.length || !primaryAttrId) return;
    const primaryAttrIndex = attrIdsWithValues.indexOf(primaryAttrId);
    if (primaryAttrIndex === -1) return;
    const primaryValueId = source.attributeValueIds[primaryAttrIndex];
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i === idx) return v;
        if (v.attributeValueIds[primaryAttrIndex] === primaryValueId) {
          return { ...v, pendingImages: [...source.pendingImages] };
        }
        return v;
      }),
    );
  };

  const applyFieldToAll = (idx: number, key: keyof GeneratedVariant) => {
    const value = variants[idx][key];
    setVariants((prev) => prev.map((v, i) => i === idx ? v : { ...v, [key]: value }));
  };

  const countSamePrimary = (idx: number): number => {
    if (!primaryAttrId) return 0;
    const primaryAttrIndex = attrIdsWithValues.indexOf(primaryAttrId);
    if (primaryAttrIndex === -1) return 0;
    const primaryValueId = variants[idx].attributeValueIds[primaryAttrIndex];
    return variants.filter((v, i) => i !== idx && v.attributeValueIds[primaryAttrIndex] === primaryValueId).length;
  };

  const handleSubmit = async () => {
    await onSubmit(variants);
    setStep(1); setSelectedValues({}); setVariants([]);
  };

  const handleClose = () => {
    setStep(1); setSelectedValues({}); setVariants([]); onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Generate Variants</h2>
            <p className={styles.subtitle}>
              {step === 1
                ? 'Select attribute values to generate combinations'
                : `Review and configure ${variants.length} variant${variants.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button type="button" onClick={handleClose} className={styles.closeBtn}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Step bar */}
        <div className={styles.stepBar}>
          {[{ n: 1, label: 'Select Values' }, { n: 2, label: 'Configure Variants' }].map(({ n, label }, i) => (
            <div key={n} className={`${styles.stepItem} ${step >= n ? styles.stepActive : ''}`}>
              <div className={styles.stepDot}>{n}</div>
              <span className={styles.stepLabel}>{label}</span>
              {i < 1 && <div className={`${styles.stepLine} ${step > n ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Step 1 */}
          {step === 1 && (
            <div className={styles.stepContent}>
              {groupedAttributes.length === 0 ? (
                <div className={styles.empty}>No attributes configured for this category.</div>
              ) : (
                <>
                  <p className={styles.helpText}>Select one or more values per attribute. All combinations will be auto-generated.</p>
                  {groupedAttributes.map(({ attr, values }) => (
                    <div key={attr.attribute_id} className={styles.attrGroup}>
                      <div className={styles.attrGroupHeader}>
                        <span className={styles.attrGroupLabel}>{attr.attribute_name.toUpperCase()}</span>
                        <span className={styles.attrGroupCount}>{(selectedValues[attr.attribute_id]?.length ?? 0)} selected</span>
                      </div>
                      <div className={styles.pillRow}>
                        {values.map((v: any) => {
                          const sel = (selectedValues[attr.attribute_id] ?? []).includes(v.attribute_value_id);
                          return (
                            <button
                              key={v.attribute_value_id}
                              type="button"
                              onClick={() => toggleValue(attr.attribute_id, v.attribute_value_id)}
                              className={`${styles.pill} ${sel ? styles.pillSelected : styles.pillUnselected}`}
                            >
                              {v.color_hex && <span className={styles.colorDot} style={{ background: v.color_hex }} />}
                              {v.display_label}
                              {sel && <i className="fa-solid fa-check" style={{ fontSize: 9 }} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {previewCount > 0 && (
                    <div className={styles.previewBanner}>
                      <i className="fa-solid fa-layer-group" />
                      <span>Will generate <strong>{previewCount}</strong> variant combination{previewCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <p className={styles.helpText}>
                Upload images once per color — use <strong>"Apply to same"</strong> to copy to all matching variants.
              </p>

              {/* Header row */}
              <div className={styles.variantHeader}>
                <span className={styles.variantHeaderNo}>#</span>
                <span>Combination</span>
                <span>SKU</span>
                <span className={styles.variantHeaderField}>Cost ($)</span>
                <span className={styles.variantHeaderField}>MRP ($)</span>
                <span className={styles.variantHeaderField}>Selling ($)</span>
                <span className={styles.variantHeaderField}>Stock</span>
                <span className={styles.variantHeaderField}>Weight</span>
                <span style={{ textAlign:'center' }}>Images</span>
                <span />
              </div>

              <div className={styles.variantList}>
                {variants.map((v, i) => {
                  const sameCount = countSamePrimary(i);
                  return (
                    <div key={i} className={styles.variantRow}>

                      {/* # */}
                      <span className={styles.variantNo}>{String(i + 1).padStart(2, '0')}</span>

                      {/* Combination */}
                      <div className={styles.variantCombination}>
                        {v.attributeLabels.split(' / ').map((label, j) => (
                          <span key={j} className={styles.attrPill}>{label}</span>
                        ))}
                      </div>

                      {/* SKU */}
                      <input type="text" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} placeholder="SKU" />

                      {/* Stock */}
                      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <input type="number" min="0" value={v.stock_qty}
                          onChange={(e) => updateVariant(i, 'stock_qty', parseInt(e.target.value) || 0)} />
                        {v.stock_qty > 0 && variants.length > 1 && (
                          <button type="button" onClick={() => applyFieldToAll(i, 'stock_qty')}
                            style={{ fontSize:9, padding:'1px 4px', borderRadius:3, border:'1px solid #6C35DE', color:'#6C35DE', background:'#F5F0FF', cursor:'pointer', whiteSpace:'nowrap' }}>
                            <i className="fa-solid fa-copy" style={{ marginRight:2 }} />All
                          </button>
                        )}
                      </div>

                      {/* Cost */}
                      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <input
                          type="number" step="0.01" min="0"
                          value={v.cost_price ?? ''}
                          onChange={(e) => updateVariant(i, 'cost_price', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Cost"
                        />
                        {v.cost_price && variants.length > 1 && (
                          <button type="button" onClick={() => applyFieldToAll(i, 'cost_price')}
                            style={{ fontSize:9, padding:'1px 4px', borderRadius:3, border:'1px solid #6C35DE', color:'#6C35DE', background:'#F5F0FF', cursor:'pointer', whiteSpace:'nowrap' }}>
                            <i className="fa-solid fa-copy" style={{ marginRight:2 }} />All
                          </button>
                        )}
                      </div>

                      {/* MRP */}
                      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <input
                          type="number" step="0.01" min="0"
                          value={v.mrp ?? ''}
                          onChange={(e) => updateVariant(i, 'mrp', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="MRP"
                        />
                        {v.mrp && variants.length > 1 && (
                          <button type="button" onClick={() => applyFieldToAll(i, 'mrp')}
                            style={{ fontSize:9, padding:'1px 4px', borderRadius:3, border:'1px solid #6C35DE', color:'#6C35DE', background:'#F5F0FF', cursor:'pointer', whiteSpace:'nowrap' }}>
                            <i className="fa-solid fa-copy" style={{ marginRight:2 }} />All
                          </button>
                        )}
                      </div>

                      {/* Selling */}
                      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <input
                          type="number" step="0.01" min="0"
                          value={v.selling_price ?? ''}
                          onChange={(e) => updateVariant(i, 'selling_price', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Selling"
                        />
                        {v.selling_price && variants.length > 1 && (
                          <button type="button" onClick={() => applyFieldToAll(i, 'selling_price')}
                            style={{ fontSize:9, padding:'1px 4px', borderRadius:3, border:'1px solid #6C35DE', color:'#6C35DE', background:'#F5F0FF', cursor:'pointer', whiteSpace:'nowrap' }}>
                            <i className="fa-solid fa-copy" style={{ marginRight:2 }} />All
                          </button>
                        )}
                      </div>

                      {/* Weight */}
                      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <input type="number" step="0.1" min="0" value={v.weight_kg ?? ''} placeholder="—"
                          onChange={(e) => updateVariant(i, 'weight_kg', e.target.value ? parseFloat(e.target.value) : null)} />
                        {v.weight_kg && variants.length > 1 && (
                          <button type="button" onClick={() => applyFieldToAll(i, 'weight_kg')}
                            style={{ fontSize:9, padding:'1px 4px', borderRadius:3, border:'1px solid #6C35DE', color:'#6C35DE', background:'#F5F0FF', cursor:'pointer', whiteSpace:'nowrap' }}>
                            <i className="fa-solid fa-copy" style={{ marginRight:2 }} />All
                          </button>
                        )}
                      </div>

                      {/* Images */}
                      <div className={styles.variantImgCell}>
                        {v.pendingImages.length > 0 ? (
                          <>
                            <div className={styles.variantImgPreview}>
                              <img src={v.pendingImages[0].preview} alt="preview" className={styles.variantImgThumb} />
                              {v.pendingImages.length > 1 && (
                                <span className={styles.variantImgCount}>+{v.pendingImages.length - 1}</span>
                              )}
                              <button type="button" className={styles.variantImgClear} onClick={() => updateVariant(i, 'pendingImages', [])}>
                                <i className="fa-solid fa-xmark" />
                              </button>
                            </div>
                            {sameCount > 0 && (
                              <button
                                type="button"
                                onClick={() => applyImagesToSamePrimary(i)}
                                style={{ fontSize:9, padding:'1px 5px', borderRadius:4, border:'1px solid #6C35DE', color:'#6C35DE', background:'#F5F0FF', cursor:'pointer', whiteSpace:'nowrap', lineHeight:1.4 }}
                              >
                                <i className="fa-solid fa-copy" style={{ marginRight:2 }} />
                                +{sameCount} same
                              </button>
                            )}
                          </>
                        ) : (
                          <label className={styles.variantImgUpload}>
                            <i className="fa-solid fa-upload" style={{ fontSize: 10 }} />
                            <span>Upload</span>
                            <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                if (!files.length) return;
                                const pending: PendingImage[] = files.map((file) => ({
                                  id: `local-${Date.now()}-${Math.random()}`,
                                  preview: URL.createObjectURL(file),
                                  file, isUrl: false,
                                }));
                                updateVariant(i, 'pendingImages', pending);
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Delete */}
                      <button type="button" onClick={() => removeVariant(i)} className={styles.removeBtn}>
                        <i className="fa-regular fa-trash-can" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {variants.length === 0 && <div className={styles.empty}>All variants removed.</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {step === 2 && (
            <button type="button" onClick={() => setStep(1)} className="gng-btn-secondary">
              <i className="fa-solid fa-arrow-left" /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={handleClose} className="gng-btn-secondary">Cancel</button>
          {step === 1 && (
            <button type="button" onClick={handleGenerate} disabled={attrIdsWithValues.length === 0} className="gng-btn-primary">
              Generate <i className="fa-solid fa-wand-magic-sparkles" />
            </button>
          )}
          {step === 2 && (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting || variants.length === 0} className="gng-btn-primary">
              {isSubmitting
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : <><i className="fa-solid fa-check" /> Save {variants.length} Variant{variants.length !== 1 ? 's' : ''}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};