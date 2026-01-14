"use client";

import { useState, useEffect, useCallback } from 'react';

interface Lead {
    id: string;
    companyName: string;
    website: string | null;
    status: string;
    industry: string | null;
    location: string | null;
    createdAt: string;
    contactMethods: ContactMethod[];
}

interface ContactMethod {
    id: string;
    type: string;
    value: string;
    isRoleBased: boolean;
    isVerified: boolean;
    sourceUrlId: string | null;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLead, setNewLead] = useState({ companyName: '', website: '', email: '', industry: '', location: '' });
    const [saving, setSaving] = useState(false);

    const fetchLeads = useCallback(async () => {
        try {
            const url = searchQuery
                ? `/api/leads?search=${encodeURIComponent(searchQuery)}`
                : '/api/leads';
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setLeads(data);
                if (data.length > 0 && !selectedLead) {
                    setSelectedLead(data[0]);
                }
            }
        } catch (e) {
            console.error('Failed to fetch leads:', e);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedLead]);

    useEffect(() => {
        // Seed data on first load
        fetch('/api/seed', { method: 'POST' }).finally(() => {
            fetchLeads();
        });
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchLeads();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, fetchLeads]);

    const handleCreateLead = async () => {
        if (!newLead.companyName) return;
        setSaving(true);
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewLead({ companyName: '', website: '', email: '', industry: '', location: '' });
                fetchLeads();
            }
        } catch (e) {
            console.error('Failed to create lead:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleApproveContact = async (leadId: string, contactId: string) => {
        // TODO: Implement approval logic
        alert(`Approved contact ${contactId} for lead ${leadId}`);
    };

    const handleRejectContact = async (leadId: string, contactId: string) => {
        // TODO: Implement rejection logic
        alert(`Rejected contact ${contactId} for lead ${leadId}`);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="h1">Leads & Contacts</h1>
                    <p className="text-sm">Verified contact methods and compliance audit trails.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#9CA3AF' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '200px' }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        + Manual Lead
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading leads...</div>
            ) : leads.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h3 className="h3">No leads found</h3>
                    <p className="text-sm" style={{ marginBottom: '1.5rem' }}>
                        {searchQuery ? `No results for "${searchQuery}"` : 'Create your first lead to get started.'}
                    </p>
                    {!searchQuery && (
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Lead</button>
                    )}
                </div>
            ) : (
                <>
                    {/* Selected Lead Detail View */}
                    {selectedLead && (
                        <div className="card" style={{ background: '#111827', color: 'white', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <h2 className="h2" style={{ margin: 0 }}>{selectedLead.companyName.toUpperCase()}</h2>
                                        <span style={{
                                            background: '#4C1D95',
                                            color: '#C4B5FD',
                                            fontSize: '0.65rem',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: 700,
                                            letterSpacing: '0.05em'
                                        }}>
                                            {selectedLead.status === 'RESEARCHED' ? 'VERIFIED ENTITY' : selectedLead.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
                                        {selectedLead.website && <span>🔗 {selectedLead.website}</span>}
                                        {selectedLead.location && <span>📍 {selectedLead.location}</span>}
                                        {selectedLead.industry && <span>🏢 {selectedLead.industry}</span>}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="text-label" style={{ color: '#9CA3AF' }}>Audit Progress</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, fontStyle: 'italic' }}>
                                        {selectedLead.contactMethods.length > 0
                                            ? `${Math.round((selectedLead.contactMethods.filter(c => c.isVerified).length / selectedLead.contactMethods.length) * 100)}% COMPLETE`
                                            : 'NO CONTACTS'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Methods Table */}
                    {selectedLead && selectedLead.contactMethods.length > 0 && (
                        <>
                            <h3 className="h3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '4px', height: '24px', background: 'var(--accent)' }}></div>
                                EVIDENCE TIER 01: ROLE-BASED EMAILS
                            </h3>

                            <div className="card" style={{ padding: 0, marginBottom: '2rem' }}>
                                <TableHeader />
                                {selectedLead.contactMethods.map(contact => (
                                    <TableRow
                                        key={contact.id}
                                        email={contact.value}
                                        source={contact.sourceUrlId ? `/source/${contact.sourceUrlId}` : '/discovered'}
                                        confidence={contact.isVerified ? '98% HIGH CONFIDENCE' : contact.isRoleBased ? '76% MEDIUM' : '60% LOW'}
                                        onApprove={() => handleApproveContact(selectedLead.id, contact.id)}
                                        onReject={() => handleRejectContact(selectedLead.id, contact.id)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Leads List */}
                    <h3 className="h3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--accent)' }}></div>
                        ALL LEADS ({leads.length})
                    </h3>

                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '1rem', borderBottom: '1px solid var(--border)', background: '#F9FAFB' }}>
                            <div className="text-label">Company</div>
                            <div className="text-label">Industry</div>
                            <div className="text-label">Location</div>
                            <div className="text-label">Status</div>
                            <div className="text-label" style={{ textAlign: 'right' }}>Actions</div>
                        </div>
                        {leads.map(lead => (
                            <div
                                key={lead.id}
                                onClick={() => setSelectedLead(lead)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                                    padding: '1rem',
                                    borderBottom: '1px solid var(--border)',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    background: selectedLead?.id === lead.id ? '#F0F9FF' : 'white',
                                    transition: 'background 0.15s'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>{lead.companyName}</div>
                                    <div className="text-sm" style={{ color: '#6B7280' }}>{lead.website}</div>
                                </div>
                                <div className="text-sm">{lead.industry || '—'}</div>
                                <div className="text-sm">{lead.location || '—'}</div>
                                <div>
                                    <StatusBadge status={lead.status} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <a
                                        href={`/leads/${lead.id}`}
                                        className="btn btn-secondary"
                                        style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        View Details
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Create Lead Modal */}
            {isModalOpen && (
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
                        <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Add New Lead</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Company Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newLead.companyName}
                                    onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                                    placeholder="e.g., Acme Corporation"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Website</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newLead.website}
                                    onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                                    placeholder="e.g., acme.com"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={newLead.email}
                                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                    placeholder="e.g., info@acme.com"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Industry</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newLead.industry}
                                        onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                                        placeholder="e.g., SaaS"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newLead.location}
                                        onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                                        placeholder="e.g., USA"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateLead}
                                disabled={saving || !newLead.companyName}
                            >
                                {saving ? 'Creating...' : 'Create Lead'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TableHeader() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr', padding: '1rem', borderBottom: '1px solid var(--border)', background: '#F9FAFB' }}>
            <div className="text-label">Email Address</div>
            <div className="text-label">Provenance / Source</div>
            <div className="text-label">Confidence Score</div>
            <div className="text-label" style={{ textAlign: 'right' }}>Verification Actions</div>
        </div>
    );
}

function TableRow({ email, source, confidence, onApprove, onReject }: {
    email: string;
    source: string;
    confidence: string;
    onApprove: () => void;
    onReject: () => void;
}) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr', padding: '1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 600 }}>
                {email}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔗</span> {source}
            </div>
            <div>
                <span style={{
                    background: confidence.includes('HIGH') ? '#111827' : confidence.includes('MEDIUM') ? '#374151' : '#6B7280',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontStyle: 'italic'
                }}>
                    {confidence}
                </span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                    className="btn btn-success-soft"
                    style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                    onClick={onApprove}
                >
                    APPROVE
                </button>
                <button
                    className="btn btn-danger-soft"
                    style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                    onClick={onReject}
                >
                    REJECT
                </button>
            </div>
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
            fontSize: '0.7rem',
            fontWeight: 700
        }}>
            {status}
        </span>
    );
}
