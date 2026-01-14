"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Campaign {
    id: string;
    name: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    steps: SequenceStep[];
    drafts: DraftEmail[];
    stats: {
        totalDrafts: number;
        sentDrafts: number;
        approvedDrafts: number;
        pendingDrafts: number;
        progress: number;
    };
}

interface SequenceStep {
    id: string;
    order: number;
    delayDays: number;
    subjectTpl: string;
    bodyTpl: string;
}

interface DraftEmail {
    id: string;
    subject: string;
    status: string;
    toAddress: string;
    createdAt: string;
    lead: {
        id: string;
        companyName: string;
    };
}

export default function CampaignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', type: '', status: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCampaign();
        }
    }, [id]);

    const fetchCampaign = async () => {
        try {
            const res = await fetch(`/api/campaigns/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCampaign(data);
                setEditForm({
                    name: data.name || '',
                    type: data.type || '',
                    status: data.status || 'DRAFT'
                });
            } else {
                console.error('Campaign not found');
            }
        } catch (e) {
            console.error('Failed to fetch campaign:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                fetchCampaign();
                setEditing(false);
            }
        } catch (e) {
            console.error('Failed to save:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/campaigns');
            }
        } catch (e) {
            console.error('Failed to delete:', e);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchCampaign();
            }
        } catch (e) {
            console.error('Failed to update status:', e);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                Loading campaign details...
            </div>
        );
    }

    if (!campaign) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h2 className="h2">Campaign Not Found</h2>
                <p className="text-sm" style={{ marginBottom: '1.5rem' }}>This campaign may have been deleted or doesn't exist.</p>
                <a href="/campaigns" className="btn btn-primary">← Back to Campaigns</a>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <a href="/campaigns" className="text-sm" style={{ textDecoration: 'none', color: 'var(--accent)' }}>← Back to Campaigns</a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h1 className="h1" style={{ margin: 0 }}>{campaign.name}</h1>
                        <StatusBadge status={campaign.status} />
                    </div>
                    <p className="text-sm">{campaign.type} • Created {new Date(campaign.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Settings</button>
                    {campaign.status === 'ACTIVE' ? (
                        <button className="btn btn-warning" onClick={() => handleStatusChange('PAUSED')}>
                            Pause Campaign
                        </button>
                    ) : campaign.status === 'PAUSED' ? (
                        <button className="btn btn-primary" onClick={() => handleStatusChange('ACTIVE')}>
                            Resume Campaign
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => handleStatusChange('ACTIVE')}>
                            Launch Campaign
                        </button>
                    )}
                    <button
                        className="btn"
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none' }}
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard label="Total Drafts" value={campaign.stats.totalDrafts.toString()} />
                <StatCard label="Sent" value={campaign.stats.sentDrafts.toString()} color="var(--success)" />
                <StatCard label="Approved" value={campaign.stats.approvedDrafts.toString()} color="var(--accent)" />
                <StatCard label="Pending" value={campaign.stats.pendingDrafts.toString()} color="var(--warning)" />
            </div>

            {/* Progress Bar */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 className="h3" style={{ margin: 0 }}>Campaign Progress</h3>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{campaign.stats.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#F3F4F6', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${campaign.stats.progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                        borderRadius: '6px',
                        transition: 'width 0.5s ease'
                    }}></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                {/* Overview */}
                <div className="card">
                    <h3 className="h3">Overview</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Status</span>
                            <StatusBadge status={campaign.status} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Type</span>
                            <span style={{ fontWeight: 600 }}>{campaign.type}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Sequence Steps</span>
                            <span style={{ fontWeight: 600 }}>{campaign.steps.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Leads Targeted</span>
                            <span style={{ fontWeight: 600 }}>{campaign.drafts.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Open Rate</span>
                            <span style={{ fontWeight: 600, color: 'var(--success)' }}>73%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Reply Rate</span>
                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>12%</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Draft Emails */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="h3" style={{ margin: 0 }}>Recent Drafts</h3>
                        <span className="text-sm" style={{ color: '#6B7280' }}>{campaign.drafts.length} total</span>
                    </div>

                    {campaign.drafts.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📧</div>
                            <p className="text-sm">No drafts yet. Add leads to this campaign to start generating emails.</p>
                        </div>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {campaign.drafts.map(draft => (
                                <div key={draft.id} style={{
                                    padding: '0.75rem 0',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{draft.subject}</div>
                                        <div className="text-sm" style={{ color: '#6B7280' }}>
                                            To: <span style={{ color: 'var(--accent)' }}>{draft.toAddress}</span> • {draft.lead.companyName}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <DraftStatusBadge status={draft.status} />
                                        <span className="text-sm" style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                                            {new Date(draft.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sequence Steps */}
            {campaign.steps.length > 0 && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <h3 className="h3" style={{ marginBottom: '1rem' }}>Email Sequence</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {campaign.steps.map((step, index) => (
                            <div key={step.id} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                padding: '1rem',
                                background: '#F9FAFB',
                                borderRadius: '8px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    flexShrink: 0
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{step.subjectTpl}</div>
                                    <div className="text-sm" style={{ color: '#6B7280', marginTop: '0.25rem' }}>
                                        {step.delayDays === 0 ? 'Sent immediately' : `Sent after ${step.delayDays} day${step.delayDays > 1 ? 's' : ''}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90vw' }}>
                        <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Edit Campaign</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Campaign Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
                                <select
                                    className="input"
                                    value={editForm.type}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                >
                                    <option value="REAM_CLEANING">Ream Cleaning</option>
                                    <option value="UNIDOXIA">UniDoxia</option>
                                    <option value="COLD_OUTREACH">Cold Outreach</option>
                                    <option value="FOLLOW_UP">Follow Up</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                                <select
                                    className="input"
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="PAUSED">Paused</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="card" style={{ textAlign: 'center' }}>
            <div className="text-label">{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--foreground)', marginTop: '0.5rem' }}>
                {value}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, { bg: string; color: string }> = {
        ACTIVE: { bg: '#ECFDF5', color: '#059669' },
        PAUSED: { bg: '#FEF3C7', color: '#D97706' },
        DRAFT: { bg: '#F3F4F6', color: '#6B7280' },
        COMPLETED: { bg: '#DBEAFE', color: '#2563EB' },
    };
    const s = styles[status] || styles.DRAFT;
    return (
        <span style={{
            background: s.bg,
            color: s.color,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700
        }}>
            {status}
        </span>
    );
}

function DraftStatusBadge({ status }: { status: string }) {
    const styles: Record<string, { bg: string; color: string }> = {
        DRAFT: { bg: '#F3F4F6', color: '#6B7280' },
        PENDING_APPROVAL: { bg: '#FEF3C7', color: '#D97706' },
        APPROVED: { bg: '#D1FAE5', color: '#059669' },
        REJECTED: { bg: '#FEE2E2', color: '#DC2626' },
        SENT: { bg: '#DBEAFE', color: '#2563EB' },
    };
    const s = styles[status] || styles.DRAFT;
    return (
        <span style={{
            background: s.bg,
            color: s.color,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 700
        }}>
            {status}
        </span>
    );
}
