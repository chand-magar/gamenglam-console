import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '../../schemas/auth.schemas';
import { useAuth } from '../../hooks/useAuth';
import styles from './index.module.css';

export const LoginForm = () => {
  const { login, isLoading, error, isAuthenticated, dismissError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = (values: LoginFormValues) => login(values);

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>
          <i className="fa-solid fa-shield-halved" />
          Admin Portal
        </span>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in to your admin account to continue.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <i className={`fa-solid fa-circle-exclamation ${styles.alertIcon}`} />
          <span>{error}</span>
          <button
            type="button"
            className={styles.alertClose}
            onClick={dismissError}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Username */}
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
              autoComplete="username"
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

        {/* Password */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.inputWrapper}>
            <i className={`fa-solid fa-lock ${styles.inputIcon}`} />
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
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

        {/* Forgot password */}
        <div className={styles.forgotRow}>
          <a href="/auth/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <i className="fa-solid fa-arrow-right" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};