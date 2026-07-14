import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import { roleSchema, type RoleFormValues } from '../../schemas/role.schemas';
import type { Role, RoleSectionPermission } from '../../../../domain/entities/Role';
import type { Section } from '../../../../domain/entities/Section';
import type { Page } from '../../../../domain/entities/Page';
import styles from './index.module.css';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: RoleFormValues) => Promise<void>;
  sections:     Section[];
  pages:        Page[];
  editItem?:    Role | null;
  isSubmitting: boolean;
}

const ALL_METHODS = ['GET', 'POST', 'PUT', 'UPDATE', 'DELETE'];

// Build full permissions from all sections+pages,
// pre-filling methods from existing role_details if editing
const buildPermissions = (
  sections: Section[],
  pages:    Page[],
  existing: RoleSectionPermission[] = [],
): RoleSectionPermission[] => {
  return sections
    .filter((s) => s.status === 'A')
    .sort((a, b) => a.section_order - b.section_order)
    .map((s) => {
      const existingSection = existing.find((e) => e.section_id === s.section_id);
      return {
        section_id:    s.section_id,
        section_name:  s.section_name,
        section_path:  s.section_path,
        section_icon:  s.section_icon,
        section_order: s.section_order,
        pages: pages
          .filter((p) => p.section_no === s.section_no && p.status === 'A')
          .sort((a, b) => a.page_order - b.page_order)
          .map((p) => {
            const existingPage = existingSection?.pages?.find(
              (ep) => ep.page_id === p.page_id,
            );
            return {
              page_id:    p.page_id,
              page_name:  p.page_name,
              page_path:  p.page_path,
              page_order: p.page_order,
              methods:    existingPage?.methods ?? [],
            };
          }),
      };
    });
};

