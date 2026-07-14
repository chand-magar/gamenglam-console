import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAttributeValues } from '../../hooks/useAttributeValues';
import { useAttributes } from '../../hooks/useAttributes';
import { AttributeValuesPanel } from '../../components/AttributeValuesPanel';
import type { AttributeValue } from '../../../../domain/entities/AttributeValue';
import type { AttributeValueFormValues } from '../../schemas/attributeValue.schemas';

const TYPE_LABEL: Record<string, string> = {
  select:       'Visual Swatch',
  multi_select: 'Multi Select',
  boolean:      'Toggle',
  text:         'Text Input',
  number:       'Number Input',
  color:        'Visual Swatch',
};

const AttributeValuesPage = () => {
  const { attributeId } = useParams<{ attributeId: string }>();

  const { items: attributes, fetch: fetchAttributes } = useAttributes();
  const {
    items, isLoading, isSubmitting, error,
    fetch, create, update, remove, dismissError,
  } = useAttributeValues(attributeId!);

  const [deleteItem, setDeleteItem] = useState<AttributeValue | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || !attributeId) return;
    hasFetched.current = true;
    fetch();
    if (attributes.length === 0) fetchAttributes({ page: 1, limit: 100 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const attribute = attributes.find((a) => a.attribute_id === attributeId);

  const handleCreate = async (values: AttributeValueFormValues) => {
    await create({
      attribute_no:  attribute?.attribute_no ?? 0,
      value:         values.value,
      display_label: values.display_label,
      color_hex:     values.color_hex || null,
      sort_order:    values.sort_order,
    });
  };

  const handleUpdate = async (id: string, values: AttributeValueFormValues) => {
    await update(id, {
      value:         values.value,
      display_label: values.display_label,
      color_hex:     values.color_hex || null,
      sort_order:    values.sort_order,
    });
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.attribute_value_id);
    setDeleteItem(null);
  };

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <Link to="/dashboard" className="gng-crumb-link">Dashboard</Link>
        <i className="fa-solid fa-chevron-right" />
        <Link to="/attributes" className="gng-crumb-link">Attributes</Link>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Values</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">
            Attribute Values — {attribute?.attribute_name ?? '—'}
          </h1>
          <p className="gng-page-subtitle">
            Manage individual value variations for the '{attribute?.attribute_name}' global attribute.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="gng-btn-secondary">
            <i className="fa-solid fa-upload" /> Bulk Import
          </button>
          <button type="button" className="gng-btn-success">
            <i className="fa-solid fa-floppy-disk" /> Save Changes
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="gng-error-alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button type="button" className="gng-error-dismiss" onClick={dismissError}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* Panel */}
      <AttributeValuesPanel
        attributeId={attributeId!}
        internalName={attribute?.code ?? ''}
        inputType={attribute ? (TYPE_LABEL[attribute.type] ?? attribute.type) : ''}
        items={items}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={setDeleteItem}
      />

      {/* Delete confirm */}
      {deleteItem && (
        <div className="gng-confirm-overlay">
          <div className="gng-confirm-box">
            <div className="gng-confirm-icon">
              <i className="fa-solid fa-trash-can" />
            </div>
            <p className="gng-confirm-title">Delete Value</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">"{deleteItem.display_label}"</span>?
            </p>
            <div className="gng-confirm-actions">
              <button
                type="button"
                className="gng-confirm-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gng-btn-danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Deleting…</>
                  : <><i className="fa-solid fa-trash-can" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributeValuesPage;