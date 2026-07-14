import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../../schemas/auth.schemas';
import { useAuth } from '../../hooks/useAuth';
import styles from './index.module.css';

export const ForgotPasswordForm = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { username: '' },
  });

  const onSubmit = async ({ username }: ForgotPasswordFormValues) => {
    await forgotPassword(username);
    setSent(true);
  };

  if (sent) {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>
          <i className="fa-solid fa-envelope-circle-check" />
        </div>
        <h2 className={styles.successTitle}>Check your inbox</h2>
        <p className={styles.successText}>
          If that username is registered, a reset link has been sent.
          Please check your email inbox.
        </p>
        
          <a href="/auth/login"
          className={styles.submitBtn}
          style={{ textDecoration: 'none', display: 'inline-flex' }}
        >
          <i className="fa-solid fa-arrow-left" />
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <span className={styles.eyebrow}>
          <i className="fa-solid fa-key" />
          Password Reset
        </span>
        <h1 className={styles.title}>Forgot your password?</h1>
        <p className={styles.subtitle}>
          Enter your username and we'll send you a reset link.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <div className={styles.inputWrapper}>
            <i className={`fa-regular fa-user ${styles.inputIcon}`} />
            <input
              {...register('username')}
              id="username"
              type="text"
              autoFocus
              placeholder="Enter your username"
              className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
            />
          </div>
          {errors.username && (
            <p className={styles.errorText}>
              <i className="fa-solid fa-circle-exclamation" />
              {errors.username.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} />
              Sending link…
            </>
          ) : (
            <>
              Send reset link
              <i className="fa-solid fa-paper-plane" />
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