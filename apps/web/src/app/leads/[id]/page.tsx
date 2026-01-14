"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Lead {
    id: string;
    companyName: string;
    website: string | null;
    status: string;
    industry: string | null;
    location: string | null;
    createdAt: string;
    updatedAt: string;
    contactMethods: ContactMethod[];
    drafts: DraftEmail[];
}

interface ContactMethod {
    id: string;
    type: string;
    value: string;
    isRoleBased: boolean;
    isVerified: boolean;
}

interface DraftEmail {
    id: string;
    subject: string;
    status: string;
    createdAt: string;
}

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ companyName: '', website: '', industry: '', location: '', status: '' });

    useEffect(() => {
        if (id) {
            fetchLead();
        }
    }, [id]);

    const fetchLead = async () => {
        try {
            const res = await fetch(`/api/leads/${id}`);
            if (res.ok) {
                const data = await res.json();
                setLead(data);
                setEditForm({
                    companyName: data.companyName || '',
                    website: data.website || '',
                    industry: data.industry || '',
                    location: data.location || '',
                    status: data.status || 'NEW'
                });
            } else {
                console.error('Lead not found');
            }
        } catch (e) {
            console.error('Failed to fetch lead:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                fetchLead();
                setEditing(false);
            }
        } catch (e) {
            console.error('Failed to save:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/leads');
            }
        } catch (e) {
            console.error('Failed to delete:', e);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                Loading lead details...
            </div>
        );
    }

    if (!lead) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h2 className="h2">Lead Not Found</h2>
                <p className="text-sm" style={{ marginBottom: '1.5rem' }}>This lead may have been deleted or doesn't exist.</p>
                <a href="/leads" className="btn btn-primary">← Back to Leads</a>
            </div>
        );
    }

    const primaryEmail = lead.contactMethods.find(c => c.type === 'EMAIL')?.value || 'No email';
    const engagementScore = Math.floor(Math.random() * 30) + 70; // Simulated for demo

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <a href="/leads" className="text-sm" style={{ textDecoration: 'none', color: 'var(--accent)' }}>← Back to Leads</a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white',
                        fontWeight: 700
                    }}>
                        {lead.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h1 className="h1" style={{ margin: 0, fontSize: '1.5rem' }}>{lead.companyName}</h1>
                            <StatusBadge status={lead.status} />
                        </div>
                        <p className="text-sm" style={{ margin: '0.25rem 0 0 0' }}>
                            {lead.industry || 'Business'} • {lead.location || 'Unknown Location'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
                    <button
                        className="btn btn-primary"
                        onClick={() => primaryEmail !== 'No email' && window.open(`mailto:${primaryEmail}`)}
                        disabled={primaryEmail === 'No email'}
                    >
                        Send Email
                    </button>
                    <button
                        className="btn"
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none' }}
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Contact Information */}
                    <div className="card">
                        <h3 className="h3">Contact Information</h3>
                        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <div className="text-label">Primary Email</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <span style={{ fontWeight: 500 }}>{primaryEmail}</span>
                                    {lead.contactMethods.find(c => c.type === 'EMAIL')?.isVerified && (
                                        <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>VERIFIED</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-label">Website</div>
                                <div style={{ marginTop: '0.25rem' }}>
                                    {lead.website ? (
                                        <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                                            {lead.website}
                                        </a>
                                    ) : '—'}
                                </div>
                            </div>
                            <div>
                                <div className="text-label">Industry</div>
                                <div style={{ marginTop: '0.25rem' }}>{lead.industry || '—'}</div>
                            </div>
                            <div>
                                <div className="text-label">Location</div>
                                <div style={{ marginTop: '0.25rem' }}>{lead.location || '—'}</div>
                            </div>
                        </div>
                    </div>

                    {/* All Contact Methods */}
                    {lead.contactMethods.length > 0 && (
                        <div className="card">
                            <h3 className="h3">All Contact Methods ({lead.contactMethods.length})</h3>
                            <div style={{ marginTop: '1rem' }}>
                                {lead.contactMethods.map(contact => (
                                    <div key={contact.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 0',
                                        borderBottom: '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{
                                                width: '32px',
                                                height: '32px',
                                                background: '#F3F4F6',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem'
                                            }}>
                                                {contact.type === 'EMAIL' ? '✉️' : contact.type === 'PHONE' ? '📞' : '📋'}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>{contact.value}</div>
                                                <div className="text-sm" style={{ color: '#6B7280' }}>
                                                    {contact.type} {contact.isRoleBased && '• Role-based'}
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{
                                            background: contact.isVerified ? '#DCFCE7' : '#FEF3C7',
                                            color: contact.isVerified ? '#166534' : '#92400E',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700
                                        }}>
                                            {contact.isVerified ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="card">
                        <h3 className="h3" style={{ fontSize: '1rem' }}>Notes</h3>
                        <textarea
                            className="input"
                            style={{ width: '100%', marginTop: '0.5rem', minHeight: '100px' }}
                            placeholder="Add notes about this lead..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Save Note</button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: '#F9FAFB' }}>
                        <h3 className="h3" style={{ fontSize: '1rem' }}>Vitals</h3>
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <div className="text-label">Created</div>
                                <div className="text-sm">{new Date(lead.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div className="text-label">Last Updated</div>
                                <div className="text-sm">{new Date(lead.updatedAt).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div className="text-label">Engagement Score</div>
                                <div style={{ fontWeight: 700, fontSize: '1.25rem', color: engagementScore > 80 ? 'var(--success)' : 'var(--warning)' }}>
                                    {engagementScore}/100
                                </div>
                            </div>
                            <div>
                                <div className="text-label">Contact Methods</div>
                                <div className="text-sm">{lead.contactMethods.length} found</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <h3 className="h3" style={{ fontSize: '1rem' }}>Recent Drafts</h3>
                        <div style={{ marginTop: '1rem' }}>
                            {lead.drafts.length === 0 ? (
                                <p className="text-sm" style={{ color: '#6B7280' }}>No drafts yet</p>
                            ) : (
                                lead.drafts.map(draft => (
                                    <div key={draft.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <div className="text-sm" style={{ fontWeight: 500 }}>{draft.subject}</div>
                                        <div className="text-sm" style={{ color: '#6B7280', fontSize: '0.7rem' }}>
                                            {draft.status} • {new Date(draft.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                        <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Edit Lead</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Company Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editForm.companyName}
                                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Website</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editForm.website}
                                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Industry</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={editForm.industry}
                                        onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                                <select
                                    className="input"
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                >
                                    <option value="NEW">New</option>
                                    <option value="RESEARCHED">Researched</option>
                                    <option value="DRAFTED">Drafted</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="SENT">Sent</option>
                                    <option value="REPLIED">Replied</option>
                                    <option value="BOOKED">Booked</option>
                                    <option value="CLOSED_WON">Closed Won</option>
                                    <option value="OPTED_OUT">Opted Out</option>
                                    <option value="UNQUALIFIED">Unqualified</option>
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

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, { bg: string; color: string }> = {
        NEW: { bg: '#ECFDF5', color: '#059669' },
        RESEARCHED: { bg: '#DBEAFE', color: '#2563EB' },
        DRAFTED: { bg: '#FEF3C7', color: '#D97706' },
        APPROVED: { bg: '#D1FAE5', color: '#059669' },
        SENT: { bg: '#E0E7FF', color: '#4F46E5' },
        REPLIED: { bg: '#FCE7F3', color: '#DB2777' },
        BOOKED: { bg: '#CFFAFE', color: '#0891B2' },
        CLOSED_WON: { bg: '#BBF7D0', color: '#16A34A' },
        OPTED_OUT: { bg: '#FEE2E2', color: '#DC2626' },
        UNQUALIFIED: { bg: '#F3F4F6', color: '#6B7280' },
    };
    const s = styles[status] || styles.NEW;
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
