import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../../core/hooks/useAppSelector';
import { selectCurrentUser } from '../../../../features/auth/store/authSelectors';
import { useAuth } from '../../../../features/auth/hooks/useAuth';
import styles from './index.module.css';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export const Topbar = ({ collapsed, onToggle }: Props) => {
  const user          = useAppSelector(selectCurrentUser);
  const { logout, isLoading } = useAuth();
  const navigate      = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef   = useRef<HTMLDivElement>(null);

  const initials = user?.user_fullname
    ? user.user_fullname.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <header className={styles.topbar}>
      {/* Logo area */}
      <div className={styles.logoArea}>
        <div className={styles.logoIcon}>
          <i className="fa-solid fa-bolt" style={{ color: '#a78bfa', fontSize: 17 }} />
        </div>
        <span className={styles.logoText}>GameNGlam</span>

        <button
          type="button"
          className={styles.toggleBtn}
          onClick={onToggle}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          <i className="fa-solid fa-bars" />
        </button>
      </div>

      <div className={styles.spacer} />

      {/* Right actions */}
      <div className={styles.actions}>
        <button type="button" className={styles.iconBtn} title="Notifications">
          <i className="fa-regular fa-bell" />
          <span className={styles.notifDot} />
        </button>

        <button type="button" className={styles.iconBtn} title="Messages">
          <i className="fa-regular fa-envelope" />
        </button>

        <button type="button" className={styles.iconBtn} title="Help">
          <i className="fa-regular fa-circle-question" />
        </button>

        <div className={styles.vDivider} />

        {/* Profile with dropdown */}
        <div className={styles.profileWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={styles.profile}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>
                {user?.user_fullname ?? 'Admin User'}
              </p>
              <p className={styles.profileRole}>Administrator</p>
            </div>
            <i className={`fa-solid fa-chevron-down ${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <p className={styles.dropdownName}>{user?.user_fullname ?? 'Admin User'}</p>
                <p className={styles.dropdownEmail}>{user?.email_id ?? ''}</p>
              </div>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
              >
                <i className="fa-solid fa-gear" />
                Settings
              </button>

              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
              >
                <i className="fa-regular fa-user" />
                My Profile
              </button>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading
                  ? <><i className="fa-solid fa-spinner fa-spin" />Signing out…</>
                  : <><i className="fa-solid fa-right-from-bracket" />Sign out</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};