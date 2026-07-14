import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../config/navigation';
import styles from './index.module.css';

interface Props {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: Props) => {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Main nav */}
      <div className={styles.navSection}>
        <ul className={styles.nav}>
          {NAV_ITEMS.filter((i) => !i.bottom).map((item) => {
            const active = pathname.startsWith(item.path);
            return (
              <li key={item.path} className={styles.navLi}>
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                >
                  <i className={`${item.icon} ${styles.navIcon}`} />
                  <span className={`${styles.navLabel} ${collapsed ? styles.navLabelHidden : ''}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`${styles.navBadge} ${collapsed ? styles.navBadgeHidden : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
                {/* Tooltip — only renders when collapsed */}
                {collapsed && (
                  <span className={styles.tooltip}>{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.divider} />

      {/* Bottom nav — Settings */}
      <div className={styles.navSection} style={{ paddingTop: 8 }}>
        <ul className={styles.nav}>
          {NAV_ITEMS.filter((i) => i.bottom).map((item) => {
            const active = pathname.startsWith(item.path);
            return (
              <li key={item.path} className={styles.navLi}>
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                >
                  <i className={`${item.icon} ${styles.navIcon}`} />
                  <span className={`${styles.navLabel} ${collapsed ? styles.navLabelHidden : ''}`}>
                    {item.label}
                  </span>
                </button>
                {collapsed && (
                  <span className={styles.tooltip}>{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};