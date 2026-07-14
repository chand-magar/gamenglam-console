import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../../schemas/auth.schemas';
import { useAuth } from '../../hooks/useAuth';
import styles from './index.module.css';

export const ResetPasswordForm = () => {
  const { resetPassword, isLoading, error } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ password }: ResetPasswordFormValues) => {
    const result = await resetPassword(token, password);
    if (!('error' in result)) navigate('/auth/login', { replace: true });
  };

  return (
    <div>
      <div className={styles.header}>
        <span className={styles.eyebrow}>
          <i className="fa-solid fa-lock" />
          New Password
        </span>
        <h1 className={styles.title}>Reset your password</h1>
        <p className={styles.subtitle}>
          Choose a strong, unique password to protect your account.
        </p>
      </div>

      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <i className={`fa-solid fa-circle-exclamation ${styles.alertIcon}`} />
          <span>{error}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            New password
          </label>
          <div className={styles.inputWrapper}>
            <i className={`fa-solid fa-lock ${styles.inputIcon}`} />
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className={`${styles.input} ${styles.inputWithToggle} ${errors.password ? styles.inputError : ''}`}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
            >
              <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {errors.password && (
            <p className={styles.errorText}>
              <i className="fa-solid fa-circle-exclamation" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="confirmPassword">
            Confirm new password
          </label>
          <div className={styles.inputWrapper}>
            <i className={`fa-solid fa-lock ${styles.inputIcon}`} />
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              className={`${styles.input} ${styles.inputWithToggle} ${errors.confirmPassword ? styles.inputError : ''}`}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirm((p) => !p)}
              tabIndex={-1}
            >
              <i className={`fa-regular ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className={styles.errorText}>
              <i className="fa-solid fa-circle-exclamation" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading || !token}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} />
              Resetting…
            </>
          ) : (
            <>
              Reset password
              <i className="fa-solid fa-check" />
            </>
          )}
        </button>
      </form>

      <a href="/auth/login" className={styles.backLink}>
        <i className="fa-solid fa-arrow-left" />
        Back to sign in
      </a>
    </div>
  );
};