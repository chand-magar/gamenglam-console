import { useState } from 'react';
import { UserListPage } from '../Users';
import { RoleListPage } from '../Role';
import styles from './index.module.css';

type Tab = 'users' | 'roles';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'users', label: 'Users', icon: 'fa-solid fa-users'    },
  { key: 'roles', label: 'Roles', icon: 'fa-solid fa-id-badge' },
];

const EmployeesPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="gng-page">

      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Employees</span>
      </nav>

      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Employee Management</h1>
          <p className="gng-page-subtitle">
            Manage admin users and their role assignments.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <i className={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'users' && <UserListPage embedded />}
        {activeTab === 'roles' && <RoleListPage embedded />}
      </div>

    </div>
  );
};

export default EmployeesPage;