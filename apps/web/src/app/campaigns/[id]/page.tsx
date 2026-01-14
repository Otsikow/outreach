"use client";

import { useParams } from 'next/navigation';

export default function CampaignDetailPage() {
    const params = useParams();
    const id = params.id;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <a href="/campaigns" className="text-sm" style={{ hover: { textDecoration: 'underline' } }}>← Back to Campaigns</a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="h1">Campaign #{id}</h1>
                    <p className="text-sm">Detailed performance metrics and lead management.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary">Edit Settings</button>
                    <button className="btn btn-primary" onClick={() => alert('Sending sequence...')}>Resume Outreach</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3 className="h3">Overview</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Status</span>
                            <span className="badge" style={{ background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Leads</span>
                            <span style={{ fontWeight: 600 }}>1,240</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Sent</span>
                            <span style={{ fontWeight: 600 }}>843</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-sm">Opened</span>
                            <span style={{ fontWeight: 600 }}>621 (73%)</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="h3">Recent Activity</h3>
                    <div style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.875rem' }}>
                        <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>Email Sent</span> to <span style={{ color: 'var(--accent)' }}>john.doe@example.com</span> - <span style={{ fontSize: '0.75rem' }}>2 mins ago</span>
                        </div>
                        <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>Email Opened</span> by <span style={{ color: 'var(--accent)' }}>jane.smith@example.com</span> - <span style={{ fontSize: '0.75rem' }}>15 mins ago</span>
                        </div>
                        <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>Reply Received</span> from <span style={{ color: 'var(--accent)' }}>ceo@startup.io</span> - <span style={{ fontSize: '0.75rem' }}>1 hour ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
