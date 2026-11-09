import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RichTextEditor } from '../../../../shared/components/RichTextEditor';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useNewsletter } from '../../hooks/useNewsletter';
import { DataTable } from '../../../../shared/components/DataTable';
import type { Column } from '../../../../shared/components/DataTable';
import type { Subscriber, Campaign } from '../../../../domain/entities/Newsletter';

// ── Schemas ────────────────────────────────────────────────────────────────

const addSubscriberSchema = z.object({
  email: z.string().email('Enter a valid email'),
  name:  z.string().optional(),
});
type AddSubscriberForm = z.infer<typeof addSubscriberSchema>;

const sendCampaignSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  body:    z.string().min(10, 'Body must be at least 10 characters'),
});
type SendCampaignForm = z.infer<typeof sendCampaignSchema>;

// ── Status helpers ─────────────────────────────────────────────────────────

const SUB_STATUS: Record<string, { label: string; cls: string; icon: string }> = {
  A: { label: 'Active',   cls: 'gng-badge-active',   icon: 'fa-circle-check' },
  I: { label: 'Inactive', cls: 'gng-badge-inactive',  icon: 'fa-circle-pause' },
};

const CAMP_STATUS: Record<string, { label: string; cls: string; icon: string }> = {
  sent:   { label: 'Sent',   cls: 'gng-badge-active',   icon: 'fa-circle-check'  },
  draft:  { label: 'Draft',  cls: 'gng-badge-inactive', icon: 'fa-circle-dot'    },
  failed: { label: 'Failed', cls: 'gng-badge-danger',   icon: 'fa-circle-xmark'  },
};

// ── Page ───────────────────────────────────────────────────────────────────

