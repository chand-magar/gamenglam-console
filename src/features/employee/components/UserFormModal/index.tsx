import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../shared/components/Modal';
import {
  createUserSchema, updateUserSchema,
  type CreateUserFormValues, type UpdateUserFormValues,
} from '../../schemas/user.schemas';
import type { User } from '../../../../domain/entities/User';
import type { Role } from '../../../../domain/entities/Role';
import styles from './index.module.css';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (values: CreateUserFormValues | UpdateUserFormValues) => Promise<void>;
  roles:        Role[];
  editItem?:    User | null;
  isSubmitting: boolean;
}

const GENDER_OPTIONS = [
  { value: '',       label: 'Prefer not to say' },
  { value: 'male',   label: 'Male'              },
  { value: 'female', label: 'Female'            },
  { value: 'other',  label: 'Other'             },
];

export const UserFormModal = ({
  open, onClose, onSubmit, roles, editItem, isSubmitting,
}: Props) => {

  const {
    register: registerCreate,
    handleSubmit: handleCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      user_fullname: '',
      email_id:      '',
      mobile_no:     null,
      gender:        '',
      role_no:       0,
      password:      '',
    },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      user_fullname: '',
      email_id:      '',
      gender:        '',
      mobile_no:     null,
      address:       null,
    },
  });

  useEffect(() => {
    if (editItem) {
      resetUpdate({
        user_fullname: editItem.user_fullname,
        email_id:      editItem.email_id,
        gender:        (editItem.gender as any) ?? '',
        mobile_no:     editItem.mobile_no ?? null,
        address:       editItem.address   ?? null,
      });
    } else {
      resetCreate({
        user_fullname: '',
        email_id:      '',
        mobile_no:     null,
        gender:        '',
        role_no:       0,
        password:      '',
      });
    }
  }, [editItem, open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit User' : 'Add User'}
      subtitle={editItem ? 'Update user details.' : 'Create a new admin user.'}
      icon="fa-solid fa-user"
      variant="default"
      size="md"
      footer={{
        cancelLabel:  'Cancel',
        confirmLabel: editItem ? 'Save Changes' : 'Add User',
        confirmIcon:  'fa-solid fa-check',
        isSubmitting,
        onConfirm: editItem
          ? handleUpdate((v) => onSubmit(v))
          : handleCreate((v) => onSubmit(v)),
      }}
    >
      <div className={styles.formBody}>

        {editItem ? (
          /* ── Edit form ── */
          <>
            <div className="gng-field">
              <label className="gng-label" htmlFor="u_fullname">Full Name</label>
              <input
                {...registerUpdate('user_fullname')}
                id="u_fullname"
                type="text"
                placeholder="e.g. John Doe"
                className={`gng-input ${updateErrors.user_fullname ? 'gng-input-error' : ''}`}
              />
              {updateErrors.user_fullname && (
                <p className="gng-error-text">
                  <i className="fa-solid fa-circle-exclamation" />
                  {updateErrors.user_fullname.message}
                </p>
              )}
            </div>

            <div className="gng-form-row">
              <div className="gng-field">
                <label className="gng-label" htmlFor="u_email">Email</label>
                <input
                  {...registerUpdate('email_id')}
                  id="u_email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  className={`gng-input ${updateErrors.email_id ? 'gng-input-error' : ''}`}
                />
                {updateErrors.email_id && (
                  <p className="gng-error-text">
                    <i className="fa-solid fa-circle-exclamation" />
                    {updateErrors.email_id.message}
                  </p>
                )}
              </div>

              <div className="gng-field">
                <label className="gng-label" htmlFor="u_mobile">Mobile</label>
                <input
                  {...registerUpdate('mobile_no', {
                    setValueAs: (v) => v === '' ? null : v,
                  })}
                  id="u_mobile"
                  type="text"
                  placeholder="e.g. 9808000000"
                  className="gng-input"
                />
              </div>
            </div>

            <div className="gng-field">
              <label className="gng-label" htmlFor="u_gender">Gender</label>
              <select id="u_gender" className="gng-select" {...registerUpdate('gender')}>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="gng-field">
              <label className="gng-label" htmlFor="u_address">Address</label>
              <textarea
                {...registerUpdate('address', {
                  setValueAs: (v) => v === '' ? null : v,
                })}
                id="u_address"
                placeholder="Optional address..."
                className="gng-textarea"
              />
            </div>
          </>
        ) : (
          /* ── Create form ── */
          <>
            <div className="gng-field">
              <label className="gng-label" htmlFor="c_fullname">
                Full Name <span className="gng-required">*</span>
              </label>
              <input
                {...registerCreate('user_fullname')}
                id="c_fullname"
                type="text"
                placeholder="e.g. John Doe"
                className={`gng-input ${createErrors.user_fullname ? 'gng-input-error' : ''}`}
              />
              {createErrors.user_fullname && (
                <p className="gng-error-text">
                  <i className="fa-solid fa-circle-exclamation" />
                  {createErrors.user_fullname.message}
                </p>
              )}
            </div>

            <div className="gng-form-row">
              <div className="gng-field">
                <label className="gng-label" htmlFor="c_email">
                  Email <span className="gng-required">*</span>
                </label>
                <input
                  {...registerCreate('email_id')}
                  id="c_email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  className={`gng-input ${createErrors.email_id ? 'gng-input-error' : ''}`}
                />
                {createErrors.email_id && (
                  <p className="gng-error-text">
                    <i className="fa-solid fa-circle-exclamation" />
                    {createErrors.email_id.message}
                  </p>
                )}
              </div>

              <div className="gng-field">
                <label className="gng-label" htmlFor="c_mobile">Mobile</label>
                <input
                  {...registerCreate('mobile_no', {
                    setValueAs: (v) => v === '' ? null : v,
                  })}
                  id="c_mobile"
                  type="text"
                  placeholder="e.g. 9808000000"
                  className="gng-input"
                />
              </div>
            </div>

            <div className="gng-form-row">
              <div className="gng-field">
                <label className="gng-label" htmlFor="c_role">
                  Role <span className="gng-required">*</span>
                </label>
                <select
                  id="c_role"
                  className={`gng-select ${createErrors.role_no ? 'gng-input-error' : ''}`}
                  {...registerCreate('role_no', { valueAsNumber: true })}
                >
                  <option value={0}>Select Role</option>
                  {roles.filter((r) => r.status === 'A').map((r) => (
                    <option key={r.role_id} value={r.role_no}>{r.role_name}</option>
                  ))}
                </select>
                {createErrors.role_no && (
                  <p className="gng-error-text">
                    <i className="fa-solid fa-circle-exclamation" />
                    {createErrors.role_no.message}
                  </p>
                )}
              </div>

              <div className="gng-field">
                <label className="gng-label" htmlFor="c_gender">Gender</label>
                <select id="c_gender" className="gng-select" {...registerCreate('gender')}>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="gng-field">
              <label className="gng-label" htmlFor="c_password">
                Password <span className="gng-required">*</span>
              </label>
              <input
                {...registerCreate('password')}
                id="c_password"
                type="password"
                placeholder="Min. 8 characters"
                className={`gng-input ${createErrors.password ? 'gng-input-error' : ''}`}
              />
              {createErrors.password && (
                <p className="gng-error-text">
                  <i className="fa-solid fa-circle-exclamation" />
                  {createErrors.password.message}
                </p>
              )}
            </div>
          </>
        )}

      </div>
    </Modal>
  );
};