"use client";

import { useState, useEffect } from 'react';

export default function IntelligencePage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leads')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLeads(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // ... (Keep existing Render logic, but map over `leads` state)

    return (
        <div style={{ height: '100%', display: 'flex', gap: '2rem' }}>

            {/* Filters Sidebar (Static for MVP) */}
            <div style={{ width: '280px', flexShrink: 0 }}>
                <h2 className="h3" style={{ marginBottom: '1.5rem' }}>Parameters</h2>

                <div className="filter-group">
                    <label className="text-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Location</label>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <Checkbox label="North America" checked />
                        <Checkbox label="Europe" />
                        <Checkbox label="Asia-Pacific" />
                    </div>
                </div>

                <div className="filter-group" style={{ marginTop: '2rem' }}>
                    <label className="text-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Industry</label>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <Checkbox label="SaaS" />
                        <Checkbox label="EdTech" />
                        <Checkbox label="FinTech" />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                    <div style={{ fontWeight: 600, color: '#1E40AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>AI Recommendation</div>
                    <p className="text-sm" style={{ color: '#1E40AF' }}>Narrowing Industry to 'SaaS' might increase conversion by 12% based on your history.</p>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 className="h1">Active Discovery</h1>
                        <p className="text-sm">Showing {leads.length || 0} qualified leads found by AI</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-secondary">Export</button>
                        <button className="btn btn-secondary">Columns</button>
                    </div>
                </div>

                {/* Table/List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {loading ? <div style={{ padding: '2rem' }}>Loading...</div> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Type</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Location</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Website</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(lead => (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{lead.companyName}</td>
                                        <td style={{ padding: '1rem', color: '#6B7280' }}>{lead.industry || 'Business'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {lead.location === 'USA' && '🇺🇸'}
                                                {lead.location === 'UK' && '🇬🇧'}
                                                {lead.location === 'GER' && '🇩🇪'}
                                                {lead.location === 'CAN' && '🇨🇦'}
                                                {lead.location || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--accent)' }}>{lead.website}</td>
                                        <td style={{ padding: '1rem' }}><StatusBadge status={lead.status} /></td>
                                        <td style={{ padding: '1rem' }}>
                                            <a href={`/leads/${lead.id || '1'}`} className="btn btn-ghost" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
                                                Inspect
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Detail Panel Placeholder (Keep consistent) */}
                {/* ... */}
            </div>
        </div>
    );
}

function Checkbox({ label, checked }: { label: string; checked?: boolean }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked={checked} style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>{label}</span>
        </label>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        NEW: { bg: '#ECFDF5', color: '#059669' },
        RESEARCHED: { bg: '#FFFBEB', color: '#D97706' },
        CONTACTED: { bg: '#EFF6FF', color: '#2563EB' },
    };
    const s = styles[status] || styles.NEW;
    return (
        <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
            {status}
        </span>
    );
}