const NewsletterPage = () => {
  const {
    subscribers, subscriberTotal, subscriberPage, subscriberPages,
    campaigns, campaignTotal,
    isLoading, isSubmitting, isSending, error,
    fetchSubscribers, addSubscriber, deleteSubscriber,
    fetchCampaigns, sendCampaign, changeSubscriberPage,
    campaignPage, campaignPages,
    dismissError,
  } = useNewsletter();

  const [tab,         setTab]         = useState<'newsletter' | 'subscribers'>('newsletter');
  const [deleteItem,  setDeleteItem]  = useState<Subscriber | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [subSearch,   setSubSearch]   = useState('');

  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchSubscribers({ page: 1, limit: 10 });
    fetchCampaigns(1, 10);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCount = subscribers.filter((s) => s.status === 'A').length;
  const sentCount   = campaigns.filter((c) => c.sent_status === 'sent').length;

  // ── Forms ────────────────────────────────────────────────────────────────
  const addForm = useForm<AddSubscriberForm>({ resolver: zodResolver(addSubscriberSchema) });
  const onAddSubscriber = async (values: AddSubscriberForm) => {
    await addSubscriber({ email: values.email, name: values.name });
    addForm.reset();
    setShowAddForm(false);
  };

  const campaignForm = useForm<SendCampaignForm>({ resolver: zodResolver(sendCampaignSchema) });
  const onSendCampaign = async (values: SendCampaignForm) => {
    await sendCampaign({ subject: values.subject, body: values.body });
    campaignForm.reset();
  };

  // ── Columns ──────────────────────────────────────────────────────────────
  const subCols: Column<Subscriber>[] = [
    {
      key: 'no', title: '#', width: '52px',
      render: (_, i) => <span className="gng-row-no">{String((subscriberPage - 1) * 10 + i + 1).padStart(2, '0')}</span>,
    },
    {
      key: 'email', title: 'Email',
      render: (row) => (
        <span style={{ fontSize: 13, fontWeight: 500 }}>{row.email}</span>
      ),
    },
    {
      key: 'name', title: 'Name',
      render: (row) => (
        <span style={{ fontSize: 13, color: row.name ? 'var(--gng-text)' : '#CBD5E1' }}>
          {row.name || '—'}
        </span>
      ),
    },
    {
      key: 'status', title: 'Status', align: 'center',
      render: (row) => {
        const s = SUB_STATUS[row.status] ?? SUB_STATUS['I'];
        return (
          <span className={`gng-badge ${s.cls}`}>
            <i className={`fa-solid ${s.icon}`} style={{ fontSize: 10 }} /> {s.label}
          </span>
        );
      },
    },
    {
      key: 'subscribed_at', title: 'Subscribed', align: 'center',
      render: (row) => <span className="gng-date">{dayjs(row.subscribed_at).format('MMM DD, YYYY')}</span>,
    },
    {
      key: 'actions', title: '', align: 'center', width: '60px',
      render: (row) => (
        <div className="gng-actions">
          <button type="button" className="gng-action-btn gng-action-delete"
            onClick={() => setDeleteItem(row)} title="Remove subscriber">
            <i className="fa-regular fa-trash-can" />
          </button>
        </div>
      ),
    },
  ];

  const campCols: Column<Campaign>[] = [
    {
      key: 'no', title: '#', width: '52px',
      render: (_, i) => <span className="gng-row-no">{String(i + 1).padStart(2, '0')}</span>,
    },
    {
      key: 'subject', title: 'Subject',
      render: (row) => <span style={{ fontSize: 13, fontWeight: 600 }}>{row.subject}</span>,
    },
    {
      key: 'status', title: 'Status', align: 'center',
      render: (row) => {
        const s = CAMP_STATUS[row.sent_status] ?? CAMP_STATUS['draft'];
        return (
          <span className={`gng-badge ${s.cls}`}>
            <i className={`fa-solid ${s.icon}`} style={{ fontSize: 10 }} /> {s.label}
          </span>
        );
      },
    },
    {
      key: 'recipients', title: 'Recipients', align: 'center',
      render: (row) => (
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {row.recipient_count > 0 ? row.recipient_count : '—'}
        </span>
      ),
    },
    {
      key: 'sent_at', title: 'Sent At', align: 'center',
      render: (row) => (
        <span className="gng-date">
          {row.sent_at ? dayjs(row.sent_at).format('MMM DD, YYYY · HH:mm') : '—'}
        </span>
      ),
    },
    {
      key: 'error', title: 'Note',
      render: (row) => (
        <span style={{ fontSize: 12, color: row.error_message ? '#EF4444' : '#CBD5E1' }}>
          {row.error_message || '—'}
        </span>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Newsletter</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Newsletter</h1>
          <p className="gng-page-subtitle">Manage subscribers and send email campaigns.</p>
        </div>
        {tab === 'subscribers' && (
          <button type="button" className="gng-btn-primary" onClick={() => setShowAddForm(true)}>
            <i className="fa-solid fa-user-plus" /> Add Subscriber
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-users" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Subscribers</p>
            <p className="gng-stat-value">{isLoading ? '—' : subscriberTotal}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-green">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Active</p>
            <p className="gng-stat-value">{isLoading ? '—' : activeCount}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-paper-plane" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Campaigns Sent</p>
            <p className="gng-stat-value">{isLoading ? '—' : sentCount}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-bullhorn" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Campaigns</p>
            <p className="gng-stat-value">{isLoading ? '—' : campaignTotal}</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="gng-error-alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button type="button" className="gng-error-dismiss" onClick={dismissError}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="gng-tabs">
        <button
          type="button"
          className={`gng-tab${tab === 'newsletter' ? ' gng-tab-active' : ''}`}
          onClick={() => setTab('newsletter')}
        >
          <i className="fa-solid fa-paper-plane" />
          Newsletter
          {campaignTotal > 0 && <span className="gng-tab-badge">{campaignTotal}</span>}
        </button>
        <button
          type="button"
          className={`gng-tab${tab === 'subscribers' ? ' gng-tab-active' : ''}`}
          onClick={() => setTab('subscribers')}
        >
          <i className="fa-solid fa-users" />
          Subscribers
          {subscriberTotal > 0 && <span className="gng-tab-badge">{subscriberTotal}</span>}
        </button>
      </div>

      {/* ── Newsletter tab ──────────────────────────────────────────────── */}
      {tab === 'newsletter' && (
        <>
          {/* Compose card */}
          <div className="gng-card">
            <div className="gng-card-header">
              <div className="gng-card-header-icon">
                <i className="fa-solid fa-paper-plane" />
              </div>
              <div>
                <p className="gng-card-header-title">Compose Campaign</p>
                <p className="gng-card-header-sub">
                  {activeCount > 0
                    ? `Will be delivered to ${activeCount} active subscriber${activeCount !== 1 ? 's' : ''}`
                    : 'No active subscribers yet — add some first'}
                </p>
              </div>
              {activeCount > 0 && (
                <div className="gng-card-header-end">
                  <span className="gng-badge gng-badge-active">
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 10 }} />
                    {activeCount} active
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={campaignForm.handleSubmit(onSendCampaign)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="gng-field">
                <label className="gng-label">Subject <span className="gng-required">*</span></label>
                <input
                  {...campaignForm.register('subject')}
                  type="text"
                  placeholder="e.g. New arrivals — Summer 2026"
                  className={`gng-input${campaignForm.formState.errors.subject ? ' gng-input-error' : ''}`}
                />
                {campaignForm.formState.errors.subject && (
                  <p className="gng-error-text">{campaignForm.formState.errors.subject.message}</p>
                )}
              </div>

              <div className="gng-field">
                <label className="gng-label">Body <span className="gng-required">*</span></label>
                <Controller
                  name="body"
                  control={campaignForm.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your email content here…"
                      minHeight={260}
                      error={!!campaignForm.formState.errors.body}
                    />
                  )}
                />
                {campaignForm.formState.errors.body && (
                  <p className="gng-error-text">{campaignForm.formState.errors.body.message}</p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                <button type="submit" className="gng-btn-primary" disabled={isSending}>
                  {isSending
                    ? <><i className="fa-solid fa-spinner fa-spin" /> Sending…</>
                    : <><i className="fa-solid fa-paper-plane" /> Send to All Active Subscribers</>}
                </button>
                <button
                  type="button"
                  className="gng-btn-secondary"
                  onClick={() => campaignForm.reset()}
                  disabled={isSending}
                >
                  <i className="fa-solid fa-rotate" /> Clear
                </button>
              </div>
            </form>
          </div>

          {/* Campaign history card */}
          <div className="gng-card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
              <div className="gng-card-header-icon" style={{ width: 34, height: 34, fontSize: 14 }}>
                <i className="fa-solid fa-clock-rotate-left" />
              </div>
              <div>
                <p className="gng-card-header-title" style={{ fontSize: 14 }}>Campaign History</p>
              </div>
              <div className="gng-card-header-end">
                <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>{campaignTotal} total</span>
              </div>
            </div>
            <DataTable<Campaign>
              columns={campCols}
              data={campaigns}
              rowKey={(r) => r.campaign_id}
              isLoading={isLoading}
              total={campaignTotal}
              page={campaignPage ?? 1}
              limit={10}
              totalPages={campaignPages ?? 0}
              onPageChange={(p) => fetchCampaigns(p, 10)}
              emptyIcon="fa-solid fa-paper-plane"
              emptyTitle="No campaigns sent yet"
              emptySubtitle="Compose and send your first campaign above."
            />
          </div>
        </>
      )}

      {/* ── Subscribers tab ─────────────────────────────────────────────── */}
      {tab === 'subscribers' && (
        <>
          {/* Add subscriber form */}
          {showAddForm && (
            <div className="gng-card">
              <div className="gng-card-header">
                <div className="gng-card-header-icon gng-card-header-icon-green">
                  <i className="fa-solid fa-user-plus" />
                </div>
                <div>
                  <p className="gng-card-header-title">Add Subscriber</p>
                  <p className="gng-card-header-sub">Manually add someone to the newsletter list</p>
                </div>
              </div>
              <form
                onSubmit={addForm.handleSubmit(onAddSubscriber)}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}
              >
                <div className="gng-field" style={{ flex: '1 1 220px' }}>
                  <label className="gng-label">Email <span className="gng-required">*</span></label>
                  <input
                    {...addForm.register('email')}
                    type="email"
                    placeholder="email@example.com"
                    className={`gng-input${addForm.formState.errors.email ? ' gng-input-error' : ''}`}
                  />
                  {addForm.formState.errors.email && (
                    <p className="gng-error-text">{addForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="gng-field" style={{ flex: '1 1 180px' }}>
                  <label className="gng-label">Name <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    {...addForm.register('name')}
                    type="text"
                    placeholder="Full name"
                    className="gng-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingBottom: 2 }}>
                  <button type="submit" className="gng-btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin" /> Adding…</> : <><i className="fa-solid fa-plus" /> Add</>}
                  </button>
                  <button type="button" className="gng-btn-secondary" onClick={() => { setShowAddForm(false); addForm.reset(); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Subscriber list card */}
          <div className="gng-card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="gng-card-header-icon" style={{ width: 34, height: 34, fontSize: 14 }}>
                <i className="fa-solid fa-users" />
              </div>
              <div>
                <p className="gng-card-header-title" style={{ fontSize: 14 }}>Subscribers</p>
              </div>
              <div className="gng-card-header-end">
                <div className="gng-search-wrapper" style={{ minWidth: 200 }}>
                  <i className="fa-solid fa-magnifying-glass" />
                  <input
                    type="text"
                    placeholder="Search email or name…"
                    className="gng-search-input"
                    value={subSearch}
                    onChange={(e) => {
                      setSubSearch(e.target.value);
                      fetchSubscribers({ page: 1, limit: 10, search: e.target.value || undefined });
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="gng-btn-secondary"
                  onClick={() => fetchSubscribers({ page: 1, limit: 10, status: 'A' })}
                >
                  <i className="fa-solid fa-filter" /> Active
                </button>
                <button
                  type="button"
                  className="gng-btn-secondary"
                  onClick={() => { setSubSearch(''); fetchSubscribers({ page: 1, limit: 10 }); }}
                >
                  <i className="fa-solid fa-rotate" />
                </button>
              </div>
            </div>

            <DataTable<Subscriber>
              columns={subCols}
              data={subscribers}
              rowKey={(r) => r.subscriber_id}
              isLoading={isLoading}
              total={subscriberTotal}
              page={subscriberPage}
              limit={10}
              totalPages={subscriberPages}
              onPageChange={changeSubscriberPage}
              emptyIcon="fa-solid fa-users"
              emptyTitle="No subscribers yet"
              emptySubtitle="Add subscribers manually or wait for customers to sign up from the store."
            />
          </div>
        </>
      )}

      {/* Delete confirm overlay */}
      {deleteItem && (
        <div className="gng-confirm-overlay">
          <div className="gng-confirm-box">
            <div className="gng-confirm-icon"><i className="fa-solid fa-user-minus" /></div>
            <p className="gng-confirm-title">Remove Subscriber</p>
            <p className="gng-confirm-text">
              Remove <span className="gng-confirm-name">"{deleteItem.email}"</span> from the newsletter?
              They will no longer receive email campaigns.
            </p>
            <div className="gng-confirm-actions">
              <button type="button" className="gng-confirm-cancel" onClick={() => setDeleteItem(null)}>Cancel</button>
              <button
                type="button"
                className="gng-btn-danger"
                disabled={isSubmitting}
                onClick={async () => { await deleteSubscriber(deleteItem.subscriber_id); setDeleteItem(null); }}
              >
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Removing…</>
                  : <><i className="fa-solid fa-user-minus" /> Remove</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterPage;
