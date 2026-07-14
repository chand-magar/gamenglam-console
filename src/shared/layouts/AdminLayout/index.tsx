import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../AdminLayout/Sidebar';
import { Topbar } from '../AdminLayout/Topbar';
import styles from './index.module.css';

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={styles.layout}>
      <Topbar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className={styles.body}>
        <Sidebar collapsed={collapsed} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};