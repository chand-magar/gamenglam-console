import { Outlet } from 'react-router-dom';
import styles from './index.module.css';

export const AuthLayout = () => (
  <div className={styles.wrapper}>
    {/* Left brand panel */}
    <div className={styles.panel}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />
      <div className={styles.grid} />

      {/* Logo */}
      <div className={styles.panelLogo}>
        <div className={styles.panelLogoIcon}>
          <i className="fa-solid fa-bolt" style={{ color: '#a78bfa', fontSize: 17 }} />
        </div>
        <span className={styles.panelLogoText}>GameNGlam</span>
      </div>

      {/* Center content */}
      <div className={styles.panelContent}>
        <div className={styles.panelTag}>
          <span className={styles.panelTagDot} />
          Enterprise Admin Console
        </div>

        <h1 className={styles.panelHeading}>
          Control every<br />
          part of{' '}
          <span className={styles.panelHeadingAccent}>your store.</span>
        </h1>

        <p className={styles.panelSubtext}>
          One dashboard for products, orders, customers,
          and growth — built for teams that move fast.
        </p>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>8.4k</span>
            <span className={styles.statLabel}>Products</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>142</span>
            <span className={styles.statLabel}>Categories</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>99.9%</span>
            <span className={styles.statLabel}>Uptime</span>
          </div>
        </div>
      </div>

      <p className={styles.panelFooter}>
        © {new Date().getFullYear()} GameNGlam. All rights reserved.
      </p>
    </div>

    {/* Right form panel */}
    <div className={styles.formSide}>
      <div className={styles.formBox}>
        <Outlet />
      </div>
    </div>
  </div>
);