export const RoleFormModal = ({
  open, onClose, onSubmit, sections, pages, editItem, isSubmitting,
}: Props) => {
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { role_name: '', role_details: [] },
  });

  const [permissions, setPermissions] = useState<RoleSectionPermission[]>([]);

  useEffect(() => {
    if (!open) return;

    if (editItem) {
      reset({ role_name: editItem.role_name, role_details: editItem.role_details ?? [] });
      // Show ALL sections/pages but pre-fill methods from saved role_details
      setPermissions(buildPermissions(sections, pages, editItem.role_details ?? []));
    } else {
      reset({ role_name: '', role_details: [] });
      // Show ALL sections/pages with no methods selected
      setPermissions(buildPermissions(sections, pages, []));
    }
  }, [editItem, open, sections, pages, reset]);

  // ── Helpers ──────────────────────────────────────────────────────────

  const isSectionChecked = (sectionId: string) => {
    const sec = permissions.find((s) => s.section_id === sectionId);
    if (!sec || sec.pages.length === 0) return false;
    return sec.pages.every((p) => p.methods.length === ALL_METHODS.length);
  };

  const isSectionIndeterminate = (sectionId: string) => {
    const sec = permissions.find((s) => s.section_id === sectionId);
    if (!sec) return false;
    const totalMethods = sec.pages.reduce((acc, p) => acc + p.methods.length, 0);
    const maxMethods   = sec.pages.length * ALL_METHODS.length;
    return totalMethods > 0 && totalMethods < maxMethods;
  };

  const isPageChecked = (sectionId: string, pageId: string) => {
    const sec  = permissions.find((s) => s.section_id === sectionId);
    const page = sec?.pages.find((p) => p.page_id === pageId);
    return page ? page.methods.length === ALL_METHODS.length : false;
  };

  const isMethodChecked = (sectionId: string, pageId: string, method: string) => {
    const sec  = permissions.find((s) => s.section_id === sectionId);
    const page = sec?.pages.find((p) => p.page_id === pageId);
    return page ? page.methods.includes(method) : false;
  };

  // ── Toggle handlers ───────────────────────────────────────────────────

  const toggleSection = (sectionId: string) => {
    const allChecked = isSectionChecked(sectionId);
    setPermissions((prev) =>
      prev.map((s) =>
        s.section_id !== sectionId ? s : {
          ...s,
          pages: s.pages.map((p) => ({
            ...p,
            methods: allChecked ? [] : [...ALL_METHODS],
          })),
        },
      ),
    );
  };

  const togglePage = (sectionId: string, pageId: string) => {
    const checked = isPageChecked(sectionId, pageId);
    setPermissions((prev) =>
      prev.map((s) =>
        s.section_id !== sectionId ? s : {
          ...s,
          pages: s.pages.map((p) =>
            p.page_id !== pageId ? p : {
              ...p,
              methods: checked ? [] : [...ALL_METHODS],
            },
          ),
        },
      ),
    );
  };

  const toggleMethod = (sectionId: string, pageId: string, method: string) => {
    setPermissions((prev) =>
      prev.map((s) =>
        s.section_id !== sectionId ? s : {
          ...s,
          pages: s.pages.map((p) =>
            p.page_id !== pageId ? p : {
              ...p,
              methods: p.methods.includes(method)
                ? p.methods.filter((m) => m !== method)
                : [...p.methods, method],
            },
          ),
        },
      ),
    );
  };

  const handleFormSubmit = async (values: RoleFormValues) => {
    // Only send sections/pages that have at least one method selected
    const filtered: RoleSectionPermission[] = permissions
      .map((s) => ({
        ...s,
        pages: s.pages.filter((p) => p.methods.length > 0),
      }))
      .filter((s) => s.pages.length > 0);

    await onSubmit({ ...values, role_details: filtered });
    reset();
    setPermissions([]);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Role' : 'Add Role'}
      subtitle="Configure role name and page permissions."
      icon="fa-solid fa-id-badge"
      variant="default"
      size="lg"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Add Role',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm:    handleSubmit(handleFormSubmit),
      }}
    >
      <div className={styles.formBody}>

        {/* Role Name */}
        <div className="gng-field">
          <label className="gng-label" htmlFor="role_name">
            Role Name <span className="gng-required">*</span>
          </label>
          <input
            {...register('role_name')}
            id="role_name"
            type="text"
            placeholder="e.g. Super Admin"
            className={`gng-input ${errors.role_name ? 'gng-input-error' : ''}`}
          />
          {errors.role_name && (
            <p className="gng-error-text">
              <i className="fa-solid fa-circle-exclamation" />
              {errors.role_name.message}
            </p>
          )}
        </div>

        {/* Permissions */}
        <div className="gng-field">
          <label className="gng-label">Permissions</label>
          <div className={styles.permissionsWrapper}>

            {permissions.length === 0 && (
              <p className={styles.emptyMsg}>
                <i className="fa-solid fa-circle-info" />
                No sections available. Add sections and pages first.
              </p>
            )}

            {permissions.map((section) => (
              <div key={section.section_id} className={styles.sectionBlock}>

                {/* Section header */}
                <div className={styles.sectionHeader}>
                  <label className={styles.sectionCheckLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSectionChecked(section.section_id)}
                      ref={(el) => {
                        if (el) el.indeterminate = isSectionIndeterminate(section.section_id);
                      }}
                      onChange={() => toggleSection(section.section_id)}
                    />
                    <i className={`${section.section_icon} ${styles.sectionIcon}`} />
                    <span className={styles.sectionName}>{section.section_name}</span>
                    <span className={styles.sectionPath}>{section.section_path}</span>
                  </label>
                  <span className={styles.sectionMeta}>
                    {section.pages.filter((p) => p.methods.length > 0).length}/{section.pages.length} pages
                  </span>
                </div>

                {/* Pages */}
                {section.pages.length === 0 ? (
                  <p className={styles.noPages}>No pages in this section.</p>
                ) : (
                  <div className={styles.pagesGrid}>
                    {section.pages.map((page) => (
                      <div key={page.page_id} className={styles.pageRow}>

                        {/* Page checkbox + name */}
                        <label className={styles.pageCheckLabel}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={isPageChecked(section.section_id, page.page_id)}
                            onChange={() => togglePage(section.section_id, page.page_id)}
                          />
                          <span className={styles.pageName}>{page.page_name}</span>
                          <span className="gng-code-tag" style={{ fontSize: 11 }}>
                            {page.page_path}
                          </span>
                        </label>

                        {/* Method checkboxes */}
                        <div className={styles.methodsRow}>
                          {ALL_METHODS.map((method) => (
                            <label
                              key={method}
                              className={`${styles.methodLabel} ${
                                isMethodChecked(section.section_id, page.page_id, method)
                                  ? styles.methodChecked
                                  : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                style={{ display: 'none' }}
                                checked={isMethodChecked(section.section_id, page.page_id, method)}
                                onChange={() => toggleMethod(section.section_id, page.page_id, method)}
                              />
                              {method}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </Modal>
  );
};