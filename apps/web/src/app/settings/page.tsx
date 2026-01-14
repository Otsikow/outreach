"use client";

import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('integrations');
    const [gmailStatus, setGmailStatus] = useState('DISCONNECTED');

    useEffect(() => {
        // Check connection status on load
        fetch('http://localhost:4000/api/auth/google/status')
            .then(res => res.json())
            .then(data => setGmailStatus(data.connected ? 'CONNECTED' : 'DISCONNECTED'))
            .catch(() => setGmailStatus('OFFLINE')); // API not running
    }, []);

    const handleConnectGmail = () => {
        // Redirect to backend auth flow
        window.location.href = 'http://localhost:4000/api/auth/google';
    };

    return (
        <div>
            <h1 className="h1" style={{ marginBottom: '2rem' }}>Settings & Configuration</h1>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                <Tab label="Integrations" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
                <Tab label="Compliance Rules" active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')} />
            </div>

            {activeTab === 'integrations' && (
                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px' }}>

                    {/* Gmail Card */}
                    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h3 className="h3" style={{ margin: 0, fontSize: '1rem' }}>Gmail Account</h3>
                                <StatusBadge status={gmailStatus} />
                            </div>
                            <p className="text-sm" style={{ marginTop: '0.25rem' }}>Send outreach directly from your workspace.</p>
                        </div>

                        <div>
                            {gmailStatus === 'CONNECTED' ? (
                                <button
                                    disabled
                                    className="btn btn-secondary"
                                    style={{ color: '#6B7280', cursor: 'not-allowed', background: '#F3F4F6' }}
                                >
                                    Sync Active
                                </button>
                            ) : (
                                <button
                                    onClick={handleConnectGmail}
                                    className="btn btn-primary"
                                >
                                    Connect Google
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Other cards... */}
                    <IntegrationCard
                        title="Firecrawl"
                        desc="Web scraping and contact extraction engine."
                        status="CONNECTED"
                        apiKey="fc_live_****************"
                    />

                </div>
            )}

            {/* Compliance Tab ... */}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'CONNECTED') {
        return <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>CONNECTED</span>;
    }
    if (status === 'OFFLINE') {
        return <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: '4px' }}>API ERROR</span>;
    }
    return <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#F3F4F6', color: '#6B7280', padding: '2px 6px', borderRadius: '4px' }}>DISCONNECTED</span>;
}

function Tab({ label, active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                color: active ? 'var(--primary)' : '#6B7280',
                fontWeight: active ? 600 : 500
            }}
        >
            {label}
        </div>
    );
}

function IntegrationCard({ title, desc, status, apiKey, placeholder }: any) {
    return (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 className="h3" style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: status === 'CONNECTED' ? '#DCFCE7' : '#F3F4F6', color: status === 'CONNECTED' ? '#166534' : '#6B7280', padding: '2px 6px', borderRadius: '4px' }}>{status}</span>
                </div>
                <p className="text-sm" style={{ marginTop: '0.25rem' }}>{desc}</p>
            </div>
            <div style={{ width: '300px' }}>
                <input
                    type="password"
                    className="input"
                    defaultValue={apiKey}
                    placeholder={placeholder || 'API Key'}
                    disabled={status === 'CONNECTED'}
                    style={{ width: '100%', background: status === 'CONNECTED' ? '#F9FAFB' : 'white' }}
                />
            </div>
        </div>
    );
}
