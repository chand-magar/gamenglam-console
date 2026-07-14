import { useEffect } from 'react';
import styles from './index.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export type ModalSize    = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type FooterAlign  = 'left' | 'right' | 'between';

export interface ModalFooterConfig {
  cancelLabel?:   string;
  confirmLabel?:  string;
  confirmIcon?:   string;
  isSubmitting?:  boolean;
  onConfirm?:     () => void;
  align?:         FooterAlign;
  extra?:         React.ReactNode; // left-side slot for extra buttons
}

export interface ModalProps {
  // Visibility
  open:           boolean;
  onClose:        () => void;

  // Header
  title:          string;
  subtitle?:      string;
  icon?:          string;           // font-awesome class e.g. "fa-solid fa-tag"
  variant?:       ModalVariant;

  // Layout
  size?:          ModalSize;
  noPadding?:     boolean;
  closeOnOverlay?: boolean;

  // Footer — pass undefined to hide footer entirely
  footer?:        ModalFooterConfig;

  // Content
  children:       React.ReactNode;
}

// ── Size map ─────────────────────────────────────────────────────────────────

const SIZE_CLASS: Record<ModalSize, string> = {
  sm:   styles.sizeSm,
  md:   styles.sizeMd,
  lg:   styles.sizeLg,
  xl:   styles.sizeXl,
  full: styles.sizeFull,
};

// ── Icon variant map ──────────────────────────────────────────────────────────

const ICON_CLASS: Record<ModalVariant, string> = {
  default: styles.headerIconDefault,
  success: styles.headerIconSuccess,
  warning: styles.headerIconWarning,
  danger:  styles.headerIconDanger,
  info:    styles.headerIconInfo,
};

// ── Confirm button variant map ────────────────────────────────────────────────

const CONFIRM_CLASS: Record<ModalVariant, string> = {
  default: styles.confirmDefault,
  success: styles.confirmSuccess,
  warning: styles.confirmWarning,
  danger:  styles.confirmDanger,
  info:    styles.confirmInfo,
};

// ── Footer align map ──────────────────────────────────────────────────────────

const FOOTER_ALIGN_CLASS: Record<FooterAlign, string> = {
  left:    styles.footerLeft,
  right:   '',
  between: styles.footerBetween,
};

// ── Component ─────────────────────────────────────────────────────────────────

export const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  variant       = 'default',
  size          = 'md',
  noPadding     = false,
  closeOnOverlay = true,
  footer,
  children,
}: ModalProps) => {

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const footerAlignClass = footer?.align
    ? FOOTER_ALIGN_CLASS[footer.align]
    : '';

  return (
    <div
      className={styles.overlay}
      onClick={closeOnOverlay ? (e) => e.target === e.currentTarget && onClose() : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`${styles.modal} ${SIZE_CLASS[size]}`}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {icon && (
              <div className={`${styles.headerIcon} ${ICON_CLASS[variant]}`}>
                <i className={icon} />
              </div>
            )}
            <div className={styles.headerText}>
              <p className={styles.title} id="modal-title">{title}</p>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className={styles.divider} />

        {/* ── Body ── */}
        <div className={`${styles.body} ${noPadding ? styles.bodyNoPadding : ''}`}>
          {children}
        </div>

        {/* ── Footer ── */}
        {footer && (
          <div className={`${styles.footer} ${footerAlignClass}`}>
            {/* Extra left-side slot */}
            {footer.extra && <div>{footer.extra}</div>}

            {/* Cancel */}
            {footer.cancelLabel !== undefined && (
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={footer.isSubmitting}
              >
                {footer.cancelLabel || 'Cancel'}
              </button>
            )}

            {/* Confirm */}
            {footer.onConfirm && (
              <button
                type="button"
                className={`${styles.confirmBtn} ${CONFIRM_CLASS[variant]}`}
                onClick={footer.onConfirm}
                disabled={footer.isSubmitting}
              >
                {footer.isSubmitting ? (
                  <>
                    <span className={styles.spinner} />
                    Loading…
                  </>
                ) : (
                  <>
                    {footer.confirmIcon && <i className={footer.confirmIcon} />}
                    {footer.confirmLabel || 'Confirm'}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};