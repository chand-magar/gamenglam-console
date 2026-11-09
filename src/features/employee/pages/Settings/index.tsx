import { useState } from 'react';
import { SectionListPage } from '../Section';
import { PageListPage } from '../Page';
import styles from './index.module.css';

type Tab = 'sections' | 'pages';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'sections', label: 'Sections', icon: 'fa-solid fa-rectangle-list' },
  { key: 'pages',    label: 'Pages',    icon: 'fa-solid fa-file-lines'      },
];

const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('sections');

  return (
    <div className="gng-page">

      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Settings</span>
      </nav>

      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">System Settings</h1>
          <p className="gng-page-subtitle">
            Manage navigation sections and pages for the admin panel.
          </p>
        </div>
      </div>

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
        {activeTab === 'sections' && <SectionListPage embedded />}
        {activeTab === 'pages'    && <PageListPage    embedded />}
      </div>

    </div>
  );
};

export default SystemSettingsPage;